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

export class MemoryStoreAdapter implements ClubStore {
  badges = new Map<string, Badge>();
  users = new Map<string, UserProfile>();
  progress = new Map<string, UserBadgeProgress>();
  nominations = new Map<string, Nomination>();
  evictions = new Map<string, CommitteeEvictionRequest>();
  tiers = new Map<number, UpgradeTier>();
  activities = new Map<string, ClubActivity>();

  private badgeSubscribers = new Set<(badges: Badge[]) => void>();
  private userSubscribers = new Set<(users: UserProfile[]) => void>();
  private nominationSubscribers = new Set<(noms: Nomination[]) => void>();
  private evictionSubscribers = new Set<(evictions: CommitteeEvictionRequest[]) => void>();
  private tierSubscribers = new Set<(tiers: UpgradeTier[]) => void>();
  private activitySubscribers = new Set<(acts: ClubActivity[]) => void>();
  private progressSubscribers = new Map<string, Set<(prog: Record<string, UserBadgeProgress>) => void>>();

  subscribeBadges(
    onData: (badges: Badge[]) => void,
    fallbackBadges: Badge[] = []
  ): () => void {
    if (this.badges.size === 0 && fallbackBadges.length > 0) {
      fallbackBadges.forEach(b => this.badges.set(b.id, b));
    }
    onData(Array.from(this.badges.values()));
    this.badgeSubscribers.add(onData);
    return () => this.badgeSubscribers.delete(onData);
  }

  async saveBadge(badge: Badge): Promise<boolean> {
    this.badges.set(badge.id, badge);
    const list = Array.from(this.badges.values());
    this.badgeSubscribers.forEach(cb => cb(list));
    return true;
  }

  async deleteBadge(badgeId: string): Promise<boolean> {
    const deleted = this.badges.delete(badgeId);
    if (deleted) {
      const list = Array.from(this.badges.values());
      this.badgeSubscribers.forEach(cb => cb(list));
    }
    return deleted;
  }

  async forceSyncAll(badges: Badge[]): Promise<number> {
    badges.forEach(b => this.badges.set(b.id, b));
    return badges.length;
  }

  subscribeUserProgress(
    userId: string,
    onData: (prog: Record<string, UserBadgeProgress>) => void
  ): () => void {
    const userProgs = this.getUserProgressMap(userId);
    onData(userProgs);

    if (!this.progressSubscribers.has(userId)) {
      this.progressSubscribers.set(userId, new Set());
    }
    const subs = this.progressSubscribers.get(userId)!;
    subs.add(onData);
    return () => subs.delete(onData);
  }

  async saveProgress(item: UserBadgeProgress): Promise<boolean> {
    this.progress.set(item.id, item);
    const subs = this.progressSubscribers.get(item.userId);
    if (subs) {
      const userProgs = this.getUserProgressMap(item.userId);
      subs.forEach(cb => cb(userProgs));
    }
    return true;
  }

  private getUserProgressMap(userId: string): Record<string, UserBadgeProgress> {
    const result: Record<string, UserBadgeProgress> = {};
    for (const item of this.progress.values()) {
      if (item.userId === userId) {
        result[item.badgeId] = item;
      }
    }
    return result;
  }

  subscribeUsers(
    onData: (users: UserProfile[]) => void,
    fallbackUsers: UserProfile[] = []
  ): () => void {
    if (this.users.size === 0 && fallbackUsers.length > 0) {
      fallbackUsers.forEach(u => this.users.set(u.uid, u));
    }
    onData(Array.from(this.users.values()));
    this.userSubscribers.add(onData);
    return () => this.userSubscribers.delete(onData);
  }

  async saveUser(user: UserProfile): Promise<boolean> {
    this.users.set(user.uid, user);
    const list = Array.from(this.users.values());
    this.userSubscribers.forEach(cb => cb(list));
    return true;
  }

  async deleteUser(userId: string): Promise<boolean> {
    const deleted = this.users.delete(userId);
    if (deleted) {
      const list = Array.from(this.users.values());
      this.userSubscribers.forEach(cb => cb(list));
    }
    return deleted;
  }

  subscribeNominations(
    onData: (nominations: Nomination[]) => void
  ): () => void {
    onData(Array.from(this.nominations.values()));
    this.nominationSubscribers.add(onData);
    return () => this.nominationSubscribers.delete(onData);
  }

  async saveNomination(nomination: Nomination): Promise<boolean> {
    this.nominations.set(nomination.id, nomination);
    const list = Array.from(this.nominations.values());
    this.nominationSubscribers.forEach(cb => cb(list));
    return true;
  }

  subscribeEvictions(
    onData: (evictions: CommitteeEvictionRequest[]) => void
  ): () => void {
    onData(Array.from(this.evictions.values()));
    this.evictionSubscribers.add(onData);
    return () => this.evictionSubscribers.delete(onData);
  }

  async saveEviction(eviction: CommitteeEvictionRequest): Promise<boolean> {
    this.evictions.set(eviction.id, eviction);
    const list = Array.from(this.evictions.values());
    this.evictionSubscribers.forEach(cb => cb(list));
    return true;
  }

  subscribeUpgradeTiers(
    onData: (tiers: UpgradeTier[]) => void,
    fallbackTiers: UpgradeTier[] = []
  ): () => void {
    if (this.tiers.size === 0 && fallbackTiers.length > 0) {
      fallbackTiers.forEach(t => this.tiers.set(t.level, t));
    }
    onData(Array.from(this.tiers.values()));
    this.tierSubscribers.add(onData);
    return () => this.tierSubscribers.delete(onData);
  }

  async saveUpgradeTier(tier: UpgradeTier): Promise<boolean> {
    this.tiers.set(tier.level, tier);
    const list = Array.from(this.tiers.values());
    this.tierSubscribers.forEach(cb => cb(list));
    return true;
  }

  async uploadEvidenceImage(file: File): Promise<string> {
    return `memory://evidence/${file.name}`;
  }

  async uploadBadgeImage(_badgeId: string, dataUrl: string): Promise<string> {
    return dataUrl;
  }

  subscribeActivities(onData: (acts: ClubActivity[]) => void): () => void {
    const list = Array.from(this.activities.values()).sort((a, b) => b.timestamp - a.timestamp);
    onData(list);
    this.activitySubscribers.add(onData);
    return () => this.activitySubscribers.delete(onData);
  }

  async recordActivity(activity: Omit<ClubActivity, 'id'>): Promise<boolean> {
    const id = 'act_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    const item: ClubActivity = { ...activity, id };
    this.activities.set(id, item);
    const list = Array.from(this.activities.values()).sort((a, b) => b.timestamp - a.timestamp);
    this.activitySubscribers.forEach(cb => cb(list));
    return true;
  }
}
