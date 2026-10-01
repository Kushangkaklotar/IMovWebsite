/**
 * IMov - IndexedDB Persistent Binary APK Storage
 * Enables browser storage of real APK binary files (up to several hundred MBs)
 * persisting across reloads, tabs, and visits.
 */

const DB_NAME = 'IMovApkDB';
const DB_VERSION = 1;
const STORE_NAME = 'uploaded_apks';
const RECORD_KEY = 'current_active_apk';

/**
 * Open or create the IndexedDB instance
 */
function openApkDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

/**
 * Save an APK File/Blob permanently in IndexedDB
 */
async function saveApkToIndexedDB(file, meta = {}) {
  const db = await openApkDatabase();

  const record = {
    id: RECORD_KEY,
    blob: file,
    fileName: meta.fileName || file.name || 'IMov-Official.apk',
    fileSize: meta.fileSize || formatBytesToMB(file.size),
    version: meta.version || 'v12.4',
    updatedAt: new Date().toISOString()
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const putRequest = store.put(record);

    putRequest.onsuccess = () => {
      // Also cache metadata in localStorage for instant synchronous lookups
      try {
        localStorage.setItem('imov_active_apk_meta', JSON.stringify({
          fileName: record.fileName,
          fileSize: record.fileSize,
          version: record.version,
          updatedAt: record.updatedAt,
          hasCustomApk: true
        }));
      } catch (e) {
        console.warn('Could not cache metadata to localStorage:', e);
      }
      resolve(record);
    };

    putRequest.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

/**
 * Retrieve the saved APK File/Blob from IndexedDB
 */
async function getApkFromIndexedDB() {
  try {
    const db = await openApkDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(RECORD_KEY);

      getRequest.onsuccess = (event) => {
        const record = event.target.result;
        if (record && record.blob) {
          resolve(record);
        } else {
          resolve(null);
        }
      };

      getRequest.onerror = () => {
        resolve(null);
      };
    });
  } catch (err) {
    console.warn('Error reading from IndexedDB:', err);
    return null;
  }
}

/**
 * Delete the custom APK from IndexedDB
 */
async function deleteApkFromIndexedDB() {
  try {
    const db = await openApkDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const delRequest = store.delete(RECORD_KEY);

      delRequest.onsuccess = () => {
        localStorage.removeItem('imov_active_apk_meta');
        resolve(true);
      };

      delRequest.onerror = () => {
        resolve(false);
      };
    });
  } catch (err) {
    return false;
  }
}

/**
 * Helper to format file byte size into MB
 */
function formatBytesToMB(bytes) {
  if (!bytes || isNaN(bytes)) return '24.8 MB';
  const mb = bytes / (1024 * 1024);
  return mb.toFixed(1) + ' MB';
}

/**
 * Get synchronously cached metadata if available
 */
function getCachedApkMeta() {
  try {
    const raw = localStorage.getItem('imov_active_apk_meta');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}
