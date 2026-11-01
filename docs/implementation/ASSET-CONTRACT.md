# Production Asset Contract

**Asset:** `public/assets/models/coffee_machine.glb`
**Runtime adapter:** `src/assets/ritualModel.ts`
**Constants:** `src/config/asset.ts`
**Validation:** `src/assets/ritualModel.ts` reports missing nodes and out-of-range dimensions in the developer console; `npm run test:e2e` exercises the assembled scene.

The GLB is authored with world-space vertex data baked into the mesh geometry. Most scene nodes therefore have identity transforms; `HopperLid` and `coffeeBeans` are the exceptions and must keep their authored pivots/transforms.

## Export and scale

| Property | Value |
| --- | --- |
| Coordinate system | Y-up, right-handed |
| Source | Authored Blender export, version `blender-glb-v1` |
| File size | ~8.05 MB |
| Uniform scale | `0.12` metres per raw unit |
| Raw offset before scale | `(0, 1.6408, -0.0954)` |
| Resulting footprint | 0.312 × 0.412 × 0.429 m (W × D × H) |
| Resulting base | Sits at `y = 0` |

The scale/offset puts the chassis footprint at the world origin and the base plane on the counter. Product dimensions stay inside RITUAL-02's approved 30–40 cm width, 35–45 cm depth and 35–45 cm height ranges.

## Measured raw bounds

| Part | Raw X | Raw Y | Raw Z |
| --- | --- | --- | --- |
| `body` | −1.3010 … 1.3010 | −1.6408 … 1.2750 | −1.6195 … 1.8103 |
| `HopperLid` origin | — | 1.8425 | −1.2964 |
| `coffeeCup` | −0.3639 … 0.5893 | −1.0710 … −0.5684 | 0.9100 … 1.6377 |
| `coffeeSpout` bottom face | — | −0.2597 | 1.1165 … 1.2395 |

`HopperLid`'s node origin **is** the rear hinge; rotating that node about its local X axis is the approved lid animation. `coffeeCup` geometry is baked in world space and is not centred on its own axis, so the adapter subtracts the measured rim centroid and base height when creating the movable cup root.

## Required node manifest

| Node | Role | Notes |
| --- | --- | --- |
| `body` | machine chassis | Includes the fixed drip tray and cup well |
| `HopperLid` | movable lid | Animate local X rotation only |
| `Hopper` | glass vessel | Static |
| `coffeeSpout` | outlet reference | Nozzle exit is the bottom-face centre |
| `coffeeCup` | movable ceramic cup | Reparented into its own world-space actor |
| `btnPower` | power control | Independent press travel |
| `btnMake` | make control | Independent press travel |
| `btnPour` | pour control | Independent press travel |
| `coffeeBeans` | baked bean pile | Consolidated into one mesh at runtime |

No movable bean container exists in the authored asset. The glass jar beside the machine is a runtime prop built by `src/scene/BeanSupply.tsx`; this is permitted by RITUAL-02 §6 and is required for a physical bean-transfer interaction.

## Spatial anchors (world metres)

| Anchor | X | Y | Z |
| --- | --- | --- | --- |
| Hero target | 0 | 0.200 | 0.020 |
| Lid hinge | 0 | 0.418 | −0.167 |
| Hopper opening | 0 | 0.4191 | −0.0636 |
| Bean settling target | 0 | 0.3523 | −0.0685 |
| Coffee exit (nozzle) | 0 | 0.16573 | 0.12991 |
| Power button | 0 | 0.2739 | 0.1602 |
| Make button | −0.036 | 0.2739 | 0.1602 |
| Pour button | +0.036 | 0.2739 | 0.1602 |
| Cup placed | 0 | pad top 0.0684 | 0.1299 |
| Cup start | −0.084 | tray floor 0.0529 | 0.1500 |

The hopper radius is 0.0878 m. The cup is 0.0934 m across, with an interior mouth radius of 0.039 m and a usable capture radius of 0.034 m after trimming the rounded rim. The stream footprint adds another 0.009 m; these values define full/partial/zero capture.

## Cup interior and volume model

- Interior floor above cup base: 0.0059 m
- Normal maximum fill height: 0.0524 m above the interior floor
- Interior radius at floor: 0.0228 m
- Interior radius at fill line: 0.0390 m
- Interior shape: tapered frustum
- 1.00 normalised cup unit = one full interior volume
- Fill level is obtained by inverting the exact frustum integral via a 128-sample table (`src/domain/cupGeometry.ts`), not by linear height interpolation

## Material inventory and calibration

| Authored material | Role | Calibration |
| --- | --- | --- |
| `mCharcoalBody` | main housing / cavity | Semi-matte charcoal; authored high-frequency stone normal map removed at runtime because it reads as noise at exhibition distance |
| `mSatinMetal` | trim and top edge | Brushed satin metal, metalness 1.0 |
| `mCharcoalMetal` | darker metal housing panels | Dark satin metal |
| `mGoldAccent` | small accent | Metal, emissive reduced so it reads as anodised metal rather than a lamp |
| `mDarkMetalTrim` | recessed trim | Dark metal |
| `mGlassHopper` | bean vessel | Transparent physical material, `depthWrite: false`, subtle transmission |
| `mCeramic` | cup | Warm ivory, low roughness, soft clearcoat |
| `mCoffeeBeans` | baked pile | Merged mesh with per-bean vertex tint |
| `mCoffeeSpout` | metal nozzle | Satin metal |
| `mButtonCap` | button caps | Shared texture map; power clone receives an emissive mask for the indicator |

Material tuning is applied once per shared material instance in `src/assets/materialTuning.ts`. Do not clone materials per frame.

## Validation checklist

- [x] Required nodes found; adapter report `ok`
- [x] Machine height inside the authored 0.30–0.50 m range
- [x] Machine base at approximately `y = 0`
- [x] Cup diameter inside 0.07–0.12 m
- [x] Lid hinge and nozzle anchors measured from the asset, not guessed
- [x] Cup interior supports a visible fill surface
- [x] Bean pile consolidated into one draw call
- [x] GLB served locally; no network dependency
- [x] End-to-end scene assembly exercised in Chrome

Re-run the asset checks after any GLB replacement with `npm run test:e2e` and inspect the hero/hoist captures in `screenshots/`.
