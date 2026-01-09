// IndexedDB utility for storing large data like images

const DB_NAME = 'BananaSlidesDB';
const DB_VERSION = 1;
const HISTORY_STORE = 'history';
const SETTINGS_STORE = 'settings';

interface HistoryItemData {
  id: string;
  timestamp: number;
  userInput: string;
  deck: {
    title: string;
    styleInstruction: string;
    summary: string;
    slides: {
      pageNumber: number;
      narrativeGoal: string;
      keyContent: string;
      visual: string;
      layout: string;
      generatedImageUrl?: string;
      customStyleVariables?: string;
    }[];
    socialMedia: {
      title: string;
      intro: string;
      tags: string[];
    };
  };
}

interface AppSettingsData {
  apiKey: string;
  systemPrompt: string;
  socialPrompt: string;
  styleVariables: string;
  aspectRatio: string;
}

let db: IDBDatabase | null = null;

// Initialize IndexedDB
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create history store
      if (!database.objectStoreNames.contains(HISTORY_STORE)) {
        const historyStore = database.createObjectStore(HISTORY_STORE, { keyPath: 'id' });
        historyStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Create settings store
      if (!database.objectStoreNames.contains(SETTINGS_STORE)) {
        database.createObjectStore(SETTINGS_STORE, { keyPath: 'id' });
      }
    };
  });
};

// Get database instance
const getDB = async (): Promise<IDBDatabase> => {
  if (db) return db;
  return initDB();
};

// History operations
export const saveHistoryItem = async (item: HistoryItemData): Promise<void> => {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([HISTORY_STORE], 'readwrite');
    const store = transaction.objectStore(HISTORY_STORE);
    const request = store.put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getAllHistory = async (): Promise<HistoryItemData[]> => {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([HISTORY_STORE], 'readonly');
    const store = transaction.objectStore(HISTORY_STORE);
    const index = store.index('timestamp');
    const request = index.getAll(IDBKeyRange.lowerBound(0));
    request.onsuccess = () => {
      // Sort by timestamp descending (newest first)
      const results = request.result.sort((a: HistoryItemData, b: HistoryItemData) => b.timestamp - a.timestamp);
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteHistoryItem = async (id: string): Promise<void> => {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([HISTORY_STORE], 'readwrite');
    const store = transaction.objectStore(HISTORY_STORE);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const clearAllHistory = async (): Promise<void> => {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([HISTORY_STORE], 'readwrite');
    const store = transaction.objectStore(HISTORY_STORE);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Settings operations
export const saveSettings = async (settings: AppSettingsData): Promise<void> => {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([SETTINGS_STORE], 'readwrite');
    const store = transaction.objectStore(SETTINGS_STORE);
    const request = store.put({ id: 'app_settings', ...settings });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getSettings = async (): Promise<AppSettingsData | null> => {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([SETTINGS_STORE], 'readonly');
    const store = transaction.objectStore(SETTINGS_STORE);
    const request = store.get('app_settings');
    request.onsuccess = () => {
      if (request.result) {
        const { id, ...settings } = request.result;
        resolve(settings as AppSettingsData);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
};
