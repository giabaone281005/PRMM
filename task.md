# Kế hoạch thực thi

## Cập nhật mobile theo phản hồi mới
- [x] Ba tab Home / Bài học / Hồ sơ; bỏ các thẻ minh họa lớn, thay bằng lưới icon.
- [x] Tăng cỡ chữ giao diện/điều khiển bài học; kiểm tra màn hình 320 px và text scale 135%.
- [x] Hồ sơ với tên hiển thị, tiến độ hiện tại, chuỗi ngày, thời gian học, heatmap 20 tuần và timeline thật.
- [x] Lưu hoạt động theo tài khoản local/user, loại thời gian idle/nền; chống đếm trùng checkpoint/completion.
- [x] Kiểm tra ảnh cuối, 11 Flutter tests và Android integration; mở lại app cập nhật trên emulator.

Quy ước: [x] có bằng chứng, [ ] chưa hoàn tất; không đánh đồng mã đã viết với nghiệm thu.

- [x] Đọc đặc tả, tìm REA skill, kiểm kê workspace và SDK.
- [x] Ghi audit, tách sister skill, bảo toàn REA.
- [x] Contract 2020-12, sáu fixtures và test vectors/scenarios TS/Dart.
- [x] Runtime persistent scene, geometry constraints, checkpoint/snapshot.
- [x] CMS tạo/sửa/lưu/versions/publish/unpublish/assignment và editor trực quan.
- [x] Khuôn problem JSON, kiểm tra dữ kiện/đáp án, tự chọn 12 engine.
- [x] Luồng nhập biểu mẫu/paste/upload JSON, tải khuôn mẫu và preview điện thoại 360/390/430 px.
- [x] Native Flutter cho trục số/phân số/cân bằng/đồ thị/tam giác; Three.js WebView cho khối hộp.
- [x] API local lưu file, version bất biến, replay tiến độ; web và emulator cùng đọc catalog.
- [x] Supabase schema/RLS/publish/progress source và kiểm thử PostgreSQL nhúng; chưa rollout remote.
- [x] Builder template; provider adapter phía server/job/review scaffold có test output constraints.
- [x] Curriculum/capability matrix, local course/modules editor, audit, settings, CI definitions.
- [x] Typecheck, unit tests, production build, browser E2E và screenshots.
- [x] Flutter analyze/test/build, Android integration sáu engine và bài vừa publish từ local API.
- [x] Chạy lại kiểm tra cuối sau tinh chỉnh preview; server local đã chạy và Flutter CLI đã mở app trên emulator.
- [x] Hoàn tất verification-report và đối chiếu phạm vi local với master spec.

## Hoãn theo yêu cầu người dùng / không tính hoàn tất production
- [ ] Người dùng thiết lập Supabase đích; kiểm kê/backup và apply migrations an toàn.
- [ ] Kiểm chứng Auth/PostgREST/Edge/RLS/storage thật; tài khoản admin/student production.
- [ ] Cấu hình provider AI thật và đánh giá giáo viên cho nội dung AI từ văn bản tự do.
- [ ] Nội dung toàn bộ chương trình 6–9, physics/Rive, fallback 3D tương đương.
- [ ] iOS, thiết bị vật lý yếu, performance và accessibility audit đầy đủ.

## CMS trực quan và mở rộng engine — 2026-11-12
- [x] Bỏ Chương trình/Phân tích khỏi điều hướng CMS.
- [x] Bài học: lọc lớp 6–9, sắp xếp tăng/giảm theo lớp, tên và lần chỉnh sửa.
- [x] Chữ lớn hơn, dữ kiện có nhãn dễ hiểu, phương trình/hình xem ngay, thông tin kỹ thuật thu vào mục nâng cao.
- [x] Studio: lời dẫn ngắn, dữ kiện sinh câu hướng dẫn mới, mục tiêu hoàn thành bằng ngôn ngữ dễ hiểu, preview điện thoại.
- [x] Thêm sáu engine thật cho web + Flutter: phần trăm, tỉ lệ, tọa độ, diện tích, Pythagore, đường thẳng (tổng 12).
- [x] Khuôn JSON, kiểm tra đáp án, runtime metrics, registry/schema SQL nguồn và Edge bundle đồng bộ.
- [x] Lưu đề chưa có engine; không xuất bản dạng chưa hỗ trợ, không tự nhận hiểu mọi đề.
- [x] Kiểm thử 47 TS/PostgreSQL, 19 browser, 12 Flutter; Android hoàn thành sáu engine mới bằng gestures.
- [x] Local catalog có 12 bài mẫu; giữ nguyên các bản nháp/phiên bản người dùng đã có.

## Supabase data integration � 2026-11-12
- Removed automatic browser lesson fixture seeding and Flutter bundled catalog fallback.
- Web requires Supabase configuration by default. Local development API requires explicit VITE_ENABLE_LOCAL_DEMO=true.
- Existing four SQL migrations remain the schema source; no remote project was returned by the connector.
- Remaining: select/connect target project, inspect remote schema, apply reviewed migrations, deploy progress/generate functions, verify RLS with separate users.


## Thiết kế database và bỏ dữ liệu mẫu — 2026-11-13
- [x] Đọc React/Flutter, API local, Auth, activity và bốn migration Supabase.
- [x] Lập docs/architecture/supabase-database-plan.md: ERD, 14 bảng hiện có, bảng bổ sung, RLS, indexes và rollout.
- [x] Bỏ seed/reconciliation 12 bài mẫu; API local mới bắt đầu rỗng.
- [x] Bỏ nguồn catalog/draft/audit localStorage cũ; giữ cache tiến độ thật.
- [x] Xóa JSON mẫu khỏi Flutter assets; đầu vào kiểm thử nằm riêng trong integration_test.
- [x] Featured/card web lấy từ manifest; bỏ lịch ngày minh họa suy từ số bài.
- [x] Build web/mobile runtime; 48 TS/SQL tests, Flutter analyze và 12 tests; browser checks.
- [ ] Chọn project, kiểm kê/backup và rollout remote theo database plan.
- [ ] Triển khai đồng bộ profile/requests/study activity và kiểm chứng Auth/Edge/RLS thật.


## Supabase thật — 2026-11-13
- [x] Xác nhận project scoped sbzpmrgsqznaydllqmbm; preflight database rỗng và snapshot cấu hình/schema.
- [x] Apply 6 migrations; local/remote versions khớp; 17/17 bảng public bật RLS.
- [x] Hồ sơ/settings/timezone, engine requests, study sessions/outbox/aggregation, verified milestones, bootstrap admin email đã xác minh.
- [x] Thu hồi quyền mặc định quá rộng; sửa idempotency attempt/assignment, tách policies và thêm FK indexes.
- [x] Deploy progress/generate ACTIVE; kiểm tra Auth/PostgREST/Edge thật bằng 5 user tạm, dọn toàn bộ dữ liệu test.
- [x] Cấu hình web/Flutter project thật, Auth URLs; 52 TS/SQL, 20 browser, 14 Flutter, analyze và APK debug PASS.
- [x] Security/health advisors sạch; performance chỉ còn INFO unused indexes. Báo cáo docs/architecture/supabase-deployment.md.
- [ ] Chủ tài khoản đăng ký/xác minh prmfa26@gmail.com để nhận quyền admin; allowlist private đã cấu hình.
- [ ] AI provider thật, production web domain/hosting, Android user acceptance và iOS; assets/taxonomy nâng cao khi có nhu cầu.


## Mobile Auth và cài emulator — 2026-11-13
- [x] Đăng nhập/đăng ký/xác minh email/gửi lại, kiểm tra mật khẩu nhập lại và lỗi tiếng Việt.
- [x] Logout theo scope local; lưu/khôi phục phiên bằng flutter_secure_storage 11.2.0, tự refresh token và tách dữ liệu theo user.
- [x] 21 Flutter tests; flutter analyze sạch; build APK debug với cấu hình Supabase thật.
- [x] adb install -r Success trên emulator-5554; mở và xác nhận giao diện đăng nhập mới có nút Đăng ký.
- [ ] Native integration test auth_flow_test.dart và người dùng xác minh email thật; chưa tính các ca này là PASS.


## Admin tạo bài → mobile tự cập nhật — 2026-11-13
- [x] Sửa PGRST201 ở loadLessons bằng FK hint rõ ràng; lưu/xuất bản refresh ngay thư viện và số liệu admin.
- [x] Tạo & xuất bản lên app tách Lưu nháp; cập nhật thông báo thao tác.
- [x] Migration live_published_catalog trên Supabase thật, 7 lịch sử local/remote khớp; chỉ catalog_state được đưa vào Realtime.
- [x] Mobile Realtime + reconnect/resume + revision fallback; giữ danh sách khi lỗi và không remount player.
- [x] Mobile hiện tên bài thực trong icon grid và thẻ tiếp tục.
- [x] 53 TS/SQL, 23 Flutter, 20 browser tests; hosted admin UI → Android publication/open/unpublish PASS.
- [x] Dọn đúng hai tài khoản/bài/markers thử; bài gốc người dùng vẫn còn, published-version protection vẫn bật.

- [x] Build/cài lại APK thông thường trên emulator sau test; khôi phục session trước test, không đóng gói test account, đã mở app và xác nhận giao diện.

## Bài chọn bi ba màu — 2026-11-13
- [x] Tạo bài qua Studio bằng phiên admin có sẵn: 5 bi đỏ, 3 bi xanh, 2 bi vàng; phân loại 6 thẻ biến cố và giải thích xác suất.
- [x] Preview web: phân loại đúng cả 6 thẻ, nút hoàn thành được mở.
- [x] Xuất bản lên app; thư viện CMS đọc lại trạng thái Đã xuất bản.
- [ ] Mở bài và xác minh thao tác trên emulator; đang xử lý khởi động Android/ADB.

## Bàn giao nhóm — 2026-11-13
- [x] Tạo PROJECT_HANDOVER.md tại root: kiến trúc, nguồn, contract/engines, Supabase, môi trường/chạy/build/test, lỗi/giới hạn, roadmap/phân công/acceptance.
- [x] Rà lại tài liệu cũ và phân biệt kết quả lịch sử với kiểm tra hiện tại; ghi ANR bài chọn bi chưa giải quyết.
- [x] Kiểm tra lại: 81 TS/SQL tests, web build, Flutter analyze và 48 Flutter tests PASS; links Markdown tồn tại.
- [ ] Nhóm tiếp nhận tái hiện/sửa ANR và nghiệm thu hosted U-IME → Android → Edge progress xuyên suốt; xem PROJECT_HANDOVER.md.

## Local startup 2026-11-13
- [x] Pull first-version (already up to date), load Downloads/.env.local for web and derive ignored mobile defines, start Vite and Pixel_9 Flutter app.


## Excel Toán 9 — local pilot
- [x] Đọc 3 sheet, giữ 24 dạng / 6 nhóm engine.
- [x] Ba mẫu 6 checkpoint; export AI bundle / import / preview / publish local; không dùng Supabase.
- [x] 86 tests, build và E2E import/publish local PASS.
- [ ] 21 dạng còn lại và tương tác đầy đủ theo Excel; nghiệm thu Flutter chưa làm trong bản thử.

- [x] Theo phản hồi: tích hợp mẫu Toán 9 / JSON vào Công cụ tương tác và Studio có sẵn; bỏ màn biên soạn thử riêng.


- [x] Bỏ Studio khỏi menu chính; chỉ mở qua Thêm bài mới/Sửa bài, thêm nút trở về danh sách và route /admin/lessons/new.

- [x] Chỉ hiển thị lớp 9 trong dashboard/catalog; chuyển server 5180 từ local sang Supabase theo yêu cầu mới. Gỡ xuất bản bài lớp 7, giữ dữ liệu/lịch sử. Supabase xác nhận 3 bài lớp 9 đang xuất bản.

## Bộ mẫu công cụ sáu checkpoint và bàn giao
- [x] 15 mẫu / 13 kiểu tương tác, 90 checkpoint có cấu hình và đáp án; tăng độ rõ của hình 2D/3D.
- [x] Xuất schema riêng, 15 file JSON mẫu, importer kiểm tra khả năng hoàn thành.
- [x] Đồng bộ Supabase: 15 bài lớp 9 / 90 checkpoint; ba bài cũ nâng version, giữ lịch sử.
- [x] File PROJECT_HANDOVER_ENGINE_CHECKPOINTS.md mô tả trước/sau, cách pull/chạy, giới hạn và lộ trình.
- [ ] Phủ 21 dạng curriculum còn thiếu; hợp nhất 10 chủ đề legacy; nghiệm thu Android hosted và ANR bài bi.

- [x] Chốt kiểm thử: build, 88 TS/SQL tests, 38 browser tests, 48 Flutter tests và analyze PASS; chuẩn bị branch first-version-v2 theo yêu cầu push.

- [x] Tạo SPEC_TOAN9_CMS_ENGINE_FLOW6.md cho phiên sau: flow 6 checkpoint bất biến, hình theo dữ kiện, ma trận 15 công cụ/24 dạng, form admin alphabet + chú thích tiếng Việt, không lộ LaTeX.

- [x] Hợp nhất hai bản thiết kế thành SPEC_TOAN9_CMS_ENGINE_FLOW6.md; bổ sung đối chiếu mã Excel/Markdown, ví dụ đề và gợi ý 2 tầng; bản nguồn backup local.
