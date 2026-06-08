import { BarChart3, Gift, Home, Map, Medal, QrCode, Trophy, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { DemoResetButton } from "./DemoResetButton";

const logoMark = `${import.meta.env.BASE_URL}assets/alpify-mark.png`;

export type Page = "home" | "explore" | "passport" | "rewards" | "leaderboard" | "impact" | "share";

const navItems: { page: Page; label: string; icon: LucideIcon }[] = [
  { page: "home", label: "Home", icon: Home },
  { page: "explore", label: "Explore", icon: Map },
  { page: "passport", label: "Passport", icon: Medal },
  { page: "rewards", label: "Rewards", icon: Gift },
  { page: "leaderboard", label: "Leaders", icon: Trophy },
  { page: "share", label: "Share", icon: QrCode },
  { page: "impact", label: "Impact", icon: BarChart3 },
];

interface AppShellProps {
  page: Page;
  totalPoints: number;
  onNavigate: (page: Page) => void;
  onReset: () => void;
  children: ReactNode;
}

export function AppShell({ page, totalPoints, onNavigate, onReset, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-soft text-navy">
      <header className="sticky top-0 z-40 border-b border-white/80 bg-soft/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <button type="button" onClick={() => onNavigate("home")} className="flex items-center gap-3 text-left">
            <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-2xl bg-white shadow-soft">
              <img src={logoMark} alt="Alpify" className="h-full w-full object-cover" />
            </span>
            <span>
              <span className="block text-lg font-black tracking-normal">Alpify</span>
              <span className="block text-xs font-semibold text-stone">Beyond the obvious</span>
            </span>
          </button>
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.page === page;
              return (
                <button
                  key={item.page}
                  type="button"
                  onClick={() => onNavigate(item.page)}
                  className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-bold transition ${
                    active ? "bg-navy text-white" : "text-navy/70 hover:bg-white hover:text-navy"
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-white px-4 py-2 text-sm font-black shadow-sm">{totalPoints} pts</div>
            <div className="hidden sm:block">
              <DemoResetButton onReset={onReset} />
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl overflow-x-hidden px-4 pb-28 pt-5 lg:pb-10">{children}</main>
      <BottomNav page={page} onNavigate={onNavigate} />
    </div>
  );
}

export function BottomNav({ page, onNavigate }: { page: Page; onNavigate: (page: Page) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 pb-2 pt-1 shadow-soft backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-7 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.page === page;
          return (
            <button
              key={item.page}
              type="button"
              onClick={() => onNavigate(item.page)}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-bold transition sm:text-[11px] ${
                active ? "bg-alpine text-white" : "text-stone hover:bg-soft hover:text-navy"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
