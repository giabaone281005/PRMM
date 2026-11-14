# Sửa lỗi publish authoring — 14/11/2026

Người dùng gửi ba log browser: hai bảng `lesson_authoring_drafts`/`lesson_authoring_revisions` trả 404; `OPTIONS /functions/v1/authoring` không trả HTTP thành công nên browser chặn CORS. Nguồn gốc là backend CP-04/05/06 chưa rollout, không phải dữ kiện đề.

## Đã xử lý

- Xác minh target qua `supabase/.temp/project-ref`, URL trong log và connector project: `sbzpmrgsqznaydllqmbm`.
- Remote ban đầu chỉ có 9 migration cũ và hai functions progress/generate; thiếu cả sidecar và function authoring.
- Lưu snapshot schema/functions/policies và digest dữ liệu vào `.local/deployment/pre-authoring-snapshot.json` (ignored, không đưa dữ liệu private vào repo). `pg_dump` không chạy vì Docker engine không sẵn; đây là snapshot qua catalog SQL, không phải bản pg_dump đầy đủ.
- CLI dry-run chỉ ra đúng ba migration pending, không seed/roles/vault. Đã áp dụng `20261113160543_cylinder_runtime_contract.sql`, `20261113162509_parabola_runtime_contract.sql`, `20261113163650_authoring_provenance.sql` bằng `db push --remote=sbzpmrgsqznaydllqmbm --skip-vault --yes`. Log: [migrations.log](migrations.log).
- Deploy `authoring` v1 và cập nhật `progress` v4 bằng Supabase connector. Giữ verify_jwt=false theo cấu hình: từng handler tự xác thực bearer qua Auth trước thao tác; preflight không cần session. Không thay function generate hoặc Auth configuration.

## Xác minh hẹp sau sửa

- PASS: hai bảng sidecar tồn tại, đủ 12 migration; dry-run sau apply báo upToDate=true.
- PASS: OPTIONS từ origin `http://127.0.0.1:5173`, method POST, các header authorization/apikey/content-type/x-client-info trả 200, allow-origin `*`, đúng allow-headers. POST không có session trả 401 Unauthorized: function đã boot và giữ chặn xác thực.
- PASS: snapshot ngay trước apply có **22 versions / 7 progress**. Digest versions `33e27c7c3a9f05a3403579e932efcfd5`, progress `0c4139362dc2e9fdf2c8e75d4b332b8e` giữ nguyên sau rollout. Lần kiểm kê sớm hơn có 21 versions; có một version được thêm trước thời điểm snapshot, không phải do migration.
- Sidecar hiện chưa có row: chưa tự tạo/publish một bài thử hoặc dùng session của người dùng. Chưa xác nhận end-to-end click publish qua browser; người dùng tiếp tục tự test như yêu cầu trước đó.
- Security advisors trước/sau chỉ có cảnh báo Auth leaked-password protection đã có; không sửa Auth settings trong phạm vi này. Không có cảnh báo RLS mới cho sidecar.
- NOT RUN: full TS/Dart/browser/Android suites. Không đánh dấu hoàn thành acceptance CP-04/05/06 chỉ từ rollout.

Người dùng có thể bấm publish lại với JSON đề hiện tại; không cần thay số hoặc chuyển sang local demo. Nếu trang còn lỗi cũ, tải lại trang rồi thực hiện lại. Luồng lưu/publish sẽ đi qua authoring function đã triển khai.
