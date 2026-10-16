# Studio Empire — 3D Rebuild Execution Specification

Status: foundation / not yet a playable 3D build. Production `main` must remain untouched until visual and gameplay tests pass.

## Goal
Replace the current 2D Canvas office with a Babylon.js orthographic/isometric 3D scene, not a flat illustration. All 3D employees, furniture, architecture, and UI controls must be independently authored, interactive entities. Keep the existing business simulation and save format, using adapter/migrations if necessary.

## Actual deployment targets
- Repository: `shepgleis-create/Studio-Empire`
- Existing Vercel project: `studio-empire`, under `sg-0bee`
- Production: `studio-empire-omega.vercel.app`
- Branch: `feature/3d-engine-foundation`; never force-push or reset `main`
- Vercel current blocker: scoped project/deployment API requests returned `403 Forbidden`; connection can list the project but is not authorized for project detail or deployment. Resolve before claiming a deployed preview.

## Engine and architecture
- TypeScript + Babylon.js + Vite; no mandatory native editor on the user's iPhone.
- Orthographic isometric camera, bounded pinch zoom/pan, portrait and landscape viewport fitting.
- Modular types: OfficeScene, FurnitureItem, Workstation, EmployeeActor, CharacterAnimator, OccupancyGrid/NavMesh, ProjectStatusAdapter, SaveAdapter, UI HUD.
- Scene object records: id, mesh/asset URI, anchor/transform, collision, walkable node, staff attachment point, click target, tier, era, LOD.
- GLB/glTF assets with texture compression and low-cost mobile fallbacks; keep third-party license manifest.
- Existing JS business simulation retained behind an adapter until proven equivalent.

## User-facing art direction
- Polished, stylized 3D studio scenes with warm light, believable materials, historical hardware, and matching rigged characters.
- NO generated full-room mockup as an implementation asset with stationary people/text; use individual 3D models and animations only.
- No paid asset purchases before a working proof-of-engine with free/legal assets and a visual review.

## Quality gate 0 — engine proof (not release art)
- Babylon engine boots in Safari/WebGL and Chrome.
- Camera supports pan, pinch zoom, desktop zoom, fit/reset, rotating viewport without broken interaction.
- Draw real independent floor, wall, desk, chair, computer and three actor meshes.
- At least one actor routes to a workstation and executes a sitting/working animation state (temporary geometry allowed for this engineering gate ONLY).
- Asset load errors display actionable messages, not blank canvases.
- Real browser screenshots at iPhone 390x844 and 844x390, desktop 1280x800; recording of moving actor; measured frame rate, load time and memory where available.

## Quality gate 1 — polished 1975–1985 garage (first shippable art)
- Separate modeled/textured retro hardware, workshop wall, storage, desks, chairs, environmental props and lighting.
- Three matched rigged characters (walk, idle, sit, type, break) interacting with matching 3D furniture.
- Collision/pathing around props, occlusion and shadows verified; no static duplicate humans.
- Professional mobile/desktop HUD, not baked into the 3D scene.
- Game creation -> development -> release; research and rivals operate from old simulation.
- Preservation test for at least one legacy 1975 save and an existing current-era save.
- Actual in-game images visually reviewed against approved reference. If quality misses, fail gate; do not describe as complete.

## Quality gate 2 — economic office progression
- Next independently modeled office, proper purchase/lease price and monthly costs, capacity, room/workstation changes, and save migration.
- Additional tiers only after previous art and gameplay gates pass.

## Build and release workflow
1. Audit code and save schema; back up existing working production sources.
2. Build engine module on feature branch; run compile/type checks.
3. Add art and animations (source files, GLB files and license records) through repo.
4. Run automated interactions, image comparisons, and performance checks.
5. Use existing Vercel project for *preview* after access is repaired; do not merge unfinished branch.
6. Test preview URL on actual iPhone Safari; fix documented issues.
7. Merge only when user accepts functional and actual rendered visual evidence.
8. Verify production deployment, Git commit SHA and save compatibility.

## Per-update report
- Committed file names and SHA; test commands and exact results; screenshot provenance; real preview URL or accurate blocker; remaining quality failures.
- Clearly label concept art versus game assets versus actual game screenshots.