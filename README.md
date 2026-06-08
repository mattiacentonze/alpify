# Alpify

**Slogan:** Beyond the obvious

**Hero sentence:** Discover hidden Alpine gems, collect rewards, and explore beyond the crowds.

Alpify is a frontend-only EUSALP hackathon prototype for a gamified Alpine discovery web app. It helps redistribute tourist flows by rewarding visitors for exploring under-discovered Alpine places, completing outdoor side quests, collecting partner rewards and choosing sustainable mobility.

The intended product feel is “Duolingo for outdoor discovery”: mobile-first, friendly, playful, credible and useful for tourism institutions and local partners.

## Tech Stack

- Vite
- React
- TypeScript
- TailwindCSS
- Leaflet / React Leaflet
- `qrcode.react`
- Static JSON data in `public/data`
- Browser `localStorage` for demo progress

## Run Locally

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

Production build:

```bash
npm run build
npm run preview
```

## Location Data

Locations are loaded from:

```text
public/data/locations.json
```

This file is the source of truth for map markers, location cards, detail panels, side quests, points, connected badges, rewards, partners, crowding levels and mobility bonuses.

If the uploaded JSON has slightly different fields, the app normalizes it in:

```text
src/lib/data.ts
```

Locations without coordinates are skipped on the map but still shown in the Explore list with a warning. Missing optional fields use graceful fallback text.

## QR Code Page

Open the **Share** page in the app to show a QR code for judges.

The QR code uses the current browser URL:

- On Vercel, it points to the live deployed Alpify URL.
- Locally, it points to localhost.

Copy shown on the page:

> Scan to try the Alpify demo on your phone.

## Deploy to Vercel

1. Push the repo to GitHub.
2. Import the repo in Vercel.
3. Framework preset: `Vite`.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. No environment variables are required.

The app is static and does not require a backend, server, API keys or database.

## Deploy to GitHub Pages

Optional scripts are included:

```bash
GITHUB_PAGES=true npm run deploy
```

For GitHub Pages under `username.github.io/repo-name`, Vite needs the correct base path. The current config uses `/alpify/` when `GITHUB_PAGES=true`.

The app uses hash-based navigation, so static hosting does not need server rewrites.

## Demo Progress

Progress is stored in the current browser with `localStorage`:

- total points
- visited locations
- completed quests
- unlocked badges
- unlocked rewards
- claimed rewards
- mobility check-ins
- collected stamps

Use **Reset demo** on the Passport page or desktop header to restart the pitch flow.

## Known Limitations

- No backend
- No real GPS
- No real AI image verification
- No real reward redemption
- Progress is stored only in the current browser
- QR code points to the current deployed URL
- Quest photo files are previewed locally and never uploaded
