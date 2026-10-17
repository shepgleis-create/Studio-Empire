# Studio Empire — 3D Garage (first playable engine prototype)

**Project isolation:** The existing game remains at `/`. The 3D prototype lives under `/game3d/` so GitHub/Vercel may deploy both without overwriting the existing production game or its saves.

**Engine:** Babylon.js (`BABYLON.Engine` and `BABYLON.Scene`) with actual WebGL meshes, orthographic camera and geometric lighting; the prototype uses the Babylon learning CDN, which must be replaced by a pinned bundled/self-hosted dependency before production release.

**Run:** `python3 -m http.server 8974` from the repository root and open `http://localhost:8974/game3d/`. This requires internet access for the Babylon CDN. If the CDN is unreachable, the page shows an explicit error rather than claiming rendering succeeded.

**Mobile:** Portrait and landscape layouts; drag to pan, pinch to zoom, camera buttons; tap a 3D workstation/employee to inspect. Uses a real 3D coordinate system. Test on Safari before declaring production-ready.

**World:** 2 full garage walls and floor; garage door, window, lights, beams, 4 workstations with era-sensitive hardware (CRT before 2000, flatter monitors afterward), shelves, lounge furniture, equipment bench, coffee equipment, plants, storage, signage and materials.

**Employees:** Separately constructed articulated Babylon meshes, distinct names/skins/clothes, independent A* paths, work/break/meeting loop and walk/typing movement. **Not yet** artist-quality licensed character models or rigged mocap. Animation is programmatic prototype, not a finished animation pipeline.

**Old save:** `bridge.js` reads existing `studio-empire-reboot-v1` data from localStorage if accessible, but never writes or migrates it. If no save is available, uses a clearly labelled 1980 demo snapshot. New scene does not yet advance the existing business simulation: it is an isolated visual engine proof, *not* a full career-mode replacement.

**Verify:** `python3 game3d/tests/smoke.py` runs responsive UI tests with Playwright; when CDN/WebGL are working, also checks the actual Babylon scene object counts and captures real screenshots. With blocked CDN, it reports WebGL **skipped**, never passed. On production previews, `python3 game3d/tests/smoke.py https://DEPLOYMENT-URL/game3d/`.

**Visual quality gate:** This code establishes real geometry and spatial behavior; custom, cohesive 3D room models, textures, authentic rigged characters and art direction still need work. No concept art can count as a real scene screenshot.

**Vercel:** Branch `feature/3d-engine-foundation` generates preview deployments through the existing Git integration. Production `main` remains unchanged. Do not merge before live engine verification, existing-save compatibility checks and art approval.

**NEXT:** Switch to pinned `@babylonjs/core` and Vite build after npm access is available, add glTF/glb art assets (with license manifest), rigged animation import, improve mobile GPU budget, integrate simulation events, test real iPhone Safari, then decide whether to merge.