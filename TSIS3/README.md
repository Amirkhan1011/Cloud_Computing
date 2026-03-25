# CFO Bot (Cloud Economics) & Agentic Architecture

Academic project that estimates the **monthly cloud cost** of a Chat Bot application using **Spec-Driven Development (SDD)** and deterministic SSOT pricing formulas.

## Repository Layout
- `docs/` contains the Phase 1-5 artifacts:
  - `SSOT.md`, `ImplementationPlan.md`, `TestSpecification.md`, `PricingStrategy.md`
- `cfo-bot/` contains the React + TypeScript (Vite) implementation and tests
- Firebase Hosting config is at the repository root:
  - `firebase.json`, `.firebaserc`

## Setup
1. Install Node.js (LTS recommended)
2. Open a terminal in this repository root (`Antigravity`)
3. Install app dependencies:
   - `cd cfo-bot`
   - `npm install`

## Run (Local Development)
1. From `cfo-bot/`:
   - `npm run dev`
2. Open the URL printed in the terminal (Vite dev server)

## Test
From `cfo-bot/`:
- `npm test`

## Build (Production)
From `cfo-bot/`:
- `npm run build`

The build output is placed in `cfo-bot/dist/` (used by Firebase Hosting).

## Firebase Deployment (Hosting)
Prerequisites:
- A Firebase project (create in Firebase console)
- Firebase CLI installed:
  - `npm install -g firebase-tools`

1. Set your Firebase project id in `.firebaserc`:
   - Open `.firebaserc` and replace `YOUR_FIREBASE_PROJECT_ID`
2. From repository root:
   - `firebase login`
   - Ensure you already built the app (`npm run build` from `cfo-bot/`)
3. Deploy hosting:
   - `firebase deploy --only hosting`
4. After deploy, Firebase will print the live URL.

### Deployment Checklist
- `cfo-bot/dist/` exists (run `npm run build`)
- `.firebaserc` contains the correct Firebase project id
- `firebase.json` points Hosting `public` to `cfo-bot/dist`

