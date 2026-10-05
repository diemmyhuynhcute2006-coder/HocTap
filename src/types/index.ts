export type ActivityType =
  | 'study'
  | 'work'
  | 'reading'
  | 'planning'
  | 'writing'
  | 'creative'
  | 'other';

export interface ActivityMeta {
  type: ActivityType;
  label: string;
  iconName: string;
  color: string;
}

export type SessionStatus = 'completed' | 'abandoned';

export interface FocusSession {
  id: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  activityType: ActivityType;
  goal: string;
  durationMinutes: number;
  actualMinutes: number;
  status: SessionStatus;
  pointsEarned: number;
  dateStr: string; // YYYY-MM-DD
}

export type CharacterState = 'welcome' | 'idle' | 'focus' | 'complete' | 'giveup';

export type ItemCategory =
  | 'plants'
  | 'furniture'
  | 'wall'
  | 'pets'
  | 'window'
  | 'themes';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  price: number; // in Focus Points
  icon: string;
  rarity?: 'common' | 'rare' | 'special';
  streakRequired?: number; // e.g. 5 for 5-day streak exclusive
  windowType?: string;
  themeId?: ThemeColor;
}

export type ThemeColor = 'green' | 'blue' | 'pink' | 'purple' | 'brown' | 'white';

export interface RoomCustomization {
  deskItem: string | null;
  wallItem: string | null;
  floorItem: string | null;
  shelfItem: string | null;
  petItem: string | null;
  windowView: string;
  lampOn: boolean;
}

export interface UserSettings {
  themeColor: ThemeColor;
  darkMode: boolean;
  soundVolume: number;
  ambientSound: 'none' | 'rain' | 'fireplace' | 'cafe' | 'forest' | 'whitenoise';
  timerChime: boolean;
  showCharacter: boolean;
  showPet: boolean;
  hasSeenWelcome: boolean;
}

export interface UserProgress {
  focusPoints: number;
  totalPointsEarned: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null; // YYYY-MM-DD
  ownedItemIds: string[];
  roomSetup: RoomCustomization;
  sessions: FocusSession[];
  streakRewardsClaimed: number[];
}
