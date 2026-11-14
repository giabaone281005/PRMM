# ENG-01 evidence — 14/11/2026

Source: shared working tree on first-version, baseline f2cee66; not committed. Implementation and scope: [Cartesian engine decision](../../architecture/cartesian-engine.md).

| Check | Result | Evidence |
|---|---|---|
| Full TS/SQL regression | PASS, 208 tests / 14 files | all-ts-sql.log |
| Shared TS/Dart Cartesian vectors and core contract | PASS, 34 targeted Dart tests | dart-tests.log |
| Full Flutter unit/widget suite | PASS, 94 tests | flutter-tests-final.log |
| Browser: nine generated lessons × six checkpoints | PASS, 9 cases | browser.log, graph-*-cp4.png and cp6.png |
| Final mobile CSS/layout browser rerun | PASS, one representative six-step case | browser-final-layout.log |
| Real Redmi Note 9S / Android 12 | PASS, nine inputs × six checkpoints | android-cartesian.log |
| Web typecheck/build and mobile bundle | PASS | build-final.log, mobile-bundle-final.log |
| Flutter analyze | 4 informational braces lints, exit 1; no errors/warnings | flutter-analyze-final.log |
| Supabase migration | PASS | migration-deploy.log |
| Normal Android debug APK rebuild/install | PASS, installed and launched on Redmi | android-build-final.log, android-install-final.log; no uninstall/data clear |

Each generated lesson begins incomplete, completes through allowed events, changes checkpoint without replacing the SVG, and replays/restores through TS/Dart. Includes vertical/horizontal lines, unique/parallel/coincident systems and 0/1/2 line–parabola intersections. Additional vectors cover free-grid irrational roots, degeneracy and impossible snap grids. Browser tests perform actual SVG pointer drags plus numeric controls. Android integration dispatches DOM controls inside the physical WebView and verifies Dart evaluation; it does not prove finger gesture ergonomics.

Backend: configured project sbzpmrgsqznaydllqmbm received migration 20261113174923 and authoring v2/progress v5. Read-only validation confirmed vertical/horizontal accepted, degenerate line and unreachable snap rejected. Before/after: 23 versions, digest 032747fe0b11661902cf361de3966920; 7 progress, digest 0c4139362dc2e9fdf2c8e75d4b332b8e. No remote sample lesson/progress writes. Legacy generate unchanged.

NOT RUN: authenticated hosted create/import → publish → learner save/resume round-trip for these new templates; native finger drag coverage for every graph mode; old installed APK compatibility negotiation; iOS; teacher review. Older clients need updating before new graph lessons are published. These are release acceptance gates, not inferred from local tests.

Use Công cụ tương tác → cartesian_graph_engine → desired enabled mode → Soạn bài từ mode này. Edit coefficients in the existing Studio, preview six steps, then save/publish explicitly. Three new example inputs are under learning-platform/contracts/authoring; each has parameter and practice/assessment variants. Existing parabola template remains available.
