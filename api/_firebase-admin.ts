import { initializeApp, getApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Lazily initializes Firebase Admin SDK exactly once per serverless cold start.
 * The service account JSON is stored as a Vercel environment variable
 * (FIREBASE_SERVICE_ACCOUNT) — never in source code.
 */
let initialized = false;

export function getAdminApp() {
  if (!initialized) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccount) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set.');
    }

    let serviceAccountJson;
    try {
      // 1. Basic sanitization (trim, remove extra quotes)
      let raw = (serviceAccount || '').trim();
      if (raw.startsWith("'") && raw.endsWith("'")) raw = raw.slice(1, -1);
      if (raw.startsWith('"') && raw.endsWith('"')) raw = raw.slice(1, -1);
      
      try {
        // Try standard parse
        serviceAccountJson = JSON.parse(raw);
      } catch (err) {
        // 2. Repair Strategy: Vercel/CLI can inject literal newlines into the string.
        const repaired = raw
          .replace(/[\u0000-\u001F]/g, (char) => {
            if (char === '\n') return '\\n';
            if (char === '\r') return '\\r';
            if (char === '\t') return '\\t';
            return ''; // Drop others
          })
          .replace(/\\\\n/g, '\\n');

        serviceAccountJson = JSON.parse(repaired);
      }
    } catch (err: any) {
      console.error('FIREBASE_SERVICE_ACCOUNT_PARSE_FATAL:', err.message);
      const hint = serviceAccount.substring(0, 100).replace(/\n/g, '[NL]');
      throw new Error(`CRITICAL: Firebase Service Account JSON is malformed. Hint (start of string): ${hint}. Error: ${err.message}`);
    }

    try {
      if (getApps().length === 0) {
        initializeApp({
          credential: cert(serviceAccountJson),
        });
      }
      console.log('Firebase Admin initialized for project:', serviceAccountJson.project_id);
    } catch (err) {
      console.error('Firebase Admin initialization error:', err);
      throw err;
    }

    initialized = true;
  }

  return getApp();
}

export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}
