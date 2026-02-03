export type ClassType = 'Elf' | 'Dark Wizard' | 'Dark Lord' | 'Dark Knight';

export interface Player {
  id: string;
  name: string;
  class: ClassType;
  cp: string; // Combat Power
  dkp: number;
  role: 'DPS' | 'Tank' | 'Healer';
  avatarUrl: string;
  status: 'Online' | 'Offline';
}

export type Rarity = 'Legendary' | 'Epic' | 'Rare' | 'Uncommon' | 'Common';

export interface Item {
  id: string;
  name: string;
  rarity: Rarity;
  stats: string;
  chance: string;
  iconUrl: string;
  cost: number; // DKP Cost
  lastRecipientId?: string; // ID of the last player who received this item
  limitToTop5?: boolean; // If true, only the top 5 players are eligible
}

export type LootStatus = 'Acquired' | 'Skipped' | 'Absent' | 'Did Not Take';

export interface LootEvent {
  id: string;
  itemId: string;
  playerId: string;
  status: LootStatus;
  date: string;
  raidName: string;
  cost: number;
}

export interface DistributableItem {
  id: string;
  name: string;
  quantity: number;
}