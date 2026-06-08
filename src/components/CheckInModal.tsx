import { Bike, Bus, Footprints, Train, X } from "lucide-react";
import type { Location, MobilityMode, Progress } from "../types";

interface CheckInModalProps {
  location: Location | null;
  result: { earned: number; bonus: number; alreadyVisited: boolean; progress: Progress } | null;
  suggestedNext?: Location;
  onClose: () => void;
  onConfirm: (mode: MobilityMode) => void;
}

export function CheckInModal({ location, result, suggestedNext, onClose, onConfirm }: CheckInModalProps) {
  if (!location) return null;

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-end bg-navy/50 p-3 sm:place-items-center">
      <section className="w-full max-w-md rounded-3xl bg-white p-5 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black text-alpine">Check in</p>
            <h2 className="text-2xl font-black">{location.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100">
            <X size={18} />
          </button>
        </div>

        {!result ? (
          <>
            <p className="mt-4 text-sm font-semibold text-stone">How did you arrive?</p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {[
                { mode: "Walking" as const, label: "Walking", icon: Footprints },
                { mode: "Bike" as const, label: "Bike", icon: Bike },
                { mode: "Train" as const, label: "Train", icon: Train },
                { mode: "Bus" as const, label: "Bus", icon: Bus },
                { mode: "Other" as const, label: "Other", icon: X },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.mode}
                    type="button"
                    onClick={() => onConfirm(item.mode)}
                    className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-soft p-3 text-sm font-black transition hover:border-alpine hover:bg-white"
                  >
                    <Icon size={24} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 rounded-2xl bg-cream p-3 text-sm leading-6 text-stone">
              Walking and biking unlock the full mobility bonus. Train earns 75%, bus earns 50%, and other arrival modes collect base points only.
            </p>
          </>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="rounded-3xl bg-soft p-4">
              <p className="text-lg font-black">{result.alreadyVisited ? "Already checked in" : "Nice! You helped balance the flow."}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-white p-3">
                  <p className="text-xl font-black">{result.earned}</p>
                  <p className="text-xs font-bold text-stone">Base</p>
                </div>
                <div className="rounded-2xl bg-white p-3">
                  <p className="text-xl font-black">{result.bonus}</p>
                  <p className="text-xs font-bold text-stone">Mobility</p>
                </div>
                <div className="rounded-2xl bg-white p-3">
                  <p className="text-xl font-black">{result.progress.totalPoints}</p>
                  <p className="text-xs font-bold text-stone">Total</p>
                </div>
              </div>
            </div>
            <p className="rounded-2xl bg-fresh/15 p-3 text-sm font-bold text-alpine">
              {result.bonus > 0 ? "Mobility bonus earned." : "Base points collected. Try sustainable mobility for bonus points next time."}
            </p>
            {suggestedNext ? (
              <p className="text-sm leading-6 text-stone">
                Suggested next quest: <strong>{suggestedNext.name}</strong>
              </p>
            ) : null}
            <button type="button" onClick={onClose} className="min-h-12 w-full rounded-full bg-alpine px-5 font-black text-white">
              Continue exploring
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
