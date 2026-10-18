import type { Badge, UserProfile } from '../types';

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'early-riser',
    title: 'Early Riser',
    tagline: 'First one boiling water while everyone else snores.',
    description: 'Be out of bed and ready to go before all other members of the group are out of bed.',
    category: 'camping',
    iconName: 'Sunrise',
    isNominatable: true,
    approvalMode: 'single_reviewer',
    requirements: [
      {
        id: 'out-of-bed-first',
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
    id: 'proficient-cleaner',
    title: 'Proficient Cleaner',
    tagline: 'Leave no trace, leave no gear behind.',
    description: 'Master anchor cleaning under varied conditions with clean rope management.',
    category: 'climbing',
    iconName: 'ShieldCheck',
    isNominatable: false,
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
        evidenceType: 'photo_and_text'
      }
    ],
    createdBy: 'admin',
    createdAt: Date.now() - 9000000,
    isActive: true
  },
  {
    id: 'dirtbag-barista',
    title: 'Dirtbag Barista',
    tagline: 'Life is too short for instant coffee at the crag.',
    description: 'Successfully brew freshly ground espresso or pour-over at the crag base or hanging belay.',
    category: 'camping',
    iconName: 'Coffee',
    isNominatable: true,
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
    id: 'epic-bail',
    title: 'Epic Bail',
    tagline: 'The mountain will always be there tomorrow.',
    description: 'Make a sound judgment call to bail off a route or pack up camp due to weather, darkness, or good sense.',
    category: 'banter',
    iconName: 'CornerUpLeft',
    isNominatable: true,
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
    id: 'campfire-maestro',
    title: 'Campfire Maestro',
    tagline: 'One match. Zero firestarter. Pure bushcraft.',
    description: 'Light a roaring campfire in challenging damp conditions using only single match and natural tinder.',
    category: 'camping',
    iconName: 'Flame',
    isNominatable: true,
    approvalMode: 'single_reviewer',
    requirements: [
      {
        id: 'one-match-fire',
        title: 'Single Match Fire',
        description: 'Sustain campfire for over 1 hour starting from only 1 match.',
        targetCount: 1,
        evidenceType: 'photo'
      }
    ],
    createdBy: 'admin',
    createdAt: Date.now() - 6000000,
    isActive: true
  },
  {
    id: 'whipper-survivor',
    title: 'Whipper Survivor',
    tagline: 'Catch air, not hospital beds.',
    description: 'Take a clean, safe, leader fall of at least 3 meters on sport or trad with perfect belay catch.',
    category: 'climbing',
    iconName: 'Zap',
    isNominatable: true,
    approvalMode: 'committee_vote',
    requirements: [
      {
        id: 'clean-fall',
        title: 'Airborne Flight',
        description: 'Document or witness testimony of a safe leader fall taken with good technique.',
        targetCount: 1,
        evidenceType: 'text'
      }
    ],
    createdBy: 'admin',
    createdAt: Date.now() - 5000000,
    isActive: true
  }
];

export const MOCK_USERS: UserProfile[] = [
  {
    uid: 'user-chris',
    email: 'chris@example.com',
    displayName: 'Chris "Granite" H.',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Chris',
    role: 'admin',
    createdAt: Date.now() - 20000000
  },
  {
    uid: 'user-sam',
    email: 'sam@example.com',
    displayName: 'Sam "BelaySlave" P.',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sam',
    role: 'committee',
    createdAt: Date.now() - 18000000
  },
  {
    uid: 'user-alex',
    email: 'alex@example.com',
    displayName: 'Alex "ChalkBag" D.',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex',
    role: 'committee',
    createdAt: Date.now() - 15000000
  },
  {
    uid: 'user-taylor',
    email: 'taylor@example.com',
    displayName: 'Taylor "CampChef" W.',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Taylor',
    role: 'member',
    createdAt: Date.now() - 10000000
  }
];
