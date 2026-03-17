/**
 * offlineQueue.ts
 * ───────────────
 * IndexedDB-backed queue for scans captured while offline.
 * When the user is offline, scans are stored here and replayed
 * via the Service Worker Background Sync API when connectivity returns.
 */

const DB_NAME    = 'pilot-offline';
const STORE_NAME = 'pending-scans';
const DB_VERSION = 1;

export interface PendingScan {
  id:           string;   // uuid generated client-side
  imageBase64:  string;   // compressed JPEG base64 (no data: prefix)
  userAnswer:   string;   // 'Special' | 'Non-Biodegradable' | 'Biodegradable' | 'Residual'
  timestamp:    number;   // Date.now()
}

// ─── DB INITIALISER ───────────────────────────────────────────

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
    request.onerror   = ()      => reject(request.error);
  });
}

// ─── PUBLIC API ───────────────────────────────────────────────

/** Adds a scan to the offline queue. */
export async function queueScan(entry: PendingScan): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req   = store.put(entry);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

/** Returns all pending scans in insertion order. */
export async function getPendingScans(): Promise<PendingScan[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req   = store.getAll();
    req.onsuccess = () => { db.close(); resolve(req.result as PendingScan[]); };
    req.onerror   = () => reject(req.error);
  });
}

/** Removes a processed scan from the queue by id. */
export async function removeScan(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req   = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

/** Returns the count of pending scans (useful for a badge UI). */
export async function pendingScanCount(): Promise<number> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req   = store.count();
    req.onsuccess = () => { db.close(); resolve(req.result); };
    req.onerror   = () => reject(req.error);
  });
}

/** Registers a Background Sync event if the browser supports it. */
export async function registerSyncIfSupported(): Promise<void> {
  if (!('serviceWorker' in navigator) || !('SyncManager' in window)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    // @ts-ignore – SyncManager is not yet in all TS lib types
    await reg.sync.register('sync-scans');
  } catch (err) {
    console.warn('Background Sync registration failed:', err);
  }
}
