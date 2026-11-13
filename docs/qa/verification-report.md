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
