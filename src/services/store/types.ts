import type {
  Badge,
  UserProfile,
  UpgradeTier,
  UserBadgeProgress,
  Nomination,
  CommitteeEvictionRequest,
  ClubActivity
} from '../../types';

export interface ClubStore {
  // Badges
  subscribeBadges(
    onData: (badges: Badge[]) => void,
    fallbackBadges?: Badge[],
    onError?: (err: Error) => void
  ): () => void;
  saveBadge(badge: Badge): Promise<boolean>;
  deleteBadge(badgeId: string, imageUrl?: string): Promise<boolean>;
  forceSyncAll(
    badges: Badge[],
    users?: UserProfile[],
    progress?: Record<string, UserBadgeProgress>
  ): Promise<number>;

  // User Progress
  subscribeUserProgress(
    userId: string,
    onData: (progress: Record<string, UserBadgeProgress>) => void,
    fallbackProgress?: Record<string, UserBadgeProgress>,
    onError?: (err: Error) => void
  ): () => void;
  saveProgress(progress: UserBadgeProgress): Promise<boolean>;

  // Users
  subscribeUsers(
    onData: (users: UserProfile[]) => void,
    fallbackUsers?: UserProfile[],
    onError?: (err: Error) => void
  ): () => void;
  saveUser(user: UserProfile): Promise<boolean>;
  deleteUser(userId: string): Promise<boolean>;

  // Nominations
  subscribeNominations(
    onData: (nominations: Nomination[]) => void,
    fallbackNominations?: Nomination[],
    onError?: (err: Error) => void
  ): () => void;
  saveNomination(nomination: Nomination): Promise<boolean>;

  // Committee Evictions
  subscribeEvictions(
    onData: (evictions: CommitteeEvictionRequest[]) => void,
    fallbackEvictions?: CommitteeEvictionRequest[],
    onError?: (err: Error) => void
  ): () => void;
  saveEviction(eviction: CommitteeEvictionRequest): Promise<boolean>;

  // Upgrade Tiers
  subscribeUpgradeTiers(
    onData: (tiers: UpgradeTier[]) => void,
    fallbackTiers?: UpgradeTier[],
    onError?: (err: Error) => void
  ): () => void;
  saveUpgradeTier(tier: UpgradeTier): Promise<boolean>;

  // Storage / Proof Upload
  uploadEvidenceImage(file: File, userId: string, badgeId: string): Promise<string>;
  uploadBadgeImage(badgeId: string, dataUrl: string): Promise<string>;

  // Activity Feed
  subscribeActivities(
    onData: (activities: ClubActivity[]) => void,
    onError?: (err: Error) => void
  ): () => void;
  recordActivity(activity: Omit<ClubActivity, 'id'>): Promise<boolean>;
}
