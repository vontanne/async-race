# Async Race

> **Score: 400 / 400** (self-assessed)
> **Deployment:** _to be added after GitHub Pages publish._

EPAM Campus / Rolling Scopes School test task. A Single Page Application that manages a virtual garage of radio-controlled cars and runs animated drag races against a local mock REST API.

---

## Project Overview

Async Race is an Angular 21 SPA built around two views:

- **Garage** — full CRUD over a collection of cars, bulk random generation (100 per click), a per-car engine controller with start/stop animation, and a "race the whole page" orchestrator.
- **Winners** — a server-sorted, paginated table of every car that has crossed the finish line first, with win count, best time, and the car's icon in its original color.

Page state (current page, sort, in-flight input) is preserved across navigation. The race animation runs outside the Angular zone via `requestAnimationFrame` and a registered `@property --pos` custom property, so a full 7-car page races smoothly even at the responsive 500 px breakpoint.

---

## Technologies

- **Angular 21.2** — standalone components, signals + computed, `viewChild` / `viewChildren`, `@for / @if / @empty` control flow, lazy-loaded routes, OnPush change detection everywhere.
- **TypeScript 5.9** — `strict` mode + `noImplicitAny`, plus `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, and Angular's `strictTemplates` / `strictInjectionParameters`.
- **RxJS 7.8** — `firstValueFrom`, `forkJoin`, `catchError`, `takeUntilDestroyed`.
- **Vitest 4** — fast unit-test runner with `HttpTestingController`, `TestBed`, jsdom.
- **ESLint 9** (flat config) + `typescript-eslint` `strictTypeChecked` + `stylisticTypeChecked` + `@angular-eslint`.
- **Prettier 3** — single source of formatting truth.

---

## Requirements

- **Node.js** ≥ 20 (matches Angular 21's supported range; 22 LTS recommended)
- **npm** ≥ 10 (this project pins `npm@11.12.1` via `packageManager`)

---

## Installation

```bash
git clone https://github.com/vontanne/async-race.git
cd async-race
npm ci
```

---

## Environment Configuration

The API base URL lives in `src/app/core/constants/api.constants.ts`:

```ts
export const API_BASE_URL = 'http://localhost:3000';
```

Per the task brief the reviewer runs the mock backend locally, so the URL is intentionally a single constant rather than a `fileReplacements` setup. Modern browsers treat `http://localhost` as a secure origin, so the deployed HTTPS frontend can call the local HTTP backend without mixed-content blocking.

If you ever need to point at a different host (Docker, codespace, etc.), edit that one constant.

---

## Running the Application

Before starting the frontend you **must** have the mock backend running on `http://localhost:3000`.

### Backend (one-time setup)

The backend lives in a separate repository: **https://github.com/mikhama/async-race-api**

```bash
git clone https://github.com/mikhama/async-race-api.git
cd async-race-api
npm install
npm start
```

This boots a JSON-server-based mock on `http://127.0.0.1:3000` exposing `/garage`, `/engine`, and `/winners`. Leave this terminal running.

### Frontend

In a **separate terminal**, inside this repo:

```bash
npm start
```

The Angular dev server runs at `http://localhost:4200`. Open it and the SPA will start talking to the mock backend immediately.

---

## Available Scripts

| Script | Purpose |
|---|---|
| `npm start` | Dev server at `http://localhost:4200`, HMR enabled. |
| `npm run build` | Production build → `dist/async-race/`. |
| `npm run watch` | Development build with file watching. |
| `npm test` | Run the full Vitest suite once and exit (CI mode). |
| `npm run test:watch` | Vitest in interactive watch mode for local TDD. |
| `npm run lint` | ESLint on `src/**/*.{ts,html}`. |
| `npm run format` | Prettier write-mode across `ts`, `html`, `css`. |
| `npm run ci:format` | Prettier check-mode for CI; non-zero exit on drift. |

---

## Project Structure

```
src/app/
├── core/
│   ├── constants/      api.constants.ts, car-names.constants.ts
│   ├── interceptors/   error.interceptor.ts          — toast on unexpected HTTP errors
│   ├── models/         car / engine / race / winner  — pure type definitions
│   └── services/       car, engine, winner           — HTTP layer (one per resource)
│                       notification                  — toast queue (signals)
│                       race-state                    — race lifecycle orchestrator
├── features/
│   ├── garage/         garage.component + garage-state.service + car-card/
│   └── winners/        winners.component + winners-state.service
├── layout/
│   └── header/         top nav with active link styling
├── shared/
│   ├── car-icon/       SVG sprite used in both Garage and Winners
│   ├── notifications/  toast renderer
│   ├── pagination/     reusable prev / next pager
│   └── winner-banner/  modal shown when a race produces a winner
├── app.config.ts       provideHttpClient(withFetch, withInterceptors), provideRouter
├── app.routes.ts       lazy routes: '/garage' (default) + '/winners'
└── app.ts              shell — header + <router-outlet/> + notifications
```

### Architectural notes

- **State management** is signal-based and locality-scoped. `*StateService`s are `providedIn: 'root'` so view state survives navigation; transient data (lists, loading flags) lives on the component.
- **`RaceStateService`** owns the cross-cutting race lifecycle (`isRacing`, `hasFinishedRace`, `winnerData`) and the winner-persistence side effect, decoupled from any single view through the `Raceable` interface.
- **Animation** runs in `runOutsideAngular` via `requestAnimationFrame`, writing to a registered `@property --pos`. Change detection is never triggered by the per-frame paint.
- **HTTP error handling** is centralised in `errorInterceptor`: documented gameplay errors (404 on `/winners?id=`, 429 on `/engine?status=drive`, 500 on `/engine?status=drive`) are swallowed silently; anything else surfaces as a toast.

---

## Development Notes

- All components use `ChangeDetectionStrategy.OnPush`.
- All HTTP subscriptions are scoped via `takeUntilDestroyed(this.destroyRef)`.
- Car cards implement the `Raceable` interface, letting `RaceStateService` orchestrate `Promise.any` across the page without depending on any specific component.
- Strict `eqeqeq`, `no-magic-numbers`, `max-lines-per-function: 40`, and `no-duplicate-imports` are enforced via ESLint.
- The `*StateService` singletons keep page numbers and form inputs alive across `/garage ⇄ /winners` switches.

### A note on the Airbnb ESLint requirement

The project uses ESLint v9 flat config with `typescript-eslint`'s `strictTypeChecked` + `stylisticTypeChecked` presets, the official `@angular-eslint` plugin, **plus the Airbnb-aligned rules** that the spec explicitly calls out:

- `max-lines-per-function: 40`
- `no-magic-numbers`
- `no-var`, `prefer-const`, `arrow-body-style`
- `eqeqeq`, `no-duplicate-imports`, `no-console` (allow `error`/`warn`)

The legacy `eslint-config-airbnb-base@15` package predates ESLint v9 flat config and `typescript-eslint v8` and conflicts with both. The current configuration enforces the same rules the spec actually checks for, in a form that is compatible with the modern toolchain.

---

## Testing

```bash
npm test          # one-shot, exits with status code (CI-friendly)
npm run test:watch
```

Current coverage: **12 test files, 71 tests** — every service, the HTTP error interceptor, the pagination/car-icon/car-card components, and both feature shells (`garage`, `winners`) are covered with `TestBed` + `HttpTestingController` + jsdom.

The tests stub HTTP at the interceptor boundary, so no backend is required.

---

## Production Build

```bash
npm run build
```

Outputs to `dist/async-race/` with hashed filenames. Production bundle is gated by Angular's budget config in `angular.json`:

- **initial bundle**: 500 kB warning, 1 MB error
- **per-component style**: 4 kB warning, 8 kB error

Current production size (gzipped): **~70 kB initial**, with `/garage` and `/winners` lazy-loaded.

---

## EPAM Async Race Task Compliance

### Self-assessed score: **400 / 400**

### 🚀 UI Deployment

- [ ] **Deployment Platform** — _to be filled in after GitHub Pages publish._

### ✅ Requirements to Commits and Repository

- [x] **Commit guidelines compliance** — Conventional Commits format (`feat:`, `refactor:`, `test:`, `fix:`, `chore:`), imperative present tense.
- [x] **Checklist included in README.md** — see this section.
- [x] **Score calculation** — at the top of this README.
- [ ] **UI Deployment link in README.md** — _to be added with deployment._

### Basic Structure (80 / 80)

- [x] **Two Views (10)** — `/garage` and `/winners` routes, lazy-loaded.
- [x] **Garage View Content (30)** — title, create+edit panel, race control panel, garage section.
- [x] **Winners View Content (10)** — title, sortable paginated table, pager.
- [x] **Persistent State (30)** — `GarageStateService` + `WinnersStateService` are root-singleton signal stores; page numbers, input fields, color choices, sort + order all survive navigation.

### Garage View (90 / 90)

- [x] **CRUD Operations (20)** — name validated `1 ≤ len ≤ 50`; deleting a car also deletes its entry from `/winners`.
- [x] **Color Selection (10)** — native `<input type="color">` provides the full RGB palette, rendered on the SVG icon.
- [x] **Random Car Creation (20)** — `Generate cars` button creates 100 cars from 10 brands × 10 models each, with random colors.
- [x] **Car Management Buttons (10)** — Select + Delete on every card, disabled while the car is racing.
- [x] **Pagination (10)** — 7 cars per page.
- [x] **EXTRA — Empty Garage (10)** — friendly "No cars in garage yet." message.
- [x] **EXTRA — Empty Garage Page (10)** — deleting the last car on a non-first page auto-navigates back one page.

### Winners View (50 / 50)

- [x] **Display Winners (15)** — every race winner is upserted into `/winners`.
- [x] **Pagination (10)** — 10 winners per page.
- [x] **Winners Table (15)** — `#`, icon (in original color), name, wins, best time. Repeat wins increment `wins`; best time uses `Math.min(existing, new)`.
- [x] **Sorting (10)** — server-side `_sort=wins|time` + `_order=ASC|DESC`, with sortable column headers (keyboard accessible via Enter/Space + `aria-sort`).

### Race (170 / 170)

- [x] **Start Engine Animation (20)** — waits for `velocity/distance` → animates → calls `drive`; on 500 the animation is frozen at the car's current position and state becomes `broken`.
- [x] **Stop Engine Animation (20)** — cancels the rAF loop, awaits the PATCH, resets `--pos` to 0.
- [x] **Responsive Animation (30)** — `@media (max-width: 500px)` shrinks track + car-width; the `--pos` math stays correct because it scales relative to `100% - var(--car-width)`.
- [x] **Start Race Button (10)** — races every car on the current page via `Promise.any`.
- [x] **Reset Race Button (15)** — restores every car to its starting position.
- [x] **Winner Announcement (5)** — modal banner with car name and time (rounded to 2 decimals, matching the Winners table).
- [x] **Button States (20)** — `canStart` and `canStop` computed signals derived from a 5-state engine machine (`idle`, `starting`, `driving`, `broken`, `stopping`).
- [x] **Actions during the race (50)** — per-car Select/Delete disabled while that car is starting or driving; Race disabled while racing; Reset only enabled after the race starts or finishes; engine cleanup on `DestroyRef.onDestroy` stops orphan engines if a card unmounts mid-race.

### 🎨 Prettier and ESLint Configuration (10 / 10)

- [x] **Prettier Setup (5)** — `format` and `ci:format` scripts, single quotes, Angular HTML parser.
- [x] **ESLint Configuration (5)** — ESLint v9 flat config with `typescript-eslint strictTypeChecked` + `stylisticTypeChecked` + `@angular-eslint`, plus the Airbnb-aligned rules the spec explicitly requires (40-line function cap, no-magic-numbers, eqeqeq, no-var, prefer-const, arrow-body-style, no-duplicate-imports). See the "Note on the Airbnb ESLint requirement" section above.

### 🌟 Overall Code Quality (reviewer's discretion, up to 100)

- [x] **Modular Design** — clean separation: `core/` (models, services, interceptors, constants), `features/` (page-level components + per-feature state), `shared/` (reusable presentation), `layout/`.
- [x] **Function Modularization** — every function under 40 lines (enforced by ESLint).
- [x] **Code Duplication & Magic Numbers** — constants for every limit, timeout, threshold, and HTTP code; `no-magic-numbers` enforced.
- [x] **Readability** — descriptive names, no abbreviations, JSDoc-free because the code reads as itself.
- [x] **Extra features** — lazy-loaded routes, `@property` registration with `inherits: true`, rAF in `runOutsideAngular`, `Raceable` interface decoupling, `Promise.any` first-finisher semantics, 71 Vitest tests.
