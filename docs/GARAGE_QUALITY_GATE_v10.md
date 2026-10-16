# Garage quality gate — v0.10 (development branch)

**Status: IN PROGRESS; not approved for production.**

## Tested
- Garage has 13 independent renderable props (up from 9), separate from actors.
- No employees baked into the background scene.
- A* navigation returns a valid sample route.
- Scene initialization and no horizontal overflow at 320px portrait, 390px portrait, 844px landscape, and 1280px desktop.
- 1975 historical career import accepted after correcting the validator.
- Four local headless Chromium viewport tests: PASS (not real iPhone Safari).

## Not yet approved
- Art remains simplified procedural rendering, **not** the agreed cinematic quality level.
- Better character sprites, multi-directional animation, seating transitions, proper occlusion, environmental texture and asset pipeline are still required.
- Physical iPhone performance and WebKit compatibility have not been measured.
- Production release intentionally withheld until garage visual acceptance passes.

## Next implementation gate
1. Build a reusable scene asset manifest and sprite atlas with unified scale, lighting and perspective.
2. Author a professional garage environment with independently placed floor, walls, furniture, lighting and props—without pre-rendered people.
3. Make three employees walk to desks, sit, type, stand, discuss at the whiteboard and take breaks with correct occlusion.
4. Compare actual browser screenshots to approved visual references, and revise artwork until the quality target is met.
5. Test Safari/WebKit and desktop, plus old saves, then preview and production deploy only after checks pass.

Test script: `tests/test_garage_quality.py`.
