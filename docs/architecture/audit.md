# Audit — 2026-11-12

## Nguồn và kiểm kê
- Root D:\PRMM ban đầu chỉ có master spec và rea-main.
- rea-main/package.json: rea-agents 6.7.0, công cụ reverse engineering, không có React CMS/Flutter learner/Supabase của sản phẩm yêu cầu.
- REA skill thực: C:/Users/kzrok/.agents/skills/reverse-engineer-anything/SKILL.md; đã đọc. Scope loại trừ ordinary source repository analysis. Không gọi REA runtime hoặc sửa skill toàn cục.
- Không có lesson routes, manifests, migrations, env project identity hoặc trang học bị lỗi để tái hiện. Không thể kết luận một lỗi tải bài học có sẵn.
- Node 24.14.0, npm 11.9.0; Flutter 3.47.4/Dart 3.13.3; Android emulator-5554 API35 sẵn.
- Docker và Supabase CLI không có trên PATH ban đầu.
- Connector liệt kê một Supabase project; chưa có bằng chứng project đó thuộc nền tảng này. Đã hỏi database đích, chưa thực hiện thay đổi remote.

## Quyết định
Sau audit, tạo learning-platform thay vì đưa ứng dụng vào công cụ REA không liên quan.
Thêm sister skill trong workspace, giữ REA nguyên trạng.
Contract-first; native Flutter 2D và Three.js 3D dùng cùng semantics. Local preview được ghi rõ là local; không giả lập Supabase thành production.

## Khoảng trống phải xác minh
Project Supabase đích và dữ liệu hiện tại; schema backup trước rollout; provider AI;
curriculum review; iOS/thiết bị vật lý; performance profile trên thiết bị yếu.
Các kiểm chứng chưa chạy phải xuất hiện trong báo cáo QA.
