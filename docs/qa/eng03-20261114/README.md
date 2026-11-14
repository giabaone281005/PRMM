# ENG-03 evidence — 14/11/2026

Source: shared uncommitted working tree on first-version, baseline f2cee66. Existing CP/ENG changes and unrelated REA source preserved. [Algebra scope and contract decision](../../architecture/algebra-engine.md).

| Check | Result | Evidence |
|---|---|---|
| Full TS/SQL regression | PASS, 354 tests / 16 files | ts-sql-tests.log |
| Final journal replay checks | PASS, 62 algebra tests; accepted journals reproduce snapshots | ts-replay-final.log |
| Targeted TS algebra/authoring/core | PASS, 140 tests | ts-targeted.log |
| Targeted Dart algebra/core | PASS, 67 tests | dart-targeted.log |
| Full Flutter unit/widget suite | PASS, 227 tests | flutter-tests.log |
| Flutter analyze | Four pre-existing informational braces lints; exit 1, no new errors/warnings | flutter-analyze.log |
| Browser six-step learners | PASS, 18 cases | browser.log, six eng03-*.png screenshots |
| Studio export/import/preview/save/publish/reload/version | PASS, 4 mode cases in local test API | browser-studio.log |
| Redmi Note 9S Android 12 | PASS, 18 inputs × 6 checkpoints | android-algebra.log |
| Typecheck/web build/mobile/Edge bundle | PASS | build.log, mobile-bundle.log, mobile-bundle-retry.log, edge-bundle.log |
| PostgreSQL transaction publication | PASS for all 18 compiled lessons, then rollback | ts-sql-tests.log / database.test.ts |
| Migration and Edge rollout | PASS | migration-deploy.log, edge-deploy.log |
| Remote algebra validation | PASS, 38/38 vectors | backend-verification.json |
| Remote data preservation | PASS, counts/digests unchanged | backend-verification.json |
| HTTP auth/CORS smoke | PASS, OPTIONS 200; unauthenticated POST authoring/progress 401 | edge-http-check.log |
| Normal Android app restored | PASS, debug APK rebuilt, installed with -r and MainActivity launched | android-build-final.log, android-install-final.log |

Coverage: product factors and signs, repeated roots, rational original domain/holes, extraneous candidates, all-domain identity, no real/valid roots, linear/constant degree reduction, Δ negative/zero/positive, negative leading coefficient, real Viète sum/product and repeated-root multiplicity. Shared vectors compare AST structure/probes, reduced polynomial, solution/domain/classification, card ordering/slot targets and equivalent-operation permissions in TS/Dart. Independent invariant tests substitute roots into the original AST and check transformation algebra on allowed domains. Unknown AST operations, independent answer/domain lists and unsupported coefficients/policies are rejected.

All eighteen generated lessons start incomplete, traverse six fixed steps, preserve scene identity and restore each interaction state. Backend replay tests filter accepted actions and verify the full journal reproduces the final snapshot. Contradictory extra root entries, forbidden roots, omitted repeated Viète roots and stale confirmations are rejected.

Browser tests exercise actual card dragging plus tap-card/slot controls, numerical inputs, domain checkboxes, classification and transformation selection. The supporting ENG-01 plot stays mounted across checkpoints. Four Studio cases export authoring input, import/diff as a variant, preview, save, publish, reload, reject invalid givens, publish version two and verify version-one manifest/receipt remain unchanged. These use a local in-memory API, not hosted user credentials.

Physical Android integration renders all modes in the real Redmi WebView and uses DOM-dispatched controls; authoritative Dart verifies event acceptance, evaluation, six steps, stable scene/plot and restore. This proves bridge parity, not native finger gesture ergonomics. An initial mobile bundle encountered a Windows write lock on integration_test/fixtures.dart; the first device attempt saw the old file and failed before running lessons. After regenerating successfully, the complete device suite PASS. The initial bundle failure is retained as mobile-bundle-initial-failed.log; final bundle success is logged separately. No data clear/uninstall.

Final reruns include exact fractional normalization and the disabled, explicitly unsupported general-squaring option. The normal app was rebuilt and successfully reinstalled/launched after the final test; existing data/session were preserved. Test-only fixtures are not imported into lib/. Earlier APK replacement attempts met MIUI restrictions; the final logged install succeeded without uninstalling or changing phone settings.

Backend: target sbzpmrgsqznaydllqmbm verified from repo project-ref and connected project metadata. A private rollback function/data snapshot is ignored at learning-platform/.local/deployment/eng03-before.json. Applied only migration 20261113185213, deployed authoring v6/progress v9 with handlers' bearer auth and OPTIONS unchanged; legacy generate v3 unchanged. Before/after: 23 versions, digest bd18dcd5e165f1b087a40b2e2560c5d2; 7 progress, digest a73f97ecf31362b2c576d97229774413. No hosted lesson/progress writes or Auth setting changes. Security advisor reports only the existing leaked-password-protection warning.

NOT RUN / release gates: authenticated hosted authoring → publish → Android catalog → learner save/resume; complete native finger drag coverage; old APK negotiation; iOS; teacher review. General CAS, arbitrary rational ASTs, arbitrary squaring equivalence proofs and complex-root Viète are outside this bounded implementation. Updated learner build must precede distributing new algebra templates.

Use existing Công cụ tương tác → Đại số và phương trình → Soạn bài từ mode này, or select a mode in the Studio template dropdown. Givens/formula/domain/answer traces are derived from the same model. No LaTeX/key editing or independent answer entry is needed. Engineering tests did not publish user lessons remotely.
