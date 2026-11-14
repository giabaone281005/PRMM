# ENG-03 — balance_scale_engine

Implemented 14/11/2026 in the existing Studio, shared WebView renderer and authoritative TS/Dart evaluators. Four separate mode/model schemas serve the unchanged codes ALG-03/10/11. These are bounded algebra capabilities, not a general CAS. Registry status is implemented_adapter; curriculum coverage is implemented_pending_acceptance.

| Mode | Template | Code | Accepted model |
|---|---|---|---|
| product_equation | math9-algebra-product-equation@1 | M9-ALG-03 | (px+q)(rx+s)=0 |
| rational_equation | math9-algebra-rational-equation@1 | M9-ALG-03 | (px+q)(rx+s) / ((dx+e)(fx+g)) = k |
| quadratic_equation | math9-algebra-quadratic-equation@1 | M9-ALG-10 | ax²+bx+c=0, explicit degreePolicy |
| viete | math9-algebra-viete@1 | M9-ALG-11 | ax²+bx+c=0 with a≠0 and real roots |

Every input coefficient is an integer −9…9. Both numerator factors require nonzero p/r. The first denominator factor requires d≠0; the second may be constant but never identically zero. Use f=0,g=1 for a single linear denominator. All roots/candidates must lie within ±1000. No independent roots, forbidden-value array, answer, expression string, script or user-supplied AST is accepted. Strict schema rejects extra fields and template/code/mode mismatch. Separate practice/assessment data are required; compiler owns the six-step order.

## Structured expressions and domain

`packages/lesson-runtime/algebra.ts` derives typed, semantic-ID AST nodes: const, variable x, addition, multiplication and division. The entire equation, signed cards, probes, expansion, roots and criteria come from the same data. `evaluateExpr` has an explicit operation whitelist; it returns undefined/null for a zero denominator rather than evaluating arbitrary text. Neither LaTeX nor display labels serve as executable input. Dart `lib/algebra.dart` independently builds/evaluates the matching AST and polynomial model; shared vectors compare both AST structure and numeric probes.

The original rational denominator defines the forbidden set before any cancellation or multiplication. After cross-multiplication, solve:

```text
A = pr − kdf
B = ps + qr − k(dg + ef)
C = qs − keg
Ax² + Bx + C = 0
```

Candidate roots are then filtered against **both original denominator factors**. Identity A=B=C=0 means every real x in the original domain; holes remain excluded. A constant false equation has no roots. Repeated denominator factors contribute a unique forbidden value, not duplicate checklist items. Numeric evaluation uses a near-zero threshold 1e−8; bounded integer coefficients avoid ambiguous near-coincident inputs.

`quadratic_only` rejects a=0 with a Vietnamese correction message. `allow_linear` explicitly handles a=0,b≠0 as linear, a=b=0,c=0 as an identity, and a=b=0,c≠0 as impossible. No Δ is asserted for a nonquadratic equation. Quadratic roots use the stable ENG-01 solver; Δ<0/0/>0 gives none/one distinct repeated/two distinct real roots. Dart computes the matching stable quadratic independently. Viète rejects a=0 and Δ<0 in this real-root scope; repeated roots are supplied twice for sum/product and matching while the distinct-root count remains one.

## Interactions and equivalent transformations

Source factor cards, numeric/variable cards and formula cards have stable IDs. Coefficient slots, factor slots, sum-slot and product-slot are semantic DOM targets, never author-supplied screen coordinates. Cards support actual pointer/HTML dragging and tap-card-then-slot for accessibility/touch. Numeric cards may be reused when coefficients coincide. Formula matching retains the signs −b/a and c/a.

The renderer uses two symbolic trays labeled Vế trái/Vế phải, with signed algebraic values and an explicit caption. No negative number is modeled as a negative physical mass. The optional plot reuses ENG-01 bounds, projection, clipping and line functions: y=Ax² against y=−Bx−C; for reduced degree, the linear/constant function against the x-axis. Rational plots remain conditional on the original domain and do not draw supplied answer markers.

Allowed transformation actions are checked, not trusted from the renderer:

- Multiplying by the denominator requires the correct, explicitly acknowledged original domain.
- Zero-product splitting applies to product_equation.
- Dividing the expanded equation by its leading a requires a≠0, including after rational clearing on the acknowledged domain.
- Dividing both sides by the first factor is rejected when it could be zero. For rational models it is permitted only when that factor's zero was already excluded by the original denominator; the transformed equation retains the domain.
- Negating both sides is equivalent.
- Division by zero is rejected. General squaring/domain proofs are outside the implemented operation set: the squaring option is explicitly disabled. This is a capability limit, not a claim that squaring is never equivalent (for example P(x)=0 and P(x)²=0 over the original real domain).

The rendered transformed equation is derived only after the action's conditions hold. Normalizing coefficients retains exact fractions such as (1)/(3), rather than putting rounded decimals into an equality. A rejected action can be selected for feedback but cannot complete a transformation task.

## Session, state and grading

The existing adjust_parameter transport carries allowlisted actions. x is a probe; a/b/c encode compiler-owned card selections; y is a transformation ID. width/height are learner root inputs; numerator is the distinct-root classification (0/1/2/all-domain=3). denominator stores a rational exclusion mask or the chosen polynomial degree. targetWidth acknowledges domain, targetA/B hold Δ or Viète sum/product, and targetY is fresh answer confirmation. These names reuse existing runtime state fields; they are not independent authoring answers. Clearing an input uses a transport sentinel that can never be a valid answer.

Each checkpoint starts incomplete. Explore requires a probe movement. Identify matches factors/coefficients or the original domain. Discover validates an equivalent transformation, degree/Δ/classification or Viète relations. Guided/practice/assessment require the corresponding slots/domain/relations, an allowed transformation, correct classification, all required roots and confirmation. Edits invalidate confirmation; changing the domain mask also invalidates its acknowledgment. No-solution/all-domain conclusions require empty finite-root fields; a one-root claim cannot carry an extra second root. Viète repeated roots require both copies. Numeric root/Δ/sum/product tolerance is 1e−5. Success feedback reveals answers only after authoritative evaluation.

One algebra scene and optional plot DOM persist across all six checkpoints. Deliberate checkpoint patches reset task selections/probes/confirmations and replace the givens for steps 5/6. TS/Dart restore bind to full lesson identity/version. Accepted event journals replay through the exact service used by Edge progress; failed/duplicate attempts are not journaled.

## Contract, rollout and regeneration

An optional strict `uime.algebra` branch binds to the existing FORMULA_SNAP_BUILDER/math_explorer_2d adapter. It is mutually exclusive with geometry/graph/parabola/cylinder extensions. Canonical registry/schema/dispatcher/evaluator entries are implemented; no new canonical value was merely appended to the old engine enum. Old published lessons/progress continue on their existing adapters. New algebra lessons require this updated player; the unchanged base Lesson 1.0.0 version does not make older binaries capable. General v2 scene protocol and old-client negotiation remain ENG-07/release work. Update the learner build before distributing these lessons.

From learning-platform, run generators before Flutter builds/analysis:

```text
npm run algebra:generate
npm run contracts:generate
npm run templates:generate
npm run core:generate
npm run bundle:mobile
npm run bundle:edge
```

Primary model schemas/examples are in scripts/algebra-definitions.mjs; the catalog adds metadata to the existing Studio. Generated output contains four starter inputs, eighteen whole lesson fixtures (including hạ bậc and extra rational cases), and 38 shared vectors. Keep generated schema, mobile contracts/runtime, test-only fixture file and Edge output together. The mobile fixture generator must finish successfully before device tests; an initial Windows file lock left an older fixture file during this task, so regeneration and the entire device run were repeated successfully. Test fixtures are not imported into the normal app.

Migration `20261113185213_algebra_engine_contract.sql` adds semantic SQL validation and strict Lesson schema. It was applied to configured project sbzpmrgsqznaydllqmbm. Authoring v6 and progress v9 are ACTIVE; legacy generate v3 unchanged. Remote validation matches all 38 vectors; data counts/digests are unchanged. No remote sample lesson or progress was written. Never rewrite applied migration history; use a new CLI-created migration for further contract changes. [Evidence and release boundaries](../qa/eng03-20261114/README.md).
