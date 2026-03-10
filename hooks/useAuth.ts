import { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import { getUserStats, getUserBadges } from '../services/firestoreService';
import { UserStats, BadgeRecord } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<string[]>([]);

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const stats = await getUserStats(firebaseUser.uid);
        const badges = await getUserBadges(firebaseUser.uid);
        setUserStats(stats);
        setUnlockedBadgeIds(badges.filter(b => b.unlocked).map(b => b.id));
      }
    });
  }, []);

  return { user, userStats, unlockedBadgeIds };
};