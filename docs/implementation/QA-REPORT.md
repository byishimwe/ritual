# QA Report — Ritual Implementation

**Date:** 1 November 2026
**Branch:** `feat/ritual-complete-implementation`
**Environment:** Windows, Node 24, Chrome (system channel), Vite 8, WebGL via SwiftShader for headless runs
**Status:** Feature complete / release candidate. **Not yet an accepted exhibition release.**

This report separates checks that actually ran from the human, hardware and sound acceptance that still requires the exhibition machine. A green test run is not evidence of cinematic quality.

## Automated checks

| Check | Command | Result |
| --- | --- | --- |
| TypeScript project build | `npm run typecheck` | Pass |
| Lint | `npm run lint` | Pass — 0 warnings, 0 errors |
| Domain tests | `npm test` | Pass — 66 tests in 5 files |
| Browser journey | `npm run test:e2e` | Pass — 5 tests, 1 worker |
| Production build | `npm run build` | Pass — 608 modules; 1.31 MB JS (371 kB gzip), 1.9 kB CSS |
| Production load | `npm run preview`, Chrome | HTTP 200, canvas initialized, loader dismissed, no console/page/request errors |
| Production interaction smoke | Click lid/power/make/pour, `R` | No runtime errors; no visible HTML interface |
| Reset from far orbit | Manual probe | Camera returned to hero position within 5 × 10⁻⁷ m |
| Reset during bean drag | Manual probe | Fresh session (`OFF`, hopper closed, supply available, cup at start); pointer released cleanly |

### Domain coverage

- command guards and rejection reasons
- exact grinding 4.0 s / transition 1.2 s / brewing 4.2 s boundaries
- readiness, no automatic pour, one batch per cycle
- finite volume accounting and conservation
- full, partial and zero cup capture
- overflow and early-stop discard
- inactivity windows
- reset from all machine states and during active interactions
- session generation fencing
- simulation clock clamping

### Browser coverage

1. initial scene is the canonical untouched state
2. beans cannot be added through a closed hopper
3. full ritual: open, transfer, close, power, grind, brew, align cup, pour, stop, reset
4. misaligned cup misses entirely; missed volume matches release; zero cup volume
5. unattended pour fills the cup, overflows, exhausts the batch and leaves a stable result

Headless software rendering advances simulated time slower than wall time. Browser assertions wait on authoritative state or volume thresholds, never on fixed pour durations.

## Manual visual review

Captured in `screenshots/` from the passing browser suite:

| Capture | State |
| --- | --- |
| `10-hero.png` | canonical hero, untouched |
| `11-prepared.png` | beans loaded, power on |
| `12-grinding.png` | grinding |
| `13-brewing.png` | brewing |
| `14-ready.png` | ready to pour |
| `15-pouring.png` | active stream |
| `16-complete.png` | early-stop result |
| `17-miss.png` | misaligned cup and surface spill |
| `18-overflow.png` | full cup and overflow puddle |

Review findings after correction: cabinet surfaces are clean and readable; the bean jar stays in frame during hopper guidance; the stream originates at the measured nozzle; cup fill uses the measured taper; spill and overflow are visible and proportional; steam is restrained; no conventional UI appears in the active scene.

This review is a developer visual check, not final artistic approval. The GLB remains a stylised authored asset; a final art-direction pass is still a human decision.

## Defects found and fixed during QA

| ID | Severity | Defect | Fix | Verification |
| --- | --- | --- | --- | --- |
| QA-01 | S1 | Bean transfer choreography started but never reported completion to the engine, leaving the supply stuck in `TRANSFERRING` | Tween tracker now composes with, rather than replaces, the timeline's `onComplete` callback | Browser journey reaches `LOADED`; full prepare sequence passes |
| QA-02 | S1 | Bean jar was not reliably pickable: its open-ended cylinder hit proxy allowed rays to pass through the open top | Closed proxy geometry and double-sided proxy material | Jar drag starts from the hero and hopper framings |
| QA-03 | S1 | Releasing beans over a closed hopper dispatched only the rejected commit, leaving the supply stuck in `DRAGGING` | Commit failure now falls back to `CANCEL_BEAN_DRAG` | "beans cannot be added through a closed hopper" passes |
| QA-04 | S2 | Powdered/stone normal map produced white speckle noise across the charcoal housing | Normal map removed from the calibrated body material | Hero and close-up captures reviewed |
| QA-05 | S2 | Overflow puddle was centred under the cup and completely hidden | Pool is placed on the lower tray in front of the cup and grows with overflow volume | `18-overflow.png` shows the consequence |
| QA-06 | S2 | Reset during a drag could leave the camera away from the hero composition | Reset shots bypass `MAX_AZIMUTH_DELTA`/drag suppression; `RESET_COMPLETED` also restores the hero | Manual far-orbit and drag-reset probes |
| QA-07 | S3 | Steam sprites were too large/opaque at exhibition framing | Reduced sprite size and opacity | Close-up review |
| QA-08 | S3 | Redundant power-button one-shots stacked on power-on/off | Input layer owns the press sound; relay event only changes the indicator | Audio review pending on hardware |

No open S0 or S1 defect was observed in the automated or manual checks above. Deferred S2/S3 items are the human/hardware acceptance items below, not known broken behaviour.

## Not verified / outstanding

- **Target hardware performance.** No FPS claim is made. Headless SwiftShader is not representative of the exhibition GPU. Quality tiers are implemented (`?quality=high|medium|low`) but must be selected on the actual machine.
- **Long-running memory soak.** Repeated-cycle stability is covered functionally; a multi-hour resource trend was not measured.
- **Sound mix.** Procedural audio exists and lifecycle cleanup is implemented, but balance on exhibition speakers and the no-audio usability check remain human reviews.
- **Usability study.** No five-participant unfamiliar-visitor study has been run. Discoverability of the lid, bean drag and cup must be observed directly.
- **Final visual acceptance.** Materials, composition and motion require approval on the real display.
- **Deployment.** A production artifact was built and verified locally. No external deployment has been published from this branch.

## Release decision

**Functional acceptance:** Automated checks pass.
**Physical consistency:** Volume accounting, capture, spill, overflow and reset pass automated tests and browser journeys.
**Cinematic acceptance:** Pending human review.
**Performance acceptance:** Pending target hardware.
**Exhibition acceptance:** Pending rehearsal, sound review and usability observation.

**Final status:** Release candidate, not exhibition-ready.
