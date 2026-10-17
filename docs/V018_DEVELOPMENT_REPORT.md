# Studio Empire v0.18 — expanded simulation, UI, and 3D scene

## Implemented in development branch
- Six working management areas: Rivals, Holdings, Game Library, Marketing, Training and Reports.
- Persistent AI competitors for new careers (preserving existing company rosters), with weekly cash, staff, fans, reputation, valuation and releases.
- Acquisition and sale of rivals, reputation/cash checks and subsidiary income during week advancement.
- Skill training affecting project production, paid marketing affecting fans and hype, patches and DLC to extend game sales.
- Saved financial reporting and real event history, searchable/sortable rival profiles.
- Additional Babylon.js mesh-based cabinets, lighting, signs, plants, workstation accessories and department decor.
- Backup-before-mutation, save revision checks, idempotent industry ticks and strict action validation.

## Tested
- Locally: 14 economy checks pass. Browser UI interaction tests pass at 320px, 390px and 1280px with no reported JavaScript errors and no unexpected horizontal overflow.
- GitHub Actions checks real WebGL Babylon rendering on mobile and desktop; results must be checked before declaring live browser acceptance.
- Live user iPhone Safari remains untested.

## Not finished
- Premium-grade furniture models, lifelike rigged characters, lighting and 3D asset production still fall below the approved image.
- AI is a meaningful competitor simulation first pass, not full publisher/legal/stock-market infrastructure.
- Industry step and base time advance are separately validated saves, not a single atomic transaction.
- Preview localStorage does not automatically see production-origin saves.
- Pin/self-host Babylon before commercial release; test performance on physical iPhone.

**Branch:** feature/3d-engine-foundation; keep main and original saves untouched until quality gates pass.
