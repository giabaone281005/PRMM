# ENG-02 — geometry_2d_canvas

Implemented in the existing React Studio / shared SVG WebView / Flutter player on 14/11/2026. No parallel application, imported SVG diagram, executable author code or pixel hotspot input. Eight registry modes serve ten unchanged canonical codes. Each mode has a strict model schema, math guards and allowlisted state/events; registry coverage remains `implemented_pending_acceptance` until release acceptance.

| Group | Canonical code | Mode | Model and supported capability |
|---|---|---|---|
| G1 | GEO-01 | right_triangle | Two perpendicular legs AB/AC determine A=90°; select opposite/adjacent/hypotenuse relative to B or C, derive lengths |
| G1 | GEO-02 | right_triangle | Same construction; derive sin/cos/tan for B/C |
| G1 | GEO-03 | right_triangle | Derive acute angle; vectors include 30°/45°/60° configurations |
| G2 | GEO-04 | circle_symmetry | Center/radius, P by distance/polar angle, reflection across a local axis, inside/on/outside |
| G2 | GEO-05 | line_circle | Radius, nonnegative normal distance and normal angle determine an arbitrarily oriented line; 0/1/2 intersections, movable tangent/contact/radius layer |
| G2 | GEO-06 | two_circles | Radii and center distance determine pair; disjoint, intersecting, internal/external tangent, contained, concentric or coincident |
| G3 | GEO-07 | circle_angles | Minor arc 20°…160°, central/inscribed angles; V slides on the complementary major arc |
| G3 | GEO-08 | arc_sector_annulus | Arc length, sector area and annulus area; inner radius strictly below outer |
| G3 | GEO-09 | triangle_circles | Unique SSS triangle, chosen positive orientation; incircle/circumcircle, incenter/circumcenter, bisector/perpendicular-bisector layers |
| G3 | GEO-10 | cyclic_polygon | Four ordered polar vertices on one circle, convex nondegenerate quadrilateral/opposite angles; regular polygon with 3…12 vertices |

G1 has three templates `math9-geometry-01/02/03`; subsequent codes use `math9-geometry-04` through `10`. Every template fixes the six pedagogical roles and takes three separate data sets. GEO-08 selects arc/sector/annulus using `measure`; GEO-09 selects incircle/circumcircle; GEO-10 selects regular polygon/cyclic quadrilateral. Each has examples in `learning-platform/contracts/authoring`.

## Mathematical construction and constraints

`packages/lesson-runtime/geometry.ts` builds the derived object model, a compiler-owned topologically ordered dependency graph and constraint descriptor. Examples: C depends on A/B and lengths; intersections depend on their line/circles; the reflected point depends on P/axis; circle centers depend on three vertices; inscribed V depends on the circle/arc. IDs such as `side-AC`, `arc-AB`, `intersection-1`, `tangent-contact` and `incircle` remain stable under transforms. Dependency cycles/dangling references are implementation errors and fail construction.

This release supports determined templates rather than an arbitrary constraint solver. Two fixed legs plus perpendicularity determine G1; SSS determines GEO-09. Unknown fields or extra angle/coordinate constraints are rejected by schema, so conflicting/ambiguous user constraint graphs cannot enter the runtime. Triangle inequality and area/maxSide² ≥ 0.03 reject degenerate or nearly flat SSS triangles. Lengths are bounded 0.5…20, units cm/m; right-leg ratios 0.1…10, center/line distance 0…40, OP 0.5…30. Ordered cyclic vertex gaps must each be 10°…170°. The configured triangle orientation removes the mirrored SSS ambiguity.

Dragging a G1 vertex rotates the determined triangle about A while preserving both lengths and its right angle. Other rigid handles rotate their dependent configuration; a tangent contact moves along its circle with its perpendicular tangent. In GEO-07, V independently slides on the major arc while endpoints and inscribed-angle relation remain fixed. This is not free unconstrained vertex editing. Changing givens in Studio rebuilds the actual dimensions and derived objects.

## State, rendering and evaluation

The legacy transport carries normalized `adjust_parameter` events. Mode guards define which keys can act: x is orientation (−180…180°), y view zoom (0.6…1), a only the inscribed vertex angle in circle_angles, b a semantic selection encoded through a compiler-owned ordered ID table, c a mode-specific layer mask, numerator the learner's result, width fresh confirmation. G1 layers use bits 1/2; G2 tangent bit 16; GEO-09 adds incircle/circumcircle bits 4/8. No author-supplied object index or answer is trusted. Authoritative Dart uses the same ID ordering/count and math; shared vectors check those bindings.

Projection uses derived center/bounds, fits constructions including optional layers, and clips the SVG. The same projection transforms visible geometry, point/curve hit strokes and the drag handle. View-only zoom does not alter mathematical lengths. Labels do not intercept curve hits; small center hit regions avoid swallowing small-circle outlines. Accessible labeled object buttons supplement direct graph selection. Layer changes preserve orientation, zoom, selected ID and canvas identity; disabling a selected required construction correctly makes it unavailable for completion.

Every new checkpoint starts incomplete. Explore requires a real permitted movement; identify requires the correct visible object. Discover requires a derived numeric relation plus confirmation; guided/practice/assessment require selection and a numeric result with confirmation. Editing the result/selection invalidates confirmation. Numeric tolerance is max(0.005, |value|×0.0001). Assessment does not print the computed target value or render independent target coordinates. Success feedback is revealed after evaluation. The full six-step flow is fixed in compiler code.

One SVG/session persists through checkpoints. Checkpoint transitions deliberately replace givens at steps 5/6 and reset task state/selection/layers/transform via scene patches. Restore binds to the existing complete lesson identity/version, never recompiles old published content. Dart does not duplicate SVG drawing: the physical Android WebView uses the same geometry renderer while Dart authoritatively validates events and criteria.

## Contract and compatibility

Strict `uime.geometry` is an additive adapter extension bound to existing `TRIANGLE_HOTSPOT_TAP` / `math_explorer_2d` dispatch, not six new enum values. `geometry` cannot coexist with graph/parabola/cylinder extensions. `CoreConfig` discriminates mode/code/model; authoring validation rejects wrong template/code/version, independent answers, unknown constraints/coordinates and impossible givens.

Lesson schemaVersion/legacy engine enum remain 1.0.0. Old manifests and progress continue through their existing adapter paths. A new geometry lesson requires this updated web/mobile player; old binaries do not gain geometry support from the unchanged base version string. General canonical v2 scene protocol and minimum-client negotiation remain ENG-07/release gates. Update the learner player before publishing these templates to an installed fleet.

## Source and regeneration

Primary model schemas/examples: `scripts/geometry-definitions.mjs`. Run from `learning-platform`:

```text
npm run geometry:generate
npm run contracts:generate
npm run templates:generate
npm run core:generate
npm run bundle:mobile
npm run bundle:edge
```

`geometry:generate` updates schema branches, catalog/form metadata, registry/coverage, ten authoring examples, thirty six-step fixtures and 46 shared vectors. `templates:generate` also updates the derived six-checkpoint schema from the canonical Lesson schema. Keep generated contracts, mobile assets and Edge output together. These generators do not publish lessons or write a database. Do not rewrite applied migrations; derive subsequent SQL changes into a new CLI-created migration.

Backend migration `20261113181333_geometry_canvas_contract.sql` updates strict schema and mathematical validation. It was applied to configured project sbzpmrgsqznaydllqmbm; authoring v4 and progress v7 were deployed with handler-level auth unchanged. Legacy generate v3 was not deployed. The remote validator matches all 46 shared vectors; data snapshot digests are unchanged. Deployment follows the [Supabase migration workflow](https://supabase.com/docs/guides/deployment/database-migrations). See [ENG-02 evidence](../qa/eng02-20261114/README.md) for results and release boundaries.
