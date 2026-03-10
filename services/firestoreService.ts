import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { UserStats, ScanRecord, BadgeRecord, MissionRecord } from '../types';

// ─── USER STATS ───────────────────────────────────────────────

/**
 * Get user stats from Firestore.
 * Returns null if the user document doesn't exist yet.
 */
export const getUserStats = async (userId: string): Promise<UserStats | null> => {
  const ref = doc(db, 'users', userId, 'data', 'stats');
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as UserStats) : null;
};

/**
 * Initialize a new user's stats document.
 * Call this once right after user registers.
 */
export const initUserStats = async (userId: string, displayName: string, email: string): Promise<void> => {
  const ref = doc(db, 'users', userId, 'data', 'stats');
  const initialStats: UserStats = {
    displayName,
    email,
    ecoPoints: 0,
    level: 1,
    streak: 0,
    lastScanDate: '',
    totalScans: 0,
    correctScans: 0,
    itemsClassified: 0,
    co2Saved: 0,
    wasteDiverted: 0,
    treesSaved: 0,
    createdAt: new Date().toISOString(),
  };
  await setDoc(ref, initialStats);
};

/**
 * Update specific fields in user stats.
 */
export const updateUserStats = async (
  userId: string,
  updates: Partial<UserStats>
): Promise<void> => {
  const ref = doc(db, 'users', userId, 'data', 'stats');
  await updateDoc(ref, updates);
};

// ─── SCANS ────────────────────────────────────────────────────

/**
 * Save a scan record to the top-level scans collection.
 * This powers the leaderboard and scan history.
 */
export const saveScanRecord = async (
  userId: string,
  displayName: string,
  record: Omit<ScanRecord, 'id' | 'timestamp' | 'userId' | 'displayName'>
): Promise<string> => {
  const scansRef = collection(db, 'scans');
  const docRef = await addDoc(scansRef, {
    ...record,
    userId,
    displayName,
    timestamp: serverTimestamp(),
  });
  return docRef.id;
};

// ─── BADGES ───────────────────────────────────────────────────

/**
 * Get all badge records for a user.
 */
export const getUserBadges = async (userId: string): Promise<BadgeRecord[]> => {
  const ref = collection(db, 'users', userId, 'badges');
  const snap = await getDocs(ref);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as BadgeRecord));
};

/**
 * Unlock a specific badge for a user.
 */
export const unlockBadge = async (userId: string, badgeId: string): Promise<void> => {
  const ref = doc(db, 'users', userId, 'badges', badgeId);
  await setDoc(ref, {
    unlocked: true,
    unlockedAt: new Date().toISOString(),
  });
};

// ─── MISSIONS ─────────────────────────────────────────────────

/**
 * Get all mission records for a user.
 */
export const getUserMissions = async (userId: string): Promise<MissionRecord[]> => {
  const ref = collection(db, 'users', userId, 'missions');
  const snap = await getDocs(ref);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MissionRecord));
};

/**
 * Update mission progress for a user.
 */
export const updateMissionProgress = async (
  userId: string,
  missionId: string,
  progress: number,
  completed: boolean
): Promise<void> => {
  const ref = doc(db, 'users', userId, 'missions', missionId);
  await setDoc(
    ref,
    {
      progress,
      completed,
      ...(completed ? { completedAt: new Date().toISOString() } : {}),
    },
    { merge: true }
  );
};

// ─── LEADERBOARD ──────────────────────────────────────────────

/**
 * Get top N users by ecoPoints for the leaderboard.
 */
export const getLeaderboard = async (topN: number = 10): Promise<UserStats[]> => {
  // Query the stats subcollection across all users using a collection group query
  // Note: requires a Firestore composite index on 'data' subcollection for 'ecoPoints'
  // Alternative: store a flat 'leaderboard' collection updated on each scan (simpler)
  const ref = collection(db, 'leaderboard');
  const q = query(ref, orderBy('ecoPoints', 'desc'), limit(topN));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as UserStats);
};

/**
 * Update the leaderboard entry for a user.
 * Call this after every scan that awards points.
 */
export const updateLeaderboardEntry = async (
  userId: string,
  stats: Pick<UserStats, 'displayName' | 'ecoPoints' | 'level' | 'correctScans' | 'totalScans'>
): Promise<void> => {
  const ref = doc(db, 'leaderboard', userId);
  const accuracy =
    stats.totalScans > 0
      ? Math.round((stats.correctScans / stats.totalScans) * 100)
      : 0;
  await setDoc(ref, { ...stats, accuracy }, { merge: true });
};