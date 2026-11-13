# Triển khai Supabase — 2026-11-13

Backend đã triển khai lên project `sbzpmrgsqznaydllqmbm` ở Sydney (`ap-southeast-2`).
API: `https://sbzpmrgsqznaydllqmbm.supabase.co`.
[Mở dashboard](https://supabase.com/dashboard/project/sbzpmrgsqznaydllqmbm).

## Kết quả

- Sáu migration đã apply; phiên bản local và remote khớp qua `supabase migration list --remote`.
- 17 bảng public, cả 17 đều bật RLS. Bảng cấu hình bootstrap admin nằm trong schema private.
- Hai Edge Function `progress` và `generate` ở trạng thái ACTIVE, version 1.
- Catalog không chứa bài mẫu. Sau kiểm thử đã dọn đúng tài khoản/dữ liệu của lần smoke test;
  readback xác nhận 0 user, lesson, version, session, request và job thử nghiệm.
- Trigger chống sửa/xóa published version đã được xác nhận vẫn bật sau cleanup.
- Security và health advisors: không có findings. Performance chỉ còn INFO về các
  index chưa được dùng trên database mới, không còn cảnh báo policy trùng hoặc FK thiếu index.

## Tài khoản quản trị đầu tiên

Tài khoản `pvhldd.1@gmail.com` đã xác minh email và đã được cấp quyền admin theo yêu cầu chủ dự án. Quyền đã được đọc lại từ Supabase và thao tác được ghi trong audit_logs. Email cấu hình nhầm trước đó đã được gỡ khỏi bootstrap allowlist; không xóa tài khoản của email đó.

Mở [trang quản trị](http://127.0.0.1:5173/admin), đăng nhập bằng tài khoản này hoặc tải lại trang nếu đang đăng nhập. Không có mật khẩu mặc định.

Auth site URL là `http://127.0.0.1:5173`; redirect allowlist gồm localhost và 127.0.0.1
ở cổng 5173. Email confirmation vẫn bật. Khi đưa web lên một domain công khai,
cập nhật Auth URLs theo domain đó; phiên này triển khai backend, chưa host website.

## Client và API

- `.env.local` đã chứa URL/publishable key và tắt API demo trên máy hiện tại.
- `.local/supabase.mobile.json` chứa hai giá trị public để build Flutter bằng
  `--dart-define-from-file=../../.local/supabase.mobile.json` từ `apps/mobile/`.
  Các file cấu hình máy và CLI `.temp/` được gitignore. Không lấy hoặc đưa service-role key vào client.
- React đăng ký/đăng nhập qua Auth, đọc progress từ server khi tải catalog,
  lưu yêu cầu dạng toán vào `engine_requests`; giao bài dùng ignoreDuplicates.
- Flutter đọc/cập nhật profile, tải progress server, đọc thống kê từ `my_study_activity`.
  Khoảng hoạt động học có ID bền vững trong outbox theo tài khoản; retry cùng payload
  không cộng thời gian hai lần. Server hợp nhất khoảng trùng giữa thiết bị và chia ngày theo timezone.
- Mobile refresh access token trong phiên và xóa thông tin tài khoản khi logout.
  Chưa lưu refresh token bền vững trong kho bảo mật thiết bị; mở lại app cần đăng nhập.
- `progress` xác minh bearer bằng Auth, replay journal rồi commit bằng service-role
  phía server. Database kiểm tra revision và attempt identity, sinh milestones một lần.
  Người có progress được tiếp tục version cũ sau unpublish.
- `generate` xác minh Auth và role author/admin, tạo job ở trạng thái review.
  Chưa cấu hình AI provider; kiểm thử thành công ở template mode.
- Gateway `verify_jwt=false` vì từng function tự xác minh bearer với `/auth/v1/user`.
  Đã xác nhận request không đăng nhập bị 401 và student bị cấm generate. CORS cho phép
  header x-client-info của supabase-js; cấu hình deploy được lưu trong config.toml.

## Kiểm chứng

- PASS: 52 TypeScript/SQL tests; 20 Playwright tests chạy một lượt với API local riêng,
  cấu hình test ghi đè URL/key thành rỗng để không ghi nhầm vào Supabase thật.
- PASS: 9 nhóm kiểm tra hosted với 5 tài khoản Auth tạm: admin, 2 author, 2 student.
  [Kết quả HTTP/Edge/PostgREST](../qa/supabase-hosted-smoke.json).
- PASS: Flutter analyze, 14 Flutter tests, build APK debug với cấu hình Supabase thật.
  Kiểm tra ZIP APK xác nhận không chứa fixture/evaluation/scenario JSON.
- PASS: production web build, Edge bundles, kiểm tra form đăng ký trên web cấu hình thật.
  [Ảnh form đăng ký](../qa/supabase-signup.png).
- NOT RUN: thao tác học end-to-end trên Android với tài khoản người dùng thật, iOS,
  AI provider, gửi/xác nhận email của chủ tài khoản và production frontend hosting.

Các mốc checkpoint trong timeline dùng thời gian server xác nhận. Thời gian học là
telemetry của thiết bị, không được coi là chứng nhận chống gian lận.

## Lịch sử và vận hành

| Version UTC | Migration |
|---|---|
| 20261112171824 | lesson_platform |
| 20261112171827 | contract_validation |
| 20261112171829 | trusted_progress |
| 20261112171831 | curriculum_and_roles |
| 20261112171834 | production_data_services |
| 20261112172024 | policy_and_index_hardening |

Bốn bootstrap migration giữ nguyên SQL, đổi tên timestamp cho khớp lịch sử do MCP cấp.
Không chạy lại bootstrap hoặc sửa file đã apply. Dùng `supabase migration new` cho
thay đổi tiếp theo. Generator contract chỉ xuất SQL xem trước vào `supabase/generated/`.

Preflight snapshot schema/config và kết quả chi tiết nằm trong `.local/deployment/`;
database ban đầu không có dữ liệu ứng dụng, tài khoản hoặc bucket cần di chuyển.
Không có thao tác xóa dữ liệu người dùng có sẵn. Cleanup chỉ nhắm UUID/lesson ID của
lần smoke test, trong transaction; không dùng TRUNCATE hoặc reset database.

Asset buckets và taxonomy nâng cao được giữ cho giai đoạn sau theo kế hoạch đã duyệt.
Giữ các index mới và theo dõi khi có lưu lượng thực; [giải thích INFO unused index](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).


## Cập nhật catalog Realtime — 2026-11-13

Đã apply migration thứ 7 `20261112182103_live_published_catalog`: hiện 18 bảng public. `catalog_state` chứa một revision toàn cục, chỉ authenticated đọc, trigger nội bộ tăng revision khi publish/unpublish; không phát dữ liệu nháp. Đây là bảng duy nhất trong publication supabase_realtime. Mobile dùng realtime_client 2.13.2, subscribe khi đăng nhập/foreground và tự bắt kịp khi resume; fallback revision mỗi 30 giây. Lưu draft không xuất hiện trên learner.

Luồng admin thực đã kiểm tra tới emulator: save draft → publish từ UI → card xuất hiện → mở bài native → unpublish từ UI → card tự biến mất. Dữ liệu test đã dọn và bài có sẵn của người dùng được bảo toàn. Xem ../qa/live-catalog-hosted-results.json và các ảnh android-live-*.png.
