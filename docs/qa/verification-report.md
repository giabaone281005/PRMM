# Báo cáo kiểm chứng — 2026-11-12

## Kết luận theo phạm vi hiện tại

**PASS: bản local để người dùng thử luồng tạo bài và học tương tác.** Người dùng đã yêu cầu tự thiết lập Supabase sau. Không tuyên bố hoàn tất production master spec hoặc toàn bộ chương trình Toán 6–9.

Studio: http://127.0.0.1:5173/admin/studio. Trang học: http://127.0.0.1:5173/.
App `vn.mohoc.mo_hoc` chạy trên Android emulator-5554, Pixel 9/API35. API local dùng `10.0.2.2:5173/api` từ emulator.

## Kiểm tra đã thực thi

| Hạng mục | Kết quả | Bằng chứng |
|---|---|---|
| TypeScript typecheck | PASS | npm run typecheck; npm run build cũng chạy tsc |
| Contract, math, planner, blueprint, replay, PostgreSQL/RLS | PASS — 34 tests | vitest-results.json; learning-platform/tests/*.test.ts |
| Browser luồng tạo/học/version/restore/responsive | PASS — 9 E2E | playwright-results.json; tests/e2e/acceptance.spec.ts, creation.spec.ts |
| Browser console/network bổ sung | PASS — 1 test | browser-diagnostics.json; diagnostics.spec.ts (chạy riêng --reporter=list để giữ báo cáo 9 E2E) |
| Web production build | PASS | dist/index.html và assets; còn cảnh báo bundle lớn ~1.22 MB chưa chia chunk |
| Flutter analyze | PASS, không issue | flutter-analyze.log |
| Flutter contract/math/widget | PASS — 7 tests | flutter-tests.jsonl, dòng cuối success=true |
| Android APK debug | PASS | apps/mobile/build/app/outputs/flutter-apk/app-debug.apk |
| Android tam giác và WebView 3D | PASS — 2 kịch bản | android-geometry-integration.log; Android screenshots |
| Android bốn engine toán native | PASS — 4 kịch bản | android-math-integration.log |
| Publish từ local author API → tải và giải trên Android | PASS — 1 kịch bản | android-math-integration.log; android-local-created-lesson.png |
| Bundle mobile Three.js và Edge Functions | PASS build | npm run bundle:mobile; npm run bundle:edge |
| Sister skill | PASS | quick_validate.py .agents/skills/lesson-platform: Skill is valid |
| Supabase thật / iOS / thiết bị vật lý | NOT RUN — hoãn | Xem schema-migrations.md và task.md |
| Provider AI thật từ đề tự do | NOT RUN — chưa cấu hình | Luồng JSON không phụ thuộc AI |

## Nghiệm thu trọng tâm

- Sáu dạng JSON tự định tuyến engine. Số/đáp án thay đổi không cần viết lại scene; đáp án sai hoặc dữ kiện ngoài phạm vi bị từ chối.
- Preview điện thoại 360/390/430 px chạy runtime thật. Thao tác mở checkpoint; không dùng ảnh giả hoặc A/B/C/D làm thay thế.
- Scene DOM/native element identity giữ nguyên qua checkpoint. Trạng thái đỉnh, mặt, lớp, hệ số và tokens được giữ có chủ đích.
- Tam giác chống suy biến, đo tổng góc và ghép ba hình quạt thành nửa hình tròn 180°.
- Khối hộp là mesh WebGL thật, orbit bằng pointer/native touch, chọn mặt qua raycast. Trên Android test lớp dùng DOM range input trong WebView, orbit/chọn mặt dùng native pointer. Chưa tính là đã kiểm tra range drag bằng ngón tay trên thiết bị vật lý.
- Fraction/number line/balance/graph native sử dụng Canvas và gesture/Slider. Shared math-scenarios khớp metrics/transition TS và Dart.
- Publish/readback/version/assignment/unpublish kiểm tra qua API local; bài mới đã được app Android tải và giải đúng.
- PostgreSQL nhúng đã kiểm tra student không đọc draft/publish/đổi role/ghi progress; author chỉ thấy draft own; version immutable; progress own và idempotency. Đây không phải nghiệm thu Supabase Auth/PostgREST thực tế.

## Kiểm tra hình ảnh

Đã xem trực tiếp: learner-desktop.png, admin-desktop.png, creator-linear_equation.png, phone-preview-quadratic_graph.png, android-home.png, android-triangle-assembled.png, android-solid-filled.png.
Ảnh responsive: learner/admin ở desktop1280, tablet820, phone390; không có horizontal overflow trong các test.
Ảnh engine mới: creator-*.png, phone-preview-*.png, android-math-*.png.

## Lỗi đã tìm và sửa

- Dart suy luận map metrics thành int và map rỗng sai generic: sửa kiểu num/Map rõ ràng; test TS/Dart đã qua.
- Reload Flutter trả Future từ setState: chuyển sang callback block đồng bộ; integration restore đã qua.
- Kotlin incremental cache khác ổ C/D: cấu hình project tắt incremental/compiler daemon, build APK thành công.
- WebView thiếu charset UTF-8 làm hỏng tiếng Việt: thêm meta charset, chụp lại android-solid-filled.png xác nhận chữ đúng.
- Browser có favicon.ico 404: thêm favicon.svg/link; kiểm tra console/network chạy lại không lỗi.
- Chọn locator nhãn form không ổn định trong CMS test: dùng control trong inspector; luồng thật được giữ và đã chạy qua.

## Giới hạn và công việc hoãn

Local dev API không đăng nhập và không dành cho Internet. Mọi dữ liệu thử lưu trong `.local/workspace.json`, không có secret.
Chưa đánh giá giáo viên theo bộ SGK cụ thể; sáu nhóm mẫu chưa bao phủ mọi đề lớp 6–9.
Chưa có offline reconciliation đầy đủ, assets ký/signed content, quan sát Sentry, AI provider thật, physics/Rive hoặc fallback tương đương cho máy thiếu WebGL.
Emulator debug có cảnh báo EGL/Choreographer/frame latency của môi trường; không dùng kết quả này để cam kết 60fps trên mọi máy.
CI definitions đã viết, chưa chạy trên GitHub.

Mở Chrome bằng CUA bị bộ duyệt quyền tự động từ chối (Computer Use was not approved to use Google Chrome). Web server vẫn chạy và URL đã kiểm tra HTTP. App được khởi động bằng Flutter CLI; browser tests chạy Chrome headless riêng.

## CMS update — 2026-11-12
PASS: npm run build; npm test (47); Playwright (19); flutter analyze; flutter test (12); Android integration extra_engines_test.dart (6 engines completed in one integration case); mobile and Edge bundles.
PASS: library class sort/filter, removed navigation, readable equation fields/live diagram, numeric changes regenerate instructions, unsupported request saves locally without publishing, all six added web phone previews complete, native persistent scene identity preserved.
PASS: local catalog HTTP returns 12 published fixtures; existing local drafts/versions preserved through additive seed reconciliation.
Evidence: cms-class-sort.png, cms-friendly-form.png, cms-new-*.png, studio-desktop.png; tests/e2e/cms-refresh.spec.ts, apps/mobile/integration_test/extra_engines_test.dart, contracts/math-scenarios.json.
Resolved during verification: browser selectors updated for revised UI; native numeric field updates on change, sliders snap to available precision. Android acceptance uses actual slider taps; separate Flutter widget test checks numeric input across checkpoint advance.
NOT RUN: remote Supabase deployment/auth production; user deferred setup. Prepared, unapplied SQL source and bundles now contain all 12 engines. Existing migration sources are bootstrap artifacts, not a rollout against an existing database.
NOT CLAIMED: every possible grade 6–9 question. Arbitrary proofs/constructions require new tested interactions; free-text engine suggestions use keywords, not an AI provider. Requests remain local to the browser.

## Supabase integration � 2026-11-12
- PASS: removed automatic fixture catalogs from web store and Flutter repository.
- NOT RUN: build/test; npm.cmd runs but tsc and vitest are missing (dependencies not installed).
- BLOCKED: remote database validation; Supabase connector returned projects: []. No remote mutation performed.
- NOT RUN: Flutter analysis/device verification.


## Bỏ dữ liệu mẫu và kế hoạch database — 2026-11-13

- PASS: npm ci (0 vulnerabilities), npm run build, npm run bundle:mobile.
- PASS: npm test: 48 tests / 5 files, gồm SQL/RLS PGlite và regression API local rỗng → draft → publish → unpublish, không tự thêm fixture.
- PASS: flutter analyze (no issues); flutter test (12 tests). Fixture thiết bị chỉ import trong integration_test, không còn JSON mẫu trong app assets.
- PASS: Browser lượt đầu 18/19; ca triangle dùng CTA featured lỗi vì featured nay chọn bài thực từ catalog. Đã sửa test chọn chính bài triangle; chạy lại ca này và ca catalog rỗng mới: 2/2 PASS. Chưa chạy cả 20 ca trong một lượt.
- PASS: Catalog rỗng không đọc catalog mẫu cũ trong localStorage, không có featured giả; reload admin không seed lại. Đã xem ảnh empty-catalog.png.
- PASS: git diff --check. Không thay đổi migration hoặc database remote.
- NOT RUN: Android device integration/APK sau thay đổi asset packaging; integration entrypoints đã qua analyzer.
- NOT RUN: Auth/PostgREST/Edge/Storage/advisors remote. Connector thấy một project, repo chưa xác định đích nên không mutate.
- Phạm vi: bỏ dữ liệu mẫu khỏi catalog và gói app; giữ canonical fixtures/templates phục vụ test/builder. Không có .local/workspace.json trong checkout này; không xóa dữ liệu người dùng trên thiết bị hoặc database.
- Thiết kế và công việc còn lại: ../architecture/supabase-database-plan.md.


## Supabase hosted rollout — 2026-11-13 (mới nhất)

- PASS: project sbzpmrgsqznaydllqmbm scoped; 6 migrations local/remote khớp, 17 public tables / 17 RLS; progress và generate ACTIVE.
- PASS: preflight 0 users/tables/buckets; snapshot .local/deployment/before.json, Auth config snapshot trước thay đổi.
- PASS: 52 TS/SQL tests (bao gồm verified admin bootstrap, overlap/midnight, isolation và attempt identity); 20 browser tests trong một lượt; web build và Edge bundles.
- PASS: Flutter analyze, 14 tests, debug APK với cấu hình Supabase thật; ZIP APK không có các JSON mẫu/fixtures/evaluation/scenarios.
- PASS: 9 nhóm hosted smoke với 5 user Auth tạm: actual password login, role/draft isolation, publish immutability, Edge replay/idempotency, activity timezone, profile/request RLS, author generation review và unpublish/resume. Evidence: supabase-hosted-smoke.json.
- PASS: cleanup chỉ dữ liệu của smoke run; readback 0 users/lessons/versions/sessions/requests/jobs; immutable_version trigger vẫn enabled.
- PASS: security và health advisors không có findings; performance không còn WARN, chỉ INFO unused indexes trên DB mới.
- PASS: Auth site/redirect URLs cổng 5173; config diff không còn drift. Form signup web thực đã mở và chụp supabase-signup.png; chưa submit email người dùng.
- NOT RUN: xác minh email prmfa26@gmail.com bởi chủ tài khoản; production frontend hosting, Android tương tác bằng user thật, iOS, provider AI thật. generate smoke dùng template mode.
- LIMITATION: mobile refresh token hiện chỉ ở RAM; cần đăng nhập lại khi restart. Outbox hoạt động học lưu theo user; thời gian thiết bị chỉ là telemetry, milestone dùng thời gian server xác nhận.
- Tài liệu và trạng thái hiện hành: ../architecture/supabase-deployment.md. Các ghi chú BLOCKED/NOT RUN remote ở các mục cũ đã được thay thế bởi kết quả trên.


## Cập nhật quyền quản trị — 2026-11-13
PASS: pvhldd.1@gmail.com đã xác minh, role=admin được readback từ database; audit owner_requested_admin_grant đã ghi. Gỡ email cấu hình nhầm khỏi bootstrap chưa sử dụng, giữ nguyên các tài khoản.


## Mobile Auth mới — 2026-11-13
PASS: 21 Flutter unit/widget tests; flutter analyze No issues found; debug APK build với cấu hình Supabase thật. PASS: cài APK qua adb install -r Success trên Pixel_9_Pro emulator-5554, mở MainActivity và kiểm tra hình ảnh giao diện đăng nhập mới với nút Đăng ký. Có xác minh email, gửi lại có cooldown, password confirmation, lỗi tiếng Việt, secure session storage, refresh và logout scope=local. PASS: probe Supabase Auth thật trả invalid_credentials cho tài khoản thử không tồn tại, không tạo account. NOT RUN: native auth_flow_test.dart (lần thử trước bị chặn ADB authorization), gửi/xác nhận email thật và iOS. Bản cài cuối được xác nhận khởi động qua bước đọc secure storage và hiển thị login, không tuyên bố đã đăng nhập thay người dùng.


## Luồng tạo bài admin → Android Realtime — 2026-11-13

PASS: 53 TS/SQL, 23 Flutter tests, 20 browser E2E. Sửa lỗi PGRST201 thực ở truy vấn lessons/lesson_versions bằng FK hint; không còn lỗi refresh thư viện sau lưu.
PASS: migration 20261112182103_live_published_catalog đã apply, local/remote khớp; catalog_state RLS chỉ authenticated đọc, client không ghi; chỉ bảng revision này được replicate, không phát draft hoặc nội dung tác giả.
PASS: kiểm thử thật qua giao diện admin tại port 5173 và Flutter native trên emulator-5554. Dùng hai user tạm, driver đăng nhập student, chờ Realtime subscribed rồi mới cho browser tạo draft/publish. Poll fallback được đặt một ngày trong test để chứng minh cập nhật đến từ WebSocket. Card tự xuất hiện, mở được NativeMathScene; gỡ xuất bản từ giao diện admin làm card tự biến mất, không pull-to-refresh.
Evidence: live-catalog-hosted-results.json, admin-live-published.png, android-live-published.png, android-live-unpublished.png. Khoảng 5358 ms trong report bao gồm quan sát card, screenshot, mở và đóng bài, không phải phép đo latency WebSocket riêng.
PASS: dọn đúng run live-7e56de26-4d5b-4516-a23d-3a0ce21a0878; readback remaining_test_users=0, remaining_test_lessons=0, original_lesson_present=true; immutable_version trigger vẫn bật. Phiên secure storage có sẵn trên emulator được test lưu trong RAM và phục hồi; không xuất token/mật khẩu người dùng ra host.
Mobile thực: foreground subscribe, đổi tài khoản hủy subscription cũ, resume bắt kịp thay đổi, kiểm tra revision 30 giây dự phòng và giữ catalog khi network lỗi. Card hiện title thật thay vì chỉ nhãn engine.
Resolved in verification: callback setState trả Future gây lỗi debug đã sửa thành callback synchronous; driver lượt đầu chờ hết hạn do admin PGRST201, đã sửa và chạy lại thành công từ đầu.
Security advisor: không có finding mới trên bảng/policy; còn WARN Auth leaked-password protection disabled, nằm ngoài thay đổi catalog. Tham khảo https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection .
NOT RUN: iOS, performance thiết bị vật lý yếu, stress nhiều publish đồng thời hoặc SLA latency production.

PASS cuối: flutter analyze sạch; web production build PASS; APK thông thường build/cài lại Success và MainActivity đã mở trên emulator. Kiểm tra kernel APK không chứa tài khoản/entrypoint live-test; đã xóa hai file credential/defines thử trên host. CUA xác nhận giao diện login của bản thường hoạt động.

## Bài chọn bi ba màu — 2026-11-13
PASS: tạo qua UI Studio với phiên admin hiện có; thùng 5 bi đỏ, 3 bi xanh, 2 bi vàng, 6 thẻ EVENT_CARD_BUCKET, hình SVG và giải thích xác suất. Preview chấm đúng 6 thẻ và mở nút hoàn thành. Xuất bản qua UI thành công; chuyển trang thư viện đọc lại tên bài và trạng thái Đã xuất bản. Evidence: three-color-web-preview.png, three-color-published.png.
NOT RUN: tương tác trên Android. Emulator Pixel_9_Pro cần cold boot; thử đồ họa phần mềm sau khi ADB shell không đáp ứng. CUA native capture báo window crop is outside captured monitor. Chưa tuyên bố Android PASS.
BLOCKED cuối lượt: emulator đã có cửa sổ Pixel_9_Pro nhưng ADB trả device unauthorized. Đã yêu cầu người dùng tự chấp nhận Allow USB debugging nếu xuất hiện; chưa có xác nhận. Bài đã xuất bản, chưa kiểm chứng mở bài trên mobile.

## Rà soát bàn giao — 2026-11-13
PASS: npm test 81/81 (7 files), npm run build (TypeScript + Vite), flutter analyze No issues found, flutter test 48/48. Có cảnh báo Vite import resolution tương lai và chunk JS >500kB, đã ghi PROJECT_HANDOVER.md. PASS: kiểm tra đường dẫn Markdown trong tài liệu bàn giao và code fences.
NOT RUN trong lượt tài liệu: browser/device E2E, build APK, live Supabase readback/deploy. Lỗi ANR quan sát ở lượt chạy app chọn bi trước chưa được xử lý; restart về Home không chứng minh tương tác đã PASS. PROJECT_HANDOVER.md tổng hợp 9 migration trên disk, khả năng hiện tại, khác biệt tài liệu lịch sử và roadmap ưu tiên.

## Local startup 2026-11-13
PASS: git pull --ff-only origin first-version; existing config loaded without printing values; admin /admin/studio HTTP 200; Pixel_9 emulator boot completed; Flutter debug APK built, installed and VM service connected; vn.mohoc.mo_hoc/.MainActivity RESUMED.
NOT RUN: authenticated lesson interactions. Automatic approval review rejected browser launch commands without a specific reason; dashboard URL remains available.


## Excel Toán 9 local pilot — 2026-11-13
- PASS: 86 Vitest tests; TypeScript + Vite build; 1 Playwright E2E nhập JSON, preview, xuất bản API local, 0 Supabase requests.
- PASS: 18 checkpoint trong 3 mẫu đạt qua LessonSession; AI schema validate và kiểm tra JSON lỗi.
- NOT RUN: Flutter/native acceptance và đánh giá sư phạm; 21 dạng chưa có mẫu.
- Screenshot: curriculum-local.png. Chi tiết: ../architecture/math9-local-pilot.md.

## Tích hợp dashboard hiện có
- PASS: build, 86 tests; Playwright template → Studio → xuất bundle → nhập biến thể → sửa câu hỏi → lưu/xuất bản → danh sách bài. Câu hỏi recognition khớp checkpoint, không request Supabase.
- NOT RUN: xác minh UI qua tài khoản Supabase; không thay đổi remote trong lượt tích hợp.


## Luồng quản lý bài học
- PASS: build; E2E danh sách → Thêm bài mới → chọn mẫu → Studio → nhập JSON → lưu/xuất bản → quay lại danh sách → mở sửa bài.
- Studio không còn trong sidebar; Bài học giữ active khi đang soạn. Không ghi Supabase.

## Chỉ lớp 9 / đúng nguồn Supabase
- PASS: Supabase 3 bài lớp 9 published, 1 bài lớp 7 unpublished. Dashboard 5180 khởi động với VITE_ENABLE_LOCAL_DEMO=false.
- PASS: build; đọc kiểm tra RLS với role authenticated của khazim2810@gmail.com trả đủ 3 bài lớp 9.
- NOT RUN: thao tác UI đăng nhập bằng mật khẩu người dùng; cần người dùng đăng nhập lại trên nguồn Supabase.

## Chốt bàn giao engine / checkpoint — 2026-11-13
- PASS: npm run build; npm test 88/88 (9 files), có test 90 checkpoint và import JSON không thể đạt.
- PASS: npx playwright test 38/38 trong lượt cuối (3.1 phút). Các run bị dừng/sai selector trước đó không phải kết quả cuối.
- PASS: npm run bundle:mobile; Flutter test 48/48; Flutter analyze không có issue.
- PASS: Supabase read-back 15 bài lớp 9 published / 90 checkpoint / 0 sai số bước; kiểm tra dưới RLS admin thấy đủ 15, không có bài lớp khác published.
- PASS: backup local trước sync; ba bài cũ giữ ID, tạo version mới (graph2, bi2, trụ3), thêm 12 bài mẫu version1.
- Advisors: health sạch; security WARN leaked-password protection disabled; performance INFO 4 unused indexes. Chưa thay cấu hình hoặc xóa index.
- NOT RUN: Android hosted xuyên suốt / ANR bài bi, iOS, thiết bị thật và hosting web production.
- Giới hạn: 15 mẫu công cụ không đồng nghĩa đã phủ 24 dạng trong Excel. 21 dòng curriculum còn thiếu mẫu; bộ legacy 10 chủ đề/56 checkpoint cần hợp nhất.
- Bàn giao: ../../PROJECT_HANDOVER_ENGINE_CHECKPOINTS.md. Branch bàn giao: first-version-v2.

## Đặc tả phiên kế tiếp — tài liệu
- PASS: file SPEC_TOAN9_CMS_ENGINE_FLOW6.md có đủ 24 mã chương trình duy nhất, ví dụ JSON parse được, liên kết bàn giao tồn tại.
- Chỉ thay tài liệu; không sửa runtime hoặc Supabase; không chạy lại test ứng dụng cho thay đổi tài liệu.
- Nội dung là yêu cầu triển khai tiếp, không đánh dấu tính năng fixed-flow/dynamic scene đã hoàn thành.

## Hợp nhất đặc tả Toán 9
- PASS: một file chuẩn SPEC_TOAN9_CMS_ENGINE_FLOW6.md; đủ 24 mã canonical, 4 JSON ví dụ parse được, có bảng alias giữa mã Excel hiện có và Markdown bổ sung.
- Đã xử lý xung đột ALG-09/căn bậc ba-parabol, STA/STP, 4 bước admin/6 checkpoint học sinh và payload/schema. Bảo toàn yêu cầu admin alphabet + nhãn/chú thích tiếng Việt, không LaTeX trong form.
- Tài liệu nguồn backup trong .local/spec-source-backups, không commit. Chỉ sửa tài liệu, không thay runtime hay remote database.

## CP-01 — Baseline hiện hành và đối chiếu tài liệu — 13/11/2026

- **PASS CP-01:** chạy lại baseline trên nguồn commit `f2cee66d4488e79114a6756e879f4c9accb1d830`, branch `first-version`. Tài liệu và evidence CP-01 là thay đổi working tree chưa commit. Báo cáo chi tiết, cấu hình đã lược key và logs: [cp01-20261113/README.md](cp01-20261113/README.md).
- Môi trường: Windows, Node 24.7.0, npm 11.6.0, Flutter 3.47.7 stable, Dart 3.13.5. CI pin Flutter 3.47.4; chưa chạy CI remote. `npm ls --depth=0` exit 0; không chạy lại `npm ci` trên dependencies có sẵn.
- Nguồn dữ liệu: `.env.local` và module Vite đang phục vụ tại 127.0.0.1:5173 xác nhận Supabase project `sbzpmrgsqznaydllqmbm`, local demo false. Mobile defines trỏ cùng project nhưng không chứng minh APK đang cài có cấu hình đó. Playwright mở server 5174 riêng, Supabase URL/key rỗng, local memory/test mode; không ghi remote.

| Kiểm tra chạy lại | Kết quả |
|---|---|
| `npm run typecheck` | PASS, exit 0 |
| `npm test` | PASS, 9 files / 88 tests |
| `npm run build` | PASS, TypeScript + Vite |
| `npm run bundle:mobile` | PASS |
| `npm run bundle:edge` | PASS; không deploy |
| `npm run test:e2e -- --reporter=list,json` | PASS, 38 tests, 0 skipped/flaky/unexpected, khoảng 3.5 phút |
| `flutter analyze` | PASS, No issues found |
| `flutter test` | PASS, 48 tests |
| Kiểm ma trận | PASS, 24 mã duy nhất, 3 có mẫu curriculum / 21 chưa có mẫu, không đổi mã |

- Cảnh báo hiện hữu: Vite import resolution/config loader native; web JS chunk 1,379.66 kB (gzip 366.16 kB); Flutter có 10 package mới ngoài constraints. Không nâng dependency hoặc tắt cảnh báo trong CP-01.
- Bundle mobile/Edge/schema/fixtures không có diff nội dung với commit nền. Đã khôi phục kiểu xuống dòng generated files; 24 ảnh browser thay đổi được lưu riêng trong thư mục evidence, giữ ảnh lịch sử tại đường dẫn cũ. Không sửa logic ứng dụng.
- Tài liệu: `task.md` dẫn backlog hiện hành và giải thích checkbox Supabase cũ; ma trận thay flow 4 slide bằng 6 checkpoint, phân biệt 4 thao tác admin, đánh dấu trạng thái mẫu và chỉ rõ payload/kiến trúc đích chưa triển khai. `PROJECT_CHECKPOINTS.md` đánh dấu CP-01 PASS.
- **NOT RUN:** build/cài APK, Android integration và ANR bài bi, hosted Auth/publish/Realtime/Android/Edge progress/resume liên tục, live catalog/RLS/advisors, iOS, thiết bị thật, kiểm duyệt sư phạm, production hosting/signing, cài sạch và generators contract/template. Android hosted/ANR tiếp tục mở ở CP-02.
- Phạm vi PASS là baseline local và đối chiếu tài liệu; không tuyên bố native hoặc production-ready.

## CP-03 — Authoring contract và registry — 13/11/2026

- **PASS (contract/interface local):** schema authoring riêng, registry hai template/mode có sáu nhiệm vụ cố định, metadata form, validation toán, compiler interface và receipt ngoài runtime manifest. Không đổi schema runtime/evaluator, không tự recompile/publish bài cũ.
- **PASS:** typecheck; 66 tests mới (gồm 15 manifest legacy chạy đủ bước và restore snapshot), full suite 154 tests/10 files, build. Logs và phạm vi: [cp03-20261113/README.md](cp03-20261113/README.md).
- Quyết định lưu sidecar immutable theo lesson/version/hash và tương thích legacy: [authoring-contract.md](../architecture/authoring-contract.md). Persistence backend chưa triển khai trong CP-03.
- **NOT RUN / tiếp theo:** compiler hình trụ/parabol CP-04/05; UI/import/persistence/publish sidecar CP-06; browser/Flutter/Android/hosted acceptance. Hai registry entry có compilerStatus pending. Giữ nguyên thay đổi CP-02 có sẵn trong working tree.

## CP-04 — Hình trụ theo dữ kiện — 13/11/2026

- **IN PROGRESS / chờ người dùng tự nghiệm thu:** đã có compiler nhận diện, ba input, geometry/raycast/fallback theo dữ kiện, giữ canvas/session/góc xoay, bước 5/6 đổi dữ kiện có reset lựa chọn; TS/Dart cùng evaluator.
- **PASS trước yêu cầu dừng test:** 162 TS/SQL tests / 11 files; 6 browser tests (3 input × WebGL/fallback); 3 Dart parity tests; typecheck và bundle mobile. [Logs, phạm vi và cách tự test](cp04-20261113/README.md).
- **NOT RUN:** Android native touch/integration, full Flutter suite/analyze, web build và UI selector cuối; người dùng yêu cầu tự test. Hosted migration/Edge rollout chưa chạy. Migration mới chỉ được kiểm trên PGlite; không publish/reseed/sửa manifest/progress cũ. Mode diện tích/thể tích/hình trải chưa triển khai.

## CP-05 — Parabol y = ax² theo dữ kiện — 13/11/2026

- **IN PROGRESS / chờ người dùng tự nghiệm thu:** compiler math9-parabola-coefficient@1; ba JSON đề, six-step flow; graph/point/viewport/hit từ cùng mô hình, giữ SVG/session/ID; TS/Dart evaluator tương ứng, nối mẫu vào Công cụ tương tác hiện có.
- **PASS (sinh artifact và biên dịch):** export ba manifest, web TypeScript + Vite, bundle mobile và Edge. [Logs và hướng dẫn tự test](cp05-20261113/README.md).
- **NOT RUN theo yêu cầu không chạy test:** TS/Dart/SQL/browser tests, Flutter analyze/build/cài APK, Android/native gesture/restore/parity và hosted acceptance. Tests TS/Dart đã chuẩn bị nhưng chưa có kết quả thực nghiệm. Không coi build PASS là nghiệm thu sáu bước.
- Migration private runtime contract mới chỉ tạo file; chưa apply local/remote. Không deploy Edge, không publish/reseed/biên dịch lại manifest/progress cũ. Tam giác vuông và mode mở rộng ngoài phạm vi CP-05 này.

## CP-06 — Form admin / AI JSON / provenance — 13/11/2026

- **IN PROGRESS / chờ người dùng tự nghiệm thu và rollout:** form registry cho hình trụ/parabol; preview/highlight/flow cố định/computed read-only; schema/sample/AI bundle, import candidate/diff và áp dụng riêng; unsaved warning, legacy nâng cao phân biệt rõ.
- Save/publish managed compile phía server, kiểm revision/owner/role, transaction sidecar và immutable published snapshot bind đúng manifest hash. Local API lưu file, hosted Edge/migration/RLS đã viết nhưng chưa triển khai remote. Restore/clone managed lấy input đúng version; không sửa published/progress cũ.
- **PASS:** web TypeScript + Vite build, bundle mobile và Edge (authoring mới). [Logs và hướng dẫn tự test](cp06-20261113/README.md). [Quyết định persistence](../architecture/authoring-persistence.md).
- **NOT RUN:** unit/Dart/SQL/PGlite/browser tests, advisors, PostgreSQL migration/RPC execution, round-trip/reload/concurrency/role tests và Android/hosted acceptance. Theo yêu cầu để người dùng tự test; build không thay thế bằng chứng nghiệm thu. Không ghi remote/publish dữ liệu trong lượt này.

## Sửa publish authoring hosted — 14/11/2026

- **PASS rollout:** lỗi báo từ log là thiếu migration sidecar và function authoring trên project sbzpmrgsqznaydllqmbm. Đã apply ba migration CP-04/05/06; deploy authoring v1 và progress v4, generate giữ nguyên.
- **PASS xác minh hẹp:** CORS preflight OPTIONS trả 200, POST không có session trả 401, đủ hai bảng sidecar/12 migration. Snapshot 22 versions/7 progress cùng digest trước/sau giữ nguyên.
- **NOT RUN:** full suites, tạo bài thử, click publish có session người dùng và Android acceptance; tiếp tục để người dùng tự test. [Báo cáo chi tiết](authoring-publish-fix-20261114/README.md). Các ghi chú “chưa rollout” trong CP-04/05/06 phía trên là trạng thái tại thời điểm các lượt đó.

## ENG-00 — Core engine contract/registry — 14/11/2026

- **PASS nền tảng:** sáu registry entry, mode/capability inventory, coverage 24 canonical codes, strict executable schema hai adapter, TS/Dart resolvers/gates, interface/version/compatibility/rollout decision. Planned modes không được publish; không thay runtime enum/published/progress.
- **PASS:** TypeScript/Vite build, Edge bundle, 12 TS và 10 Dart contract tests; integration U-IME WebView bridge và bundled registry/schema trên **Redmi Note 9S / Android 12**. [Evidence](eng00-20261114/README.md).
- Người dùng cho phép chạy tests tự động trên điện thoại thật, thay chỉ dẫn không chạy test trước đó. MIUI chặn cài lần đầu; sau khi người dùng bật Install via USB, rerun PASS. Không wipe/clear data. WebView case dùng DOM-dispatched controls, không phải mọi native gesture hoặc hosted end-to-end.
- Planned modes ENG-01…06/v2 chưa triển khai; chưa bao phủ acceptance 24 dạng. Bước tiếp theo ENG-01; không apply SQL/deploy remote trong ENG-00.

## ENG-01 — Cartesian graph — 14/11/2026

- **PASS implementation:** linear_relation, linear_system và line_parabola_intersection, cùng parabol CP-05 trong một registry engine; ALG-01/02/09 giữ mã canonical. Phương trình đứng/ngang, số nghiệm, snap, viewport, semantic hit, variants, sáu bước và TS/Dart replay/restore theo dữ kiện. [Quyết định](../architecture/cartesian-engine.md).
- **PASS:** 208 TS/SQL tests, 94 Flutter tests, chín browser lessons và chín lesson × sáu bước trên Redmi Note 9S Android 12. Typecheck/build/mobile/Edge bundle PASS. Flutter analyze còn bốn informational braces lints (exit 1), không ghi PASS cho analyze. [Logs và phạm vi](eng01-20261114/README.md).
- **PASS backend rollout:** migration 20261113174923, authoring v2/progress v5; không đổi 23 published versions và 7 progress theo digest trước/sau. Legacy generate giữ nguyên; không publish bài thử.
- **NOT RUN:** hosted authenticated publish/learner round-trip, native finger gestures cho mọi mode, older APK negotiation và teacher review. Android case dùng DOM controls với Dart authoritative bridge; browser có pointer drag và numeric controls. Updated player cần rollout trước bài graph mới. Các kết quả ENG-00 phía trên là lịch sử trước ENG-01.

## ENG-02 — Geometry 2D — 14/11/2026

- **PASS implementation:** G1/G2/G3, tám mode/schema và mười template GEO-01…10. Mô hình dựng hình và dependency graph sinh objects/labels/hit/answers cùng dữ kiện; locks/mode guards, semantic layers, TS/Dart evaluation/restore và optional runtime adapter giữ legacy. [Quyết định/phạm vi](../architecture/geometry-engine.md).
- **PASS:** 290 TS/SQL tests (bao gồm PostgreSQL transaction publish 30 lessons), 170 Flutter tests, 46 shared vectors; 33 browser cases gồm 30 lessons × sáu bước và ba Studio export/import/preview/save/publish/version/reload. Typecheck/build/mobile/Edge bundle PASS. Analyze có bốn informational braces lints có trước ENG-02, exit 1. [Evidence](eng02-20261114/README.md).
- **PASS backend:** migration 20261113181333, authoring v4/progress v7; remote validator 46/46; 23 versions và 7 progress giữ nguyên digest; không publish/reseed user content. Security advisor chỉ báo existing leaked-password-protection warning. Legacy generate không deploy.
- **PASS Android cuối:** bridge trên Redmi Note 9S Android 12 PASS 30 inputs × sáu bước trong 2m31s với renderer cuối. Một lượt reinstall bị MIUI từ chối khi màn hình nghỉ; đánh thức máy và rerun PASS, không clear data/uninstall.
- **PASS khôi phục app thường:** build debug APK với cấu hình mobile hiện có, cài -r sau retry MIUI và launch MainActivity thành công; test fixtures không được import vào lib của app thường.
- **NOT RUN:** authenticated hosted round-trip, finger gestures toàn bộ modes, older APK negotiation, iOS/teacher review. Đây là giới hạn nghiệm thu phát hành; không đồng nhất DOM controls trên thiết bị với kéo bằng ngón tay. Tiếp theo ENG-03.

## ENG-03 — Balance/algebra — 14/11/2026

- **PASS implementation:** bốn mode riêng tích/hữu tỉ/bậc hai/Viète cho ALG-03/10/11; typed AST, miền từ mẫu gốc, loại nghiệm ngoại lai, hạ bậc/Δ/nghiệm kép, điều kiện biến đổi, signed cards/semantic slots và plot dùng ENG-01. Không negative physical masses hoặc CAS tổng quát. [Quyết định/phạm vi](../architecture/algebra-engine.md).
- **PASS:** 354 TS/SQL tests / 16 files; targeted final replay 62; 227 Flutter tests; 22 browser cases (18 sáu bước và bốn Studio export/import/preview/save/publish/reload/version); 18 lessons × sáu bước qua Redmi Note 9S Android 12 WebView/Dart bridge. Build TypeScript/web/mobile/Edge PASS; analyze có bốn informational braces lints cũ, exit 1. [Evidence](eng03-20261114/README.md).
- Lượt device đầu thất bại do file fixture cũ: Windows từ chối ghi fixtures.dart trong generator. Đã sinh lại thành công và chạy lại toàn bộ integration PASS; không tính lượt lỗi là bằng chứng Android PASS.
- **PASS backend:** migration 20261113185213, authoring v6/progress v9 ACTIVE; remote vectors 38/38; không đổi 23 versions/7 progress theo digest. Không publish/reseed bài hay progress thử. Legacy generate v3 giữ nguyên; advisor chỉ báo existing leaked-password-protection warning.
- **PASS bản cuối và khôi phục app:** giữ dạng phân số chính xác trong phép chuẩn hóa; bình phương được khóa theo phạm vi kiểm chứng (không dạy rằng bình phương luôn sai). Rerun web/device PASS; normal debug APK build/install -r/launch MainActivity thành công, giữ data/session.
- **NOT RUN:** authenticated hosted authoring/publish/catalog/progress end-to-end, native finger drag toàn bộ modes, older APK negotiation, iOS và teacher review. Android test dùng DOM controls, không được gọi là full native gesture acceptance. Tiếp theo ENG-04.

## Đóng gói và hướng dẫn admin — 14/11/2026

- **PASS đối chiếu tài liệu:** hướng dẫn root HUONG_DAN_TAO_BAI_HOC_ADMIN.md dựa trên 19 template authoring/15 engineTopics/24 curriculum rows; có ví dụ từ file canonical, ma trận đường soạn, giới hạn từng mode, legacy và luồng AI JSON/save/version. Links tương đối đã kiểm tồn tại.
- README_DONG_GOI.md phân biệt source snapshot với database backup, hướng dẫn local/Supabase/Android và cấu hình riêng của máy nhận. Không thay application runtime hoặc remote backend trong lượt đóng gói.
- **PASS kiểm gói:** releases/MoHoc_source_after_ENG03_20261114.zip gồm 5.992 source/document files; CRC, SHA-256 từng entry, required files và credential-pattern scan PASS. Kết quả máy đọc tại file .verification.json cùng tên; ZIP có PACKAGE_MANIFEST.json. Không đưa .git/.local/.env thật/dependencies/build vào gói; giữ source chưa commit. Source của hướng dẫn trong ZIP khớp file giao riêng.
- **NOT RUN:** rerun full test suites, cài lại app, publish hoặc thao tác người dùng trên hosted trong lượt tài liệu/đóng gói. Các kết quả test phía trên là bằng chứng của ENG trước đó, không phải lượt chạy mới.

## Bộ chạy test admin/user — 14/11/2026

- **PASS runner:** test-admin.bat/test-user.bat tự định vị thư mục, chuẩn bị npm dependencies khi thiếu, cài Chromium, chạy typecheck/Vitest/Playwright trên cổng riêng với workspace trong bộ nhớ. Có --headed, --list, --no-pause và user --flutter. Không sửa .env.local/.local hoặc backend hosted.
- **PASS kiểm entrypoint:** chạy thật hai BAT đến khi hoàn tất; cả hai trả exit 1 vì suite phát hiện lỗi. --list admin chạy từ C:/Users/NHIM trả exit 0, đúng 27 ca; tham số không hợp lệ trả exit 2. Node syntax check PASS. Chưa mô phỏng một máy sạch không có node_modules, mất mạng hoặc thiếu Node/Flutter.
- **PASS:** TypeScript typecheck và 354 Vitest / 16 files trên mỗi role.
- **FAIL browser admin:** 11 PASS / 16 FAIL, không retry. Lỗi timeout ở ca acceptance CMS, tám ca cms-refresh legacy, năm ca creation, curriculum-pilot và math9. Studio chuẩn đã thay route /admin/studio bằng /admin/lessons/new; các ca này tìm controls JSON/blueprint cũ trong vùng nâng cao đang đóng. Các ca Studio đại số (4), hình học (3), workspace rỗng, responsive, lọc/sắp xếp và SVG/editor PASS.
- **FAIL browser user:** 82 PASS / 3 FAIL. diagnostics tìm nút dựng bài legacy; U-IME parabol và hình trụ tìm nút preview legacy sau khi chọn bài đi qua authoring mới. Các ca learner 2D/3D, restore/completion, Cartesian/geometry/algebra, cylinder chuyên biệt, WebView bridge và các U-IME khác PASS.
- Evidence admin: [summary](automated/admin/2026-11-13T20-11-26-264Z-29896/summary.json), [HTML](automated/admin/2026-11-13T20-11-26-264Z-29896/html/index.html). Evidence user: [summary](automated/user/2026-11-13T20-11-37-152Z-3556/summary.json), [HTML](automated/user/2026-11-13T20-11-37-152Z-3556/html/index.html). Mỗi thư mục có run.log, results.json và ảnh/video/trace lỗi trong artifacts. Timestamps tên thư mục dùng UTC.
- **NOT RUN:** --headed, nhánh --flutter, Flutter device integration, hosted authentication/RLS và thao tác ngón tay. Đây là tự động hóa các ca hiện có, chưa nghiệm thu toàn bộ luồng sản phẩm. Các tests legacy cần cập nhật riêng; lượt này không thay application runtime hoặc test assertions.

## User BAT chuyển sang Android UI — 14/11/2026

- **PASS bản cuối:** test-user.bat gọi run-device-tests.mjs, build APK riêng, xác minh package bằng aapt trước cài, chạy Flutter integration driver trên Redmi Note 9S Android 12 (121ea06b). Hai test UI chính PASS (~60 giây thực thi trên thiết bị; ngoài thời gian build/install); setup/teardown cũng PASS, BAT exit 0. 14 ảnh PNG được lưu sau Home/catalog, bốn checkpoint/completion, profile/activity và triangle assembly/completion.
- Luồng gồm chạm navigation/nút, kéo native slider cho bốn bài, scene continuity, thoát/mở lại checkpoint đang học, phục hồi hoàn thành, hồ sơ/hoạt động và kéo đỉnh/ghép góc tam giác. Không gọi callbacks/session.interact hoặc JavaScript để giải bước. Fixture catalog/backend local nằm trong test APK; không truy cập/publish dữ liệu hosted.
- **PASS:** Dart analyze cho integration_test/user_ui_test.dart và test_driver/user_ui_driver.dart; Node syntax check; test-user.bat --list nhận đúng Redmi và AVD Pixel_9. APK vn.mohoc.mo_hoc.uitest được kiểm trước install và qua native app-identity channel trước khi đọc/xóa preferences. Gradle nhận diện test entrypoint từ thuộc tính target; build lib/main.dart giữ package gốc.
- **Sự cố trong lượt đầu (không tính PASS):** biến môi trường Gradle ban đầu không tách package như dự định; test đã cài vào package vn.mohoc.mo_hoc và chạy prefs.clear trước khi phát hiện. Đã dừng lượt test. Package gốc sau đó không còn hiện trong danh sách cài đặt; đã build/cài lại APK thường bằng cấu hình mobile hiện có và mở MainActivity thành công. Không khôi phục được preferences cục bộ trước sự cố; phiên đăng nhập/cache trên máy có thể cần thiết lập lại. Không có thao tác trên Supabase hoặc clear dữ liệu hosted. Lỗi đã được sửa bằng nhận diện target, kiểm APK trước cài và chốt native identity trước storage.
- Lượt tiếp theo chạy đúng sandbox: test toán/hồ sơ PASS, test tam giác lỗi vì thiếu convertFlutterSurfaceToImage cho test thứ hai; đã thêm conversion riêng và chạy lại toàn bộ suite PASS. Giữ log các lượt lỗi, không tính thành bằng chứng PASS.
- Evidence bản cuối: [summary](automated/user-device/2026-11-13T20-41-32-846Z-38280/summary.json), [log](automated/user-device/2026-11-13T20-41-32-846Z-38280/run.log), [triangle](automated/user-device/2026-11-13T20-41-32-846Z-38280/08-triangle-completed.png). Nhật ký các lượt trước nằm trong các thư mục cùng nhánh user-device.
- **NOT RUN:** tự boot/test AVD, nhiều thiết bị cùng lúc, hosted auth/RLS/progress và native WebView/3D gestures toàn bộ engines. Bộ user-browser cũ vẫn có thể gọi bằng Node runner, không còn là mặc định của test-user.bat.

## Admin BAT thao tác UI trực tiếp — 14/11/2026

- Người dùng chọn kiểm thử Gỡ xuất bản theo chức năng hiện có; không yêu cầu thêm nút xóa bài.
- **PASS:** test-admin.bat mặc định mở Chromium headed, slowMo 300 ms và chạy admin-ui.spec.ts. Một kịch bản với sáu test.step đi qua tạo form/lưu nháp; mở bài đã lưu/sửa tên và dữ kiện/lưu/reload; xuất bản; kiểm catalog người học; gỡ xuất bản qua menu; reload/kiểm lịch sử version và catalog ẩn bài/bản nháp vẫn sửa được. Tất cả thay đổi qua click/fill/select trên giao diện; không có request API chuẩn bị hoặc sửa dữ liệu trong test.
- **PASS:** kịch bản UI 1/1 trong 19 giây (24.3 giây gồm server/runner), BAT exit 0. TypeScript typecheck PASS. Mặc định chỉ chạy UI flow hiện tại; --full giữ bộ typecheck/Vitest/27 tests legacy trước đây, --headless có thể ẩn browser. Server dùng workspace trong bộ nhớ, không thay catalog hoặc bài thật ở Supabase/.local.
- Lượt UI đầu lỗi strict locator vì output cũng có implicit role=status; đã thu hẹp vào .notice[role=status] và rerun toàn bộ sáu chặng PASS. Không thay application logic để làm test xanh.
- Evidence: [summary](automated/admin/2026-11-13T20-47-02-171Z-32164/summary.json), [HTML](automated/admin/2026-11-13T20-47-02-171Z-32164/html/index.html), [log](automated/admin/2026-11-13T20-47-02-171Z-32164/run.log). Sáu ảnh bước nằm trong artifacts của cùng lượt.
- **NOT RUN:** thao tác bài đã tồn tại từ trước trên hosted, đăng nhập/phân quyền backend thật, xóa vĩnh viễn (chức năng UI chưa có). Bài đã lưu được kiểm sửa/gỡ là bài test được tạo trong lượt này. Bộ legacy lịch sử không được gọi mặc định và chưa được sửa trong lượt này.

## Mở rộng admin kiểm tất cả chủ đề — 14/11/2026

- **PASS 49/49 browser UI cases**, 7,2 phút tổng. 19 template chuẩn: tạo/save/reload/publish/reload; 25 lựa chọn legacy (10 nhóm Toán 9 + 15 engine): dựng/save/publish/reload; ba pilot chương trình; kiểm kê toàn bộ 24 card và hai dropdown; luồng tạo/sửa/publish/catalog/unpublish/history/draft. Tất cả thay đổi bài qua UI headed, không gọi API để seed bài trong tests.
- Inventory được tạo lại bằng scripts/ui-test-inventory.ts trước mỗi lượt; test so sánh options UI với inventory để phát hiện chủ đề mới/bị bỏ sót. topic-inventory.json ghi template/pilot theo từng mã. Card chưa có nút tạo được kiểm đúng trạng thái disabled; không đồng nhất việc kiểm card với đã có form/engine chuẩn đầy đủ cho 24 mã.
- Lượt đầu 44 PASS / 5 FAIL: bốn ca đại số tìm SVG đang thu gọn thay vì vùng cards thực sự hiển thị; luồng CRUD cũ giả định catalog rỗng dù các ca mới đã publish nhiều bài. Đã sửa locator/điều kiện theo đúng hành vi và chạy lại toàn bộ 49 ca PASS. Không sửa runtime ứng dụng để làm test xanh.
- Evidence bản cuối: [summary](automated/admin/2026-11-13T21-06-59-638Z-31632/summary.json), [HTML](automated/admin/2026-11-13T21-06-59-638Z-31632/html/index.html), [inventory](automated/admin/2026-11-13T21-06-59-638Z-31632/topic-inventory.json).
- Source backend vẫn là test workspace in-memory; không tạo/gỡ bài trên project hosted.

## User kiểm toàn bộ catalog hiện có — 14/11/2026

- Đã đọc project từ cấu hình hiện có (sbzpmrgsqznaydllqmbm) và lấy **19 manifest đang xuất bản / 114 checkpoint** bằng truy vấn SELECT read-only. Snapshot không chứa tài khoản/token/owner rows; kèm source tại learning-platform/tests/fixtures/published-catalog.snapshot.json, cache trong .local. Truy vấn đối chiếu sau kiểm thử lúc 04:39 ngày 14/11 (UTC+7) xác nhận vẫn 19 manifest và nội dung không thay đổi.
- test-user.bat mặc định đăng ký một test cho mỗi lesson ID/version, đi qua toàn bộ checkpoint, kiểm scene liên tục, thoát/mở lại sau checkpoint đầu và mở lại sau hoàn thành. Mỗi bài được chọn qua catalog UI. Header dữ liệu và checksum được lưu trong catalog-inventory.json; đầu vào Android ở android-input.jsonl; kết quả từng bước ở lesson-results.json. Catalog rỗng, lesson thiếu PASS hoặc thiếu checkpoint đều làm toàn lượt FAIL, kể cả khi framework báo không có test lỗi.
- Inputs WebView dùng ADB tap/swipe/text trên thiết bị; DOM JavaScript chỉ đọc/định vị/scroll. Binding bật shouldPropagateDevicePointerEvents trong từng test và khôi phục sau test. Không gọi callback/session.interact, setter input value hoặc dispatch sự kiện để giải đáp án. UI Flutter/navigation dùng tester pointers. Chỉ ACK tiến độ ở host test loopback, không ghi progress/publish trên Supabase.
- **Kết quả lượt tổng Pixel 9 / Android API 35:** 18 bài PASS / 108 checkpoint; một bài geometry dừng ở kiểm góc xoay 45° vì input native nhận 44°. Đây là góc camera khám phá tùy chọn, không phải đáp án toán học. Lượt thử căn bù pixel tiếp theo vẫn lệch và bị giữ FAIL. Đã bỏ cơ chế căn bù, chỉ cho góc camera này dung sai 2°, giữ độ chính xác slider đáp án và bộ đánh giá toán học của runtime.
- **PASS kiểm lại có mục tiêu:** bài lesson-492ff8c6-f5f2-4a91-8d0a-c673f3ed1d3d đi đủ sáu checkpoint, có nhập kết quả số, chọn đối tượng, restore và completion. Không sửa math/runtime hoặc nội dung published để làm test xanh. Mười tám bài còn lại dùng đường kiểm slider/đáp án không thay đổi.
- **PASS mức bao phủ sau tổng hợp: 19/19 bài, 114/114 checkpoint**, từ lượt tổng và lượt kiểm lại một bài, có đối chiếu SHA-256/version cho bài được kiểm lại. **Không tuyên bố đã có một lượt sạch toàn bộ 19 bài sau sửa assertion**; bản FAIL của lượt tổng vẫn giữ nguyên. [Coverage tổng hợp](automated/user-device/catalog-coverage-final-20261114.json), [lượt tổng](automated/user-device/2026-11-13T21-21-59-216Z-19668/summary.json), [kiểm lại geometry](automated/user-device/2026-11-13T21-35-44-836Z-33148/summary.json).
- **PASS static:** TypeScript typecheck, Node syntax, Dart analyze cho entrypoint/catalog/smoke/driver. Admin 49/49 UI cases PASS như mục trên. Native package vẫn được kiểm bằng aapt trước install và native channel trước storage. Điện thoại thường vẫn có package vn.mohoc.mo_hoc sau lượt này; không clear/uninstall app thường trong lượt mở rộng.
- **Lỗi/chặn trong quá trình chuẩn bị:** Redmi bị MIUI từ chối install qua USB (INSTALL_FAILED_USER_RESTRICTED), chưa chạy bộ 19 bài trên điện thoại thật. AVD quick-boot treo; đã khởi động lạnh thành công, không wipe userdata. Lượt dynamic async test registration và lượt đầu ADB bị framework chặn device events được ghi FAIL; đã đăng ký test index đồng bộ và bật forwarding thật, kiểm preflight một bài PASS trước khi chạy toàn catalog. Có timeout cho query/build/driver/ADB, không retry ẩn lỗi.
- **NOT RUN:** đăng nhập live-refresh bằng MOHOC_TEST_EMAIL/MOHOC_TEST_PASSWORD vì không có credentials được cung cấp; hosted UI auth/RLS/progress; toàn bộ 19 bài trên điện thoại thật; một lượt sạch 19/19 sau geometry assertion fix; các renderer/nội dung mới ngoài snapshot này. Có env credentials thì runner đọc mới published_catalog trước mỗi lượt, revoke riêng phiên đăng nhập mới với scope local; không có credentials thì source snapshot và timestamp được ghi rõ, không giả là live mới nhất.

## Kiểm chứng tiếp trên Redmi sau xác nhận cài — 14/11/2026

- Đã chạy đầy đủ 19 bài của snapshot trên Redmi Note 9S / Android 12 (121ea06b). Lượt đầu cài lại vẫn bị MIUI từ chối; lượt tiếp theo đã cài/mở đúng vn.mohoc.mo_hoc.uitest và chạy test. Không tự thay cấu hình bảo mật hoặc clear/uninstall package thường.
- **Lượt tổng:** 18 bài PASS; bài geometry lesson-492ff8c6-f5f2-4a91-8d0a-c673f3ed1d3d dừng ở checkpoint 3. Trên WebView của Redmi, input số controlled đã nhận giá trị 8 khi ADB gõ 0.8; state/assertion và ảnh lỗi ghi rõ numeral=8. Đây là lỗi nhập thập phân thực tế, khác lỗi assertion góc camera của lượt AVD trước.
- **Đã sửa UI nguồn:** GeometryScene dùng ô số giữ buffer gốc trong khi đang nhập, không gửi các tiền tố chưa hoàn chỉnh vào vòng ACK. Commit số hữu hạn khi blur/Enter và đọc/commit giá trị hiện tại trước khi xác nhận. Reset input theo checkpoint; canvas không remount. Không đổi evaluator TypeScript/Dart, schema, đáp án hoặc manifest published. Đã bundle lại runtime mobile.
- **PASS kiểm lại geometry trên Redmi:** đủ 6 checkpoint, gồm nhập các số thập phân, chọn đối tượng, restore và completion. Các bài khác đã PASS trong lượt tổng và không dùng component số geometry vừa sửa. [Coverage Redmi tổng hợp](automated/user-device/redmi-coverage-final-20261114.json) xác minh 19/19 bài, 114/114 checkpoint qua lượt tổng + kiểm lại 1 bài; so khớp version/SHA-256. Không tuyên bố có một lượt sạch cả 19 bài sau fix UI. [Lượt tổng](automated/user-device/2026-11-13T23-56-56-916Z-29444/summary.json), [kiểm lại](automated/user-device/2026-11-14T00-08-09-485Z-5340/summary.json).
- **PASS regression:** 30 ca geometry browser (mỗi bài sáu checkpoint) và ca mới gõ tuần tự 0.8 rồi xác nhận, kiểm numerator=0.8/modelError=0/canvas identity. Setup đầu của test mới bị từ chối vì cố nhảy checkpoint; đã sửa setup để giải hai bước đầu qua UI rồi chuyển hợp lệ. Log [30 ca](geometry-decimal-20261114/browser.log), [ca nhập thập phân cuối](geometry-decimal-20261114/regression-final.log). Typecheck và mobile bundle PASS.
- APK thường vn.mohoc.mo_hoc vẫn tồn tại, không có ADB reverse rule test còn sót sau kết thúc. Chỉ APK UI test đã nhận runtime sửa trong lượt này; **chưa build/cài APK app thường mới hoặc deploy frontend/backend hosted**. Credentials/live-refresh và hosted progress vẫn ngoài phạm vi lượt này.
