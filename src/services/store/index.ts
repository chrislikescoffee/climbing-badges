import type { ClubStore } from './types';
import { FirestoreStoreAdapter } from './firestoreStoreAdapter';
import { MemoryStoreAdapter } from './memoryStoreAdapter';

export * from './types';
export { FirestoreStoreAdapter, MemoryStoreAdapter };

// Default production singleton
export const clubStore: ClubStore = new FirestoreStoreAdapter();
