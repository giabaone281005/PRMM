# ENG-01 — Cartesian graph engine

Implemented 14/11/2026 in the existing Studio, runtime and Flutter player. Registry ID `cartesian_graph_engine@1`, minimum runtime `1.0.0`. This is an optional, strictly validated `uime.graph` extension handled before the legacy `PARABOLA_SLIDER` path; runtime engine enums and legacy dispatch remain intact. Old published manifests and progress are not recompiled. Graph manifests require this updated player; do not distribute them to older installed players merely because the base runtime version matches.

| Mode | Template | Canonical code | Scope |
|---|---|---|---|
| linear_relation | math9-linear-relation@1 | M9-ALG-01 | Point satisfying ax+by=c, including vertical/horizontal |
| linear_system | math9-linear-system@1 | M9-ALG-02 | Two lines; unique, parallel, coincident |
| parabola_coefficient | math9-parabola-coefficient@1 | M9-ALG-09 | Existing CP-05 coefficient interactions |
| line_parabola_intersection | math9-line-parabola@1 | M9-ALG-09 | Extension: ax+by=c against y=qx²; 0/1/2 intersections |

The intersection extension does not allocate a new curriculum code. It is not a general polynomial solver, translated parabola or conic engine.

## Data and evaluation

New modes accept integer coefficients in −12…12, rejecting zero line normals and q=0. Snap is 0 (free), 0.5 or 1; reject generated targets outside ±1000 or unreachable on the selected grid. Targets, class, feedback, viewport and hit paths derive from the same coefficients. No author-supplied independent answers or target coordinates. Deterministic free-coordinate anchors produce repeatable point tasks; choose coefficients/grid that give nice points when required. Free-grid irrational intersections use numeric tolerance 1e−5.

`packages/lesson-runtime/cartesian.ts` and `apps/mobile/lib/cartesian.dart` implement matching math, allowed events, metrics and restore behavior. Semantic IDs identify graphs and pins. The SVG clips paths and fits line anchors and intersections. Grid snapping is in mathematical coordinates. Pin controls supplement pointer dragging; transparent paths and labeled graph buttons support coincident curves. Exploration exposes a coefficient slider for the parabola. Assessment does not render the target points; fresh confirmation is required, and edits invalidate previous confirmation.

Authoring schema/metadata/compiler live in the existing `packages/lesson-authoring` modules. Parameters drive explore/identify/discover/guided; practice and assessment use separate variants, with a continuous scene/session and reset task metrics on checkpoint changes. Viewport follows new coefficients at the transition. Flow and criteria are compiler-owned.

## Regeneration and rollout

From `learning-platform`: run `npm run cartesian:generate`, `npm run contracts:generate`, `npm run core:generate`, `npm run bundle:mobile`, `npm run bundle:edge`. Commit schema, fixtures, mobile assets and Edge output together. `contracts/generated/cartesian.json` contains nine whole lessons; `contracts/core-engines/cartesian-vectors.json` is shared by TS/Dart.

Migration `20261113174923_cartesian_graph_contract.sql` installs schema and semantic SQL validation. It was applied to configured project sbzpmrgsqznaydllqmbm; authoring v2 and progress v5 were deployed. Legacy generate v3 remains unchanged. Snapshot counts/digests for 23 published versions and 7 progress records were unchanged. No lesson was remotely published by this task. Roll out the updated web/mobile player before publishing graph lessons to learners; unsupported old clients are not an acceptance target.

## Verification boundary

See [ENG-01 evidence](../qa/eng01-20261114/README.md). Browser tests exercise pointer drag plus exact coordinate controls; physical Android tests exercise rendered WebView controls and the authoritative Dart bridge, not native finger gestures. Hosted authenticated authoring → publish → learner progress round-trip, older APK negotiation and pedagogical approval remain release gates.
