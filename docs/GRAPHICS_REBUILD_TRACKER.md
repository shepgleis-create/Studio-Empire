# Studio Empire — Graphics Rebuild Verification Tracker

Status: **WIP — starter garage quality gate NOT passed.**

## Baseline confirmed (2026-10-15)
- Repo: `shepgleis-create/Studio-Empire`; original `main` preserved.
- Existing game is primarily one large inline HTML/JavaScript application plus a Canvas2D office renderer.
- Current user saves and simulation contain years, difficulty, employees, games, research, rivals, acquisitions, offices, publishers, DLC and finance mechanics. Work on this feature branch leaves these systems intact.
- Current graphics rely heavily on procedural geometry; visually short of approved high-detail concepts.
- Existing office tiers 2–4 continue using the prior renderer; no claims that their visuals have been rebuilt.

## Changes on feature/garage-scene-v09
- [x] Separate garage drawing path; existing simulation preserved.
- [x] Independently drawn workstations and other props, nine scene objects.
- [x] Live employees only; zero human figures in structural background cache.
- [x] Shared depth ordering for furniture and employees.
- [x] Navigation-grid occupancy and A* pathfinding for task destinations.
- [x] Historical CRT vs later monitor graphics.
- [x] Current project progress indicator reflects simulation state.
- [x] Event handling can tap employees and contextual garage workstations.
- [x] JavaScript syntax checks and Chromium tests at 320x650, 390x844, 844x390, 1280x800.
- [x] Test flow: 1975 new career, development, weekly advances, release.
- [ ] Artist-quality matching environment asset library (FAIL).
- [ ] High-quality animated character sprite atlas/rig with sit and walk transitions (PARTIAL).
- [ ] True obstruction in every complex corner and collision tests at all densities (PARTIAL).
- [ ] iPhone Safari and iPad WebKit physical-device testing (NOT TESTED).
- [ ] Migration to modular TS/WebGL renderer (NOT STARTED).
- [ ] New production HUD in both orientations (NOT STARTED).
- [ ] Screenshot visual-quality comparison approval (FAIL).
- [ ] Office-tier-specific illustrations at approved standard (NOT STARTED).
- [ ] Reliable performance validation at 50–200 characters (NOT TESTED).
- [ ] Production deployment (NOT DONE—intentionally gated).

## Acceptance Gate A
Do **not merge or deploy** until garage character/environment art truly meets agreed reference quality, input/camera works on actual WebKit and old saves and game release pass on the merged preview.

## Release verification rules
Do not label generated concept art as a screenshot. Real screenshots must come from a running game at known seed, career year, tier and viewport. Measure FPS and failures, cite the PR and deployment commit, and keep `main` unchanged until release gates pass.

## Next engineering cycle
1. Replace procedural low-detail rectangles with consistent original, reusable environment assets and a matching animated character atlas.
2. Implement task animations and purposeful worker interactions, proper occlusion and no desk clipping.
3. Resolve excessive empty mobile canvas and HUD real estate; test landscape switch and pinch resets.
4. Run performance profiling, visual screenshot diff and old-save regression before merge.
