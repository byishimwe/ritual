# QA Report — Ritual Implementation Completion & Release Gate Assessment

**Date:** 2 November 2026  
**Repository:** https://github.com/byishimwe/ritual  
**Branch:** `feat/ritual-complete-implementation`  
**Classification:** **Release Candidate (RC)** — Verified Software Baseline, Ready for Onsite Exhibition Rehearsal.  

---

## 1. Executive Summary

This report documents the corrective engineering, defect remediation, and quality gate assessment for the Ritual espresso experience.

All confirmed code defects have been resolved and verified with automated test coverage:
1. Azimuth bounds and orbit envelope constraints are enforced.
2. Camera event ownership is decoupled between manual orbit, physical object manipulation, and cinematic choreography.
3. Liquid capture fraction is evaluated strictly against authoritative domain state (`engine.getState().cup.position`), eliminating stale one-frame coordinate skew in visual stream and runoff rendering.
4. Prefers-reduced-motion suppresses non-essential camera animation while preserving immediate canonical hero framing restoration on reset.
5. Persistent world-space spill deposits record stationary countertop puddles.
6. Cup pointer grab-offset preservation prevents visual jumps when grabbing the vessel rim or handle.
7. Strict asset contracts throw `AssetContractError` and trigger the dedicated fatal recovery UI.
8. Unused development artifacts (`fakeControls`, `DreiControls`, `controlsFallback.ts`) have been pruned.
9. CI performance bottlenecks under software WebGL (SwiftShader) have been eliminated through automated quality tier detection, Playwright launch configuration, and deterministic state synchronization.
10. Playwright artifact upload on failure has been configured in the CI workflow.

---

## 2. Evidence Classification & Verification Levels

To prevent over-claiming readiness, this report strictly categorizes verification into distinct evidence tiers:

| Tier | Scope | Status | Notes |
|---|---|---|---|
| **Tier 1 — Local Automated Verification** | Typecheck, lint, unit & domain test suites, E2E browser test suite | **VERIFIED** | 91/91 unit tests pass; 13/13 Playwright tests pass; 0 type errors; 0 linter warnings. |
| **Tier 2 — Production Smoke Testing** | `npm run build` and Vite preview server | **VERIFIED** | Clean production bundle generated in <1s; served via HTTP 200; WebGL renders without errors. |
| **Tier 3 — Developer Visual Inspection** | Inspection of test-generated snapshots and interaction replays | **VERIFIED** | Hero shot, hopper discoverability, grinding pulse, brewing vibration, vertical stream alignment, partial capture, stationary overflow, steam subtlety reviewed. |
| **Tier 4 — CI Automation** | GitHub Actions workflow execution | **CONFIGURED & PUSHED** | Workflow timeout set to 10m; Playwright failure artifact upload enabled; SwiftShader headless flags configured. |
| **Tier 5 — Target Hardware Performance** | Execution on physical kiosk machine & target display | **PENDING ONSITE** | Verified on desktop Chrome (GPU) and headless Chromium (SwiftShader). Onsite 60 FPS kiosk benchmark required. |
| **Tier 6 — Venue Sound Listening** | Auditioning procedural audio on physical venue speakers | **PENDING ONSITE** | Web Audio procedural graph and lifecycle verified in browser. Acoustic balance and level check required on venue sound system. |
| **Tier 7 — Unfamiliar Visitor Rehearsal** | Discoverability test with unguided test visitors | **PENDING ONSITE** | Physical direct manipulation validated by automated scenarios; human discoverability requires live rehearsal. |

---

## 3. Command Execution Summary

All commands were executed against the current branch:

| Command | Environment / Target | Outcome | Details |
|---|---|---|---|
| `npm run typecheck` | `tsc -b --pretty false` | **PASS** | 0 type errors across all application and test modules |
| `npm run lint` | `oxlint` | **PASS** | 0 errors, 0 warnings across 56 source and test files |
| `npm test` | Vitest v3.2.7 | **PASS** | **91 tests passed** (8 test files, 100% pass rate in 2.1s) |
| `npm run test:e2e` | Playwright v1.64.1 | **PASS** | **13 tests passed** (1 worker, ~6.2m full execution) |
| `npm run build` | `tsc -b && vite build` | **PASS** | Client bundle built in 684ms (1,319 kB JS / 373 kB gzip; 1.92 kB CSS) |
| `npm run preview` | Vite Preview Server | **PASS** | Production bundle loads cleanly; HTTP 200; WebGL renders without errors |

---

## 4. Test Suites & Coverage Breakdown

### 4.1 Unit & Domain Test Suite (`npm test` — 91 tests)

- **`tests/domain/stateMachine.test.ts` (24 tests):** Command guards, state transitions (`OFF`, `PREPARATION`, `GRINDING`, `BREWING`, `READY_TO_POUR`, `POURING`, `COMPLETE`, `RESETTING`), preparation-first enforcement, duplicate batch prevention, and timing boundaries.
- **`tests/domain/runtime.test.ts` (13 tests):** Simulation clock fixed-step time slicing (1/60s), delta clamping, stall protection, frame loop coordination, and visibility tracking.
- **`tests/domain/spatial.test.ts` (11 tests):** Spatial tolerances, click slop, hopper drop zone detection, cup placement bounds, and drag constraint clamping.
- **`tests/domain/coffee.test.ts` (10 tests):** Authoritative volume accounting (1.30 unit batch, 1.00 cup capacity, 0.125 rate), full/partial/zero capture fractions, in-flight parcel conservation, and batch exhaustion.
- **`tests/domain/reset.test.ts` (10 tests):** Atomic logical reset, session generation increment, invalidation of stale asynchronous callbacks, visitor command rejection during reset, idempotence, in-flight cancellation, and puddle clearance.
- **`tests/domain/assets.test.ts` (13 tests):** Contract validation for all 9 required nodes (`body`, `HopperLid`, `Hopper`, `coffeeSpout`, `coffeeCup`, `btnPower`, `btnMake`, `btnPour`, `coffeeBeans`), rejection of non-finite matrix transforms (NaN/Inf), and out-of-envelope dimension rejection.
- **`tests/domain/audio.test.ts` (5 tests):** One-shot source registration and lifecycle cleanup, `stopAll()` cancellation of continuous loops and queued one-shots, bean pour cancellation, and single-loop restoration on tab resume.
- **`tests/domain/spills.test.ts` (5 tests):** World-space stationary spill persistence for missed stream and overflow puddles, cup displacement independent of puddle coordinates, new puddle accumulation at updated cup position, and total spilled volume conservation.

### 4.2 End-to-End Browser Test Suite (`npm run test:e2e` — 13 tests)

1. **`initial scene is the canonical untouched state`:** Default state (`OFF`, lid closed, beans available, cup at rest, volume 0).
2. **`beans cannot be added through a closed hopper`:** Direct bean transfer rejected when hopper lid is shut.
3. **`full ritual: prepare, brew, pour into an aligned cup`:** Complete visitor journey (open hopper, transfer beans, close hopper, power machine, start grind, mechanical pause, brew, align cup, pour coffee, stop pour, verify volume conservation, and operator reset).
4. **`misaligned cup misses the coffee entirely`:** Unaligned cup collects 0 volume; all dispensed coffee lands as missed surface spill on the drip tray grille.
5. **`unattended pouring fills the cup, then overflows and exhausts the batch`:** Full cup fill (1.00 unit), overflow (>0.15 unit), and complete batch exhaustion.
6. **`orbit stays inside its approved azimuth, polar and zoom envelope`:** Stresses manual camera drag across all axes; verifies camera clamps within azimuth bounds [−160°, +160°], polar limits, and distance limits; verifies reset from far orbit returns precisely to hero shot.
7. **`a cinematic shot survives the short Make button gesture`:** Pressing Make button does not cancel or discard the subsequent grinding cinematic camera framing.
8. **`manual orbit immediately overrides an active cinematic move`:** User pointer drag on empty stage immediately aborts guided camera transitions and retains visitor viewpoint.
9. **`grabbing the cup rim does not snap its centre to the pointer`:** Grab-offset preservation; grabbing the cup by the rim does not cause the cup to jump under the cursor.
10. **`overflow stays on the stage when the cup is moved, and reset clears it`:** Overflow puddles remain fixed at world coordinates when the filled cup is dragged away; operator reset clears all puddles.
11. **`reduced motion suppresses cinematic shots but restores hero camera on reset`:** Validates that under `prefers-reduced-motion: reduce`, non-essential cinematic camera moves are suppressed while operator reset immediately restores canonical hero framing.
12. **`corrupted or missing asset produces the recovery card and offers reload`:** Verifies that a network failure or corrupted GLB activates the React `ErrorBoundary` and displays the `.ritual-fatal` recovery card without rendering an interactive broken canvas.
13. **`contract asset failure dispatches fatal recovery state with error details`:** Verifies that an `AssetContractError` triggers the fatal error boundary with specific missing node details and reload action.

---

## 5. Confirmed Defects Repaired

### C-01: Unbounded Horizontal Orbit Constraints
- **File:** `src/scene/CameraRig.tsx`
- **Correction:** Connected `minAzimuthAngle={CAMERA.orbit.minAzimuth}` and `maxAzimuthAngle={CAMERA.orbit.maxAzimuth}` to Drei `OrbitControls`.

### C-02: Guided Camera Event Ownership During Pointer Gestures
- **File:** `src/scene/CameraRig.tsx`
- **Correction:** Decoupled manual orbit, physical object manipulation, and cinematic choreography. Button presses no longer cancel camera moves; object drags defer shots until release; manual orbit immediately overrides active tweens.

### L-01: Liquid Capture Evaluation Order & Coordinate Skew
- **File:** `src/scene/LiquidStream.tsx`
- **Correction:** Reordered evaluations so `cup.getWorldPosition(cupWorld)` is called before reading cup coordinates. Capture fraction is evaluated directly from authoritative domain state `engine.getState().cup.position`, eliminating visual coordinate lag while the cup is being dragged.

### C-03: Reduced-Motion Camera Reset Suppression
- **File:** `src/scene/CameraRig.tsx`
- **Correction:** Allowed `RESET_STARTED` and `RESET_COMPLETED` events to execute under `reducedMotion: true` by performing an immediate, non-disorienting reset to the canonical hero framing, while continuing to suppress non-essential intermediate cinematic transitions.

### A-01: Untracked One-Shot Audio Nodes on Reset
- **File:** `src/audio/audioEngine.ts`
- **Correction:** Implemented centralized `Map<AudioScheduledSourceNode, OneShot>` tracking every created one-shot. `stopAll()` applies an immediate fast exponential gain ramp to zero and stops the source.

### A-02: Audio State Synchronization Across Tab Visibility Changes
- **File:** `src/runtime/ExperienceRuntime.tsx`, `src/audio/audioEngine.ts`
- **Correction:** On tab restore (<60s), `audio.resume(machineState)` re-synchronizes the single active process loop corresponding to authoritative machine state.

### S-01: Overflow Puddle Moving With the Cup
- **File:** `src/domain/experienceEngine.ts`, `src/scene/SpillPuddles.tsx`
- **Correction:** Created authoritative `SpillDeposit` entities that record stationary world coordinates (`x`, `y`, `z`) at impact. Moving the cup leaves existing puddles stationary.

### I-01: Cup Center Snapping to Cursor on Grab
- **File:** `src/scene/SceneInput.tsx`
- **Correction:** Computed pointer-to-cup offset `(offsetX, offsetZ)` on pointer-down and maintained that offset throughout the drag gesture.

### M-01: Silent Fallback for Missing Essential GLB Nodes
- **File:** `src/assets/ritualModel.ts`, `src/scene/RitualScene.tsx`, `src/App.tsx`
- **Correction:** Implemented `AssetContractError` throwing on missing required nodes, non-finite transforms, or out-of-envelope scales. Dispatches `ritual:asset-failure` and renders `<FatalError />`.

### L-02 / L-03: Shader Color Management & Duplicate Shader Includes
- **File:** `src/scene/LiquidStream.tsx`, `src/scene/SteamEffect.tsx`
- **Correction:** Removed redundant header includes while preserving tone mapping and color space fragments in `void main()`.

### R-01: Untracked GSAP Tweens & Delayed Calls
- **File:** `src/motion/experienceDirector.ts`
- **Correction:** Registered all tweens, timelines, button animations, lid motions, and delayed calls via `track(...)`. `dispose()` and reset kill all active tweens and restore canonical transforms.

### DEAD-01: Dead Development Artifacts
- **Files:** `src/scene/CameraRig.tsx`, `src/scene/controlsFallback.ts`
- **Correction:** Pruned unused exports `fakeControls`, `DreiControls`, and deleted unused stub `controlsFallback.ts`.

### CI-01: Headless Software WebGL Slowdown & Timeout Hang
- **Files:** `src/runtime/qualityManager.ts`, `playwright.config.ts`, `.github/workflows/ci.yml`, `tests/e2e/experience.spec.ts`
- **Correction:**
  - Automated headless/SwiftShader detection to resolve to `'low'` quality tier (disabling 2048×2048 shadow passes and bloom passes under software emulation).
  - Added CI Chromium flags (`--no-sandbox`, `--disable-dev-shm-usage`, `--use-gl=angle`, `--use-angle=swiftshader`, `--enable-unsafe-swiftshader`).
  - Synchronized `prepare()` with `hopperMotion === 'IDLE'` and added settle delays for camera transitions.
  - Added Playwright failure artifact upload and reduced CI job timeout to 10m.

---

## 6. Release Gate Assessment (Document 06)

Document 06 (§30.5, §33) defines six release gates. A release is exhibition-ready only when all six gates pass.

| Release Gate | Document 06 Requirements | Status | Supporting Evidence & Remaining Actions |
|---|---|---|---|
| **Gate R1 — Functional Integrity** | Essential interactions work; state transitions correct; preparation-first preserved; pouring user-controlled; reset reliable. | **PASS** | 91/91 unit tests passing, 13/13 E2E tests passing. Command guards, state machine, volume accounting, and atomic reset fully verified. |
| **Gate R2 — Physical Consistency** | Geometry and interactions align; cup placement affects capture; liquid volume consistent; spills and overflow coherent; no impossible behavior. | **PASS** | Verified by `capture.ts`, `coffee.test.ts`, `spills.test.ts`, and E2E tests 3, 4, 5, 10. Stationary world-space spill deposits confirmed. |
| **Gate R3 — Cinematic Quality** | Materials believable; lighting controlled; camera restrained; animation feels tactile; sound synchronized; pouring visually satisfying. | **OPEN (Pending Human Artistic Sign-off)** | Automated tests confirm camera envelope, GSAP timelines, and Web Audio sync. Screenshots 10–18 reviewed. Final aesthetic approval on the exhibition display and lighting environment must be signed off by the Creative Director. |
| **Gate R4 — Engineering Reliability** | Automated tests pass; no stale timers; no audio lifecycle leaks; no stuck pointer capture; no unrecoverable states; repeated use stable. | **PASS** | 100% automated test pass rate. Oxlint 0 warnings/0 errors. Session generation fencing, one-shot audio tracking, and visibility policies verified. |
| **Gate R5 — Performance & Compatibility** | Target hardware tested; target browser tested; performance acceptable; loading and recovery work; audio works in target environment. | **OPEN (Pending Target Hardware Benchmark)** | Verified locally on Chrome and headless Chromium under SwiftShader. 60 FPS target framerate, GPU thermal stability, and sound card latency must be benchmarked on the physical kiosk machine onsite. |
| **Gate R6 — Exhibition Operation** | Production build deployed; launch and reset documented; operator recovery documented; final version identifiable; complete visitor rehearsal passes. | **OPEN (Pending Venue Rehearsal)** | Production build verified (`dist/`). Runbook documented in `README.md`. Final exhibition rehearsal with unfamiliar visitors in the gallery space remains to be conducted. |

---

## 7. Onsite Venue Acceptance Checklist

Before public exhibition, the project owner should execute the following physical verification steps on the venue kiosk:

1. **Hardware & Kiosk Deployment:**
   - [ ] Clone repository and checkout release commit on the physical kiosk PC.
   - [ ] Run `npm run build` followed by `npm run preview` (or host via production kiosk web server).
   - [ ] Launch Chromium in kiosk fullscreen mode (`--kiosk --kiosk-printing --noerrdialogs --disable-translate`).
2. **Display & Visual Calibration:**
   - [ ] Verify 60 FPS rendering under native display resolution using DevTools performance overlay.
   - [ ] Validate color management on the venue display (tone mapping and neutral background #3e3c38).
   - [ ] Confirm no frame drops during simultaneous grinding vibration, stream rendering, and camera orbit.
3. **Sound System Audition:**
   - [ ] Connect output to physical venue speakers.
   - [ ] Verify first interaction un-mutes Web Audio cleanly without clicking or pop artifacts.
   - [ ] Audition acoustic balance between grinder motor, transition pump hum, liquid trickle, and stream hiss.
4. **Physical Visitor Rehearsal:**
   - [ ] Conduct end-to-end rehearsal with an unfamiliar participant without verbal guidance.
   - [ ] Confirm discoverability of the bean jar and hopper lid.
   - [ ] Verify physical keyboard reset (`R` key) cleanly resets the installation for the next visitor.
