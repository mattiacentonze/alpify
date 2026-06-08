import type { Badge, GroupChallenge, LeaderboardData, Location, Reward } from "../types";

export async function loadJson<T>(path: string): Promise<T> {
  const response = await fetch(`${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`);
  if (!response.ok) throw new Error(`Could not load ${path}`);
  return response.json() as Promise<T>;
}

type RawLocation = Record<string, unknown>;

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  const numeric = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(numeric) ? numeric : fallback;
}

function asOptionalNumber(value: unknown) {
  const numeric = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(numeric) ? numeric : undefined;
}

function normalizeCrowding(value: unknown): Location["crowdingLevel"] {
  const text = asString(value, "Medium").toLowerCase();
  if (text === "low") return "Low";
  if (text === "high") return "High";
  return "Medium";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function enrichBadges(locations: Location[], badges: Badge[]) {
  const existing = new Set(badges.map((badge) => badge.name.toLowerCase()));
  const generated = locations
    .filter((location) => !existing.has(location.badge.toLowerCase()))
    .map((location) => location.badge)
    .filter((value, index, array) => array.indexOf(value) === index)
    .map((name) => ({
      id: slugify(name),
      name,
      description: `Visit or complete a quest linked to ${name}.`,
      target: 1,
    }));

  return [...badges, ...generated];
}

function enrichRewards(locations: Location[], rewards: Reward[]) {
  const existing = new Set(rewards.map((reward) => reward.name.toLowerCase()));
  const generated = locations
    .filter((location) => !existing.has(location.reward.toLowerCase()))
    .map((location) => ({
      id: slugify(location.reward),
      name: location.reward,
      partner: location.partner?.name ?? "Local partner",
      requiredPoints: Math.max(8, location.basePoints + location.questBonusPoints),
      requiredQuests: 1,
      description: `${location.rewardType ?? "Partner"} reward connected to ${location.name}.`,
    }))
    .filter((reward, index, array) => array.findIndex((item) => item.id === reward.id) === index);

  return [...rewards, ...generated];
}

function normalizePartner(value: unknown): Location["partner"] {
  if (typeof value === "string" && value.trim()) return { name: value.trim(), type: "Partner" };
  if (!value || typeof value !== "object") return undefined;

  const partner = value as Record<string, unknown>;
  return {
    name: asString(partner.name, "Local partner"),
    type: asString(partner.type, "Partner"),
  };
}

export function normalizeLocations(rawLocations: RawLocation[]): Location[] {
  return rawLocations.map((raw, index) => {
    const name = asString(raw.name, `Location ${index + 1}`);
    const id = asString(raw.id, slugify(name) || `location-${index + 1}`);
    const sideQuestRaw = raw.sideQuest && typeof raw.sideQuest === "object" ? (raw.sideQuest as Record<string, unknown>) : {};
    const dataWarnings: string[] = [];
    const lat = asOptionalNumber(raw.lat);
    const lng = asOptionalNumber(raw.lng);
    const sideQuestTitle = asString(sideQuestRaw.title, "Missing side quest data");
    const sideQuestDescription = asString(sideQuestRaw.description, "Missing side quest data");

    if (lat === undefined || lng === undefined) dataWarnings.push("Missing coordinates");
    if (sideQuestTitle === "Missing side quest data" || sideQuestDescription === "Missing side quest data") dataWarnings.push("Missing side quest data");

    return {
      id,
      name,
      category: asString(raw.category, "Place"),
      lat,
      lng,
      description: asString(raw.description, "No description available yet."),
      crowdingLevel: normalizeCrowding(raw.crowdingLevel),
      basePoints: asNumber(raw.basePoints, 0),
      bikeWalkBonus: asNumber(raw.bikeWalkBonus, 0),
      questBonusPoints: asNumber(raw.questBonusPoints, 0),
      sideQuest: {
        id: asString(sideQuestRaw.id, `${id}-side-quest`),
        title: sideQuestTitle,
        description: sideQuestDescription,
        verificationType: asString(sideQuestRaw.verificationType, "unknown").toLowerCase(),
      },
      badge: asString(raw.badge, "Alpine Explorer"),
      reward: asString(raw.reward, "Partner reward"),
      rewardType: asString(raw.rewardType, "General"),
      partner: normalizePartner(raw.partner),
      estimatedVisitTimeMin: asOptionalNumber(raw.estimatedVisitTimeMin),
      familyFriendly: typeof raw.familyFriendly === "boolean" ? raw.familyFriendly : undefined,
      accessNotes: asString(raw.accessNotes, ""),
      sourceOrNotes: asString(raw.sourceOrNotes, ""),
      hasCoordinates: lat !== undefined && lng !== undefined,
      dataWarnings,
    };
  });
}

export async function loadAppData() {
  const [locations, leaderboard, challenges] = await Promise.all([
    loadJson<RawLocation[]>("/data/locations.json"),
    loadJson<LeaderboardData>("/data/leaderboard.json"),
    loadJson<GroupChallenge[]>("/data/challenges.json"),
  ]);

  const normalizedLocations = normalizeLocations(locations);
  return {
    locations: normalizedLocations,
    badges: enrichBadges(normalizedLocations, []),
    rewards: enrichRewards(normalizedLocations, []),
    leaderboard,
    challenges,
  };
}
