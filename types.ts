export enum Page {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  SCAN = 'SCAN',
  PROFILE = 'PROFILE',
  SETTINGS = 'SETTINGS',
  APP_SETTINGS = 'APP_SETTINGS',
  TIER = 'TIER',
}

export enum GarbageType {
  SPECIAL = 'Special',
  NON_BIODEGRADABLE = 'Non-Biodegradable',
  BIODEGRADABLE = 'Biodegradable',
  RESIDUAL = 'Residual',
}

export interface ScannedItem {
  id: string;
  name: string;
  type: GarbageType;
  points: number;
  image: string; // base64 data URL
  timestamp: Date;
}

export interface UserStats {
  displayName: string;
  username: string;          // ← new: unique handle e.g. "juan_eco"
  avatarUrl: string;         // ← new: base64 data URL or empty string
  email: string;
  ecoPoints: number;
  level: number;
  streak: number;
  lastScanDate: string;      // YYYY-MM-DD
  totalScans: number;
  correctScans: number;
  itemsClassified: number;
  co2Saved: number;          // kg
  wasteDiverted: number;     // kg
  treesSaved: number;
  createdAt: string;
}

export interface ScanRecord {
  itemName: string;          // name returned by Gemini
  id: string;
  userId: string;
  displayName: string;
  userAnswer: string;
  aiAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  timestamp: any;            // Firestore serverTimestamp
  imageUrl?: string;
}

export interface BadgeRecord {
  id: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface MissionRecord {
  id: string;
  progress: number;
  completed: boolean;
  completedAt?: string;
}