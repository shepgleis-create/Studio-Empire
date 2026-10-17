# Studio Empire v0.20 — UI and Interaction Rebuild

## Implemented (development branch)
- Consolidated 12 scattered career/industry pages under **Overview, Games, Team, Business**, with contextual subpages.
- Retained real game/simulation actions by routing to existing career/industry handlers; no duplicate business logic and no save writes in navigation.
- Replaced mobile footer with four clear destinations; redesigned desktop sidebar and added an accessible Manage action.
- Unified the palette as graphite/warm neutral, removed conflicting bright chrome, simplified HUD and removed redundant floating goals on phones.
- Converted mobile management into one full-height sheet with contained scrolling, safe area padding, consistent cards and low-cost transitions.
- Kept a reduced-motion mode and keyboard Escape-to-close support.
- Added a Graphite theme default in the existing main-menu settings without changing old saves.

## Verification
- Added browser acceptance checks at 320px, 390px and 1280px for actual Babylon.js, gameplay navigation, no old read-only tabs, JavaScript errors and horizontal overflow.
- Existing career and 3D smoke workflows are part of the branch gates.
- Vercel development previews are separate from production.

## Known unfinished work
- Premium game-ready 3D models, furniture, rigged characters, realistic material/lighting work.
- Physical iPhone Safari testing and large-office frame-rate profiling.
- Full parity with the original 2D game's corporation and rival systems.
- Production merge intentionally withheld until verified.

## Design principle
Do not layer another independently styled interface on top of this one. Add all future sections to the unified four-category navigation.
