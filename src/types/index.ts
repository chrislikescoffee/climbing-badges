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
}

export type EvidenceType = 'checkbox' | 'text' | 'photo' | 'photo_and_text';
export type ApprovalMode = 'self' | 'single_reviewer' | 'committee_vote';
export type BadgeCategory = 'climbing' | 'camping' | 'banter' | 'milestone';

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
  imageUrl?: string;
  iconName: string;
  isNominatable: boolean;
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

export interface OfflineQueueItem {
  id: string;
  timestamp: number;
  type: 'log_evidence' | 'nomination';
  payload: any;
  status: 'pending' | 'syncing' | 'failed';
}
