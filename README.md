# Ritual

**The Choreography of Espresso** — a cinematic, interactive 3D experience built around one believable bean-to-cup espresso machine.

There is no application UI: the machine is the interface. Visitors open the hopper, transfer beans, close it, position the cup, power the machine on, start grinding and brewing, and control the pour themselves. Camera, lighting, sound, liquid and consequences all follow the machine's authoritative state.

The approved specification lives in [`docs/`](docs); this README is the engineering and exhibition handoff. Supporting records: [asset contract](docs/implementation/ASSET-CONTRACT.md) and [QA report](docs/implementation/QA-REPORT.md).

---

## Quick start

```bash
npm ci
npm run dev
```

Open the URL printed by Vite. A first click anywhere unlocks browser audio.

```bash
npm run build     # typecheck + production build into dist/
npm run preview   # serve the production build
```

The production output is a self-contained static site. It needs no backend, no network services and no API keys. Serve `dist/` from any static host or a local HTTP server.

Recommended environment: current Chrome/Edge or Firefox on a desktop/laptop with hardware WebGL 2, at least 8 GB RAM, and speakers/headphones.

---

## Operating the machine

| Action | How |
| --- | --- |
| Inspect the scene | Drag empty space to orbit; scroll to zoom |
| Open / close the hopper | Click the lid |
| Add beans | Drag the glass bean jar over the open hopper and release |
| Position the cup | Drag the cup across the drip tray |
| Power | Click the centre button |
| Make | Click the left button |
| Start / stop pouring | Click the right button |
| Operator reset | Press `R` |

The buttons only accept actions that make physical sense: Make needs power, beans and a fully closed lid; Pour needs a finished batch; a second Pour press stops the stream. Invalid input is acknowledged mechanically and never corrupts state.

### Sequence and calibrated numbers

- Grinding: **4.0 s**
- Mechanical pause: **1.2 s**
- Brewing: **4.2 s**
- Prepared batch: **1.30 cup units**
- Cup capacity: **1.00 cup units**
- Pour rate: **0.125 cup units/s** → about **8 s** to fill, **10.4 s** to exhaust a batch
- Coffee in flight keeps falling after the stream stops
- A misaligned cup is missed, not magically filled; partial overlap splits the stream
- Overflow begins only after the cup is full
- Abandoned sessions reset after 90 s (preparation), 75 s (`READY_TO_POUR`) or 20 s (`COMPLETE`)
- A hidden tab pauses simulation; more than 60 s hidden discards the session on return

---

## Architecture

```
src/
  domain/       pure behaviour: types, commands, guards, engine, capture, cup geometry
  config/       measured asset contract and calibrated experience constants
  assets/       GLB adapter, material tuning, procedural studio environment
  state/        Zustand snapshot layer and command dispatch
  runtime/      frame loop, fixed-step clock, visibility/context recovery, quality
  scene/        machine, cup, beans, liquid, spill, steam, camera, pointer ownership
  motion/       director: GSAP motion, indicator and audio response to domain events
  audio/        procedural Web Audio graph (no audio files, no network)
  components/   loading state and fatal-error boundary only
  interactions/ pure spatial tolerances used by picking and bean release
```

Key rules:

- **One authority.** `ExperienceEngine` owns every behavioural decision. Rendering, sound, camera and effects are subscribers; they never advance or invent machine state.
- **Fixed-step time.** `SimulationClock` subdivides frame deltas into 1/60 s steps and clamps long stalls, so stage boundaries cannot be skipped or duplicated.
- **One pointer owner.** `SceneInput` captures pointer-down on an interactive object in the capture phase, so a drag can never also orbit the camera. Orbit only starts on empty stage.
- **Reset is atomic and generation-stamped.** The logical scene is restored immediately, then a bounded 1.3 s visual restoration plays. Stale tweens and callbacks are killed or fenced by session generation.
- **Measured asset, not guessed anchors.** `src/config/asset.ts` records the GLB's measured bounds and converts raw units with one scale (`0.12 m/unit`) and one offset. All buttons, hinge, nozzle, cup and hopper anchors derive from those measurements.
- **Offline by design.** The only asset request is the local GLB. All audio and the reflection environment are generated at runtime.

### Asset contract

`public/assets/models/coffee_machine.glb` must expose the named nodes `body`, `HopperLid`, `Hopper`, `coffeeSpout`, `coffeeCup`, `btnPower`, `btnMake`, `btnPour` and `coffeeBeans`. The runtime adapter (`src/assets/ritualModel.ts`) validates them, recentres the cup on its own axis, preserves the lid hinge and consolidates the baked bean pile into one mesh. Missing required nodes, non-finite transforms or out-of-spec dimensions throw an `AssetContractError` and trigger the fatal-error card in the application shell rather than rendering placeholder controls.

### Quality tiers

`?quality=high`, `?quality=medium` or `?quality=low` forces a tier; otherwise the app selects one from core count and device memory. Tiers change DPR, shadow resolution and steam density. **Core behaviour is identical in every tier.** `prefers-reduced-motion` also reduces vibration, camera choreography and steam.

---

## Verification

```bash
npm run typecheck   # tsc project build
npm run lint        # oxlint
npm test            # 93 domain, motion, asset, audio and spill tests
npm run test:e2e    # 18 pointer / integration tests against a dedicated E2E build
npm run test:production # black-box smoke and instrumentation isolation on dist/
```

The browser suite covers (including the original 13 scenarios):

- canonical untouched state
- beans rejected through a closed hopper
- full ritual: open, transfer, close, power, grind, brew, align cup, pour, stop, reset
- misaligned cup: zero capture, measurable spill, conservation
- unattended pour: full cup, overflow, batch exhaustion
- orbit envelope constraints: azimuth [-160°, +160°], polar, and zoom limits
- cinematic camera choreography surviving short button gestures
- manual orbit immediate override of active cinematic moves
- cup grab offset preservation (no center jump when grabbing rim/handle)
- persistent world-space spill puddles that do not travel with cup movement

Playwright uses system Chrome locally or bundled Chromium in CI (`PLAYWRIGHT_CHANNEL` can override). Integration retains Chromium headless-shell coverage; production smoke uses regular Chromium's new headless mode. SwiftShader enables headless software WebGL. Software rendering advances simulated time more slowly than wall time; integration waits on authoritative state/volumes, while normal production observes native completion cues and rendered results.

The deployable exhibition artifact is **only `dist/`**, produced by `npm run build`. Test instrumentation is authorized only at compile time by Vite's explicit `e2e` mode. `npm run build:e2e` writes a separate **`dist-e2e/`** artifact; Playwright builds and serves it automatically. Never deploy `dist-e2e/`. It uses half-resolution, non-antialiased rendering to keep software WebGL interaction checks practical; artistic acceptance uses the normal production artifact. Both artifacts use the same real engine, guards, fixed-step clock and domain rules. Production smoke uses a 384 x 230 browser window under CI and 1024 x 612 locally, with viewport-derived projection and pixel-density-normalized assertions; PNG analysis runs in Node so it does not starve WebGL. CI integration keeps every behavioral assertion and unconditional failure screenshot/state snapshot; discretionary stage photographs and continuous trace video stay out of its critical path. Production visual assertions always run.

Normal development and production expose no `window.__ritual`. `?test=true` and `?timeScale=5` cannot enable APIs or change simulation timing. Automation detection affects optional rendering quality only. The integration harness issues real pointer events, asserts that the rotating lid proxy receives each click, then waits for GSAP's real completion callback without retrying a toggle. Deterministic advancement runs the engine for long numerical stages; explicit motion advancement traverses the real GSAP timelines, transforms and guarded completion callbacks. Neither assigns arbitrary machine states. A separate slow-frame regression waits for unaccelerated hinge motion. Failure artifacts include step, state, events/rejection reasons, session generation, pointer owner, camera, elapsed input time and motion lifecycle.

GitHub Actions runs domain checks and the full pointer/integration suite in one job, and normal production smoke in an independent job. Each retains a 20-minute budget. Browser evidence is uploaded as `playwright-integration-results` and `playwright-production-results`. A dependent job uploads `release-verification/release-verification.json` with the exact commit, branch, run URL, all six check outcomes and both job results; its `passed` flag requires every outcome to succeed. Use that evidence with the [QA report](docs/implementation/QA-REPORT.md) to identify the verified revision.

There is no automated substitute for the remaining artistic and exhibition acceptance: material quality, motion weight, sound balance, discoverability and performance on the actual exhibition hardware still require human review on that hardware.

---

## Exhibition runbook

1. Build once with `npm run build`.
2. Serve `dist/` over HTTP (for example `npm run preview` or any static server); do not open `index.html` from `file://` because module and GLB requests need HTTP.
3. Open the site in the exhibition browser, enter fullscreen/kiosk mode and confirm the machine appears.
4. Click once to unlock audio, then run one complete test interaction including a Pour stop and `R`.
5. Leave the scene in the canonical OFF state.

**Reset:** press `R` at any time. Reset also completes automatically after the inactivity windows above, on Power after a completed cycle, and after a long hidden-tab interruption.

**If the scene is blank or rendering fails:** reload the page. If that fails, restart the browser, then the local static server. Confirm WebGL is available and the GLB is served with HTTP 200. The fatal-error card exists only for genuine technical failure; it is not part of the experience.

**If audio is silent:** check system/browser volume and mute, click the scene once (browser autoplay policy), then reload. Visual feedback remains complete without audio.

**If frame rate is low:** try `?quality=medium`, then `?quality=low`. This reduces rendering cost without changing interaction or timing.

---

## Status and known limitations

The implementation preserves the approved interaction, coffee, reset and recovery specifications. The [QA report](docs/implementation/QA-REPORT.md) records the actual verification evidence; CI results must correspond to the exact candidate commit. It is not yet an approved exhibition release: target-hardware performance, final sound mix and human usability/visual acceptance remain to be recorded on the exhibition machine.

Known non-blocking limitations:

- Audio is synthesized at runtime rather than a recorded sound library; the final mix should be reviewed on venue speakers.
- The GLB is the authored production asset; its cabinet finish is deliberately simplified at the calibrated material level to avoid high-frequency noise at exhibition distance.
- The scene is designed for a desktop/laptop pointer setup. Touch input is not a release target.
