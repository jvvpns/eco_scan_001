/**
 * geminiService.ts — RETIRED
 * ───────────────────────────
 * The Gemini API key is no longer used on the frontend.
 * All AI classification is now handled server-side via the Vercel
 * /api/classify endpoint, where the key is stored as a secret env var.
 *
 * This file is kept as a compatibility shim. Consumers should migrate
 * to `scanService.classifyAndScore`.
 */

export { classifyAndScore as identifyGarbage } from './scanService';

// Re-export the result type so existing imports don't need to change
export type { ClassifyResult as GarbageIdentificationResult } from './scanService';