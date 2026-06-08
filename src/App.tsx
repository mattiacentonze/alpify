import { useEffect, useMemo, useState } from "react";
import { Bike, Bot, Building2, Castle, CloudSun, Gift, MapPinned, Sparkles, Users, type LucideIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { AppShell, type Page } from "./components/AppShell";
import { BadgeCard, GroupChallengeCard, ImpactMetricCard, LocationCard, PassportStamp, RewardCard, ValueCard } from "./components/Cards";
import { CheckInModal } from "./components/CheckInModal";
import { DemoResetButton } from "./components/DemoResetButton";
import { LocationDrawer } from "./components/LocationDrawer";
import { MapView } from "./components/MapView";
import { ProgressBar } from "./components/ProgressBar";
import { loadAppData } from "./lib/data";
import { checkIn, claimReward, completeQuest, getProgress, hydrateUnlocks, resetDemoProgress, saveProgress } from "./lib/progress";
import type { Badge, GroupChallenge, LeaderboardData, Location, MobilityMode, Progress, Reward } from "./types";

interface AppData {
  locations: Location[];
  badges: Badge[];
  rewards: Reward[];
  leaderboard: LeaderboardData;
  challenges: GroupChallenge[];
}

const pages: Page[] = ["home", "explore", "passport", "rewards", "leaderboard", "impact", "share"];
const logoUrl = `${import.meta.env.BASE_URL}assets/alpify-logo.png`;
const logoMarkUrl = `${import.meta.env.BASE_URL}assets/alpify-mark.png`;

function pageFromHash(): Page {
  const value = window.location.hash.replace("#/", "") as Page;
  return pages.includes(value) ? value : "home";
}

export default function App() {
  const [page, setPage] = useState<Page>(pageFromHash);
  const [data, setData] = useState<AppData | null>(null);
  const [progress, setProgress] = useState<Progress>(() => getProgress());
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [checkInLocation, setCheckInLocation] = useState<Location | null>(null);
  const [checkInResult, setCheckInResult] = useState<ReturnType<typeof checkIn> | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    loadAppData().then((loaded) => {
      setData(loaded);
      const hydrated = hydrateUnlocks(getProgress(), loaded.locations, loaded.badges, loaded.rewards);
      setProgress(hydrated);
      saveProgress(hydrated);
    });
  }, []);

  useEffect(() => {
    const handler = () => setPage(pageFromHash());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const navigate = (next: Page) => {
    window.location.hash = next === "home" ? "/" : `/${next}`;
    setPage(next);
  };

  const updateProgress = (next: Progress) => {
    setProgress(next);
    saveProgress(next);
  };

  const suggestedNext = useMemo(() => {
    if (!data) return undefined;
    return data.locations.find((location) => !progress.visitedLocationIds.includes(location.id) && location.crowdingLevel === "Low");
  }, [data, progress.visitedLocationIds]);

  if (!data) {
    return (
      <div className="grid min-h-screen place-items-center bg-soft p-6 text-center text-navy">
        <div>
          <img src={logoMarkUrl} alt="Alpify" className="mx-auto h-20 w-20 rounded-3xl object-cover shadow-soft" />
          <p className="mt-4 font-black">Loading Alpify demo...</p>
        </div>
      </div>
    );
  }

  const onReset = () => {
    const next = resetDemoProgress();
    setProgress(next);
    setToast("Demo progress reset.");
    setTimeout(() => setToast(""), 2200);
  };

  const openCheckIn = (location: Location) => {
    setCheckInLocation(location);
    setCheckInResult(null);
  };

  const confirmCheckIn = (mode: MobilityMode) => {
    if (!checkInLocation) return;
    const result = checkIn(progress, checkInLocation, mode, data.locations, data.badges, data.rewards);
    updateProgress(result.progress);
    setCheckInResult(result);
  };

  const onCompleteQuest = (location: Location) => {
    const result = completeQuest(progress, location, data.locations, data.badges, data.rewards);
    updateProgress(result.progress);
    setToast(result.alreadyCompleted ? "Quest already verified." : "Quest verified — bonus unlocked!");
    setTimeout(() => setToast(""), 2400);
  };

  const onClaimReward = (rewardId: string) => {
    setProgress((current) => claimReward(current, rewardId));
    setToast("Reward claimed. Partner confirmation simulated.");
    setTimeout(() => setToast(""), 2400);
  };

  return (
    <AppShell page={page} totalPoints={progress.totalPoints} onNavigate={navigate} onReset={onReset}>
      {toast ? <div className="fixed left-1/2 top-20 z-[1200] -translate-x-1/2 rounded-full bg-navy px-5 py-3 text-sm font-black text-white shadow-soft">{toast}</div> : null}

      {page === "home" ? <HomePage progress={progress} onStart={() => navigate("explore")} /> : null}
      {page === "explore" ? (
        <ExplorePage
          locations={data.locations}
          badges={data.badges}
          progress={progress}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          onCheckIn={openCheckIn}
          onCompleteQuest={onCompleteQuest}
        />
      ) : null}
      {page === "passport" ? <PassportPage locations={data.locations} badges={data.badges} progress={progress} onReset={onReset} /> : null}
      {page === "rewards" ? <RewardsPage rewards={data.rewards} progress={progress} onClaim={onClaimReward} /> : null}
      {page === "leaderboard" ? <LeaderboardPage leaderboard={data.leaderboard} challenges={data.challenges} progress={progress} /> : null}
      {page === "share" ? <SharePage /> : null}
      {page === "impact" ? <ImpactPage /> : null}

      <CheckInModal location={checkInLocation} result={checkInResult} suggestedNext={suggestedNext} onClose={() => setCheckInLocation(null)} onConfirm={confirmCheckIn} />
    </AppShell>
  );
}

function HomePage({ progress, onStart }: { progress: Progress; onStart: () => void }) {
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[2rem] bg-navy text-white shadow-soft">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/70 to-navy/20" />
        <div className="relative min-h-[520px] px-4 py-7 sm:px-10 lg:flex lg:min-h-[610px] lg:items-end">
          <div className="max-w-5xl pb-12">
            <div className="mb-5 w-full max-w-[220px] rounded-[1.5rem] bg-white/95 p-3 shadow-soft backdrop-blur sm:mb-6 sm:max-w-[340px]">
              <img src={logoUrl} alt="Alpify" className="w-full rounded-2xl object-contain" />
            </div>
            <p className="inline-flex max-w-full rounded-full bg-white/15 px-3 py-2 text-xs font-black backdrop-blur sm:px-4 sm:text-sm">EUSALP Alpine AI Hackathon MVP</p>
            <h1 className="mt-5 whitespace-nowrap text-[clamp(1.85rem,9.4vw,6.25rem)] font-black leading-none sm:mt-6">Beyond the obvious</h1>
            <p className="mt-4 max-w-[22rem] text-base font-semibold leading-7 text-white/90 sm:mt-5 sm:max-w-none sm:whitespace-nowrap sm:text-[clamp(.9rem,2vw,1.2rem)]">
              Discover hidden Alpine gems, collect rewards, and explore beyond the crowds.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" onClick={onStart} className="min-h-14 rounded-full bg-fresh px-7 text-lg font-black text-navy shadow-soft">
                Start exploring
              </button>
              <span className="inline-flex min-h-14 items-center rounded-full bg-white/15 px-5 text-sm font-black backdrop-blur">{progress.totalPoints} demo points earned</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <ValueCard title="Discover hidden gems" text="Turn villages, trails, lakes, cultural stops and local partners into playful quest destinations." />
        <ValueCard title="Complete outdoor quests" text="Use geocaching-style tasks, photo checks and partner stamps to make each visit more engaging." />
        <ValueCard title="Travel sustainably" text="Reward walking and biking check-ins with green bonuses, badges and local partner perks." />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">Some Alpine hotspots are overcrowded, while nearby places remain invisible.</h2>
          <p className="mt-4 leading-7 text-stone">
            Alpify turns visitor management into a game: tourists earn points, badges and rewards by exploring less crowded locations, completing side quests and collecting digital or physical stamps from local partners.
          </p>
        </div>
        <div className="rounded-[2rem] bg-cream p-6 shadow-sm">
          <p className="text-sm font-black uppercase tracking-wide text-alpine">Simulated AI suggestion</p>
          <p className="mt-3 text-xl font-black">Neuschwanstein is likely crowded today.</p>
          <p className="mt-2 leading-7 text-stone">Try a nearby under-discovered castle route and earn +6 bonus points.</p>
        </div>
      </section>
    </div>
  );
}

function ExplorePage(props: {
  locations: Location[];
  badges: Badge[];
  progress: Progress;
  selectedLocation: Location | null;
  setSelectedLocation: (location: Location | null) => void;
  onCheckIn: (location: Location) => void;
  onCompleteQuest: (location: Location) => void;
}) {
  const [category, setCategory] = useState("All");
  const [crowding, setCrowding] = useState("All");
  const [rewardType, setRewardType] = useState("All");
  const categories = ["All", ...Array.from(new Set(props.locations.map((item) => item.category)))];
  const crowdingLevels = ["All", "Low", "Medium", "High"];
  const rewardTypes = ["All", ...Array.from(new Set(props.locations.map((item) => item.rewardType).filter(Boolean) as string[]))];
  const filtered = props.locations.filter((location) => {
    return (category === "All" || location.category === category) && (crowding === "All" || location.crowdingLevel === crowding) && (rewardType === "All" || location.rewardType === rewardType);
  });
  const missingCoordinateCount = filtered.filter((location) => !location.hasCoordinates).length;

  return (
    <div className="-mx-4 -mt-5 space-y-4 lg:mx-0 lg:mt-0 lg:space-y-5">
      <div className="px-4 pt-4 lg:px-0 lg:pt-0">
        <p className="text-sm font-black uppercase tracking-wide text-alpine">Explore Map</p>
        <h1 className="text-3xl font-black">Kempten / Allgäu demo routes</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-stone">Markers and quest details are loaded from public/data/locations.json. Locations without coordinates remain visible in the list.</p>
      </div>
      <section className="grid gap-3 px-4 sm:grid-cols-3 lg:px-0">
        <Filter label="Category" value={category} options={categories} onChange={setCategory} />
        <Filter label="Crowding" value={crowding} options={crowdingLevels} onChange={setCrowding} />
        <Filter label="Reward" value={rewardType} options={rewardTypes} onChange={setRewardType} />
      </section>
      <section className="grid gap-5 lg:grid-cols-[1.4fr_.8fr]">
        <div className="space-y-3">
          <MapView locations={filtered} onSelect={props.setSelectedLocation} />
          <div className="mx-4 flex flex-wrap gap-2 rounded-3xl bg-white p-3 text-xs font-black shadow-sm lg:mx-0">
            <span className="rounded-full bg-fresh/20 px-3 py-2">Low crowding = higher reward</span>
            <span className="rounded-full bg-reward/25 px-3 py-2">Medium crowding = medium reward</span>
            <span className="rounded-full bg-rose-100 px-3 py-2">High crowding = lower reward</span>
            {missingCoordinateCount ? <span className="rounded-full bg-amber-100 px-3 py-2 text-amber-800">{missingCoordinateCount} list-only</span> : null}
          </div>
        </div>
        <div className="grid gap-3 px-4 lg:max-h-[690px] lg:overflow-y-auto lg:px-0 lg:pr-1">
          {filtered.map((location) => (
            <LocationCard key={location.id} location={location} onSelect={props.setSelectedLocation} />
          ))}
        </div>
      </section>
      <LocationDrawer
        location={props.selectedLocation}
        locations={props.locations}
        badges={props.badges}
        progress={props.progress}
        onClose={() => props.setSelectedLocation(null)}
        onCheckIn={props.onCheckIn}
        onCompleteQuest={props.onCompleteQuest}
      />
    </div>
  );
}

function Filter({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block rounded-3xl bg-white p-3 shadow-sm">
      <span className="mb-2 block text-xs font-black uppercase tracking-wide text-stone">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-2xl border border-slate-200 bg-soft px-3 text-sm font-bold outline-none focus:border-alpine">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function PassportPage({ locations, badges, progress, onReset }: { locations: Location[]; badges: Badge[]; progress: Progress; onReset: () => void }) {
  const collected = locations.filter((location) => progress.collectedStamps.includes(location.id));
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-alpine">Digital Passport</p>
          <h1 className="text-3xl font-black">Stamps, places and badges</h1>
        </div>
        <DemoResetButton onReset={onReset} />
      </header>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {locations.map((location) => <PassportStamp key={location.id} location={location} collected={progress.collectedStamps.includes(location.id)} />)}
        {Array.from({ length: Math.max(0, 4 - collected.length) }).map((_, index) => <PassportStamp key={`empty-${index}`} collected={false} />)}
      </section>
      <section className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">Also works as a physical Alpine Passport</h2>
          <p className="mt-3 leading-7 text-stone">Visitors without the app can collect stamps in a paper booklet at castles, hotels, bike rentals and local attractions. This makes Alpify accessible for families, schools, older visitors and low-connectivity areas.</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm font-bold text-stone">
            {["Castles", "Partner hotels", "Bike rental shops", "Museums", "Local tourist offices", "Nature parks"].map((partner) => <span key={partner} className="rounded-2xl bg-soft px-3 py-2">{partner}</span>)}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {badges.map((badge) => <BadgeCard key={badge.id} badge={badge} progress={progress} locations={locations} />)}
        </div>
      </section>
    </div>
  );
}

function RewardsPage({ rewards, progress, onClaim }: { rewards: Reward[]; progress: Progress; onClaim: (id: string) => void }) {
  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-black uppercase tracking-wide text-alpine">Rewards</p>
        <h1 className="text-3xl font-black">Local partner perks</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-stone">Rewards are provided by local partners that benefit from redistributed visitor flows.</p>
      </header>
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rewards.map((reward) => <RewardCard key={reward.id} reward={reward} progress={progress} onClaim={onClaim} />)}
      </section>
    </div>
  );
}

function LeaderboardPage({ leaderboard, challenges, progress }: { leaderboard: LeaderboardData; challenges: GroupChallenge[]; progress: Progress }) {
  const individual = [...leaderboard.individual, { name: "You", points: progress.totalPoints }].sort((a, b) => b.points - a.points);
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-black uppercase tracking-wide text-alpine">Leaderboard</p>
        <h1 className="text-3xl font-black">Competition and collaboration</h1>
      </header>
      <section className="grid gap-4 lg:grid-cols-3">
        <LeaderboardTable title="Individual" rows={individual} />
        <LeaderboardTable title="Family / Group" rows={leaderboard.groups} />
        <article className="rounded-[2rem] bg-white p-5 shadow-sm">
          <p className="text-sm font-black uppercase tracking-wide text-alpine">Community Challenge</p>
          <h2 className="mt-2 text-xl font-black">{leaderboard.communityChallenge.title}</h2>
          <div className="mt-5"><ProgressBar value={leaderboard.communityChallenge.current} max={leaderboard.communityChallenge.target} label={`${leaderboard.communityChallenge.current} / ${leaderboard.communityChallenge.target} completed`} /></div>
        </article>
      </section>
      <section>
        <h2 className="text-2xl font-black">Group Challenges</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {challenges.map((challenge) => <GroupChallengeCard key={challenge.id} challenge={challenge} />)}
        </div>
      </section>
    </div>
  );
}

function LeaderboardTable({ title, rows }: { title: string; rows: { name: string; points: number }[] }) {
  return (
    <article className="rounded-[2rem] bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black">{title}</h2>
      <div className="mt-4 space-y-2">
        {rows.map((row, index) => (
          <div key={row.name} className={`flex items-center justify-between rounded-2xl px-3 py-3 ${row.name === "You" ? "bg-fresh/15" : "bg-soft"}`}>
            <span className="font-black">{index + 1}. {row.name}</span>
            <span className="font-black text-alpine">{row.points} pts</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function SharePage() {
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-5 text-center">
      <header>
        <img src={logoUrl} alt="Alpify" className="mx-auto mb-4 w-full max-w-[280px] rounded-[1.5rem] bg-white object-contain shadow-sm" />
        <p className="text-sm font-black uppercase tracking-wide text-alpine">Demo QR</p>
        <h1 className="text-3xl font-black">Share Alpify</h1>
        <p className="mt-2 text-sm leading-6 text-stone">Scan to try the Alpify demo on your phone.</p>
      </header>
      <section className="rounded-[2rem] bg-white p-6 shadow-soft sm:p-8">
        <div className="mx-auto grid aspect-square w-full max-w-[280px] place-items-center rounded-[2rem] bg-soft p-5">
          {shareUrl ? (
            <QRCodeSVG
              value={shareUrl}
              size={220}
              bgColor="#F6FAF4"
              fgColor="#102A43"
              level="H"
              imageSettings={{
                src: logoMarkUrl,
                x: undefined,
                y: undefined,
                height: 46,
                width: 46,
                excavate: true,
              }}
            />
          ) : null}
        </div>
        <p className="mt-5 break-all rounded-2xl bg-cream p-3 text-sm font-bold text-navy">{shareUrl}</p>
        <p className="mt-4 text-sm leading-6 text-stone">
          On Vercel, this QR code points to the live deployed URL. Locally, it points to localhost.
        </p>
      </section>
    </div>
  );
}

function ImpactPage() {
  const partnerCards = [
    ["Hotels receive more distributed footfall", HotelIcon],
    ["Bike rentals are rewarded through sustainable mobility quests", Bike],
    ["Museums and castles gain visibility", Castle],
    ["Tourism boards get visitor-flow insights", MapPinned],
    ["Local shops can sponsor rewards", Gift],
    ["Families get guided outdoor discovery", Users],
  ] as const;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-black uppercase tracking-wide text-alpine">Impact Dashboard</p>
        <h1 className="text-3xl font-black">Visitor-flow management layer</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-stone">Demo simulation. For destinations and tourism boards, Alpify can guide tourists away from overcrowded hotspots and toward nearby under-discovered places.</p>
      </header>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ImpactMetricCard value="32%" label="of demo check-ins redirected to under-discovered places" />
        <ImpactMetricCard value="68%" label="of completed trips used walking or biking" />
        <ImpactMetricCard value="14" label="local partners activated" />
        <ImpactMetricCard value="7" label="hidden gems discovered this week" />
        <ImpactMetricCard value="24" label="side quests completed" />
        <ImpactMetricCard value="9" label="rewards claimed" />
      </section>
      <section>
        <h2 className="text-2xl font-black">Future AI layer</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <AiCard icon={Bot} title="AI recommendation engine" text="Suggests alternative destinations based on interests, crowding, weather and mobility mode." />
          <AiCard icon={CloudSun} title="AI crowding score" text="Combines tourism statistics, seasonality, events, mobility flows and partner data to estimate crowding." />
          <AiCard icon={Sparkles} title="AI quest generator" text="Creates educational, family-friendly and sustainability-oriented side quests for each location." />
        </div>
        <div className="mt-4 rounded-[2rem] bg-cream p-5">
          <p className="font-black">Simulated AI suggestion</p>
          <p className="mt-2 leading-7 text-stone">Neuschwanstein is likely crowded today. Try a nearby under-discovered castle route and earn +6 bonus points.</p>
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-black">Why partners join Alpify</h2>
        <p className="mt-2 max-w-3xl leading-7 text-stone">Alpify connects tourists, destinations and local partners through a shared reward system.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {partnerCards.map(([text, Icon]) => (
            <article key={text} className="flex gap-3 rounded-3xl bg-white p-4 shadow-sm">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-soft text-alpine"><Icon size={21} /></span>
              <p className="font-black leading-6">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

const HotelIcon = Building2;

function AiCard({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <article className="rounded-3xl bg-white p-5 shadow-sm">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sky/15 text-navy"><Icon size={22} /></span>
      <h3 className="mt-4 font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone">{text}</p>
    </article>
  );
}
