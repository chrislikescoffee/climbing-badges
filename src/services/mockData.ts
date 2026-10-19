import type { Badge, UserProfile, CommitteeEvictionRequest, UpgradeTier } from '../types';

export const INITIAL_UPGRADE_TIERS: UpgradeTier[] = [
  { level: 1, name: 'Bronze', color: '#cd7f32', description: 'Foundational completion' },
  { level: 2, name: 'Silver', color: '#cbd5e1', description: 'Proven proficiency' },
  { level: 3, name: 'Gold', color: '#ffd700', description: 'Mastery & precision' },
  { level: 4, name: 'Emerald', color: '#10b981', description: 'Crag veteran achievement' },
  { level: 5, name: 'Diamond Cyan', color: '#06b6d4', description: 'Legendary crag status' }
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'a1b2c3d4-0001-4000-8000-000000000001',
    title: 'Early Riser',
    tagline: 'First one boiling water while everyone else snores.',
    description: 'Be out of bed and ready to go before all other members of the group are out of bed.',
    category: 'camping',
    awardType: 'repeatable',
    iconName: 'Sunrise',
    isNominatable: true,
    isNominationOnly: false,
    approvalMode: 'single_reviewer',
    requirements: [
      {
        id: 'req_early_awake',
        title: 'Dawn Camp Awake',
        description: 'Prove you were brewing coffee or packing gear while the rest of the tents were silent.',
        targetCount: 1,
        evidenceType: 'photo_and_text'
      }
    ],
    createdBy: 'admin',
    createdAt: Date.now() - 10000000,
    isActive: true
  },
  {
    id: 'a1b2c3d4-0002-4000-8000-000000000002',
    title: 'Proficient Cleaner',
    tagline: 'Leave no trace, leave no gear behind.',
    description: 'Master anchor cleaning under varied conditions with clean rope management.',
    category: 'climbing',
    awardType: 'upgradable',
    iconName: 'ShieldCheck',
    isNominatable: false,
    isNominationOnly: false,
    approvalMode: 'committee_vote',
    requirements: [
      {
        id: 'clean-method-a',
        title: 'Clean anchors using Method A (Thread & Lower)',
        description: 'Safely cleaned five anchors using standard thread & lower protocol.',
        targetCount: 5,
        evidenceType: 'text'
      },
      {
        id: 'clean-method-b',
        title: 'Clean anchors using Method B (Rappel Clean)',
        description: 'Safely cleaned three anchors on personal tether & rappel device.',
        targetCount: 3,
        evidenceType: 'text'
      },
      {
        id: 'clean-adverse',
        title: 'Clean in Adverse Circumstances',
        description: 'At least one clean performed in high wind, rain, dusk or awkward hanging stance.',
        targetCount: 1,
        evidenceType: 'photo_mandatory'
      }
    ],
    createdBy: 'admin',
    createdAt: Date.now() - 9000000,
    isActive: true
  },
  {
    id: 'a1b2c3d4-0003-4000-8000-000000000003',
    title: 'Dirtbag Barista',
    tagline: 'Life is too short for instant coffee at the crag.',
    description: 'Successfully brew freshly ground espresso or pour-over at the crag base or hanging belay.',
    category: 'camping',
    awardType: 'repeatable',
    iconName: 'Coffee',
    isNominatable: true,
    isNominationOnly: false,
    approvalMode: 'single_reviewer',
    requirements: [
      {
        id: 'crag-coffee',
        title: 'Gourmet Crag Brew',
        description: 'Serve a hot, non-instant coffee to at least one climbing partner before 10am.',
        targetCount: 2,
        evidenceType: 'photo_and_text'
      }
    ],
    createdBy: 'admin',
    createdAt: Date.now() - 8000000,
    isActive: true
  },
  {
    id: 'a1b2c3d4-0004-4000-8000-000000000004',
    title: 'Epic Bail',
    tagline: 'The mountain will always be there tomorrow.',
    description: 'Make a sound judgment call to bail off a route or pack up camp due to weather, darkness, or good sense.',
    category: 'life_skills',
    awardType: 'repeatable',
    iconName: 'CornerUpLeft',
    isNominatable: true,
    isNominationOnly: true,
    approvalMode: 'committee_vote',
    requirements: [
      {
        id: 'bail-story',
        title: 'The Great Retreat',
        description: 'Document the dramatic retreat and sacrificial bail carabiner/sling left behind.',
        targetCount: 1,
        evidenceType: 'photo_and_text'
      }
    ],
    createdBy: 'admin',
    createdAt: Date.now() - 7000000,
    isActive: true
  },
  {
    id: 'a1b2c3d4-0005-4000-8000-000000000005',
    title: 'Campfire Maestro',
    tagline: 'One match. Zero firestarter. Pure bushcraft.',
    description: 'Light a roaring campfire in challenging damp conditions using only single match and natural tinder.',
    category: 'camping',
    awardType: 'single',
    iconName: 'Flame',
    isNominatable: true,
    isNominationOnly: false,
    approvalMode: 'single_reviewer',
    requirements: [
      {
        id: 'campfire-proof',
        title: 'Single Match Light',
        description: 'Ignite and sustain a stable cooking campfire using exactly one match.',
        targetCount: 1,
        evidenceType: 'photo_mandatory'
      }
    ],
    createdBy: 'admin',
    createdAt: Date.now() - 6000000,
    isActive: true
  }
];

export const MOCK_USERS: UserProfile[] = [];

export const INITIAL_EVICTION_REQUESTS: CommitteeEvictionRequest[] = [];
