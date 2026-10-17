# Studio Empire v0.22 — Production Lab and Connected Career Simulation

## Implemented on \`feature/3d-engine-foundation\`
- Added a real Production Lab screen under Games, compatible with the unified v0.20 navigation and v0.21 continuous time.
- Production policies: Balanced, Quality First, Crunch, Lean. Choices modify weekly development spending, project progress, quality risk, and employee morale in the saved career.
- Genre-weighted project priorities: six presets that allocate a fixed 180-point budget to Design, Technology and Presentation. Uses the preexisting release-review formula and preserves project data.
- Release target dates: four to 52 simulated weeks from the present. Late projects incur additional bug pressure; no fabricated deadline success.
- Employee specializations: saved Generalist, Programming, Game Design, Art/Animation, QA and Audio assignments. Programming/design affect pace, QA lowers bug pressure, and non-generalist staff improve the project match score.
- Simulated milestone states: concept, prototype, production, polish and release-ready; persistent studio history entries for transitions.
- Live Production Lab: real project progress, forecasted cost, weeks remaining, defect count, planning controls, and milestones, with phone-first responsive layout.
- The module wraps the established career/industry week advance, and uses the existing guarded save transactions; it does not replace the overall game.

## Verification
- Local test harness exercising v0.16 career and v0.18 industry compatibility: 38 assertions passed, including a full project lifecycle and idempotent per-week adjustment.
- Exact branch test added: \`node tests/production-v22.test.mjs\`.
- Exact 3D browser test added: \`python tests/production-v22-browser.py\`, covering 390px phone and 1280px desktop with a rendered Babylon scene.
- Existing GitHub career workflow updated to run those new tests.
- As of documentation commit, CI jobs are queued. Do not claim those tests passed until the GitHub workflow reports success.
- Vercel development preview is deployed from this branch. Production main is unchanged. Physical iPhone Safari not independently tested.

## Data and backward compatibility
- Preserves \`studio-empire-reboot-v1\` localStorage schema and original save backups.
- New project fields are optional: \`focus\`, \`strategy\`, \`baseWeeklyCost\`, \`targetWeek\`, \`deadlineMissed\`, \`lastProductionWeek\`, \`milestones\`, \`velocity\`, \`stage\`.
- New staff field: \`specialty\`; defaults to generalist when absent.
- Each action validates availability and writes through the existing industry transaction path. Rejecting invalid focus, plans or specialties leaves saves unchanged.
- No offline catch-up or background financial progression.

## Open issues
- Production Lab uses the existing modeled offices and placeholder character models: graphic fidelity is far below the approved premium studio concept.
- Only one project can be active; true multi-team/multi-project development remains missing.
- Release target is a risk mechanism, not a full publishing contract system.
- Employee specialization influences project output but does not yet replace the visual staff animation rig.
- Existing management screens still have legacy CSS layers; continued UI consolidation and actual iPhone performance testing are required.
- Next: multi-project scheduling, independent department capacity, contract offers, franchise/sequel tooling, paid office furnishing and high-quality model pipeline.

## Release gate
Deploy only to branch preview until unit tests and physical scene checks pass, then review saves and UI manually before any promotion to production.
