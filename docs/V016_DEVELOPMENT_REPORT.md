# Studio Empire — 3D Career Integration v0.16

## Verified and implemented in the development branch

- New real, save-backed 3D career management overlay covering: career creation, project development, production week advances, publishing, hiring, research, office prerequisites/upgrades, staff list, financial summary and saved rival directory.
- Original save key and existing company/project/released-game fields retained. Existing and unknown fields are preserved on transaction; one backup copy stored before first change. JSON export offered in the UI.
- Original cost tiers used for hiring, 4 office prices and weekly project budgets. Research unlocks respect historical availability and prerequisites; project platform release dates are enforced.
- Company cash changes from payroll, office overhead, development spending and real sales calculations, not placeholder HUD counters.
- Improved visual scene detail using independent 3D geometries and procedural signs, wall sconces, pictures, lamps, break furniture, and office finishing objects. No static employee images or pre-rendered room screenshots.
- Automatic Chromium mobile/desktop career smoke and node regression workflow added. Browser checks must assert actual WebGL initialization and game-release save writes.

## Architectural scope and known limitations

- The 3D engine remains a separate route within the original repository, **not** a replacement product or a production merge.
- Studio Empire's original v0.8 simulation remains the established source for full AI rival behavior, long-form economic calculations, and other complex systems. The 3D browser route currently implements a subset for career operations; math is adapted from v0.8 but not claimed bit-identical. Full extraction of shared simulation is still required.
- Changes are written to the same original localStorage career. **Close old game tabs before working in 3D**; original old tabs can independently autosave and overwrite more recent localStorage state. Optimistic stale-state comparison reduces (not eliminates) this race.
- Office-upgrade code remains the existing paid-office module. New career controls invoke it; they do not provide free office-tier toggles.
- Material and geometry improvements are real Babylon.js meshes but **premium 3D art parity is not achieved**. Replacing simple box-built furniture with genuine modeled, rigged and animated game assets remains a high-priority unmet requirement.
- Physical iPhone/Safari testing must be performed by the user; Chromium mobile viewport tests are not device proof.

## Release gate

1. `node --test tests/career.test.mjs` passes (11 tests).
2. Headless 390/1280 management layout tests pass locally with zero runtime errors.
3. GitHub Actions should show success for `3d-career-regression.yml` and provide real 3D screenshots for 390/1280 after push.
4. Vercel preview READY must match the exact new Git commit before sharing a preview link. Preserve `main` until manual phone verification.

## Next milestones

1. Extract a single shared simulation engine from v0.8 and 3D companion; migrate existing saves transparently and reconcile cross-tab activity.
2. Replace geometric office and people placeholders with coherent GLB models and rigged animations; optimize PBR materials and realistic baked lighting for iPhone GPUs.
3. Add an actual company creation and onboarding flow in the 3D office scene, with contextual in-world workstation assignment and natural animated character behaviors.
4. Expand departments and AI rivals with actual economic impact and functional direct 3D management controls.
5. Verify premium visual comparisons against approved concept using **real gameplay screenshots only**.
