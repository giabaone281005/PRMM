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
