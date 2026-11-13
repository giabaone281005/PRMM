# Kế hoạch dữ liệu và rollout

> Cập nhật triển khai 2026-11-13: backend thật đã lên Supabase. Trạng thái hiện hành và bằng chứng trong [supabase-deployment.md](supabase-deployment.md); nội dung dưới đây ghi lại kế hoạch ban đầu.


Cập nhật 2026-11-13: xem [thiết kế database chi tiết](supabase-database-plan.md). API local chỉ bật với `VITE_ENABLE_LOCAL_DEMO=true`, workspace mới rỗng và không tự bổ sung fixture. Flutter dùng catalog Supabase; không có fallback bài mẫu.

Theo chỉ dẫn mới nhất, người dùng sẽ thiết lập Supabase sau. Phiên này không thay đổi database remote, không lấy secret/service-role key và không liên kết project chỉ từ tên.

## Bản local đang dùng
Vite dev middleware lưu `.local/workspace.json`. Client web và Android emulator dùng chung catalog published. Save/publish/progress đều đi qua validator/replay phía local server; API này không phải cơ chế phân quyền production.

## Supabase đã chuẩn bị
- Migration do CLI tạo: lesson foundation; schema validator; trusted progress; curriculum/roles.
- RLS cho tất cả bảng public, draft theo owner/admin, published qua invoker RPC/private checked helpers, progress/attempt theo auth.uid().
- Không có quyền client ghi published versions, user_roles hoặc progress trực tiếp. Publish khóa lesson row và ghi version/audit trong transaction; trigger chống update/delete published version.
- Edge progress xác minh bearer qua Auth, đọc manifest được phép, replay gestures và checkpoint, commit idempotent bằng attempt UUID và monotonic revision.
- Edge generate chỉ cho admin/author, job state/rate limit, provider text có bounds, reviewRequired. Provider cấu hình HTTPS LESSON_AI_ENDPOINT + LESSON_AI_KEY phía server; không có key client.

## Trước triển khai thật
1. Xác định project ref và môi trường, kiểm kê schema/grants/extensions/migrations hiện có.
2. Backup schema/data; kiểm tra tên bảng có xung đột. Các migration này dành cho schema mới, không được chạy mù trên database đang có bảng cùng tên.
3. Chạy migration ở development branch/local stack, kiểm tra advisors và RLS bằng các tài khoản thật.
4. Bootstrap admin qua kênh quản trị tin cậy; tuyệt đối không cho client tự cấp vai trò.
5. Deploy các Edge Function đã bundle; kiểm tra server secrets, Auth và storage nếu bổ sung asset.
6. Cấu hình web VITE_SUPABASE_URL/PUBLISHABLE_KEY và Flutter SUPABASE_URL/PUBLISHABLE_KEY. Tắt chế độ API local khi phát hành.
7. Chạy lại publish/readback/progress/isolation trên Supabase thật trước khi nghiệm thu production.

Migrations được thực thi trong PostgreSQL nhúng PGlite để kiểm tra SQL/RLS cơ bản. Điều này không thay thế kiểm tra PostgREST/Auth/Edge live, network và advisors. Chưa xóa hay chuyển dữ liệu production nào.
