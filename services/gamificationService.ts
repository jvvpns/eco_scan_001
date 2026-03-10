import { getUserStats, updateUserStats, updateLeaderboardEntry, unlockBadge, updateMissionProgress } from './firestoreService';
import { UserStats } from '../types';

// ─── CONSTANTS ────────────────────────────────────────────────

const POINTS_PER_CORRECT_SCAN = 10;
const POINTS_PER_WRONG_SCAN = 0;
const POINTS_PER_LEVEL = 100;

// Environmental impact constants per scan
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
      if (stats.totalScans < 8) return 0;
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

// ─── CORE GAMIFICATION LOGIC ──────────────────────────────────

/**
 * Calculate what level a user should be at based on their EcoPoints.
 */
export const calculateLevel = (ecoPoints: number): number => {
  return Math.floor(ecoPoints / POINTS_PER_LEVEL) + 1;
};

/**
 * Calculate environmental impact stats based on total scans and points.
 */
export const calculateEnvironmentalImpact = (
  totalScans: number,
  ecoPoints: number
) => ({
  co2Saved: parseFloat((totalScans * CO2_PER_SCAN_KG).toFixed(2)),
  wasteDiverted: parseFloat((totalScans * WASTE_PER_SCAN_KG).toFixed(2)),
  treesSaved: parseFloat((Math.floor(ecoPoints / 100) * TREES_PER_100_POINTS).toFixed(1)),
});

/**
 * Get today's date string in YYYY-MM-DD format.
 */
const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Get yesterday's date string in YYYY-MM-DD format.
 */
const getYesterdayString = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

/**
 * Main function — call this after every scan completes.
 * Handles points, level, streak, environmental impact,
 * badge unlocks, and mission progress all in one go.
 *
 * Returns the updated stats so the UI can reflect changes immediately.
 */
export const processScanResult = async (
  userId: string,
  isCorrect: boolean,
  unlockedBadgeIds: string[] // pass in already-unlocked badge IDs to avoid re-unlocking
): Promise<{
  updatedStats: UserStats;
  pointsEarned: number;
  newlyUnlockedBadges: string[];
  completedMissions: string[];
}> => {
  const currentStats = await getUserStats(userId);
  if (!currentStats) throw new Error('User stats not found');

  const today = getTodayString();
  const yesterday = getYesterdayString();
  const pointsEarned = isCorrect ? POINTS_PER_CORRECT_SCAN : POINTS_PER_WRONG_SCAN;

  // ── Streak logic ──
  let newStreak = currentStats.streak;
  if (isCorrect) {
    if (
      currentStats.lastScanDate === today ||
      currentStats.lastScanDate === yesterday
    ) {
      newStreak = currentStats.streak + 1;
    } else {
      newStreak = 1; // reset streak if gap in days
    }
  } else {
    newStreak = 0; // wrong answer breaks streak
  }

  // ── Points & level ──
  const newPoints = currentStats.ecoPoints + pointsEarned;
  const newLevel = calculateLevel(newPoints);

  // ── Scan counts ──
  const newTotalScans = currentStats.totalScans + 1;
  const newCorrectScans = currentStats.correctScans + (isCorrect ? 1 : 0);

  // ── Environmental impact ──
  const impact = calculateEnvironmentalImpact(newTotalScans, newPoints);

  const updatedStats: UserStats = {
    ...currentStats,
    ecoPoints: newPoints,
    level: newLevel,
    streak: newStreak,
    lastScanDate: today,
    totalScans: newTotalScans,
    correctScans: newCorrectScans,
    itemsClassified: newTotalScans,
    co2Saved: impact.co2Saved,
    wasteDiverted: impact.wasteDiverted,
    treesSaved: impact.treesSaved,
  };

  // ── Save to Firestore ──
  await updateUserStats(userId, updatedStats);
  await updateLeaderboardEntry(userId, {
    displayName: updatedStats.displayName,
    ecoPoints: updatedStats.ecoPoints,
    level: updatedStats.level,
    correctScans: updatedStats.correctScans,
    totalScans: updatedStats.totalScans,
  });

  // ── Check badge unlocks ──
  const newlyUnlockedBadges: string[] = [];
  for (const badge of BADGES) {
    if (!unlockedBadgeIds.includes(badge.id) && badge.check(updatedStats)) {
      await unlockBadge(userId, badge.id);
      newlyUnlockedBadges.push(badge.id);
    }
  }

  // ── Check mission completions ──
  const completedMissions: string[] = [];
  for (const mission of MISSIONS) {
    const progress = mission.getProgress(updatedStats);
    const completed = progress >= mission.target;
    await updateMissionProgress(userId, mission.id, progress, completed);
    if (completed) {
      completedMissions.push(mission.id);
    }
  }

  return {
    updatedStats,
    pointsEarned,
    newlyUnlockedBadges,
    completedMissions,
  };
};