export type UserRole = 'admin' | 'committee' | 'member';
export type UserStatus = 'active' | 'evicted';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  role: UserRole;
  status: UserStatus;
  createdAt: number;
  badgeViewMode?: 'compact' | 'expanded';
}

export type EvidenceType = 'checkbox' | 'text' | 'photo_mandatory' | 'photo_and_text';
export type ApprovalMode = 'self' | 'single_reviewer' | 'committee_vote';
export type BadgeCategory = 'climbing' | 'camping' | 'life_skills' | 'milestone';
export type BadgeAwardType = 'single' | 'repeatable' | 'upgradable';

export interface UpgradeTier {
  level: number;
  name: string;
  color: string; // Hex color code for borders & glow
  description?: string;
}

export interface BadgeRequirement {
  id: string;
  title: string;
  description?: string;
  targetCount: number;
  evidenceType: EvidenceType;
}

export interface Badge {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: BadgeCategory;
  awardType: BadgeAwardType; // single, repeatable (x2, x3), or upgradable (colored border tiers)
  imageUrl?: string;
  iconName: string;
  isNominatable: boolean;
  isNominationOnly?: boolean;
  approvalMode: ApprovalMode;
  requirements: BadgeRequirement[];
  createdBy: string;
  createdAt: number;
  isActive: boolean;
}

export interface EvidenceLog {
  id: string;
  timestamp: number;
  text?: string;
  mandatoryPhotoUrl?: string;
  optionalPhotoUrls?: string[];
  photoUrls?: string[];
  countDelta: number;
  recordedBy: string;
}

export interface RequirementProgress {
  requirementId: string;
  currentCount: number;
  completed: boolean;
  evidenceLogs: EvidenceLog[];
}

export type BadgeProgressStatus = 'locked' | 'in_progress' | 'pending_review' | 'awarded';

export interface UserBadgeProgress {
  id: string;
  userId: string;
  badgeId: string;
  status: BadgeProgressStatus;
  progress: Record<string, RequirementProgress>;
  awardedAt?: number;
  awardedBy?: string[];
  nominationId?: string;
  awardedCount?: number; // For repeatable badges: 1, 2, 3... (x2, x3)
  upgradeTier?: number;  // For upgradable badges: 1 (Bronze), 2 (Silver), 3 (Gold)...
  awardHistory?: {
    timestamp: number;
    count?: number;
    tier?: number;
  }[];
}

export interface Nomination {
  id: string;
  badgeId: string;
  nomineeUserId: string;
  nominatorUserId: string;
  nomineeDisplayName: string;
  nominatorDisplayName: string;
  reason: string;
  photoUrls?: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  votes: Record<string, { vote: 'approve' | 'reject'; comment?: string; timestamp: number }>;
  requiredVotes: number;
}

export interface CommitteeEvictionRequest {
  id: string;
  targetUserId: string;
  targetDisplayName: string;
  targetEmail: string;
  requestedByUserId: string;
  requestedByDisplayName: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  resolvedAt?: number;
  resolvedByUserId?: string;
  resolvedByDisplayName?: string;
}

export type ActivityType = 'user_joined' | 'badge_created' | 'badge_updated' | 'badge_awarded';

export interface ClubActivity {
  id: string;
  type: ActivityType;
  timestamp: number;
  actorUserId?: string;
  actorDisplayName?: string;
  actorAvatarUrl?: string;
  targetBadgeId?: string;
  targetBadgeTitle?: string;
  targetBadgeIcon?: string;
  targetBadgeImageUrl?: string;
  details?: {
    awardCount?: number;
    upgradeTier?: number;
    category?: string;
    summary?: string;
  };
}

