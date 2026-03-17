import {
  getUserStats,
  updateUserStats,
  updateLeaderboardEntry,
  unlockBadge,
  updateMissionProgress,
  getUserMissions
} from './firestoreService';
import { UserStats } from '../types';

// ─── CONSTANTS ────────────────────────────────────────────────

const POINTS_PER_CORRECT_SCAN = 10;
const POINTS_PER_WRONG_SCAN = 0;
const POINTS_PER_LEVEL = 100;

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
    description: 'Get 3 correct answers in a row',
    icon: '🔥',
    target: 3,
    points: 50,
    getProgress: (stats: UserStats) => Math.min(stats.streak, 3),
  },
  {
    id: 'accuracy_challenge',
    name: 'Accuracy Challenge',
    description: 'Achieve 75% accuracy in 8 scans',
    icon: '🎯',
    target: 75,
    points: 100,
    getProgress: (stats: UserStats) => {
      if (stats.totalScans === 0) return 0;
      return Math.round((stats.correctScans / stats.totalScans) * 100);
    },
  },
  {
    id: 'scan_master',
    name: 'Scan Master',
    description: 'Complete 20 item scans',
    icon: '📊',
    target: 20,
    points: 150,
    getProgress: (stats: UserStats) => Math.min(stats.totalScans, 20),
  },
];

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
  unlockedBadgeIds: string[]
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
  const scanPoints = isCorrect ? POINTS_PER_CORRECT_SCAN : POINTS_PER_WRONG_SCAN;

  // 2. Streak logic
  let newStreak = currentStats.streak;
  if (isCorrect) {
    newStreak = (
      currentStats.lastScanDate === today ||
      currentStats.lastScanDate === yesterday
    ) ? currentStats.streak + 1 : 1;
  } else {
    newStreak = 0;
  }

  // 3. Increment base counts
  const newTotalScans = currentStats.totalScans + 1;
  const newCorrectScans = currentStats.correctScans + (isCorrect ? 1 : 0);

  // 4. Temporary stats for mission progress calculation
  const tempStats: UserStats = {
    ...currentStats,
    streak: newStreak,
    totalScans: newTotalScans,
    correctScans: newCorrectScans,
  };

  // 5. Check Mission transitions
  const completedMissions: string[] = [];
  let missionBonusPoints = 0;

  for (const mission of MISSIONS) {
    const prevRecord = existingMissions.find(m => m.id === mission.id);
    const wasCompleted = prevRecord?.completed ?? false;
    
    const currentProgress = mission.getProgress(tempStats);
    const isNowCompleted = currentProgress >= mission.target;

    // Transition: not completed -> completed!
    if (!wasCompleted && isNowCompleted) {
      missionBonusPoints += mission.points;
      completedMissions.push(mission.id);
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