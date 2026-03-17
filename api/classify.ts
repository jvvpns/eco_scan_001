import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';
import { getAdminAuth, getAdminFirestore } from './_firebase-admin.js';
import { FieldValue } from 'firebase-admin/firestore';

// ─── TYPES ────────────────────────────────────────────────────

type GarbageType = 'Special' | 'Non-Biodegradable' | 'Biodegradable' | 'Residual';

interface UserStats {
  ecoPoints: number;
  level: number;
  streak: number;
  lastScanDate: string;
  totalScans: number;
  correctScans: number;
  itemsClassified: number;
  co2Saved: number;
  wasteDiverted: number;
  treesSaved: number;
  displayName: string;
  username: string;
  avatarUrl: string;
}

interface MissionRecord {
  id: string;
  progress: number;
  completed: boolean;
  completedAt?: string;
}

// ─── CONSTANTS ────────────────────────────────────────────────

const POINTS_MAP: Record<GarbageType, number> = {
  Special: 15,
  'Non-Biodegradable': 12,
  Biodegradable: 10,
  Residual: 5,
};

const VALID_ANSWER_TYPES = new Set<string>(['Special', 'Non-Biodegradable', 'Biodegradable', 'Residual']);

const POINTS_PER_LEVEL = 100;
const CO2_PER_SCAN_KG = 0.05;
const WASTE_PER_SCAN_KG = 0.02;
const TREES_PER_100_POINTS = 1;
const COOLDOWN_SECONDS = 30;

// ─── MISSION DEFINITIONS (mirrors gamificationService.ts) ─────

const MISSIONS = [
  {
    id: 'daily_streak',
    target: 3,
    points: 50,
    getProgress: (stats: UserStats) => Math.min(stats.streak, 3),
  },
  {
    id: 'accuracy_challenge',
    target: 75,
    points: 100,
    getProgress: (stats: UserStats) => {
      // Show actual accuracy even before 8 scans, but target check remains for completion
      if (stats.totalScans === 0) return 0;
      return Math.round((stats.correctScans / stats.totalScans) * 100);
    },
  },
  {
    id: 'scan_master',
    target: 20,
    points: 150,
    getProgress: (stats: UserStats) => Math.min(stats.totalScans, 20),
  },
];

// ─── BADGE DEFINITIONS (mirrors gamificationService.ts) ───────

const BADGES = [
  { id: 'first_steps', check: (s: UserStats) => s.totalScans >= 1 },
  { id: 'streak_master', check: (s: UserStats) => s.streak >= 5 },
  { id: 'accuracy_pro', check: (s: UserStats) => s.totalScans >= 10 && s.correctScans / s.totalScans >= 0.8 },
  { id: 'eco_warrior', check: (s: UserStats) => s.level >= 5 },
  { id: 'master_classifier', check: (s: UserStats) => s.totalScans >= 50 },
  { id: 'perfectionist', check: (s: UserStats) => s.streak >= 10 },
];

// ─── HELPERS ──────────────────────────────────────────────────

const getTodayString = (): string => new Date().toISOString().split('T')[0];
const getYesterdayString = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};
const calculateLevel = (points: number) => Math.floor(points / POINTS_PER_LEVEL) + 1;

// ─── MAIN HANDLER ─────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── 1. Verify Firebase Auth token ──────────────────────────
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  let uid: string;
  try {
    const token = authHeader.split('Bearer ')[1];
    const decoded = await getAdminAuth().verifyIdToken(token);
    uid = decoded.uid;
  } catch (err: any) {
    console.error('VERIFY ID TOKEN ERROR:', err.message || err);
    return res.status(401).json({ 
      error: 'Invalid or expired token',
      debug: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }

  // ── 2. Validate request body ───────────────────────────────
  const { imageBase64, userAnswer, thumbnailBase64 } = req.body as { 
    imageBase64?: string; 
    userAnswer?: string;
    thumbnailBase64?: string;
  };

  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return res.status(400).json({ error: 'imageBase64 is required' });
  }
  if (!userAnswer || !VALID_ANSWER_TYPES.has(userAnswer)) {
    return res.status(400).json({ error: `userAnswer must be one of: ${[...VALID_ANSWER_TYPES].join(', ')}` });
  }

  const db = getAdminFirestore();

  // ── 3. Server-side cooldown check ─────────────────────────
  const statsRef = db.doc(`users/${uid}/data/stats`);
  const statsSnap = await statsRef.get();

  if (!statsSnap.exists) {
    return res.status(404).json({ error: 'User stats not found. Please log out and back in.' });
  }

  const currentStats = statsSnap.data() as UserStats;
  const today = getTodayString();
  const lastScan = currentStats.lastScanDate ?? '';

  // Check server-side cooldown by comparing lastScanTimestamp (milliseconds)
  // We store an extra field lastScanTimestampMs for accurate cooldown enforcement
  const lastScanMs = (statsSnap.data() as any).lastScanTimestampMs ?? 0;
  const elapsedSeconds = (Date.now() - lastScanMs) / 1000;
  if (elapsedSeconds < COOLDOWN_SECONDS) {
    const remaining = Math.ceil(COOLDOWN_SECONDS - elapsedSeconds);
    return res.status(429).json({ error: `Cooldown active. Try again in ${remaining}s.` });
  }

  // ── 4. Call Gemini API ─────────────────────────────────────
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    console.error('GEMINI_API_KEY is not configured on the server.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  const ai = new GoogleGenAI({ apiKey: geminiKey });
  let geminiResult: { isWasteItem: boolean; itemName: string; garbageType: GarbageType; description?: string };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
          {
            text: `Analyze ONLY the main waste object in the foreground of this image.
Ignore background clutter, hands, tables, walls, floors, or surroundings.

STEP 1 — Is this actually waste?
Set isWasteItem=false if the main object is any of the following (NOT waste):
- A person, animal, or body part
- Furniture, appliances, or electronics currently in use
- A building, scenery, or natural environment
- Food that has not been discarded yet
- Anything that clearly does not need disposal

STEP 2 — If it IS waste, classify it into exactly ONE of these four categories:

1. Biodegradable
   - Organic materials that naturally decompose
   - Examples: fruit peels, vegetable scraps, leftover food, leaves, paper plates, cardboard, newspapers, garden waste, wood scraps, tea bags, coffee grounds

2. Non-Biodegradable
   - Synthetic materials that do not decompose naturally
   - Examples: plastic bottles, plastic bags, styrofoam, tin cans, aluminum foil, glass bottles, broken ceramics, rubber, nylon, PET containers, sachets

3. Special
   - Items requiring special handling due to hazardous content
   - Examples: batteries, light bulbs (especially CFL/fluorescent), paint cans, motor oil containers, aerosol spray cans, medical waste (syringes, expired medicine), electronic waste (phones, circuit boards, cables), ink cartridges, fire extinguishers

4. Residual
   - Mixed or contaminated waste that cannot be recycled or composted
   - Examples: soiled diapers, used tissue, food-contaminated packaging, cigarette butts, broken items that mix materials (e.g. composite packaging), dust and sweepings

Set itemName to a short, specific label (e.g. "plastic water bottle", "banana peel", "AA battery").
Set description to one sentence explaining why it belongs to that category.`,
          },
        ],
      }],
      config: {
        systemInstruction: `You are an expert waste classification AI trained on Philippine waste segregation standards (RA 9003).
Respond in strict JSON only. No markdown, no explanation outside JSON.
When uncertain between two categories, choose the one that poses the greater environmental risk.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isWasteItem: { type: Type.BOOLEAN },
            itemName: { type: Type.STRING },
            garbageType: { type: Type.STRING, enum: ['Special', 'Non-Biodegradable', 'Biodegradable', 'Residual'] },
            description: { type: Type.STRING },
          },
          required: ['isWasteItem', 'itemName', 'garbageType', 'description'],
        },
      },
    });

    geminiResult = JSON.parse(response.text ?? '{}');
  } catch (err) {
    console.error('Gemini error:', err);
    return res.status(502).json({ error: 'AI classification failed. Please try again.' });
  }

  // ── 5. No waste detected — return early, no points, no DB write ──
  if (!geminiResult.isWasteItem) {
    return res.status(200).json({
      noWasteDetected: true,
      itemName: geminiResult.itemName ?? 'Not a waste item',
      aiAnswer: null,
      isCorrect: false,
      pointsEarned: 0,
      newlyUnlockedBadges: [],
      completedMissions: [],
    });
  }

  // ── 6. Validate AI garbage type ───────────────────────────
  const aiAnswer = geminiResult.garbageType;
  if (!VALID_ANSWER_TYPES.has(aiAnswer)) {
    return res.status(502).json({ error: `Unexpected AI classification: ${aiAnswer}` });
  }

  const isCorrect = userAnswer.toLowerCase() === aiAnswer.toLowerCase();
  const scanPoints = isCorrect ? (POINTS_MAP[aiAnswer] ?? 0) : 0;

  // ── 7. Compute updated stats (server-side, tamper-proof) ──
  const yesterday = getYesterdayString();
  let newStreak = currentStats.streak ?? 0;
  if (isCorrect) {
    newStreak = (lastScan === today || lastScan === yesterday) ? newStreak + 1 : 1;
  } else {
    newStreak = 0;
  }

  const newTotalScans = (currentStats.totalScans ?? 0) + 1;
  const newCorrectScans = (currentStats.correctScans ?? 0) + (isCorrect ? 1 : 0);

  // Temporary stats object for mission progress calculation
  const tempStats: UserStats = {
    ...currentStats,
    streak: newStreak,
    totalScans: newTotalScans,
    correctScans: newCorrectScans,
  };

  // ── 8. Check missions ─────────────────────────────────────
  const missionsRef = db.collection(`users/${uid}/missions`);
  const missionsSnap = await missionsRef.get();
  const existingMissions: MissionRecord[] = missionsSnap.docs.map(d => ({ id: d.id, ...d.data() } as MissionRecord));

  const completedMissions: string[] = [];
  let missionBonusPoints = 0;
  const missionWrites: Promise<unknown>[] = [];

  for (const mission of MISSIONS) {
    const prev = existingMissions.find(m => m.id === mission.id);
    const wasCompleted = prev?.completed ?? false;
    const currentProgress = mission.getProgress(tempStats);
    const isNowCompleted = currentProgress >= mission.target;

    if (!wasCompleted && isNowCompleted) {
      missionBonusPoints += mission.points;
      completedMissions.push(mission.id);
    }

    const missionDoc = db.doc(`users/${uid}/missions/${mission.id}`);
    missionWrites.push(
      missionDoc.set(
        { progress: currentProgress, completed: isNowCompleted, ...(isNowCompleted ? { completedAt: new Date().toISOString() } : {}) },
        { merge: true }
      )
    );
  }

  // ── 9. Final point and stats calculation ──────────────────
  const totalPointsEarned = scanPoints + missionBonusPoints;
  const finalPoints = (currentStats.ecoPoints ?? 0) + totalPointsEarned;
  const finalLevel = calculateLevel(finalPoints);
  const co2Saved = parseFloat((newTotalScans * CO2_PER_SCAN_KG).toFixed(2));
  const wasteDiverted = parseFloat((newTotalScans * WASTE_PER_SCAN_KG).toFixed(2));
  const treesSaved = parseFloat((Math.floor(finalPoints / 100) * TREES_PER_100_POINTS).toFixed(1));

  // ── 10. Update user stats ─────────────────────────────────
  const updatedStats = {
    ecoPoints: finalPoints,
    level: finalLevel,
    streak: newStreak,
    lastScanDate: today,
    lastScanTimestampMs: Date.now(),
    totalScans: newTotalScans,
    correctScans: newCorrectScans,
    itemsClassified: newTotalScans,
    co2Saved,
    wasteDiverted,
    treesSaved,
  };

  // ── 11. Badge checks ──────────────────────────────────────
  const badgesRef = db.collection(`users/${uid}/badges`);
  const badgesSnap = await badgesRef.get();
  const unlockedIds = new Set(badgesSnap.docs.filter(d => d.data().unlocked).map(d => d.id));
  const mergedStats = { ...currentStats, ...updatedStats };
  const newlyUnlockedBadges: string[] = [];
  const badgeWrites: Promise<unknown>[] = [];

  for (const badge of BADGES) {
    if (!unlockedIds.has(badge.id) && badge.check(mergedStats as UserStats)) {
      newlyUnlockedBadges.push(badge.id);
      badgeWrites.push(
        db.doc(`users/${uid}/badges/${badge.id}`).set({ unlocked: true, unlockedAt: new Date().toISOString() })
      );
    }
  }

  // ── 12. Leaderboard sync ──────────────────────────────────
  const accuracy = newTotalScans > 0 ? Math.round((newCorrectScans / newTotalScans) * 100) : 0;
  const leaderboardWrite = db.doc(`leaderboard/${uid}`).set({
    displayName: currentStats.displayName ?? '',
    username: currentStats.username ?? '',
    avatarUrl: currentStats.avatarUrl ?? '',
    ecoPoints: finalPoints,
    level: finalLevel,
    correctScans: newCorrectScans,
    totalScans: newTotalScans,
    accuracy,
  }, { merge: true });

  // ── 13. Scan record ───────────────────────────────────────
  const scanRecord = {
    userId: uid,
    displayName: currentStats.displayName ?? '',
    itemName: geminiResult.itemName ?? 'Unknown',
    userAnswer,
    aiAnswer,
    isCorrect,
    pointsEarned: totalPointsEarned,
    imageUrl: thumbnailBase64 || null,
    timestamp: FieldValue.serverTimestamp(),
  };
  const scanWrite = db.collection('scans').add(scanRecord);

  const [scanDoc] = await Promise.all([
    scanWrite,
    statsRef.update(updatedStats),
    leaderboardWrite,
    ...missionWrites,
    ...badgeWrites,
  ]);

  // ── 15. Return sanitised result to frontend ───────────────
  return res.status(200).json({
    id: scanDoc.id,
    noWasteDetected: false,
    itemName: geminiResult.itemName,
    aiAnswer,
    isCorrect,
    pointsEarned: totalPointsEarned,
    newlyUnlockedBadges,
    completedMissions,
    description: geminiResult.description ?? null,
  });
}
