# Ritual — Recovery and Release Verification

Date: 4 November 2026 (Africa/Johannesburg). Branch: `feat/ritual-complete-implementation`.
Status: software candidate verification in progress; exhibition approval pending.

## Revision and evidence

This report is versioned with the candidate. The final revision is the Git commit containing this report (`git rev-parse HEAD`). Every CI run records its immutable SHA, branch, run URL and individual check outcomes in its job summary and uploaded `playwright-results/release-verification.json`. Use that exact-SHA evidence; a previous workflow does not verify a later commit. A report cannot embed the hash of its own containing commit.

Final CI results require the exact-revision workflow readback; local results are recorded below.

## Audited baseline and root cause

The clean checkout and GitHub working branch both started at `cbee291cf677916b5282532cdc39aec18d9ea431`; fetch and symmetric revision comparison returned 0/0. Specifications RITUAL-00 through RITUAL-06, README, asset contract, prior QA report, interaction code and CI were consulted. The connected Drive Ritual folder contains the corresponding seven source documents.

[Audited run 41649722001](https://github.com/byishimwe/ritual/actions/runs/41649722001) failed: typecheck, lint, 91 domain tests and production build passed; browser tests had 8 passes and 5 failures. Artifact 13236298818 was downloaded and its five traces, screenshots and error contexts inspected.

The five failures shared `prepare()`. Its three-second timeout blindly retried a toggle even after the first click started motion. GSAP's default lag smoothing converts frame gaps over 500 ms into 33 ms of animation progress. Software rendering can therefore stretch a 0.7-second hinge animation beyond three wall-clock seconds. The retry reverses the accepted target and kills/replaces its tween; the helper then waits for the original target it just undid. Traces show the lid/camera projection changing on the second click and the opposite final physical pose. This is a synchronization/retry defect, not five separate brewing/camera/coffee defects.

Local raycast probes intersected the registered lid proxy in both settled poses and observed both physical completion events. The original full journey passed locally, confirming timing-dependent behavior. A deliberate >500 ms frame-stall regression exercises the failure condition: the corrected helper takes more than three seconds, issues exactly one opening command, receives `HOPPER_OPENED` and verifies the actual -96-degree hinge angle without reversal.

The first recovery workflow, [41847523584](https://github.com/byishimwe/ritual/actions/runs/41847523584), ran against `e3f3dade955a73544b5155229a0747f2874700cc` and failed with 12 passes / 6 failures in 541.28 seconds; production smoke was skipped by the upstream failure. Its artifact 13332054621 was inspected. All six failures occurred before the closing click: the preflight assertion saw `ritualHit:beanSupply`, although screenshots showed the jar at rest, the state was LOADED, the lid tween had completed and no gesture was active. The preflight had updated the lid matrix only; the jar proxy retained its earlier carried-world matrix between rendered frames. It now refreshes all potential occluders, matching the production picker. The full journey subsequently passed with the CI software-WebGL flags locally. This failed intermediate workflow is not release evidence.

## Files and corrections

| Files | Purpose |
| --- | --- |
| `tests/e2e/experience.spec.ts` | Remove blind hopper/ingredient retries. Project the rotating registered lid proxy, assert the nearest hit, wait for actual camera and hinge completion. Preserve all 13 original scenarios; add repeated cycles, slow frames, real capture loss, reset while dragging, partial capture/moving cup and duplicate Make checks. |
| `tests/domain/motion.test.ts` | Real GSAP rapid-reversal ownership, settled hinge, interrupted-tween cleanup and reset-generation regressions. |
| `src/scene/SceneInput.tsx` | Refresh camera/target world matrices before picking. Cancel genuine lost capture; ignore unrelated/stale loss. Normal pointer-up clears ownership before releasing capture. Blur, cancellation, reset and unmount clear ownership; cancelled bean drags cannot consume ingredients. |
| `src/runtime/ExperienceRuntime.tsx` | Remove URL time scaling and webdriver-specific clock settings. Same normal fixed-step clock in both artifacts. Expose test controls only in compile-time e2e mode; unsubscribe on cleanup. |
| `src/scene/CameraRig.tsx`, `RitualScene.tsx`, `services.tsx`, `src/motion/experienceDirector.ts` | Compile-time-only diagnostics: events/rejections, generation, pointer owner/last hit, elapsed input time, camera/pending shot, tween lifecycle/progress. Clean up handles; interrupted tweens leave the ownership set. |
| `src/scene/ExperienceCanvas.tsx`, Playwright configs, package scripts | Separate test-only `dist-e2e/`, half-resolution/no antialiasing for software integration. Normal `dist/` retains authored quality. Separate output directories and JSON reports. |
| `tests/production/smoke.spec.ts` | Black-box normal-build checks: absent APIs in bundle and hostile URLs, GLB HTTP/magic, canvas, no conventional UI, physical preparation/pour, rejected premature Pour, actual ready audio cue, coffee across the cup mouth (excluding the stream), visually settled physical motion, canonical-image reset, and no page/console/asset errors. No engine injection. |
| `.github/workflows/ci.yml` | Domain, pointer/integration and production smoke checks; exact-revision evidence and artifacts on failure; supported action runtimes. |
| README, asset contract, QA report | Remove stale passing/timeout/count claims; document deployment/test separation and human acceptance. |
| package manifest/lock, Vitest config | Updated development verification tooling and explicit domain-test collection. |

## Instrumentation boundary and verification responsibilities

Deploy only **`dist/`** from `npm run build`. Never deploy **`dist-e2e/`**. Vite's explicit compile-time e2e mode authorizes instrumentation; a query string cannot. The normal bundle eliminates every `__ritual` reference. Normal development also has no engine handle. Test/timeScale query parameters and webdriver do not alter domain timing; automatic quality selection affects rendering only.

Two additional motion regressions verify rapid hinge reversal ownership, physical settling, interruption cleanup and stale-generation reset protection. Domain tests establish exact 4.0/1.2/4.2-second stages, guards, single cycles, finite-volume accounting and reset. Browser interactions use real pointer events and raycasting. Accelerated integration calls the real fixed-step engine and advances the actual GSAP timelines through their transforms and guarded completion callbacks. It never assigns arbitrary state or dispatches substitute completion commands. The deliberate slow-frame hinge regression remains unaccelerated. A software-WebGL probe also exposed a valid bean-transfer timeline still running after 30 wall-clock seconds; explicit motion advancement resolves that test-environment bottleneck without changing production animation. Real-time production smoke has no test API, uses reduced motion to keep physical projection stable, and observes rendered coffee/reset. It does not replace cinematic/sound/performance acceptance.

Failures attach step context, state, events/rejection reasons, generation, pointer ownership, last target, camera, elapsed input time, tween lifecycle/progress and screenshot. Successful runs remain quiet. All original tests remain: none deleted, skipped or weakened to hide failures.

## Verification record

| Check | Local result | Execution time |
| --- | --- | --- |
| Clean npm ci | Passed; 0 vulnerabilities across all dependency types | 30.31 s |
| npm run typecheck | Passed | 13.68 s measured standalone run |
| npm run lint | Passed | 1.90 s measured standalone run |
| npm test | 93/93 passed, 9 files, Vitest 5.1.0; includes real GSAP reversal/reset regressions | 2.94 s runner / 6.24 s command |
| npm run build | Passed; normal dist artifact | 1.15 s Vite / 15.46 s command including tsc |
| npm run test:e2e | 18/18 passed; 0 skipped, flaky or unexpected | 192.53 s runner including server setup |
| npm run test:production | 2/2 passed; 0 skipped, flaky or unexpected; native ready cue, settled motion, rendered fill and canonical reset | 72.91 s runner including server setup |
| npm audit | 0 vulnerabilities (production and development) | Completed |

Environment: Windows desktop, Node 24.19.0, system Chrome; Linux/Node 22/Chromium verification is the separate CI result. Software-WebGL probes were used for diagnosis, including the slow bean timeline and a newly added partial-capture threshold calibration; these exploratory failures were corrected, not reported as successful release runs.

CI: pending exact-commit execution. Workflow timeout remains 20 minutes. Its JSON reports include test counts, skips, failures and durations; its exact-revision evidence records each required check outcome. No claim of green CI is made from local results.

Warnings: the existing approximately 1.32 MB minified / 373.5 kB gzipped main JavaScript bundle exceeds Vite's 500 kB warning threshold. This is recorded for target-hardware loading/performance review; it was not suppressed or hidden. The dependencies were updated to Vite 8.3.5 and Vitest 5.1.0; a clean install and audit report zero vulnerabilities.

## Asset and visual evidence

The Blender GLB and adapter were preserved. GLB SHA-256: `0348111ade1d552f89b602f665a0f35dded0270f33b1e68f15cc5018a26e56d6`.

Production pouring and reset screenshots were inspected: the machine/studio composition, loaded hopper, stream into the aligned cup and canonical reset are present. Low-resolution integration captures establish behavior, not artistic acceptance. Headless software WebGL is not an exhibition performance benchmark.

## R1–R6 release gates

| Gate | Status | Evidence / outstanding acceptance |
| --- | --- | --- |
| R1 — Functional Integrity | Pending final verification | Exact-SHA workflow, domain timing/guards and complete pointer journey. |
| R2 — Physical Consistency | Pending final verification | Proxy targeting, full/partial/missed capture, finite batch, overflow, stationary spills, conservation and reset; final human plausibility review remains. |
| R3 — Cinematic Quality | Pending owner acceptance | Art direction preserved; normal/high-quality motion, materials, lighting, coffee and synchronized sound need approval on target display. |
| R4 — Engineering Reliability | Pending final verification | Automated checks, capture-loss/reset ownership, build isolation and exact-SHA workflow. |
| R5 — Performance & Compatibility | Pending target hardware | Local Chrome/CI Chromium do not establish sustained FPS, venue compatibility, memory stability or venue audio. |
| R6 — Exhibition Operation | Pending deployment/rehearsal | Runbook/version identification exist; approved target deployment and unfamiliar visitor rehearsal remain. |

Not exhibition-ready until all six gates pass.

## Precise owner actions

1. Review this branch and exact-commit CI evidence; merge into main only after review. This recovery run does not merge main.
2. Deploy **dist/** on the exhibition computer with intended browser/display/input hardware. Record hardware, browser version and release SHA.
3. Review high-quality camera, materials, coffee, steam and tactile motion. Audition synchronized sound/levels on venue speakers. Record R3 acceptance or defects.
4. Run repeated complete sessions and interruption/reset recovery. Record FPS/spikes, loading, memory trend and audio; aim for stable 60 FPS where feasible and avoid sustained operation below 30 FPS. Record R5 acceptance.
5. Rehearse with unfamiliar visitors without instructional UI; have the operator demonstrate launch/reset/failure recovery. Record discoverability findings, R6 acceptance and final exhibition approval.
