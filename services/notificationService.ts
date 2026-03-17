import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { Notification } from '../types';

export const getNotifications = async (userId: string, limitN: number = 20): Promise<Notification[]> => {
  const ref = collection(db, 'users', userId, 'notifications');
  const q = query(ref, orderBy('timestamp', 'desc'), limit(limitN));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
};

export const addNotification = async (
  userId: string,
  message: string,
  type: 'streak' | 'mission' | 'system'
): Promise<void> => {
  // Prevent duplicate unread notifications of same type and message within a short window
  // (though here we'll just add it to keep it simple as a starting point)
  const ref = collection(db, 'users', userId, 'notifications');
  await addDoc(ref, {
    message,
    type,
    timestamp: serverTimestamp(),
    read: false
  });
};

export const markAsRead = async (userId: string, notificationId: string): Promise<void> => {
  const ref = doc(db, 'users', userId, 'notifications', notificationId);
  await updateDoc(ref, { read: true });
};

export const clearAllNotifications = async (userId: string): Promise<void> => {
  const ref = collection(db, 'users', userId, 'notifications');
  const snap = await getDocs(ref);
  const batch = writeBatch(db);
  snap.docs.forEach((d) => {
    batch.delete(d.ref);
  });
  await batch.commit();
};

export const checkStreakReminderNeeded = async (userId: string, lastScanDate: string): Promise<boolean> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    if (lastScanDate === today) return false;
    
    // Fetch only the 5 most recent notifications to check for today's reminder
    // This avoids needing a composite index for where('type') + where('timestamp')
    const ref = collection(db, 'users', userId, 'notifications');
    const q = query(ref, orderBy('timestamp', 'desc'), limit(5));
    const snap = await getDocs(q);
    
    if (snap.empty) return true;

    const startOfToday = new Date(today).getTime();
    
    const alreadySentToday = snap.docs.some(d => {
      const data = d.data();
      const ts = data.timestamp?.toDate ? data.timestamp.toDate().getTime() : 0;
      return data.type === 'streak' && ts >= startOfToday;
    });

    return !alreadySentToday;
  } catch (err) {
    console.error('Error checking streak reminder:', err);
    return false; // Fail safe
  }
};
