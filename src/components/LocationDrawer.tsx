import { useEffect, useState } from "react";
import { AlertTriangle, Camera, Check, FileCheck, MapPin, Stamp, Users, X } from "lucide-react";
import type { Badge, Location, Progress } from "../types";
import { calculateBadgeProgress } from "../lib/progress";
import { crowdingClass, iconForCategory } from "../lib/ui";
import { ProgressBar } from "./ProgressBar";
import { QuestCard } from "./Cards";

interface LocationDrawerProps {
  location: Location | null;
  locations: Location[];
  badges: Badge[];
  progress: Progress;
  onClose: () => void;
  onCheckIn: (location: Location) => void;
  onCompleteQuest: (location: Location) => void;
}

export function LocationDrawer({ location, locations, badges, progress, onClose, onCheckIn, onCompleteQuest }: LocationDrawerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    setSelectedFile(null);
    setPreviewUrl("");
  }, [location?.id]);

  useEffect(() => {
    if (!selectedFile) return undefined;
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  if (!location) return null;

  const Icon = iconForCategory(location.category);
  const checkedIn = progress.visitedLocationIds.includes(location.id);
  const questDone = progress.completedQuestIds.includes(location.sideQuest.id);
  const badge = badges.find((item) => item.name === location.badge);
  const badgeProgress = badge ? calculateBadgeProgress(badge, progress, locations) : 0;
  const verificationType = location.sideQuest.verificationType.toLowerCase();
  const totalPossible = location.basePoints + location.bikeWalkBonus + location.questBonusPoints;
  const partnerLabel = location.partner ? `${location.partner.name} · ${location.partner.type}` : "Local partner";
  const coordinateLabel = location.hasCoordinates && location.lat !== undefined && location.lng !== undefined ? `${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}` : "Coordinates missing";
  const questActionLabel = verificationType === "stamp" ? "Simulate stamp confirmation" : verificationType === "partner" ? "Simulate partner confirmation" : "Verify quest";

  return (
    <aside className="fixed inset-x-0 bottom-0 z-[900] max-h-[88dvh] overflow-y-auto rounded-t-[2rem] border border-slate-200 bg-white p-5 pb-7 shadow-soft lg:inset-y-5 lg:left-auto lg:right-5 lg:w-[440px] lg:rounded-[2rem]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-soft text-alpine">
            <Icon size={24} />
          </span>
          <div>
            <h2 className="text-2xl font-black leading-tight">{location.name}</h2>
            <p className="mt-1 text-sm font-bold text-stone">
              {location.category} · {coordinateLabel}
            </p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100">
          <X size={18} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className={`rounded-full border px-3 py-1 text-xs font-black ${crowdingClass(location.crowdingLevel)}`}>{location.crowdingLevel} crowding</span>
        <span className="rounded-full bg-cream px-3 py-1 text-xs font-black">{location.basePoints} base pts</span>
        <span className="rounded-full bg-fresh/15 px-3 py-1 text-xs font-black">+{location.bikeWalkBonus} mobility</span>
        <span className="rounded-full bg-sky/15 px-3 py-1 text-xs font-black">+{location.questBonusPoints} quest</span>
        <span className="rounded-full bg-navy px-3 py-1 text-xs font-black text-white">{totalPossible} possible pts</span>
      </div>

      <p className="mt-4 text-sm leading-6 text-stone">{location.description}</p>
      {location.dataWarnings.length ? (
        <div className="mt-4 rounded-3xl bg-amber-50 p-3 text-sm font-bold text-amber-800">
          {location.dataWarnings.map((warning) => (
            <p key={warning} className="flex items-center gap-2">
              <AlertTriangle size={15} />
              {warning}
            </p>
          ))}
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm font-bold">
        {location.estimatedVisitTimeMin ? <span className="rounded-2xl bg-soft px-3 py-2">{location.estimatedVisitTimeMin} min visit</span> : null}
        {location.familyFriendly !== undefined ? <span className="rounded-2xl bg-soft px-3 py-2">{location.familyFriendly ? "Family friendly" : "Not family focused"}</span> : null}
      </div>
      {location.accessNotes ? <p className="mt-3 rounded-2xl bg-cream p-3 text-sm leading-6 text-stone">{location.accessNotes}</p> : null}

      <div className="mt-4 rounded-3xl bg-soft p-4">
        <p className="text-xs font-black uppercase tracking-wide text-stone">Connected reward</p>
        <h3 className="mt-1 font-black">{location.reward}</h3>
        <p className="mt-1 text-sm font-semibold text-alpine">{partnerLabel}</p>
        {location.rewardType ? <p className="mt-1 text-xs font-black text-stone">{location.rewardType} reward</p> : null}
      </div>

      <div className="mt-4">
        <QuestCard location={location} completed={questDone} />
      </div>

      <div id={`quest-verification-${location.id}`} className="mt-4 rounded-3xl border border-slate-200 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-stone">Badge progress</p>
            <h3 className="font-black">{location.badge}</h3>
          </div>
          {progress.unlockedBadgeIds.includes(badge?.id ?? "") ? <Check className="text-alpine" /> : <MapPin className="text-stone" />}
        </div>
        {badge ? <div className="mt-3"><ProgressBar value={badgeProgress} max={badge.target} /></div> : null}
      </div>

      <div className="mt-4 rounded-3xl border border-slate-200 p-4">
        <p className="text-xs font-black uppercase tracking-wide text-stone">Quest verification</p>
        {questDone ? (
          <p className="mt-3 rounded-2xl bg-fresh/15 p-3 text-sm font-black text-alpine">Quest verified — bonus unlocked!</p>
        ) : verificationType === "photo" ? (
          <div className="mt-3 space-y-3">
            <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-sky bg-sky/10 px-5 text-sm font-black text-navy">
              <Camera size={17} />
              Choose quest photo
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              />
            </label>
            {selectedFile ? <p className="text-sm font-bold text-stone">Selected: {selectedFile.name}</p> : null}
            {previewUrl ? <img src={previewUrl} alt="Selected quest preview" className="max-h-48 w-full rounded-2xl object-cover" /> : null}
            <button
              type="button"
              disabled={!selectedFile}
              onClick={() => onCompleteQuest(location)}
              className="min-h-12 w-full rounded-full bg-navy px-5 font-black text-white disabled:bg-slate-200 disabled:text-stone"
            >
              <FileCheck className="mr-2 inline" size={17} />
              Verify quest
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onCompleteQuest(location)}
            className="mt-3 min-h-12 w-full rounded-full bg-navy px-5 font-black text-white"
          >
            {verificationType === "stamp" ? <Stamp className="mr-2 inline" size={17} /> : <Users className="mr-2 inline" size={17} />}
            {questActionLabel}
          </button>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onCheckIn(location)}
          className="min-h-12 rounded-full bg-alpine px-5 font-black text-white disabled:bg-slate-200 disabled:text-stone"
        >
          {checkedIn ? "Checked in" : "Check in"}
        </button>
        <button
          type="button"
          onClick={() => document.getElementById(`quest-verification-${location.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })}
          className="min-h-12 rounded-full bg-navy px-5 font-black text-white"
        >
          {questDone ? "Quest complete" : "Complete side quest"}
        </button>
      </div>

    </aside>
  );
}
