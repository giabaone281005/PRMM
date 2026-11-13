# U-IME engine implementation — 2026-11-13

Layout follow-up: Math9 is now embedded in the shared blueprint workspace rather than a separate top panel. Topic and engine choices live in the right sidebar; the left column switches between basic and Math9 forms. PASS: web build, ten-topic publish/preview browser flow, SVG/mixed-engine browser flow; updated math9-studio.png visually inspected.

## Delivered scope

All 13 named engine types in supplied toan_9_interactive_engine_spec.md now have a declarative configuration, authoring template, working renderer and shared authoritative TS/Dart evaluation. Fifteen templates include cone, cylinder and sphere variants. Existing 10-topic / 56-checkpoint recognition bank remains available; authors can append engine steps to any lesson. These templates are authoring suggestions, not automatically seeded learner catalog data.

| Engine | Interaction |
|---|---|
| TOKEN_CLASSIFIER | Multiple cards independently assigned to buckets; correction supported |
| TAP_COEFFICIENT | Formula coefficient hotspots |
| NUMBER_LINE_SELECTOR | Drag endpoint, open/closed endpoint, left/right ray |
| INEQUALITY_SIGN_SWITCH | Tap comparison sign |
| FORMULA_SNAP_BUILDER | Multiple slots, reusable formula tokens, drag or tap-token then tap-slot |
| PARABOLA_SLIDER | Live y = ax² graph driven by a |
| DELTA_STATE_TOGGLE | Live graph and two/double/no-real-root states |
| TRIANGLE_HOTSPOT_TAP | Direct side hotspots relative to marked angle |
| GEOMETRIC_HOTSPOT_FINDER | Dynamic distance d/R, line/circle relation and contact-point hotspot |
| ANGLE_MEASURE_TAP | Arc selection highlights inscribed/central angle relationship |
| 3D_SOLID_INSPECTOR | Real Three.js cone/cylinder/sphere meshes, orbit, part raycasting and highlights |
| CHART_BAR_TAP | Select actual bars and inspect frequency labels |
| EVENT_CARD_BUCKET | Certain/impossible/random buckets with multiple events |

Studio supports SVG drawing import rebuilt from inert drawing elements (scripts, event attributes, images and external references removed), draggable hotspot rectangles, engine JSON configuration and mixed-engine multi-checkpoint lessons. Uploaded SVG is displayed as an image, never executable DOM markup. Math tokens currently use Unicode rather than a general LaTeX typesetter. Arbitrary GLTF asset import, narration/audio generation and a full symbolic algebra solver are not implemented or claimed; built-in mathematical solids meet the inspector interaction described in the document.

## Evidence

- PASS: TypeScript/PGlite 81 tests, including authoritative interaction replay, all 15 templates publishing and invalid interval targets rejected.
- PASS: Flutter 48 tests, including matching TS/Dart U-IME acceptance/evaluation and progress restoration.
- PASS: browser 15 engine cases with real drag/drop, slider controls, direct hotspot clicks, actual WebGL contexts, orbit and raycast clicks on all three solids. Re-runs after formula input fixes passed; direct number-line drag and SVG/mixed-lesson tests also passed.
- PASS: Android emulator integration completed all 15 engine configurations in one persistent WebView, with actual rendered DOM controls sent through the production JavaScript bridge and evaluated in Dart. This test uses DOM-dispatched controls, not physical finger gestures for every renderer; desktop browser tests cover actual pointer/drag/raycast gestures. Earlier attempts exposed formula token overwrite and input-event handling issues, now fixed.
- PASS: final web build, Flutter analyze, normal debug APK build and adb install -r. Normal app launched as vn.mohoc.mo_hoc/.MainActivity; integration-test entrypoint is not the installed final app.
- PASS: hosted Supabase save_lesson_draft/publish_lesson accepted all 15 manifests in a transaction followed by rollback. Migration 20261113013509_uime_all_engines deployed; all nine migration timestamps match. Trusted progress/generate functions rebuilt and deployed. No learner catalog test lessons retained.
- Security advisor: existing leaked-password protection WARN only; no new schema/RLS finding. Remediation: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection .

## Device qualification

Emulator API35 x86_64 16KB image with WebView 156 had pre-existing ART/JNI native crashes. Its debug.checkjni property was blank initially; setting it to 0 allowed the integration to run. This is an emulator debugging workaround, not an app auth/security change; it remains on the current emulator for stable testing and resets with emulator configuration/reboot. Physical Android and iOS are NOT RUN. Hosted browser → Realtime → emulator → Edge progress as one new continuous scenario is NOT RUN; hosted RPC publication, trusted replay and emulator execution were verified separately.

Browser screenshots: uime-engine-solid-cone.png, uime-engine-solid-cylinder.png, uime-engine-solid-sphere.png and corresponding uime-engine-* files in this directory.
