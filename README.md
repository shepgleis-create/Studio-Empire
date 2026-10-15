# Studio Empire v0.8 — Animated office progression

## Changes
- Four distinct office tiers: garage, rented workspace, creative loft, and studio campus. Buying offices incurs cash expense, increases payroll capacity and monthly property costs, and changes the visible building.
- Distinct character-free environments: all characters are rendered from the live simulation rather than embedded in an image. Staff walking, working and breaks continue. Unoccupied desks are not filled with imaginary employees.
- Touch gestures: bounded pinch zoom, Fit Office button, immersive mode, orientation-aware resizing, responsive iPhone landscape layout.
- Save migration: previous office tiers 2 and 3 map to new levels 3 and 4. Existing `studio-empire-reboot-v1` save key is retained. Career save loading now accepts 1975 starts.
- Kept projects, reviews, rivals, acquisitions, development research, publisher deals, team hiring, DLC, and financial screens.

## Running
Open `index.html` under a static web server (or deploy its directory to Vercel). `index-self-contained.html` is the single-file play version and may work in some file viewers. No build dependencies.

## Mobile support
iPhone Safari does not allow arbitrary websites to force portrait orientation. The interface now adapts to both landscape and portrait. Fullscreen is requested only where the browser supports it; immersive mode works without Fullscreen API.

## Regression checks
`python test_v08.py` requires Python playwright + Chromium and validates 320px/390px phone, mobile landscape, desktop, new game, 1975 save, game release, office purchase tiers and immersive toggle. Test harness uses a temporary in-memory cash injection for upgrade coverage; no cheats are shipped.