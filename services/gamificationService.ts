import {
  getUserStats,
  updateUserStats,
  updateLeaderboardEntry,
  unlockBadge,
  updateMissionProgress,
  getUserMissions
} from './firestoreService';
import { addNotification } from './notificationService';
import { UserStats, GarbageType } from '../types';

// ─── CONSTANTS ────────────────────────────────────────────────

const POINTS_PER_LEVEL = 100;

export const WASTE_POINTS: Record<string, number> = {
  [GarbageType.SPECIAL]: 15,
  [GarbageType.NON_BIODEGRADABLE]: 12,
  [GarbageType.BIODEGRADABLE]: 10,
  [GarbageType.RESIDUAL]: 5,
};

const CO2_PER_SCAN_KG = 0.05;
const WASTE_PER_SCAN_KG = 0.02;
const TREES_PER_100_POINTS = 1;

// ─── BADGE DEFINITIONS ────────────────────────────────────────

export const BADGES = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Complete your first scan',
    icon: '🌱',
    check: (stats: UserStats) => stats.totalScans >= 1,
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Get 5 correct answers in a row',
    icon: '🔥',
    check: (stats: UserStats) => stats.streak >= 5,
  },
  {
    id: 'accuracy_pro',
    name: 'Accuracy Pro',
    description: 'Achieve 80% accuracy with 10+ scans',
    icon: '🎯',
    check: (stats: UserStats) =>
      stats.totalScans >= 10 &&
      stats.totalScans > 0 &&
      stats.correctScans / stats.totalScans >= 0.8,
  },
  {
    id: 'eco_warrior',
    name: 'Eco Warrior',
    description: 'Reach Level 5',
    icon: '⚡',
    check: (stats: UserStats) => stats.level >= 5,
  },
  {
    id: 'master_classifier',
    name: 'Master Classifier',
    description: 'Complete 50 scans',
    icon: '🏆',
    check: (stats: UserStats) => stats.totalScans >= 50,
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Get 10 correct answers in a row',
    icon: '💎',
    check: (stats: UserStats) => stats.streak >= 10,
  },
];

// ─── MISSION DEFINITIONS ──────────────────────────────────────

export const MISSIONS = [
  {
    id: 'daily_streak',
    name: 'Daily Streak',
    description: 'Scan at least once per day for 3 consecutive days',
    icon: '🔥',
    target: 3,
    points: 50,
    getProgress: (stats: UserStats) => stats.streak,
  },
  {
    id: 'accuracy_challenge',
    name: 'Accuracy Challenge',
    description: 'Maintain 75% accuracy over 8 scans',
    icon: '🎯',
    target: 8,
    points: 100,
    getProgress: (stats: UserStats) => stats.accuracyChallengeScans ?? 0,
  },
  {
    id: 'scan_master',
    name: 'Scan Master',
    description: 'Reach your scanning milestone',
    icon: '📊',
    target: 20, // Initial target
    points: 100,
    getProgress: (stats: UserStats) => stats.correctScans,
  },
];

const SCAN_MASTER_GOALS = [20, 50, 100, 250, 500, 1000];

// ─── HELPERS ──────────────────────────────────────────────────

export const calculateLevel = (ecoPoints: number): number =>
  Math.floor(ecoPoints / POINTS_PER_LEVEL) + 1;

export const calculateEnvironmentalImpact = (totalScans: number, ecoPoints: number) => ({
  co2Saved:      parseFloat((totalScans * CO2_PER_SCAN_KG).toFixed(2)),
  wasteDiverted: parseFloat((totalScans * WASTE_PER_SCAN_KG).toFixed(2)),
  treesSaved:    parseFloat((Math.floor(ecoPoints / 100) * TREES_PER_100_POINTS).toFixed(1)),
});

const getTodayString = (): string => new Date().toISOString().split('T')[0];

const getYesterdayString = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

// ─── CORE GAMIFICATION LOGIC ──────────────────────────────────

export const processScanResult = async (
  userId: string,
  isCorrect: boolean,
  unlockedBadgeIds: string[],
  wasteType?: string
): Promise<{
  updatedStats: UserStats;
  pointsEarned: number;
  newlyUnlockedBadges: string[];
  completedMissions: string[];
}> => {
  // 1. Get current data
  const [currentStats, existingMissions] = await Promise.all([
    getUserStats(userId),
    getUserMissions(userId)
  ]);
  
  if (!currentStats) throw new Error('User stats not found');

  const today = getTodayString();
  const yesterday = getYesterdayString();

  // 1.5 Calculate Variable Points
  const scanPoints = isCorrect && wasteType ? (WASTE_POINTS[wasteType] || 5) : 0;

  // 2. Streak logic
  let newStreak = currentStats.streak;
  let newLastCountedDate = currentStats.lastCountedDate ?? '';
  
  if (newLastCountedDate !== today) {
    if (newLastCountedDate === yesterday) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }
    newLastCountedDate = today;
  }

  // 3. Increment base counts
  const newTotalScans = currentStats.totalScans + 1;
  const newCorrectScans = currentStats.correctScans + (isCorrect ? 1 : 0);

  // 4. Update Accuracy Challenge counters
  let newAccScans = (currentStats.accuracyChallengeScans || 0) + 1;
  let newAccCorrect = (currentStats.accuracyChallengeCorrect || 0) + (isCorrect ? 1 : 0);

  // 5. Temporary stats for mission progress calculation
  const tempStats: UserStats = {
    ...currentStats,
    streak: newStreak,
    totalScans: newTotalScans,
    correctScans: newCorrectScans,
    accuracyChallengeScans: newAccScans,
    accuracyChallengeCorrect: newAccCorrect,
  };

  // 5. Check Mission transitions
  const completedMissions: string[] = [];
  let missionBonusPoints = 0;

  let newScanMasterGoal = currentStats.scanMasterGoal || 20;

  for (const mission of MISSIONS) {
    const prevRecord = existingMissions.find(m => m.id === mission.id);
    const wasCompleted = prevRecord?.completed ?? false;
    
    // Skip if already completed (except Scan Master which is progressive)
    if (wasCompleted && mission.id !== 'scan_master') continue;

    let target = mission.target;
    if (mission.id === 'scan_master') target = newScanMasterGoal;

    const currentProgress = mission.getProgress(tempStats);
    let isNowCompleted = false;

    // Special logic for Accuracy Challenge completion
    if (mission.id === 'accuracy_challenge') {
      if (currentProgress === 8) {
        const accuracy = (tempStats.accuracyChallengeCorrect / 8) * 100;
        if (accuracy >= 75) {
          isNowCompleted = true;
          missionBonusPoints += mission.points;
          completedMissions.push(mission.id);
          await addNotification(userId, "Accuracy Challenge Completed! You earned 100 points!", 'mission');
        } else {
          await addNotification(userId, "Challenge failed. You did not reach 75% accuracy.", 'mission');
        }
        // RESET counters after 8 scans regardless of pass/fail
        newAccScans = 0;
        newAccCorrect = 0;
      } else {
        await addNotification(userId, `Accuracy Challenge: ${currentProgress}/8 scans completed`, 'mission');
      }
    } else if (mission.id === 'scan_master') {
      // Scan Master logic
      if (currentProgress >= target) {
        const alreadyAwarded = prevRecord?.progress === target && prevRecord?.completed;
        if (!alreadyAwarded) {
          isNowCompleted = true;
          missionBonusPoints += mission.points;
          completedMissions.push(mission.id);
          await addNotification(userId, `Scan Master milestone reached! +${mission.points} points`, 'mission');
          
          // Move to next goal
          const currentIndex = SCAN_MASTER_GOALS.indexOf(target);
          if (currentIndex !== -1 && currentIndex < SCAN_MASTER_GOALS.length - 1) {
            newScanMasterGoal = SCAN_MASTER_GOALS[currentIndex + 1];
          }
        }
      }
    } else {
      isNowCompleted = currentProgress >= target;
      if (isNowCompleted) {
        missionBonusPoints += mission.points;
        completedMissions.push(mission.id);
        if (mission.id === 'daily_streak') {
            await addNotification(userId, "Daily Streak Completed! You earned 50 points!", 'streak');
            newStreak = 0;
        }
      }
    }

    // Update mission record in Firestore
    await updateMissionProgress(userId, mission.id, currentProgress, isNowCompleted);
  }

  // 6. Calculate Final Totals
  const totalPointsEarned = scanPoints + missionBonusPoints;
  const finalPoints = currentStats.ecoPoints + totalPointsEarned;
  const finalLevel = calculateLevel(finalPoints);
  const impact = calculateEnvironmentalImpact(newTotalScans, finalPoints);

  const updatedStats: UserStats = {
    ...currentStats,
    ecoPoints: finalPoints,
    level: finalLevel,
    streak: newStreak,
    lastScanDate: today,
    totalScans: newTotalScans,
    correctScans: newCorrectScans,
    itemsClassified: newTotalScans,
    co2Saved: impact.co2Saved,
    wasteDiverted: impact.wasteDiverted,
    treesSaved: impact.treesSaved,
    accuracyChallengeScans: newAccScans,
    accuracyChallengeCorrect: newAccCorrect,
    scanMasterGoal: newScanMasterGoal,
    lastCountedDate: newLastCountedDate,
  };

  // 7. Save Final Stats
  await updateUserStats(userId, updatedStats);

  // 8. Sync Leaderboard
  await updateLeaderboardEntry(userId, {
    displayName: updatedStats.displayName,
    username: updatedStats.username ?? '',
    avatarUrl: updatedStats.avatarUrl ?? '',
    ecoPoints: updatedStats.ecoPoints,
    level: updatedStats.level,
    correctScans: updatedStats.correctScans,
    totalScans: updatedStats.totalScans,
  });

  // 9. Badge logic
  const newlyUnlockedBadges: string[] = [];
  for (const badge of BADGES) {
    if (!unlockedBadgeIds.includes(badge.id) && badge.check(updatedStats)) {
      await unlockBadge(userId, badge.id);
      newlyUnlockedBadges.push(badge.id);
    }
  }

  return { 
    updatedStats, 
    pointsEarned: totalPointsEarned, 
    newlyUnlockedBadges, 
    completedMissions 
  };
};