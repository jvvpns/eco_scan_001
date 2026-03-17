import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
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

export const getUserStats = async (userId: string): Promise<UserStats | null> => {
  const ref = doc(db, 'users', userId, 'data', 'stats');
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as UserStats) : null;
};

export const initUserStats = async (
  userId: string,
  displayName: string,
  email: string,
  username: string = '',
  avatarUrl: string = ''
): Promise<void> => {
  const ref = doc(db, 'users', userId, 'data', 'stats');
  const initialStats: UserStats = {
    displayName,
    username,
    avatarUrl,
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
    accuracyChallengeScans: 0,
    accuracyChallengeCorrect: 0,
    scanMasterGoal: 20,
  };
  await setDoc(ref, initialStats);
};

export const updateUserStats = async (
  userId: string,
  updates: Partial<UserStats>
): Promise<void> => {
  const ref = doc(db, 'users', userId, 'data', 'stats');
  await updateDoc(ref, updates as Record<string, any>);
};

// ─── SCANS ────────────────────────────────────────────────────

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

export const getRecentScans = async (userId: string, limitN: number = 5): Promise<ScanRecord[]> => {
  const scansRef = collection(db, 'scans');
  const q = query(
    scansRef,
    orderBy('timestamp', 'desc'),
    limit(limitN)
  );
  const snap = await getDocs(q);
  // Filter to this user's scans only (Firestore rules allow reading all scans)
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as ScanRecord))
    .filter(s => s.userId === userId);
};

export const deleteScanRecord = async (scanId: string): Promise<void> => {
  const ref = doc(db, 'scans', scanId);
  await deleteDoc(ref);
};

export const updateScanThumbnail = async (scanId: string, imageUrl: string): Promise<void> => {
  const ref = doc(db, 'scans', scanId);
  await updateDoc(ref, { imageUrl });
};

/**
 * Deducts the points and counters for a deleted scan from UserStats + leaderboard.
 * isCorrect flag is needed to also roll back correctScans count.
 */
export const deductScanPoints = async (
  userId: string,
  pointsToDeduct: number,
  wasCorrect: boolean
): Promise<void> => {
  const current = await getUserStats(userId);
  if (!current) return;

  const newPoints       = Math.max(0, current.ecoPoints - pointsToDeduct);
  const newTotalScans   = Math.max(0, current.totalScans - 1);
  const newCorrectScans = Math.max(0, current.correctScans - (wasCorrect ? 1 : 0));
  const newItemsClassified = Math.max(0, current.itemsClassified - 1);
  const newLevel        = Math.floor(newPoints / 100) + 1;

  // Recalculate environmental impact
  const newCo2      = parseFloat((newTotalScans * 0.05).toFixed(2));
  const newWaste    = parseFloat((newTotalScans * 0.02).toFixed(2));
  const newTrees    = parseFloat((Math.floor(newPoints / 100) * 1).toFixed(1));

  const updates: Partial<UserStats> = {
    ecoPoints:       newPoints,
    level:           newLevel,
    totalScans:      newTotalScans,
    correctScans:    newCorrectScans,
    itemsClassified: newItemsClassified,
    co2Saved:        newCo2,
    wasteDiverted:   newWaste,
    treesSaved:      newTrees,
    accuracyChallengeScans: Math.max(0, (current.accuracyChallengeScans || 0) - 1),
    accuracyChallengeCorrect: Math.max(0, (current.accuracyChallengeCorrect || 0) - (wasCorrect ? 1 : 0)),
    scanMasterGoal: current.scanMasterGoal || 20,
  };

  await updateUserStats(userId, updates);

  // Sync leaderboard
  await updateLeaderboardEntry(userId, {
    displayName:  current.displayName,
    username:     current.username  ?? '',
    avatarUrl:    current.avatarUrl ?? '',
    ecoPoints:    newPoints,
    level:        newLevel,
    correctScans: newCorrectScans,
    totalScans:   newTotalScans,
  });
};

// ─── BADGES ───────────────────────────────────────────────────

export const getUserBadges = async (userId: string): Promise<BadgeRecord[]> => {
  const ref = collection(db, 'users', userId, 'badges');
  const snap = await getDocs(ref);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as BadgeRecord));
};

export const unlockBadge = async (userId: string, badgeId: string): Promise<void> => {
  const ref = doc(db, 'users', userId, 'badges', badgeId);
  await setDoc(ref, { unlocked: true, unlockedAt: new Date().toISOString() });
};

// ─── MISSIONS ─────────────────────────────────────────────────

export const getUserMissions = async (userId: string): Promise<MissionRecord[]> => {
  const ref = collection(db, 'users', userId, 'missions');
  const snap = await getDocs(ref);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MissionRecord));
};

export const updateMissionProgress = async (
  userId: string,
  missionId: string,
  progress: number,
  completed: boolean
): Promise<void> => {
  const ref = doc(db, 'users', userId, 'missions', missionId);
  await setDoc(
    ref,
    { progress, completed, ...(completed ? { completedAt: new Date().toISOString() } : {}) },
    { merge: true }
  );
};

// ─── LEADERBOARD ──────────────────────────────────────────────

export const getLeaderboard = async (topN: number = 10) => {
  const ref = collection(db, 'leaderboard');
  const q = query(ref, orderBy('ecoPoints', 'desc'), limit(topN));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    userId: d.id,
    ...(d.data() as Omit<UserStats, 'userId'>),
  }));
};

export const updateLeaderboardEntry = async (
  userId: string,
  stats: Pick<UserStats, 'displayName' | 'username' | 'avatarUrl' | 'ecoPoints' | 'level' | 'correctScans' | 'totalScans'>
): Promise<void> => {
  const ref = doc(db, 'leaderboard', userId);
  const accuracy = stats.totalScans > 0
    ? Math.round((stats.correctScans / stats.totalScans) * 100)
    : 0;
  await setDoc(ref, { ...stats, accuracy }, { merge: true });
};