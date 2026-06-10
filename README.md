# Async Race

**Score (self-assessed): 400 / 400** · **Live:** https://vontanne.github.io/async-race/

Single-page application for the EPAM Campus "Async Race" test task. Manages a garage of radio-controlled cars and runs animated drag races against a local mock REST API. UI state — pagination, sort, form input — persists across navigation.

## Features

- Garage CRUD with name validation and RGB color picker
- Bulk-create 100 random cars (10 × 10 brand × model combinations)
- Per-car engine controls with `requestAnimationFrame` animation
- Race orchestrator with `Promise.any` first-finisher semantics
- Winner persistence — increment wins, keep best time
- Winners table with server-side sort and pagination
- Modal winner banner
- Responsive down to 500 px

## Tech Stack

- Angular 21 — standalone components, signals, OnPush, lazy routes
- TypeScript 5.9 — `strict`, `noImplicitAny`, `strictTemplates`
- RxJS 7
- Vitest 4 + jsdom
- ESLint 9 (flat config) + `typescript-eslint` + `@angular-eslint`
- Prettier 3

## Prerequisites

- Node.js ≥ 20.19 (Node 22 LTS recommended; CI uses 22)
- npm ≥ 10 (project pins `npm@11.12.1`)

## Installation

```bash
git clone https://github.com/vontanne/async-race.git
cd async-race
npm ci
```

## Environment Configuration

API base URL is a single constant in `src/app/core/constants/api.constants.ts`:

```ts
export const API_BASE_URL = 'http://localhost:3000';
```

Change this value if the mock backend runs on a different host or port. No `.env` or `environment.ts` setup is used.

## Running Locally

### Backend

Mock REST API: https://github.com/mikhama/async-race-api

```bash
git clone https://github.com/mikhama/async-race-api.git
cd async-race-api
npm install
npm start
```

Listens on `http://localhost:3000`. Leave the process running.

### Frontend

In a separate terminal, inside this repo:

```bash
npm start
```

Open `http://localhost:4200`.

## Development Scenarios

- **Local frontend + local backend.** Default development mode. Run `npm start` here, run `npm start` in `async-race-api`.
- **Deployed frontend + local backend.** Open the live URL and run `npm start` in `async-race-api` locally. Modern browsers treat `http://localhost` as a secure origin, so HTTPS → HTTP requests work without mixed-content blocking. This is the reviewer's evaluation setup.
- **Fully deployed.** Not supported — per the task brief the mock backend is intentionally not hosted; every reviewer runs it locally.

## Available Scripts

| Script               | Purpose                                       |
| -------------------- | --------------------------------------------- |
| `npm start`          | Dev server at `http://localhost:4200`         |
| `npm run build`      | Production build → `dist/async-race/browser/` |
| `npm test`           | Vitest one-shot (CI mode)                     |
| `npm run test:watch` | Vitest watch mode                             |
| `npm run lint`       | ESLint over `src/**/*.{ts,html}`              |
| `npm run format`     | Prettier write                                |
| `npm run ci:format`  | Prettier check (CI)                           |

## Build

```bash
npm run build
```

Output: `dist/async-race/browser/`. Production budgets: 500 kB warn / 1 MB error initial; 4 / 8 kB per-component style.

## Deployment

GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`). Every push to `master` runs lint + tests + build, then publishes through `actions/deploy-pages@v4`. No separate deployment branch.

Live: https://vontanne.github.io/async-race/

---

## Task Checklist — 400 / 400

### Deployment & Repository

- [x] UI deployed to GitHub Pages
- [x] Conventional Commits
- [x] Checklist in README
- [x] Score at top of README
- [x] Deployment link at top of README

### Basic Structure (80)

- [x] Two views — Garage + Winners (10)
- [x] Garage view content — title, create/edit panel, race controls, garage section (30)
- [x] Winners view content — title, table, pagination (10)
- [x] Persistent state across navigation (30)

### Garage View (90)

- [x] CRUD with name validation (20)
- [x] RGB color picker (10)
- [x] Random 100-car generator from 10 × 10 brand × model (20)
- [x] Per-car Select / Delete (10)
- [x] Pagination, 7 per page (10)
- [x] EXTRA — empty-garage message (10)
- [x] EXTRA — auto-back when last car on a page is deleted (10)

### Winners View (50)

- [x] Display winners after race (15)
- [x] Pagination, 10 per page (10)
- [x] Increment wins, keep best time (15)
- [x] Server-side sort by wins and time, ASC / DESC (10)

### Race (170)

- [x] Start engine animation; 500 stops the animation (20)
- [x] Stop engine returns the car to its starting position (20)
- [x] Responsive animation at ≤ 500 px (30)
- [x] Start race button — races every car on the current page (10)
- [x] Reset race button — restores every car (15)
- [x] Winner announcement (5)
- [x] Button states reflect engine state (20)
- [x] Predictable behaviour for actions during a race (50)

### Prettier & ESLint (10)

- [x] Prettier `format` + `ci:format` scripts (5)
- [x] ESLint `lint` script — 40-line function cap, no-magic-numbers (5)
