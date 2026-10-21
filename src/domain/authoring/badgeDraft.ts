import { useState } from 'react';
import type {
  Badge,
  BadgeCategory,
  BadgeAwardType,
  ApprovalMode,
  BadgeRequirement
} from '../../types';
import { compressImage } from '../../utils/imageCompressor';
import { clubStore } from '../../services/store';

export interface BadgeDraftState {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: BadgeCategory;
  awardType: BadgeAwardType;
  iconName: string;
  imageUrl: string;
  isNominatable: boolean;
  isNominationOnly: boolean;
  approvalMode: ApprovalMode;
  requirements: BadgeRequirement[];
}

export function generateBadgeUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'badge-' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function createEmptyBadgeDraft(): BadgeDraftState {
  return {
    id: generateBadgeUUID(),
    title: '',
    tagline: '',
    description: '',
    category: 'climbing',
    awardType: 'single',
    iconName: 'Mountain',
    imageUrl: '',
    isNominatable: true,
    isNominationOnly: false,
    approvalMode: 'committee_vote',
    requirements: [
      {
        id: 'req_' + Date.now(),
        title: '',
        description: '',
        targetCount: 1,
        evidenceType: 'checkbox'
      }
    ]
  };
}

export function createDraftFromBadge(badge: Badge): BadgeDraftState {
  return {
    id: badge.id,
    title: badge.title,
    tagline: badge.tagline,
    description: badge.description,
    category: badge.category,
    awardType: badge.awardType || 'single',
    iconName: badge.iconName,
    imageUrl: badge.imageUrl || '',
    isNominatable: badge.isNominatable,
    isNominationOnly: Boolean(badge.isNominationOnly),
    approvalMode: badge.approvalMode,
    requirements: badge.requirements.map(r => ({ ...r }))
  };
}

export function validateAndFinalizeBadge(
  draft: BadgeDraftState,
  existingBadge?: Badge | null
): { badge?: Badge; error?: string } {
  const trimmedTitle = draft.title.trim();
  if (!trimmedTitle) {
    return { error: 'Please provide a badge title.' };
  }
  if (!draft.requirements || draft.requirements.length === 0) {
    return { error: 'A badge must contain at least one requirement.' };
  }

  const badgeId = draft.id || generateBadgeUUID();

  const normalizedRequirements: BadgeRequirement[] = draft.requirements.map((r, i) => ({
    ...r,
    id: r.id || `req_${i + 1}`,
    title: r.title.trim() || `Requirement ${i + 1}`,
    targetCount: Math.max(1, Number(r.targetCount) || 1)
  }));

  const badge: Badge = {
    id: badgeId,
    title: trimmedTitle,
    tagline: draft.tagline.trim(),
    description: draft.description.trim(),
    category: draft.category,
    awardType: draft.awardType,
    iconName: draft.iconName,
    imageUrl: draft.imageUrl.trim() || undefined,
    isNominatable: draft.isNominatable,
    isNominationOnly: draft.isNominationOnly,
    approvalMode: draft.approvalMode,
    requirements: normalizedRequirements,
    createdBy: existingBadge ? existingBadge.createdBy : 'committee',
    createdAt: existingBadge ? existingBadge.createdAt : Date.now(),
    isActive: existingBadge ? existingBadge.isActive : true
  };

  return { badge };
}

/**
 * Headless drafting hook for authoring or editing badges.
 */
export function useBadgeDraft() {
  const [draft, setDraft] = useState<BadgeDraftState>(createEmptyBadgeDraft);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const startCreate = () => {
    setDraft(createEmptyBadgeDraft());
    setEditingBadge(null);
    setIsOpen(true);
  };

  const startEdit = (badge: Badge) => {
    setDraft(createDraftFromBadge(badge));
    setEditingBadge(badge);
    setIsOpen(true);
  };

  const closeDraft = () => {
    setIsOpen(false);
    setEditingBadge(null);
  };

  const updateField = <K extends keyof BadgeDraftState>(field: K, value: BadgeDraftState[K]) => {
    setDraft(prev => ({ ...prev, [field]: value }));
  };

  const addRequirement = () => {
    setDraft(prev => ({
      ...prev,
      requirements: [
        ...prev.requirements,
        {
          id: 'req_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
          title: '',
          description: '',
          targetCount: 1,
          evidenceType: 'checkbox'
        }
      ]
    }));
  };

  const removeRequirement = (index: number) => {
    setDraft(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const updateRequirement = (index: number, field: keyof BadgeRequirement, value: any) => {
    setDraft(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) =>
        i === index ? { ...req, [field]: value } : req
      )
    }));
  };

  const handleCustomImageFile = async (file: File) => {
    setIsUploading(true);
    try {
      const compressedDataUrl = await compressImage(file, 256, 256, 0.85);
      setDraft(prev => ({ ...prev, imageUrl: compressedDataUrl }));
    } catch (err) {
      console.error('Image compression failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const saveDraft = async (): Promise<Badge | null> => {
    const { badge, error } = validateAndFinalizeBadge(draft, editingBadge);
    if (error || !badge) {
      alert(error || 'Validation error');
      return null;
    }

    let finalBadge = badge;
    if (finalBadge.imageUrl && finalBadge.imageUrl.startsWith('data:')) {
      const cloudUrl = await clubStore.uploadBadgeImage(finalBadge.id, finalBadge.imageUrl);
      finalBadge = { ...finalBadge, imageUrl: cloudUrl };
    }

    closeDraft();
    return finalBadge;
  };

  return {
    isOpen,
    isCreating: !editingBadge,
    editingBadge,
    draft,
    isUploading,
    startCreate,
    startEdit,
    closeDraft,
    updateField,
    addRequirement,
    removeRequirement,
    updateRequirement,
    handleCustomImageFile,
    saveDraft
  };
}
