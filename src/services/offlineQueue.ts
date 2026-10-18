import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';
import type { OfflineQueueItem } from '../types';

const DB_NAME = 'climbing-badges-offline-db';
const DB_VERSION = 1;
const STORE_NAME = 'offline_queue';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      }
    });
  }
  return dbPromise;
}

export async function addQueueItem(item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'status'>): Promise<OfflineQueueItem> {
  const db = await getDb();
  const queueItem: OfflineQueueItem = {
    ...item,
    id: 'offline_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    timestamp: Date.now(),
    status: 'pending'
  };
  await db.put(STORE_NAME, queueItem);
  return queueItem;
}

export async function getQueueItems(): Promise<OfflineQueueItem[]> {
  const db = await getDb();
  return db.getAll(STORE_NAME);
}

export async function removeQueueItem(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORE_NAME, id);
}

export async function clearQueue(): Promise<void> {
  const db = await getDb();
  await db.clear(STORE_NAME);
}
