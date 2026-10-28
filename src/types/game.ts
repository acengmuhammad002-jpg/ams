export type SliceType = 'number' | 'zonk' | 'coba_lagi';

export interface SliceItem {
  id: string;
  type: SliceType;
  value: number; // 0 for zonk/coba_lagi, or 5, 10, 15, 20
  label: string; // "5", "10", "15", "20", "ZONK", "COBA LAGI"
  color: string; // hex color for wedge background
  textColor: string;
  subLabel?: string;
}

export interface PrizeConfig {
  value: number;
  name: string;
  description: string;
  badgeColor: string; // css classes or hex
  iconType?: 'small' | 'medium' | 'large' | 'grand';
}

export interface GameSettings {
  gameTitle: string;
  subTitle: string;
  initialChances: number;
  maxExtraChances: number;
  allowMultiplePrizes: boolean; // true = can win multiple prizes; false = highest prize only
  prizes: PrizeConfig[];
  slices: SliceItem[];
  adminPin: string;
  soundEnabled: boolean;
  bgmEnabled: boolean;
  winProbabilityPercent: number; // e.g. 3.5% for rare/small chance
}

export interface ThrowLog {
  id: string;
  throwNumber: number;
  slice: SliceItem;
  sliceIndex: number;
  timestamp: number;
  prizeWon?: string;
  pointEarned: number;
  isExtraChance: boolean;
}

export interface PlayerHistoryEntry {
  id: string;
  studentName: string;
  date: string;
  timestamp: number;
  totalScore: number;
  throws: ThrowLog[];
  prizesWon: { value: number; name: string }[];
  isClaimed: boolean;
  claimedAt?: string;
}

export interface DartCoord {
  id: string;
  x: number; // coordinate relative to SVG center (0,0)
  y: number;
  angle: number; // dart rotation angle in degrees
  sliceIndex: number;
  label: string;
}
