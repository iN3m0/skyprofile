# SkyProfile

A desktop Hypixel Skyblock stats viewer, in the spirit of [SkyCrypt](https://skycrypt.net) — built with Electron, Vite, React, and TypeScript.

## Status

Work in progress. Current milestone: **M1 — scaffold + settings (API key storage)**. Player lookup, skills/collections, inventory/item tooltips, pets, and networth land in later milestones (see the project's plan file).

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Get a personal Hypixel API key from [developer.hypixel.net](https://developer.hypixel.net) (requires a linked Hypixel account). This app never bundles or ships a shared key — each user brings their own.
3. Run in dev mode:
   ```
   npm run dev
   ```
4. On first launch, open **Settings** and paste your API key. It's stored locally (via `electron-store`, in your OS user-data directory) and is never committed to this repo or sent anywhere but `api.hypixel.net`.

## Scripts

- `npm run dev` — run the app in development with hot reload.
- `npm run build` — type-check and build main/preload/renderer.
- `npm run build:win` — build and package a Windows installer (NSIS) via `electron-builder`.
- `npm run lint` / `npm run format` — lint / format the codebase.
- `npm run typecheck` — type-check main+preload and renderer separately.

## Architecture

- `src/main/` — Electron main process: Hypixel API client + rate limiting, settings storage, (later) NBT item decoding and networth calculation. Owns everything that needs Node access or the API key.
- `src/preload/` — narrow, typed `contextBridge` API surface (`window.api`) exposed to the renderer.
- `src/renderer/` — React/TypeScript UI, talks only to `window.api`.
- `src/shared/` — types shared between main and renderer, including the IPC channel contract (`src/shared/types/ipc.ts`).
