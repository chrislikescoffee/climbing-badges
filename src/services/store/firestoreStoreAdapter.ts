import type { ClubStore } from './types';
import type {
  Badge,
  UserProfile,
  UpgradeTier,
  UserBadgeProgress,
  Nomination,
  CommitteeEvictionRequest,
  ClubActivity
} from '../../types';
import {
  subscribeToBadges,
  cloudSaveBadge,
  cloudDeleteBadge,
  cloudForceSyncAllBadges,
  subscribeToUsers,
  cloudSaveUser,
  cloudDeleteUser,
  subscribeToNominations,
  cloudSaveNomination,
  subscribeToEvictions,
  cloudSaveEviction,
  subscribeToUpgradeTiers,
  cloudSaveUpgradeTier,
  subscribeToUserProgress,
  cloudSaveProgress,
  uploadBadgeImageToStorage,
  subscribeToActivities,
  cloudSaveActivity
} from '../firestoreSync';
import { uploadEvidencePhoto } from '../storageSync';

export class FirestoreStoreAdapter implements ClubStore {
  subscribeBadges(
    onData: (badges: Badge[]) => void,
    fallbackBadges: Badge[] = [],
    onError?: (err: Error) => void
  ): () => void {
    return subscribeToBadges(onData, fallbackBadges, onError);
  }

  saveBadge(badge: Badge): Promise<boolean> {
    return cloudSaveBadge(badge);
  }

  deleteBadge(badgeId: string, imageUrl?: string): Promise<boolean> {
    return cloudDeleteBadge(badgeId, imageUrl);
  }

  forceSyncAll(
    badges: Badge[],
    users?: UserProfile[],
    progress?: Record<string, UserBadgeProgress>
  ): Promise<number> {
    return cloudForceSyncAllBadges(badges, users, progress);
  }

  subscribeUserProgress(
    userId: string,
    onData: (progress: Record<string, UserBadgeProgress>) => void,
    fallbackProgress: Record<string, UserBadgeProgress> = {},
    onError?: (err: Error) => void
  ): () => void {
    return subscribeToUserProgress(userId, onData, fallbackProgress, onError);
  }

  async saveProgress(progress: UserBadgeProgress): Promise<boolean> {
    await cloudSaveProgress(progress);
    return true;
  }

  subscribeUsers(
    onData: (users: UserProfile[]) => void,
    fallbackUsers: UserProfile[] = [],
    onError?: (err: Error) => void
  ): () => void {
    return subscribeToUsers(onData, fallbackUsers, onError);
  }

  async saveUser(user: UserProfile): Promise<boolean> {
    await cloudSaveUser(user);
    return true;
  }

  async deleteUser(userId: string): Promise<boolean> {
    await cloudDeleteUser(userId);
    return true;
  }

  subscribeNominations(
    onData: (nominations: Nomination[]) => void,
    fallbackNominations: Nomination[] = [],
    onError?: (err: Error) => void
  ): () => void {
    return subscribeToNominations(onData, fallbackNominations, onError);
  }

  async saveNomination(nomination: Nomination): Promise<boolean> {
    await cloudSaveNomination(nomination);
    return true;
  }

  subscribeEvictions(
    onData: (evictions: CommitteeEvictionRequest[]) => void,
    fallbackEvictions: CommitteeEvictionRequest[] = [],
    onError?: (err: Error) => void
  ): () => void {
    return subscribeToEvictions(onData, fallbackEvictions, onError);
  }

  async saveEviction(eviction: CommitteeEvictionRequest): Promise<boolean> {
    await cloudSaveEviction(eviction);
    return true;
  }

  subscribeUpgradeTiers(
    onData: (tiers: UpgradeTier[]) => void,
    fallbackTiers: UpgradeTier[] = [],
    onError?: (err: Error) => void
  ): () => void {
    return subscribeToUpgradeTiers(onData, fallbackTiers, onError);
  }

  async saveUpgradeTier(tier: UpgradeTier): Promise<boolean> {
    await cloudSaveUpgradeTier(tier);
    return true;
  }

  uploadEvidenceImage(file: File, userId: string, badgeId: string): Promise<string> {
    return uploadEvidencePhoto(file, userId, badgeId);
  }

  uploadBadgeImage(badgeId: string, dataUrl: string): Promise<string> {
    return uploadBadgeImageToStorage(badgeId, dataUrl);
  }

  subscribeActivities(
    onData: (activities: ClubActivity[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    return subscribeToActivities(onData, onError);
  }

  recordActivity(activity: Omit<ClubActivity, 'id'>): Promise<boolean> {
    return cloudSaveActivity(activity);
  }
}
