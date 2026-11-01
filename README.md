# Ritual

**The Choreography of Espresso** — a cinematic, interactive 3D experience built around one believable bean-to-cup espresso machine.

There is no application UI: the machine is the interface. Visitors open the hopper, transfer beans, close it, position the cup, power the machine on, start grinding and brewing, and control the pour themselves. Camera, lighting, sound, liquid and consequences all follow the machine's authoritative state.

The approved specification lives in [`docs/`](docs); this README is the engineering and exhibition handoff. Supporting records: [asset contract](docs/implementation/ASSET-CONTRACT.md) and [QA report](docs/implementation/QA-REPORT.md).

---

## Quick start

```bash
npm install
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
| Power | Click the left button |
| Make | Click the centre button |
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

`public/assets/models/coffee_machine.glb` must expose the named nodes `body`, `HopperLid`, `Hopper`, `coffeeSpout`, `coffeeCup`, `btnPower`, `btnMake`, `btnPour` and `coffeeBeans`. The runtime adapter (`src/assets/ritualModel.ts`) validates them, recentres the cup on its own axis, preserves the lid hinge and consolidates the baked bean pile into one mesh. Missing required nodes are reported to the developer console and the scene renders around the gap; an unrecoverable load error reaches the fatal-error boundary.

### Quality tiers

`?quality=high`, `?quality=medium` or `?quality=low` forces a tier; otherwise the app selects one from core count and device memory. Tiers change DPR, shadow resolution and steam density. **Core behaviour is identical in every tier.** `prefers-reduced-motion` also reduces vibration, camera choreography and steam.

---

## Verification

```bash
npm run typecheck   # tsc project build
npm run lint        # oxlint
npm test            # 66 deterministic domain tests
npm run test:e2e    # Playwright browser journey (starts its own dev server)
```

The browser suite covers:

- canonical untouched state
- beans rejected through a closed hopper
- full ritual: open, transfer, close, power, grind, brew, align cup, pour, stop, reset
- misaligned cup: zero capture, measurable spill, conservation
- unattended pour: full cup, overflow, batch exhaustion

The Playwright config uses the system Chrome (`channel: 'chrome'`) with SwiftShader enabled so WebGL runs headless. Software rendering advances simulated time more slowly than wall time; assertions wait on authoritative state/volumes rather than fixed sleep durations. Run it on a machine with Chrome installed.

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

The implementation is feature-complete against the approved interaction, coffee, reset and recovery specifications, with the automated checks above passing. It is not yet an approved exhibition release: target-hardware performance, final sound mix and human usability/visual acceptance remain to be recorded on the exhibition machine.

Known non-blocking limitations:

- Audio is synthesized at runtime rather than a recorded sound library; the final mix should be reviewed on venue speakers.
- The GLB is the authored production asset; its cabinet finish is deliberately simplified at the calibrated material level to avoid high-frequency noise at exhibition distance.
- The scene is designed for a desktop/laptop pointer setup. Touch input is not a release target.
