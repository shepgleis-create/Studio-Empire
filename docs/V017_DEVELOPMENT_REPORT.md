# Studio Empire v0.17 — Integration, Mobile UX and Materials

## Scope

Existing repo: shepgleis-create/Studio-Empire. Development branch: feature/3d-engine-foundation.
Production main remains intact. This branch is a preview of the Babylon.js 3D frontend.

## Implemented this batch

- Eliminated competing read-only garage overlay by routing Staff, Projects, Company, inspector and project snapshot navigation to the actual save-backed career interface. The old sheet is hidden/inert.
- Rebuilt the UI palette from inconsistent green/teal/blue/coral to graphite, slate, pale text and restrained coral accent. Reworked mobile career header, navigation tabs, buttons, metrics and management cards.
- Added actual saved-state project progress and next paid-office milestone cards on the phone. Both link to functional management screens.
- Fixed the founder garage isometric camera calculation on portrait phones so the building fits, then tuned garage scale for better visibility.
- Introduced procedurally authored textures on real Babylon.js mesh surfaces: wood flooring, plaster walls, desk wood and rugs. No room screenshot is substituted for functional geometry.
- Added validated JSON save import, user confirmation when replacing an existing career, backup storage and verification after importing. Export already existed.
- Added test coverage: syntax-check gate, phone/desktop WebGL navigation, old-modal suppression, research controls, camera bounds, live mobile cards, save import/backup, complete career game release.

## Preserve

Save key remains studio-empire-reboot-v1. No automatic overwrite of existing careers.
Paid office progression and ownership remain enforced; corporate systems from the original game are not removed from main.
The new 3D URL is a Vercel preview. Production is NOT automatically changed.

## Known unfinished work

- Visual quality remains below the concept reference. The mesh assets are still largely primitive geometry; professionally modeled environment props and rigged character animations are needed.
- Performance numbers from GitHub headless software WebGL do not establish physical iPhone performance.
- The career simulation in the 3D frontend still lacks full feature parity with the original corporate and rival AI systems.
- Legacy save imports are subject to structural validation; unusual/outdated save schemas may require explicit migration.
- Need a larger, genuine 3D art asset pipeline and repeatable scene art-direction review.
- Physical iPhone Safari layout/performance testing remains outstanding.

## Release gate

Only label as verified after CI successfully runs game economy unit tests, JavaScript syntax checks, a full in-browser create-and-release career, and mobile navigation/import checks. Inspect real screenshot artifacts.
Vercel deployment READY alone proves hosting succeeded, not gameplay quality.

## Next priorities

1. Professional asset sourcing/procedural material improvements and high-quality animated workers.
2. Full career simulation parity: publishing, franchises, rivals, acquisitions, payroll, research & offices.
3. Better mobile camera gestures, performance and safe-area polish on physical devices.
4. Thorough save-schema migration and production release readiness.
