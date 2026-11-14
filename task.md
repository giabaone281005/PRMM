# Kế hoạch thực thi

## Ưu tiên mới — 14/11/2026: xây 6 core engines trước

- [x] Chốt lại thứ tự và phạm vi tại [CORE_ENGINE_IMPLEMENTATION_PLAN.md](CORE_ENGINE_IMPLEMENTATION_PLAN.md); thay thứ tự mở rộng cũ.
- [x] ENG-00 — Contract/version, sáu registry entry, coverage 24 mã, schema/gate hai adapter, TS/Dart vectors và rollout decision; PASS 14/11/2026. Tiếp theo ENG-01.
- [ ] ENG-01 — cartesian_graph_engine: phương trình/điểm, hệ hai đường thẳng, parabol, tương giao.
- [ ] ENG-02 — geometry_2d_canvas: tam giác/lượng giác, đường tròn/tiếp tuyến, góc/cung/nội tiếp/đa giác.
- [ ] ENG-03 — balance_scale_engine: tích/hữu tỉ/domain, bậc hai/Δ, Viète.
- [ ] ENG-04 — area_fraction_grid: căn/lưới/lập phương, trụ/nón/cầu, diện tích/thể tích và net hợp lệ.
- [ ] ENG-05 — number_line_engine: khoảng/tia, phép biến đổi/reflection, domain/sign adapters.
- [ ] ENG-06 — data_probability_sim: bảng/cột/quạt đồng bộ, không gian mẫu/biến cố/xác suất/simulation.
- [ ] ENG-07 — tích hợp sáu engine CMS/Flutter/Edge và chốt capability coverage; tích hợp tăng dần sau mỗi engine.
- CP-07/08 biên soạn/chuẩn hóa mẫu chuyển sau ENG-07. Giữ CP-04/05/06 đã làm; CP-02/09/10 vẫn là cổng device/compatibility/release. Không chạy tests tự động theo yêu cầu người dùng.

## Backlog hiện hành — CP-01, 13/11/2026

- Công việc tiếp theo được theo dõi tại [PROJECT_CHECKPOINTS.md](PROJECT_CHECKPOINTS.md). Dùng checkpoint này để xác định ưu tiên, phụ thuộc và tiêu chí nghiệm thu.
- Các phần phía dưới là lịch sử nối tiếp. Checkbox “chưa chọn project/chưa rollout Supabase” ở mốc cũ đã được phần “Supabase thật” và các cập nhật sau thay thế; không còn là blocker hiện hành.
- Phạm vi hiện tại là Toán 9. Yêu cầu thiết kế chuẩn: [SPEC_TOAN9_CMS_ENGINE_FLOW6.md](SPEC_TOAN9_CMS_ENGINE_FLOW6.md); hiện trạng tính năng: [PROJECT_HANDOVER_ENGINE_CHECKPOINTS.md](PROJECT_HANDOVER_ENGINE_CHECKPOINTS.md).
- [x] CP-01 PASS: chốt commit `f2cee66`, toolchain và nguồn dữ liệu; typecheck/build/bundle mobile/Edge, 88 TS/SQL tests, 38 browser tests, 48 Flutter tests và analyze đạt. Đã phân biệt trạng thái mẫu với nghiệm thu trong ma trận, giữ nguyên 24 mã canonical. Xem [báo cáo và các ca NOT RUN](docs/qa/cp01-20261113/README.md).
- CP-02 vẫn chưa hoàn thành: ANR bài chọn bi và luồng hosted Android → Edge progress phải được nghiệm thu riêng.

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

## CP-03 — Authoring contract và registry — 13/11/2026
- [x] Schema JSON đề riêng, namespace canonical, schema theo template/mode, variants bước 5/6 và content slots giới hạn; không nhận checkpoint/answer/hotspot/code từ input.
- [x] Registry bất biến hai template/mode (hình trụ nhận diện, parabol hệ số), sáu nhiệm vụ cố định, metadata form, validate toán và compiler interface.
- [x] Receipt authoring tách manifest; chốt sidecar immutable theo published version/hash và không recompile manifest/progress cũ. Quyết định: docs/architecture/authoring-contract.md.
- [x] 66 tests mới gồm 15 manifest legacy chạy/resume; tổng 154 TS/SQL tests, typecheck và build PASS. Evidence: docs/qa/cp03-20261113/README.md.
- [ ] CP-04/05: compiler dựng hình thực tế (registry đang pending); CP-06: UI và persistence sidecar giao dịch. Android/hosted tiếp tục theo CP-02, chưa nghiệm thu trong CP-03.

## CP-04 — Hình trụ theo dữ kiện — 13/11/2026
- [x] Compiler nhận diện hình trụ sáu bước, parameters/variants/đơn vị, hình và nhãn cùng mô hình; registry implemented-local.
- [x] Geometry/raycast/camera/fallback theo dữ kiện; giữ canvas và orientation; TS/Dart evaluator đồng nhất; migration runtime contract local, không đổi bài cũ.
- [x] Ba JSON đề mẫu và selector tại Công cụ tương tác hiện có; bundle mobile mới.
- [ ] Người dùng tự nghiệm thu Android/WebGL/fallback và UI cuối. Đã dừng test theo yêu cầu. Trước khi dừng: 162 TS/SQL, 6 browser, 3 Dart parity PASS. Hosted rollout chưa làm; không publish dữ liệu mới. Evidence/cách tự test: docs/qa/cp04-20261113/README.md.

## CP-05 — Parabol theo dữ kiện — 13/11/2026
- [x] Chốt phạm vi trước triển khai: math9-parabola-coefficient@1, M9-ALG-09, y = ax²; a nguyên −5…5 khác 0. Không làm tam giác vuông/biệt thức trong CP-05.
- [x] Compiler sáu nhiệm vụ, ba JSON đề và variants; mô hình chung sinh đồ thị/điểm/nhãn/đáp án/viewport; SVG và ID đối tượng giữ liên tục, vùng chọn theo path/toạ độ chiếu.
- [x] TS/Dart evaluator đồng nhất về implementation; chuẩn bị test hai phía và vector chung, không chạy tests theo yêu cầu người dùng.
- [x] Chọn ba mẫu tại Parabol động trong trang Công cụ tương tác; sinh manifest và build web/bundle mobile/Edge PASS.
- [ ] Người dùng tự nghiệm thu web/Android/restore, kiểm đủ sáu bước và parity. Migration/Edge chưa deploy; không sửa published/progress cũ. Report: docs/qa/cp05-20261113/README.md.

## CP-06 — Form Studio và AI JSON — 13/11/2026
- [x] Form metadata cho hình trụ/parabol, nhãn/ký hiệu/help/ví dụ/đơn vị/giới hạn, computed read-only; flow cố định, preview/highlight, diff và cảnh báo chưa lưu.
- [x] Export schema/sample/AI bundle/input; import validate schema/toán/compile/reachability, review rồi chọn cập nhật draft hoặc tạo biến thể ID mới. Không tự publish; full manifest/legacy nằm phần nâng cao.
- [x] Persistence local + Edge authoring/RPC server-only: compile lại input, revision chống ghi đè, receipt riêng gắn published version/hash, RLS/immutable guard; clone/restore đúng source từ lịch sử.
- [x] Build web TypeScript + Vite và bundle mobile/Edge PASS; không chạy tests theo yêu cầu người dùng.
- [ ] Nghiệm thu round-trip, reload/concurrency/RLS/local/hosted/Android do người dùng tự test. Migration và authoring Edge chưa apply/deploy remote. Report: docs/qa/cp06-20261113/README.md.

## 14/11/2026 — Sửa publish authoring trên Supabase
- [x] Chẩn đoán log 404 sidecar và CORS preflight: backend CP-04/05/06 chưa rollout.
- [x] Xác minh project sbzpmrgsqznaydllqmbm, lưu snapshot catalog/digests trước triển khai; apply ba migration pending, deploy authoring v1 và progress v4.
- [x] OPTIONS authoring trả 200; request không có session trả 401; migration history đủ 12 và không đổi 22 published versions/7 progress trong snapshot.
- [ ] Người dùng tự bấm publish và nghiệm thu round-trip/Android. Không chạy full test suites hoặc tạo/publish dữ liệu thử. Báo cáo: docs/qa/authoring-publish-fix-20261114/README.md.


## ENG-00 và điện thoại thật — 14/11/2026
- [x] Registry/config schema/coverage 24 mã, TS/Dart resolvers, compiler gate và UI trạng thái; giữ runtime v1, v2 planned chưa publish.
- [x] Contract tests TS 12/12, Dart 10/10, web build và Edge bundle PASS.
- [x] Người dùng cho phép tests tự động và kết nối Redmi Note 9S Android 12. Integration U-IME WebView bridge và bundled core registry/schema PASS trên thiết bị thật; không wipe/clear data.
- [ ] ENG-01…06 triển khai các planned modes; chưa nghiệm thu full 24 dạng/hosted/physical gestures cho mọi engine. Evidence: docs/qa/eng00-20261114/README.md.

## ENG-01 — Cartesian graph — 14/11/2026
- [x] Model ax+by=c, hệ hai đường thẳng, extension đường thẳng–parabol; giữ parabol CP-05 và canonical ALG-01/02/09. Schema/form/compiler sáu bước, registry, semantic hit, snap/viewport/drag, evaluator TS/Dart và SQL/Edge đồng bộ.
- [x] Chín lesson fixtures; 208 TS/SQL, 94 Flutter, chín browser cases và chín input × sáu bước trên Redmi Note 9S PASS. Build web/mobile/Edge PASS; analyze còn bốn informational braces lints.
- [x] Apply migration và deploy authoring v2/progress v5 vào project cấu hình; 23 published versions/7 progress cùng digest giữ nguyên. Không publish dữ liệu thử.
- [x] Build/cài lại APK thường trên Redmi và mở MainActivity thành công; không uninstall hoặc clear data.
- [ ] Cổng release: hosted authenticated round-trip, native finger gestures và old-client negotiation. Phạm vi/evidence: docs/qa/eng01-20261114/README.md; quyết định: docs/architecture/cartesian-engine.md. Tiếp theo ENG-02.

## ENG-02 — Geometry 2D G1/G2/G3 — 14/11/2026
- [x] Tám mode/schema riêng và mười template cho GEO-01…10; dựng tam giác vuông/SSS, vai trò cạnh/lượng giác/góc, đường tròn/giao/tiếp xúc/đối xứng, góc/cung/quạt/vành, nội–ngoại tiếp và đa giác từ dữ kiện.
- [x] Dependency graph có thứ tự, semantic ID, constraints compiler-owned, kéo hợp lệ/viewport/hit/layers, state/session liên tục; không nhận independent answers, pixel hotspots hoặc graph ràng buộc tùy ý từ JSON đề.
- [x] 30 fixtures × sáu bước và 46 vectors chung; 290 TS/SQL, 170 Flutter, 33 browser cases PASS, gồm ba Studio export/import/save/publish-v2/reload. Android bridge đã PASS 30 bài; kết quả rerun cuối và restore app thường ghi trong evidence.
- [x] Apply migration 20261113181333; deploy authoring v4/progress v7, remote validator 46/46; counts/digests 23 versions và 7 progress giữ nguyên. Không publish bài thử lên hosted.
- [x] Rerun cuối trên Redmi PASS 30 bài × sáu bước trong 2m31s. Build/cài lại APK thường và mở MainActivity thành công; giữ data/session, không uninstall/clear data.
- [ ] Release gates: authenticated hosted round-trip, native finger gestures đầy đủ, old-client negotiation, teacher review. Analyze còn bốn informational lints có trước ENG-02. Phạm vi: docs/architecture/geometry-engine.md; evidence: docs/qa/eng02-20261114/README.md. Tiếp theo ENG-03.

## ENG-03 — Balance/algebra — 14/11/2026
- [x] Bốn mode/schema riêng cho ALG-03/10/11: phương trình tích, hữu tỉ, hệ số/Δ/nghiệm/hạ bậc và Viète nghiệm thực; AST có cấu trúc và semantic cards/slots trong Studio/player hiện có.
- [x] Giá trị cấm từ mẫu gốc; giữ miền sau khử mẫu, lọc nghiệm ngoại lai; identity/vô nghiệm/tuyến tính/nghiệm kép có xử lý rõ. Kiểm điều kiện chia/nhân và từ chối bình phương bỏ kiểm nghiệm. Số âm là thẻ đại số có dấu, không là khối lượng.
- [x] 18 fixtures sáu bước, 38 vectors AST/toán/domain/card/operation; 354 TS/SQL, 227 Flutter, 22 browser cases (18 learner + 4 Studio version round-trips) và Redmi 18 bài × sáu bước PASS. Replay/restore/backend journal có đối chiếu; build/web/mobile/Edge PASS. Analyze giữ bốn informational lints cũ.
- [x] Apply migration 20261113185213; deploy authoring v6/progress v9, remote vectors 38/38; 23 versions/7 progress giữ nguyên counts/digests. Không publish dữ liệu thử lên hosted.
- [x] Bản UI cuối giữ phân số chính xác khi chuẩn hóa và khóa rõ bình phương ngoài phạm vi; web/device rerun PASS. Đã build/cài lại APK thường và mở MainActivity; không uninstall/clear data.
- [ ] Release gates: hosted authenticated round-trip, native finger drag toàn bộ modes, old-client negotiation, teacher review. Phạm vi: docs/architecture/algebra-engine.md; evidence: docs/qa/eng03-20261114/README.md. Tiếp theo ENG-04.

## Đóng gói source và hướng dẫn admin — 14/11/2026
- [x] Đối chiếu code admin/registry/catalog hiện hành, viết HUONG_DAN_TAO_BAI_HOC_ADMIN.md: 19 template theo dữ kiện, 15 thẻ công cụ và ma trận 24 mã; ví dụ/giới hạn/import/version/legacy rõ ràng.
- [x] README_DONG_GOI.md hướng dẫn máy nhận chạy local/Supabase/Android, nguồn cấu hình riêng và giới hạn source snapshot.
- [x] Tạo releases/MoHoc_source_after_ENG03_20261114.zip: 5.992 files gồm source chưa commit và REA nguyên trạng; loại secrets/.local/dependencies/build/Git. CRC, SHA-256 từng entry, required files và secret scan PASS; kết quả tại file .verification.json cùng tên, manifest nằm trong ZIP.

## Bộ chạy test admin/user — 14/11/2026
- [x] Tạo test-admin.bat và test-user.bat tại root, runner Node dùng chung, cấu hình Playwright chia vai trò và HUONG_DAN_CHAY_TEST.md.
- [x] Chạy thật cả hai entrypoint: typecheck và 354 Vitest PASS mỗi lượt; Playwright admin 11 PASS/16 FAIL, user 82 PASS/3 FAIL. Runner ghi FAIL và exit 1 đúng; kiểm --list từ ngoài workspace PASS; tham số sai trả exit 2.
- [ ] Cập nhật các tests legacy theo giao diện hiện tại: admin acceptance/cms-refresh/creation/curriculum-pilot/math9; user diagnostics và U-IME parabol/hình trụ. Timeout ở locator cũ/controls trong vùng nâng cao đang đóng; không coi các luồng này đã PASS.
- [ ] Flutter --flutter, thiết bị thật và hosted auth/RLS chưa chạy trong lượt này. Báo cáo tại docs/qa/automated/{admin,user}/; xem verification-report.md.

## BAT tự thao tác giao diện — 14/11/2026
- [x] User BAT chuyển sang Android Flutter integration: tự phát hiện/chọn điện thoại hoặc AVD, cài package .uitest riêng với kiểm APK trước install và native identity guard trước storage; thao tác native tap/drag/navigation, restore/completion, profile/activity, triangle.
- [x] Bản user cuối PASS trên Redmi Note 9S Android 12; 14 ảnh và log/summary trong docs/qa/automated/user-device/2026-11-13T20-41-32-846Z-38280. Dart analyze PASS; --list thiết bị/AVD PASS.
- [x] Ghi nhận sự cố lượt đầu cài vào package thường và reset preferences cục bộ; đã dừng, build/cài/launch APK thường lại. Không phục hồi được preferences trước sự cố; đã thêm hai lớp kiểm danh tính APK/app. Không có thao tác dữ liệu hosted.
- [x] Theo lựa chọn người dùng, admin test Gỡ xuất bản thay xóa vĩnh viễn. BAT mặc định mở Chromium và tự tạo/lưu/sửa/xuất bản/kiểm catalog/gỡ/kiểm lịch sử và bản nháp qua UI; sáu chặng PASS, TypeScript PASS; --full giữ bộ legacy riêng.
- [x] Cập nhật HUONG_DAN_CHAY_TEST.md và QA; app thường đã được mở lại sau device test.
- [ ] Còn ngoài phạm vi: hosted auth/RLS/native gestures WebView mọi engine, tự boot/test AVD và cập nhật tests legacy cũ. Không coi các mục này đã PASS.

## Mở rộng hai BAT kiểm toàn bộ nội dung — 14/11/2026
- [x] Admin inventory tự lấy từ code mỗi lượt; 19 template chuẩn + 25 lựa chọn legacy + 3 pilot + kiểm 24 card + CRUD/unpublish = 49 UI cases. Chạy lại toàn bộ 49/49 PASS sau sửa locator preview và điều kiện catalog không còn giả định rỗng.
- [x] Đọc 19 published manifests thật từ project cấu hình, đóng snapshot kèm source; read-only đối chiếu cuối xác nhận không thay đổi. Default user kiểm toàn catalog, có optional live refresh bằng env credentials, không còn default năm fixture.
- [x] Android input host ADB và catalog UI suite: mỗi bài/version, toàn checkpoint, restore/completion, artifact/inventory/hash và không cho thiếu kết quả vẫn PASS. Test-only package .uitest, preflight APK/native identity vẫn giữ.
- [x] Lượt tổng AVD: 18 bài/108 checkpoint PASS, geometry lỗi assertion góc camera. Kiểm lại geometry sau sửa dung sai camera PASS 6/6. Coverage đã xác minh 19/19 bài, 114/114 checkpoint qua hai lượt, có SHA/version matching; báo cáo tổng hợp catalog-coverage-final-20261114.json, giữ FAIL lượt gốc.
- [x] TypeScript/Node checks và Dart analyze PASS; cập nhật hướng dẫn chi tiết nguồn snapshot/live, lựa chọn thiết bị và thời gian chờ có hạn.
- [ ] Chưa chạy bộ 19 bài trên Redmi do MIUI từ chối USB install; đã dùng Pixel 9 AVD. Chưa có một lượt sạch toàn bộ 19 sau sửa assertion; chưa chạy live refresh bằng credentials, hosted auth/RLS/progress và nội dung/renderer ngoài snapshot.

## Redmi sau khi người dùng cho phép cài — 14/11/2026
- [x] Chạy bộ 19 bài trên điện thoại thật. Lượt tổng 18 PASS, geometry gặp lỗi nhập thập phân 0.8 → 8 ở checkpoint 3.
- [x] Sửa input UI GeometryScene giữ buffer trong khi nhập, commit khi blur/Enter/xác nhận; bundle mobile lại. Không thay bộ đánh giá, dữ liệu published hoặc schema.
- [x] Kiểm lại geometry trên Redmi PASS đủ 6 checkpoint. Coverage qua hai lượt 19/19 bài, 114/114 checkpoint, cùng version/hash; evidence redmi-coverage-final-20261114.json.
- [x] 30 geometry browser cases + regression gõ thập phân tuần tự PASS (qua hai lượt), TypeScript/mobile bundle PASS; APK thường không bị clear/uninstall.
- [ ] Chưa có một lượt sạch cả 19 bài sau UI fix; chưa cài APK app thường mới hoặc deploy hosted; live-refresh/auth/RLS/progress chưa kiểm trong lượt này.
