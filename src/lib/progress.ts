import type { Badge, Location, MobilityMode, Progress, Reward } from "../types";

const STORAGE_KEY = "alpify-progress-v1";

export const emptyProgress = (): Progress => ({
  totalPoints: 0,
  visitedLocationIds: [],
  completedQuestIds: [],
  unlockedBadgeIds: [],
  unlockedRewardIds: [],
  claimedRewardIds: [],
  mobilityCheckins: 0,
  bikeCheckins: 0,
  trainBusCheckins: 0,
  collectedStamps: [],
  lowMediumPoints: 0,
  selectedUserName: "You",
});

const unique = (values: string[]) => Array.from(new Set(values));

export function getProgress(): Progress {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return emptyProgress();

  try {
    const parsed = JSON.parse(raw) as Partial<Progress> & { stamps?: string[] };
    return { ...emptyProgress(), ...parsed, collectedStamps: parsed.collectedStamps ?? parsed.stamps ?? [] };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress: Progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function resetDemoProgress() {
  localStorage.removeItem(STORAGE_KEY);
  return emptyProgress();
}

export function calculateBadgeProgress(badge: Badge, progress: Progress, locations: Location[]) {
  const visited = locations.filter((location) => progress.visitedLocationIds.includes(location.id));
  const completed = locations.filter((location) => progress.completedQuestIds.includes(location.sideQuest.id));
  const lowVisited = visited.filter((location) => location.crowdingLevel === "Low");
  const cultureVisited = visited.filter((location) => ["Castle", "Museum"].includes(location.category));
  const lakeNatureVisited = visited.filter((location) => ["Lake", "Trail", "Viewpoint"].includes(location.category));
  const partnerQuests = completed.filter((location) => ["stamp", "partner"].includes(location.sideQuest.verificationType.toLowerCase()));

  const values: Record<string, number> = {
    "castle-explorer": cultureVisited.length,
    "lake-seeker": lakeNatureVisited.length,
    "green-traveller": progress.mobilityCheckins,
    "hidden-gem-hunter": lowVisited.length,
    "alpine-rookie": progress.collectedStamps.length,
    "family-adventurer": completed.some((location) => location.category === "Trail") ? 1 : 0,
    "local-partner-supporter": partnerQuests.length,
    "bike-trail-hero": progress.bikeCheckins,
    "culture-collector": cultureVisited.length,
    "crowd-balancer": progress.lowMediumPoints,
    "quest-master": progress.completedQuestIds.length,
  };

  const fallbackValue = locations.filter((location) => location.badge === badge.name && (progress.visitedLocationIds.includes(location.id) || progress.completedQuestIds.includes(location.sideQuest.id))).length;

  return Math.min(values[badge.id] ?? fallbackValue, badge.target);
}

export function calculateBadgeUnlocks(progress: Progress, locations: Location[], badges: Badge[]) {
  return unique([
    ...progress.unlockedBadgeIds,
    ...badges
      .filter((badge) => calculateBadgeProgress(badge, progress, locations) >= badge.target)
      .map((badge) => badge.id),
  ]);
}

export function calculateRewardUnlocks(progress: Progress, rewards: Reward[]) {
  const questCount = progress.completedQuestIds.length;
  return unique([
    ...progress.unlockedRewardIds,
    ...rewards
      .filter((reward) => progress.totalPoints >= reward.requiredPoints && questCount >= reward.requiredQuests)
      .map((reward) => reward.id),
  ]);
}

export function hydrateUnlocks(progress: Progress, locations: Location[], badges: Badge[], rewards: Reward[]) {
  const withBadges = { ...progress, unlockedBadgeIds: calculateBadgeUnlocks(progress, locations, badges) };
  return { ...withBadges, unlockedRewardIds: calculateRewardUnlocks(withBadges, rewards) };
}

export function checkIn(
  progress: Progress,
  location: Location,
  mobilityMode: MobilityMode,
  locations: Location[],
  badges: Badge[],
  rewards: Reward[],
) {
  if (progress.visitedLocationIds.includes(location.id)) {
    return { progress: hydrateUnlocks(progress, locations, badges, rewards), earned: 0, bonus: 0, alreadyVisited: true };
  }

  const isGreen = mobilityMode === "Walking" || mobilityMode === "Bike";
  const isTransit = mobilityMode === "Train" || mobilityMode === "Bus";
  const bonus = isGreen ? location.bikeWalkBonus : mobilityMode === "Train" ? Math.round(location.bikeWalkBonus * 0.75) : mobilityMode === "Bus" ? Math.round(location.bikeWalkBonus * 0.5) : 0;
  const earned = location.basePoints + bonus;
  const next: Progress = {
    ...progress,
    totalPoints: progress.totalPoints + earned,
    visitedLocationIds: unique([...progress.visitedLocationIds, location.id]),
    mobilityCheckins: progress.mobilityCheckins + (isGreen || isTransit ? 1 : 0),
    bikeCheckins: progress.bikeCheckins + (mobilityMode === "Bike" ? 1 : 0),
    trainBusCheckins: progress.trainBusCheckins + (isTransit ? 1 : 0),
    collectedStamps: unique([...progress.collectedStamps, location.id]),
    lowMediumPoints: progress.lowMediumPoints + (location.crowdingLevel !== "High" ? earned : 0),
  };

  return { progress: hydrateUnlocks(next, locations, badges, rewards), earned: location.basePoints, bonus, alreadyVisited: false };
}

export function completeQuest(
  progress: Progress,
  location: Location,
  locations: Location[],
  badges: Badge[],
  rewards: Reward[],
) {
  if (progress.completedQuestIds.includes(location.sideQuest.id)) {
    return { progress: hydrateUnlocks(progress, locations, badges, rewards), earned: 0, alreadyCompleted: true };
  }

  const next: Progress = {
    ...progress,
    totalPoints: progress.totalPoints + location.questBonusPoints,
    completedQuestIds: unique([...progress.completedQuestIds, location.sideQuest.id]),
    collectedStamps: unique([...progress.collectedStamps, location.id]),
    lowMediumPoints: progress.lowMediumPoints + (location.crowdingLevel !== "High" ? location.questBonusPoints : 0),
  };

  return { progress: hydrateUnlocks(next, locations, badges, rewards), earned: location.questBonusPoints, alreadyCompleted: false };
}

export function claimReward(progress: Progress, rewardId: string) {
  const next = { ...progress, claimedRewardIds: unique([...progress.claimedRewardIds, rewardId]) };
  saveProgress(next);
  return next;
}
