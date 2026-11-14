# ENG-02 verification — 14/11/2026

Source: shared, uncommitted working tree on first-version (baseline f2cee66). Previous CP/ENG changes preserved. [Implementation scope, limits and compatibility](../../architecture/geometry-engine.md).

| Check | Result | Evidence |
|---|---|---|
| Full TS/SQL regression | PASS, 290 tests / 15 files | ts-sql-tests.log |
| Targeted Dart geometry/core contracts | PASS, 86 tests | dart-targeted.log |
| Full Flutter unit/widget suite | PASS, 170 tests | flutter-tests.log |
| Flutter analyze | Four pre-existing informational braces lints, exit 1; no new warnings/errors | flutter-analyze.log |
| Web typecheck/build, mobile/Edge bundles | PASS | typecheck.log, build.log, mobile-bundle.log, edge-bundle.log |
| Browser: 30 fixtures × 6 steps | PASS on final renderer, including projected pointer hits after rotation/zoom | browser-final.log, ten eng02-geo-*-1.png screenshots |
| Studio form → export → import → preview → save → publish → reload → publish v2 | PASS for G1/G2/G3 in local test mode; included in final browser run | browser-final.log |
| Physical Redmi Note 9S Android 12 | PASS on final renderer, 30 inputs × 6 steps through WebView/Dart bridge (2m31s) | android-geometry-final.log |
| SQL transaction publication | PASS, all 30 generated lessons; bad geometry rejected; test transaction rolled back | ts-sql-tests.log, database.test.ts |
| Remote migration / Edge deployment | PASS | migration-deploy.log, edge-deploy-final.log |
| Remote semantic vectors | PASS, 46/46 match | backend-verification.json |
| Edge HTTP checks | PASS, authoring OPTIONS 200, unauthenticated authoring/progress 401 | edge-http-check.log |
| Normal app restored on Redmi | PASS, debug APK built, installed with -r and MainActivity launched | android-build-final.log, android-install-final.log |

Coverage: unchanged GEO-01…10, eight mode schemas with separate G1/G2/G3 entries. Fixtures include changing right legs/angle roles, sin/cos/tan, special angles, circle inside/on/outside, line intersections/tangency, circle pair 0/1/2 intersections, inscribed angles, arc/sector/annulus, SSS incircle/circumcircle, cyclic quadrilateral and regular polygon. Shared vectors additionally cover contained/concentric/coincident/internal-tangent circles and invalid data. Math invariants test right-angle/length preservation, actual intersection membership, tangent orthogonality, inradius/circumradius, inscribed-angle invariance and projection/hit after transforms. Replay tests assert every event acceptance/result, no entry auto-completion, stale-answer invalidation, six steps, stable scene objects and restored state in TS/Dart.

Browser tests use actual pointer dragging and mathematical projected clicks after rotation/zoom. Point labels ignore hit testing; center hit circles are smaller to keep nearby circumference selectable. Studio tests use local in-memory API, validate imported/exported input and verify version-one receipt/manifest remain unchanged after publishing version two. This is not an authenticated hosted round-trip.

Android integration renders all 30 lessons in the real phone WebView, dispatches its DOM controls, and verifies authoritative Dart state/evaluation/restore and stable SVG identity. It does not prove finger-drag ergonomics. A final reinstall initially returned MIUI INSTALL_FAILED_USER_RESTRICTED; after waking the phone, reinstall and the entire final test passed. No uninstall, data clear or remote sample lesson writes.

After tests, the normal APK was rebuilt with the existing ignored mobile configuration, installed successfully after retrying MIUI's restriction, and MainActivity launched. No test-only lesson data is imported by the normal app. Read-only UI inspection found the launcher; no installer/settings controls or unrelated apps were changed.

Backend target was verified from repo project-ref and connected project metadata before rollout. An ignored private function/data snapshot was saved under learning-platform/.local/deployment/eng02-before.json. Before/after: 23 versions with digest bd18dcd5e165f1b087a40b2e2560c5d2; 7 progress records with digest a73f97ecf31362b2c576d97229774413. Authoring v4/progress v7 ACTIVE; verify_jwt=false preserves handlers' bearer authentication and OPTIONS. Legacy generate v3 unchanged. Security advisor reports only existing leaked-password-protection warning; Auth settings were not altered.

NOT RUN: hosted authenticated create/import → publish → Android catalog → learner progress/resume for these templates; full native finger gestures; general free constraint solving; old APK negotiation; iOS; teacher approval. Release acceptance stays separate from implemented capability status. Large feature ratios can require object buttons/zoom on phones; coordinate-derived geometry is preserved rather than distorting the mathematical shape.

To use: existing Công cụ tương tác → Hình học 2D → Soạn bài từ mode này; select any of ten geometry templates in the Studio dropdown. Enter givens and independent variants, inspect computed values (author-only), preview and explicitly save/publish. No user lesson was published by this engineering task.
