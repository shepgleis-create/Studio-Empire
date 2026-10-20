# STUDIO EMPIRE — 50 major feature milestones

This is the requested roadmap, not a claim that fifty systems were built in v0.21. Items marked checked represent code present in the v0.22 development branch. Passing CI is tracked separately; unchecked requirements must not be claimed complete. Each item must receive independent gameplay and regression verification before final signoff.

- [x] 01. Continuous day-by-day simulation while the game is visible (true daily costs, sales and production; seven-day rival settlement)
- [x] 02. Adjustable game speed and pause/resume
- [x] 03. Auto-publish finished games with opt-out
- [x] 04. Genre and theme aware game-title generator
- [ ] 05. More varied game scopes and project types
- [x] 06. Project scheduling and release date targets (relative simulated week targets; missed date increases bugs)
- [ ] 07. Multiple simultaneous development teams
- [x] 08. Development-priority budget allocation inside projects (180-point design/technology/presentation budget)
- [ ] 09. Risk of scope creep and delays
- [x] 10. Testing and bug-fixing allocations (QA staff specialization and quality policy affect defects)
- [x] 11. Publisher contract negotiations (new: three rival offers per active title; accept, one deterministic counteroffer, decline, financed advances, permanent royalties, deadlines and late fees. CI pending)
- [ ] 12. Platform exclusivity contracts
- [x] 13. Game price changes over its lifecycle (saved prices, 14-day cooldown, price-sensitive unit demand, timed 7/14/28-day discounts and automatic expiry; final CI pending)
- [ ] 14. Sequels and franchise planning
- [ ] 15. Expansion packs and DLC revenue models
- [ ] 16. Live-service post-launch retention
- [ ] 17. User-review and critic trend simulation
- [ ] 18. Marketing campaigns tied to release timing
- [ ] 19. Seasonal consumer demand
- [ ] 20. Game industry historical platform transitions
- [ ] 21. Rival project announcements
- [ ] 22. Rival release calendar
- [ ] 23. Rival office expansions
- [ ] 24. Rival platform specialization
- [ ] 25. Rival marketing strategies
- [ ] 26. Acquisition bid negotiations
- [ ] 27. Subsidiary integration and restructuring
- [ ] 28. Buy and sell studio intellectual property
- [ ] 29. Inter-studio engine licensing contracts (partial: paid rival research partnerships grant RP; engine licenses not implemented)
- [x] 30. Employee positions and specialties (saved roles influence project progression and bug rate)
- [ ] 31. Skill growth through real project work
- [ ] 32. Employee promotions and salary negotiations (partial: saved 5%/10% raises adjust salary and morale; promotions remain)
- [x] 33. Burnout, time off and morale (new: paid leave with cooldown, four staff policies, morale/energy and daily cost consequences. CI pending)
- [ ] 34. Hiring market supply and competition (partial: recruit rivals' staff with reputation/cash/capacity limits; wider hiring market unfinished)
- [ ] 35. Department-specific workstations
- [ ] 36. Office renovation and furniture placement
- [ ] 37. Separate detailed assets for four office tiers
- [ ] 38. Rigged 3D employees and sitting/typing animations
- [ ] 39. Office pathfinding around furniture
- [ ] 40. Historical computer and equipment variants
- [x] 41. Daybreak bright palette and improved 3D scene lighting
- [ ] 42. Responsive mobile management navigation
- [ ] 43. Interactive department and employee views
- [ ] 44. Sound effects and ambient audio controls (partial: opt-in synthesized music toggle beside speed; full effects/ambient mixer unfinished)
- [ ] 45. Financial monthly reports and forecasting (partial: saved-career daily cash runway, payroll, expenses and estimated sales; detailed monthly comparisons remain)
- [ ] 46. Loans, interest, repayments and financing
- [ ] 47. Dynamic research dependency map
- [ ] 48. Difficulty rebalancing by decade
- [x] 49. Career milestones and achievable goals (12 conditions, saved one-time cash and reputation reward claims. CI pending)
- [ ] 50. Reliable export/import, migration and backup recovery

## v0.21 evidence

- Local Node model tests: 114 assertions including 96 genre/topic combinations; passed.
- Local browser harness: 320, 390, 1280px interactions passed; not a full running Babylon game.
- Vercel development preview: READY at commit 8941dc7; unchanged main production branch.
- GitHub browser and career CI: queued at report time. Re-check before announcing final pass.
- Physical iPhone Safari: not tested by the assistant.

## Release standards

No static image presented as gameplay. No savings overwritten by automated time; no offline catch-up. Each purchased office must remain a genuine paid progression. Each feature requires real UI, persistent state, at least one behavioral test, and running-game visual review where appropriate.

## v0.22 development scope

- Implemented: Production Lab under Games, project strategy (balanced/quality/crunch/lean), fixed development-priority budgets, deadline risk, project stage milestones, QA/programming/art/audio/design specialties, project cost and time forecasts.
- Connected to the existing saved career, industry economics, continuous simulator, and release-quality calculation. The original production branch remains unchanged.
- Automated tests: `tests/production-v22.test.mjs` and real WebGL browser test `tests/production-v22-browser.py` (verify actual GitHub Actions results before marking browser verification complete).
- Still incomplete: scope creep, fully adjustable feature-level budgets, studio HR leave/raises, multiple simultaneous projects, professional 3D character models, premium building interiors, physical iPhone Safari test, offline simulation recovery.
- Previous milestones 01–04 and 41 remain checked; this batch adds 06, 08, 10, and 30. Other items are not counted as finished.

## v0.23 delivered vs. remaining

Implemented daily date/time, sound toggle, research partnerships, paid publishing contracts, rival recruitment, subsidiary funding, and revised Daybreak management styling. See docs/V023_DEVELOPMENT_REPORT.md. Partial features remain unchecked and are not counted as completed milestones. The full concept-level 3D asset library and every-tab visual rebuild remain open.

## v0.24 — interconnected feature expansion (code committed; CI pending)

- Publisher marketplace for in-development games with three competing offers from real saved rival companies; upfront financing, marketing hype, negotiated counteroffers, contract cancellation, deadlines, late penalties, and permanent game royalty shares.
- Workforce controls: four daily studio operating policies, saved permanent salary raises, paid time off with cooldown, and paid severance when dismissing non-founder staff. Employee morale, energy, daily cash, and development progress respond to these choices.
- Twelve saved career achievements with progress, one-time claimable cash and reputation rewards, and duplicate-claim protection.
- Strategy forecast: daily operating cost, estimated retained daily game sales, net cash, runway, and active deals from real career data.
- User interfaces under Games → Publishers, Team → Culture, Overview → Milestones. Existing 3D branch, main menu, mobile navigation and save key preserved.
- Local pre-integration prototype: 142 assertions passed. Exact committed implementation: new GitHub Actions v24-expansion test added; must check its completion before claiming regression pass. Existing UI/browser tests and physical iPhone Safari: not independently verified for v0.24.
- Premium concept art: still not achieved; no artwork was generated or counted as gameplay in this batch.

## v0.24 — Post-release pricing addendum

- New Games → Pricing screen changes released games' saved prices. Actual daily copies use a price-elasticity factor; the sale economy reacts to both price and volume.
- Sales can run 10–40% discounts for 7, 14, or 28 simulated days and automatically restore the previous price. Pricing cooldown prevents rapid changes; valid saves are retained.
- Added pricing regression workflow and existing Production Lab form-refresh protection. Full integrated GitHub Actions tests must be checked before claiming this specific revision is verified.
