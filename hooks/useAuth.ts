import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase';
import { getUserStats, getUserBadges, initUserStats, updateUserStats } from '../services/firestoreService';
import { UserStats, BadgeRecord } from '../types';

interface UseAuthReturn {
  user: User | null;
  userStats: UserStats | null;
  unlockedBadgeIds: string[];
  loading: boolean;
  refreshStats: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (firebaseUser: User) => {
    try {
      let stats = await getUserStats(firebaseUser.uid);

      if (!stats) {
        // Brand new user — initialize with empty username and avatarUrl
        await initUserStats(
          firebaseUser.uid,
          firebaseUser.displayName ?? 'EcoUser',
          firebaseUser.email ?? '',
          '',  // username — set during register flow
          ''   // avatarUrl — set from profile edit
        );
        stats = await getUserStats(firebaseUser.uid);
      } else {
        // Sync displayName from Firebase Auth if it changed
        const updates: Partial<UserStats> = {};
        if (firebaseUser.displayName && stats.displayName !== firebaseUser.displayName) {
          updates.displayName = firebaseUser.displayName;
        }
        // Backfill username/avatarUrl for existing users missing these fields
        if (stats.username === undefined) updates.username = '';
        if (stats.avatarUrl === undefined) updates.avatarUrl = '';

        if (Object.keys(updates).length > 0) {
          await updateUserStats(firebaseUser.uid, updates);
          stats = { ...stats, ...updates };
        }
      }

      setUserStats(stats);

      const badges: BadgeRecord[] = await getUserBadges(firebaseUser.uid);
      setUnlockedBadgeIds(badges.filter(b => b.unlocked).map(b => b.id));
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const refreshStats = async () => {
    if (user) await fetchUserData(user);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchUserData(firebaseUser);
      } else {
        setUserStats(null);
        setUnlockedBadgeIds([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, userStats, unlockedBadgeIds, loading, refreshStats };
};