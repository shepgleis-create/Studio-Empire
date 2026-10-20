# Studio Empire v0.23 — daily simulation, soundtrack, and rival relations

## Source and release scope
Existing repository: shepgleis-create/Studio-Empire.
Branch: feature/3d-engine-foundation. Draft PR #2. Main production branch remains unchanged.
Babylon.js /game3d/ remains a development build.

## Implemented
- Save-backed daily calendar and progression, with real calendar dates and month lengths (including leap days), true daily prorated payroll, office operating expenses, project costs and development progress, released-game sales and staff energy. Business rival settlement every seven days.
- Automatic continuous simulation uses one clock and retains pause, 1×, 2×, 4× and 8× controls. No offline catch-up.
- Existing production strategies, design focus and employee specialties affect daily progress and quality.
- Original opt-in synthesized music toggle next to speed controls. Web Audio does not start until user taps. Stops on page visibility loss.
- Rival commercial actions: paid technology partnerships, publishing agreements, competitor recruitment, subsidiary investment. Limits depend on available funds, reputation, staff capacity, duplicate deals, and cooldowns.
- Rival agreements have finite terms and weekly calculations, stored in the existing career schema. Purchases require confirmation.
- Brighter management presentation in Daybreak theme, enhanced rival-contract panel, and rewritten old weekly-only labels.
- Financial year rollover now adds a report and resets annual profit accumulation.

## Tests (at time of writing)
- Local comprehensive engine test: 147 assertions passed against fixtures.
- GitHub Actions daily regression: passed for commit aefcc477 (prior to this documentation), after fixing a browser-only document access in headless tests.
- Existing v0.21 tests: passed.
- Full 3D visual and career browser regression: running at the time this file was written. Do not claim success until the workflow finishes.
- No real physical iPhone Safari automated run in this session.

## Compatibility and limitations
- Existing original career is preserved; no forced schema migration. Older weekly careers infer their initial day from month/week.
- Year, month, day are real dates. weekNumber remains for compatible rival and contract settlement.
- Vercel development preview only; do not merge to main without user visual acceptance.
- The new soundtrack is a lightweight synthesized instrumental, not a fully produced audio album. Browser Web Audio capability is required.
- Publishing agreements use pre-defined contract terms rather than negotiable royalty sliders. Rival AI remains simplified.
- 3D characters, room props, lighting quality and most office art remain significantly below the approved concept reference.
- Save data is browser-origin scoped; different Vercel preview URLs don't share local saves automatically. Use JSON export/import.
- Device-specific audio, GPU performance and physical iPhone Safari touch interaction remain unverified.

## Next milestones
1. Consolidate old UI stylesheets and complete professional redesign of each tab without feature removal.
2. Multi-team production, real developer skill growth, more publisher contract terms and independent rival project calendars.
3. Commercial quality models, rigged employee animations, lighting, coherent textures and accurate 3D office tiers.
4. Historical economic balance, robust annual/monthly finance, save migration suite.
5. Full mobile WebKit validation and safe integration / deploy to existing production after quality gates.
