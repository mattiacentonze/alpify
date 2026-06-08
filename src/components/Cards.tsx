import type { Badge, GroupChallenge, Location, Progress, Reward } from "../types";
import { calculateBadgeProgress } from "../lib/progress";
import { crowdingClass, iconForCategory } from "../lib/ui";
import { ProgressBar } from "./ProgressBar";
import { AlertTriangle, Check, Gift, Lock, Stamp } from "lucide-react";

export function ValueCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-3xl border border-white bg-white p-5 shadow-sm">
      <h3 className="text-lg font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone">{text}</p>
    </article>
  );
}

export function LocationCard({ location, onSelect }: { location: Location; onSelect: (location: Location) => void }) {
  const Icon = iconForCategory(location.category);
  return (
    <button
      type="button"
      onClick={() => onSelect(location)}
      className="w-full rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-soft text-alpine">
            <Icon size={23} />
          </span>
          <div>
            <h3 className="font-black">{location.name}</h3>
            <p className="text-sm font-semibold text-stone">{location.category}</p>
          </div>
        </div>
        <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black ${crowdingClass(location.crowdingLevel)}`}>
          {location.crowdingLevel}
        </span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone">{location.description}</p>
      {!location.hasCoordinates ? (
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
          <AlertTriangle size={13} />
          Missing map coordinates
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-black">
        <span className="rounded-full bg-cream px-3 py-1">{location.basePoints} base pts</span>
        <span className="rounded-full bg-fresh/15 px-3 py-1">+{location.bikeWalkBonus} green</span>
        <span className="rounded-full bg-sky/15 px-3 py-1">+{location.questBonusPoints} quest</span>
      </div>
    </button>
  );
}

export function QuestCard({ location, completed }: { location: Location; completed: boolean }) {
  return (
    <article className="rounded-3xl border border-sky/20 bg-sky/10 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-sky">Quest unlocked</p>
      <h4 className="mt-1 font-black">{location.sideQuest.title}</h4>
      <p className="mt-2 text-sm leading-6 text-stone">{location.sideQuest.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black text-navy">
          {completed ? <Check size={14} /> : <Stamp size={14} />}
          {completed ? "Quest verified" : `+${location.questBonusPoints} bonus points`}
        </span>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-stone">
          {location.sideQuest.verificationType === "unknown" ? "Missing verification type" : `${location.sideQuest.verificationType} verification`}
        </span>
      </div>
    </article>
  );
}

export function BadgeCard({ badge, progress, locations }: { badge: Badge; progress: Progress; locations: Location[] }) {
  const value = calculateBadgeProgress(badge, progress, locations);
  const unlocked = progress.unlockedBadgeIds.includes(badge.id);
  return (
    <article className={`rounded-3xl border p-4 shadow-sm ${unlocked ? "border-fresh/30 bg-white" : "border-slate-200 bg-white/75"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black">{badge.name}</h3>
          <p className="mt-1 text-sm leading-5 text-stone">{badge.description}</p>
        </div>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${unlocked ? "bg-reward text-navy" : "bg-slate-100 text-stone"}`}>
          {unlocked ? <Check size={20} /> : <Lock size={18} />}
        </span>
      </div>
      <div className="mt-4">
        <ProgressBar value={value} max={badge.target} label={unlocked ? "Unlocked" : "Progress"} />
      </div>
    </article>
  );
}

export function RewardCard({ reward, progress, onClaim }: { reward: Reward; progress: Progress; onClaim: (id: string) => void }) {
  const unlocked = progress.unlockedRewardIds.includes(reward.id);
  const claimed = progress.claimedRewardIds.includes(reward.id);
  return (
    <article className={`rounded-3xl border p-4 shadow-sm ${unlocked ? "border-reward/50 bg-white" : "border-slate-200 bg-white/75"}`}>
      <div className="flex items-start gap-3">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${unlocked ? "bg-reward" : "bg-slate-100 text-stone"}`}>
          {unlocked ? <Gift size={22} /> : <Lock size={19} />}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-black">{reward.name}</h3>
          <p className="text-sm font-semibold text-alpine">{reward.partner}</p>
          <p className="mt-2 text-sm leading-6 text-stone">{reward.description}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-stone">
          Needs {reward.requiredPoints} pts and {reward.requiredQuests} quests
        </span>
        <button
          type="button"
          disabled={!unlocked || claimed}
          onClick={() => onClaim(reward.id)}
          className="min-h-10 rounded-full bg-navy px-4 text-sm font-black text-white disabled:bg-slate-200 disabled:text-stone"
        >
          {claimed ? "Claimed" : unlocked ? "Claim" : "Locked"}
        </button>
      </div>
    </article>
  );
}

export function PassportStamp({ location, collected }: { location?: Location; collected: boolean }) {
  return (
    <article className={`grid min-h-32 place-items-center rounded-3xl border-2 border-dashed p-4 text-center ${collected ? "border-alpine bg-white" : "border-slate-300 bg-white/60"}`}>
      {collected && location ? (
        <div>
          <Stamp className="mx-auto text-alpine" size={28} />
          <h3 className="mt-2 text-sm font-black">{location.name}</h3>
          <p className="mt-1 text-xs font-bold text-stone">Stamp collected</p>
        </div>
      ) : (
        <div>
          <Lock className="mx-auto text-stone" size={22} />
          <p className="mt-2 text-sm font-black text-stone">Empty stamp slot</p>
        </div>
      )}
    </article>
  );
}

export function GroupChallengeCard({ challenge }: { challenge: GroupChallenge }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="font-black">{challenge.title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone">{challenge.description}</p>
      <div className="mt-4">
        <ProgressBar value={challenge.current} max={challenge.target} label={challenge.reward} />
      </div>
    </article>
  );
}

export function ImpactMetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-3xl border border-white bg-white p-5 shadow-sm">
      <p className="text-3xl font-black text-alpine">{value}</p>
      <p className="mt-2 text-sm font-bold text-stone">{label}</p>
    </article>
  );
}
