export type CrowdingLevel = "Low" | "Medium" | "High";
export type MobilityMode = "Walking" | "Bike" | "Train" | "Bus" | "Other";

export interface SideQuest {
  id: string;
  title: string;
  description: string;
  verificationType: string;
}

export interface Partner {
  name: string;
  type: string;
}

export interface Location {
  id: string;
  name: string;
  category: string;
  lat?: number;
  lng?: number;
  description: string;
  crowdingLevel: CrowdingLevel;
  basePoints: number;
  bikeWalkBonus: number;
  questBonusPoints: number;
  sideQuest: SideQuest;
  badge: string;
  reward: string;
  rewardType?: string;
  partner?: Partner;
  estimatedVisitTimeMin?: number;
  familyFriendly?: boolean;
  accessNotes?: string;
  sourceOrNotes?: string;
  hasCoordinates: boolean;
  dataWarnings: string[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  target: number;
}

export interface Reward {
  id: string;
  name: string;
  partner: string;
  requiredPoints: number;
  requiredQuests: number;
  description: string;
}

export interface LeaderboardData {
  individual: { name: string; points: number }[];
  groups: { name: string; points: number }[];
  communityChallenge: { title: string; current: number; target: number };
}

export interface GroupChallenge {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  reward: string;
}

export interface Progress {
  totalPoints: number;
  visitedLocationIds: string[];
  completedQuestIds: string[];
  unlockedBadgeIds: string[];
  unlockedRewardIds: string[];
  claimedRewardIds: string[];
  mobilityCheckins: number;
  bikeCheckins: number;
  trainBusCheckins: number;
  collectedStamps: string[];
  lowMediumPoints: number;
  selectedUserName: string;
}
