# Toán 9 recognition — 2026-11-13

PASS: 10 editable topic templates, 56 recognition checkpoints. Original source question 5.2 had two correct options; now split into independent statements. TypeScript tests 64/64; Flutter tests 33/33 (all ten topics selecting wrong/right fragments and completing); flutter analyze clean. Web build and debug APK build pass; normal APK installed and started on emulator-5554.

PASS: Full Playwright regression 21/21; math9 test traversed 56 checkpoints and published ten topics through isolated local API. Screenshot math9-studio.png. Hosted project sbzpmrgsqznaydllqmbm: ten valid_manifest checks true; save_lesson_draft and publish_lesson RPCs succeeded for ten lessons in a transaction followed by rollback. Zero test lessons remained. Migration 20261113011033_math9_recognition_contract applied; progress/generate functions rebuilt and redeployed. All eight migration timestamps match local/remote. Admin Studio HTTP 200 at port 5173.

NOT RUN: new recognition lesson hosted browser → native emulator → trusted Edge progress in a continuous run. Earlier Realtime acceptance predates this renderer. Native widget tests exercise taps; drag/device hotspots need further gesture acceptance.

NOT IMPLEMENTED: arbitrary SVG hotspot editor, rotating cone/cylinder/sphere, interval number line, multi-bucket classification, multi-slot formula assembly and dedicated delta/circle sliders. Built-in 2D diagrams have predefined tap targets. Math fragments use Unicode text, not LaTeX typesetting. Recognition coverage follows supplied topics; it is not certified exhaustive curriculum coverage.
