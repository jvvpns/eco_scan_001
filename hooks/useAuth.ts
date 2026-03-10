import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase';
import { getUserStats, getUserBadges, initUserStats } from '../services/firestoreService';
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
      // Try to get existing stats
      let stats = await getUserStats(firebaseUser.uid);

      // If no stats doc exists yet, initialize one (new user)
      if (!stats) {
        await initUserStats(
          firebaseUser.uid,
          firebaseUser.displayName ?? 'EcoUser',
          firebaseUser.email ?? ''
        );
        stats = await getUserStats(firebaseUser.uid);
      }

      setUserStats(stats);

      // Fetch unlocked badges
      const badges: BadgeRecord[] = await getUserBadges(firebaseUser.uid);
      setUnlockedBadgeIds(badges.filter(b => b.unlocked).map(b => b.id));
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Call this after a scan to refresh stats in the UI
  const refreshStats = async () => {
    if (user) {
      await fetchUserData(user);
    }
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