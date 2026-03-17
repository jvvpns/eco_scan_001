import * as admin from 'firebase-admin';

/**
 * Lazily initializes Firebase Admin SDK exactly once per serverless cold start.
 * The service account JSON is stored as a Vercel environment variable
 * (FIREBASE_SERVICE_ACCOUNT) — never in source code.
 */
let initialized = false;

export function getAdminApp(): admin.app.App {
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
        // We replace control characters specifically (U+0000 to U+001F) with escaped versions
        // EXCEPT for ones that are structural (which shouldn't really exist in a flat JSON string anyway).
        
        // This regex finds actual newline characters (and other control chars) 
        // and replaces them with the string representation '\n'.
        const repaired = raw
          .replace(/[\u0000-\u001F]/g, (char) => {
            if (char === '\n') return '\\n';
            if (char === '\r') return '\\r';
            if (char === '\t') return '\\t';
            return ''; // Drop others
          })
          // Also handle cases where double escaping occurred
          .replace(/\\\\n/g, '\\n')
          ;

        // Try parsing the repaired string
        serviceAccountJson = JSON.parse(repaired);
      }
    } catch (err: any) {
      console.error('FIREBASE_SERVICE_ACCOUNT_PARSE_FATAL:', err.message);
      // If we still fail, provide a snippet of the string to help verify the env var content
      const hint = serviceAccount.substring(0, 100).replace(/\n/g, '[NL]');
      throw new Error(`CRITICAL: Firebase Service Account JSON is malformed. Hint (start of string): ${hint}. Error: ${err.message}`);
    }

    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountJson),
      });
      console.log('Firebase Admin initialized for project:', serviceAccountJson.project_id);
    } catch (err) {
      console.error('Firebase Admin initialization error:', err);
      throw err;
    }

    initialized = true;
  }

  return admin.app();
}

export function getAdminFirestore(): admin.firestore.Firestore {
  return getAdminApp().firestore();
}

export function getAdminAuth(): admin.auth.Auth {
  return getAdminApp().auth();
}
