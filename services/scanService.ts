/**
 * scanService.ts
 * ──────────────
 * Handles all scan-related frontend logic:
 *   - Calling the /api/classify Vercel serverless function
 *   - Image compression before sending
 *   - Client-side cooldown helpers (localStorage gate)
 *
 * Note: the Gemini API key and point calculations live ONLY on the server.
 * This file never touches VITE_GEMINI_API_KEY.
 */

import { auth } from '../firebase';
import { queueScan, registerSyncIfSupported } from './offlineQueue';

// ─── TYPES ────────────────────────────────────────────────────

export interface ClassifyResult {
  id:                  string;
  noWasteDetected:     boolean;
  itemName:            string;
  aiAnswer:            string | null;
  isCorrect:           boolean;
  pointsEarned:        number;
  newlyUnlockedBadges: string[];
  completedMissions:   string[];
  description:         string | null;
  queued?:             true;   // set when scan was stored offline
}

// ─── CONSTANTS ────────────────────────────────────────────────

const COOLDOWN_SECONDS = 30;
const CLASSIFY_URL     = '/api/classify';

// ─── COOLDOWN HELPERS ─────────────────────────────────────────
// Stored in localStorage so the countdown survives page navigation.

const cooldownKey = (userId: string) => `ecoscan_cooldown_${userId}`;

export const getCooldownSecondsLeft = (userId: string): number => {
  try {
    const stored = localStorage.getItem(cooldownKey(userId));
    if (!stored) return 0;
    const expiresAt = parseInt(stored, 10);
    const left = Math.ceil((expiresAt - Date.now()) / 1000);
    return left > 0 ? left : 0;
  } catch {
    return 0;
  }
};

export const startCooldown = (userId: string): void => {
  try {
    localStorage.setItem(cooldownKey(userId), String(Date.now() + COOLDOWN_SECONDS * 1000));
  } catch { /* ignore */ }
};

// ─── IMAGE COMPRESSION ────────────────────────────────────────

/**
 * Downscales a data-URL image to at most `maxSize` px on its longest side
 * and re-encodes it as a JPEG at 60% quality.
 */
export const compressImage = (dataUrl: string, maxSize = 800): Promise<string> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale  = Math.min(maxSize / img.width, maxSize / img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(dataUrl); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });

// ─── THUMBNAIL HELPER ─────────────────────────────────────────

/** Creates a tiny 120px thumbnail for Firestore scan records. */
export const makeThumbnail = (dataUrl: string): Promise<string> =>
  compressImage(dataUrl, 120);

// ─── CLASSIFY & SCORE ─────────────────────────────────────────

/**
 * Sends the image + user answer to the Vercel /api/classify endpoint.
 * - Attaches the Firebase Auth ID token for server-side authentication.
 * - Falls back to the offline queue if the network is unavailable.
 */
export const classifyAndScore = async (
  imageDataUrl:  string,
  userAnswer:    string,
  thumbnailBase64?: string,
): Promise<ClassifyResult> => {
  // Get Firebase Auth ID token
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  const idToken = await currentUser.getIdToken();

  // Strip the data: prefix — we only send the raw base64
  const base64 = imageDataUrl.includes(',')
    ? imageDataUrl.split(',')[1]
    : imageDataUrl;

  // Compress before sending to reduce payload size
  const compressedBase64 = await compressImage(`data:image/jpeg;base64,${base64}`)
    .then(dataUrl => dataUrl.split(',')[1]);

  const MAX_ATTEMPTS = 2;
  let lastError: any;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(CLASSIFY_URL, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ 
          imageBase64: compressedBase64, 
          userAnswer,
          thumbnailBase64
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Unknown server error' }));
        const errorMessage = errData.error ?? `Server error ${response.status}`;
        
        // If it's a retriable server error (502, 503, 504, 429) and we have attempts left
        if ([429, 502, 503, 504].includes(response.status) && attempt < MAX_ATTEMPTS) {
          console.warn(`Classification attempt ${attempt} failed (${response.status}). Retrying in 1.5s...`);
          await new Promise(r => setTimeout(r, 1500));
          continue;
        }
        
        throw new Error(errorMessage);
      }

      return await response.json() as ClassifyResult;
    } catch (err) {
      lastError = err;
      
      // Detect offline / network failure — Fallback to offline queue
      if (
        (err instanceof TypeError && err.message.toLowerCase().includes('fetch')) ||
        !navigator.onLine
      ) {
        console.log('Network unavailable. Queuing scan for background sync...');
        await queueScan({
          id:          crypto.randomUUID(),
          imageBase64: compressedBase64,
          userAnswer,
          timestamp:   Date.now(),
        });
        await registerSyncIfSupported();

        return {
          id:                  '',
          noWasteDetected:     false,
          itemName:            '',
          aiAnswer:            null,
          isCorrect:           false,
          pointsEarned:        0,
          newlyUnlockedBadges: [],
          completedMissions:   [],
          description:         null,
          queued:              true,
        };
      }

      // If it's the last attempt and we still failed, throw the error
      if (attempt === MAX_ATTEMPTS) {
        throw lastError;
      }
    }
  }

  throw lastError ?? new Error('Unknown classification error');
};
