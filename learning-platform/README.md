# Mở Học — nền tảng học qua thao tác

React Lesson Studio + Flutter learner. Mười hai dạng tương tác nhận bài khai báo bằng JSON, giữ scene xuyên suốt checkpoint, đo thao tác và đánh giá kết quả toán học.

## Chạy bản local

Từ thư mục `learning-platform/`:

```powershell
npm ci
# Chỉ khi chưa có .env.local: Copy-Item .env.example .env.local
# Điền VITE_SUPABASE_URL và VITE_SUPABASE_PUBLISHABLE_KEY trong .env.local
npm run dev
```

- Studio: http://127.0.0.1:5173/admin/studio
- Trang học: http://127.0.0.1:5173/
- API phát triển chỉ bật khi đặt `VITE_ENABLE_LOCAL_DEMO=true` (PowerShell: `$env:VITE_ENABLE_LOCAL_DEMO="true"; npm run dev`). Workspace mới rỗng, không tự tạo bài mẫu.

Ở terminal khác:

```powershell
cd apps/mobile
flutter pub get
flutter run -d emulator-5554 --dart-define-from-file=../../.local/supabase.mobile.json
```

Flutter cần Supabase và đăng nhập để tải catalog; không có catalog mẫu dự phòng. Kéo xuống để tải lại sau khi xuất bản. Các fixture dùng cho kiểm thử thiết bị nằm riêng trong `integration_test/`, không đóng gói trong bản app thông thường.

## Luồng tạo và học

1. Mở Smart Studio, chọn khuôn hoặc nạp/paste JSON từ `contracts/problems/`.
2. Sửa dữ kiện trong biểu mẫu hoặc JSON. Đáp án nhập sẵn phải đúng với dữ kiện.
3. Chọn **Dựng bài & tự chọn engine**. Bộ định tuyến chọn engine theo loại nội dung và capabilities; không dựa vào tên bài.
4. **Preview điện thoại** chạy bài thật trong khung 360/390/430 px. Thao tác để mở checkpoint; canvas giữ identity.
5. **Tinh chỉnh checkpoint** để sửa hướng dẫn, gợi ý, phản hồi, điều kiện bằng form; chỉnh tọa độ, undo/redo; JSON nâng cao là tùy chọn.
6. Lưu draft hoặc xuất bản phiên bản bất biến. App Android tải phiên bản đó qua Supabase.
7. Học bằng kéo/ghép/thay đổi tham số, xem phản hồi, tiếp tục, thoát và mở lại để phục hồi tiến độ.

## Khuôn JSON

`contracts/problem.schema.json` là schema đầu vào; `contracts/lesson.schema.json` là manifest đầu ra cho runtime. Ví dụ:

```json
{
  "formatVersion": "1.0.0",
  "id": "equation-3x-plus-2",
  "title": "Giữ hai vế cân bằng",
  "grade": 8,
  "problem": {
    "type": "linear_equation",
    "statement": "Tìm x để 3x + 2 = 17.",
    "given": {"a": 3, "b": 2, "c": 17},
    "answer": {"x": 5}
  }
}
```

Đổi số trong `given` và đáp án tương ứng để tạo bài mới. Biểu mẫu tự tính lại đáp án khi đổi dữ kiện. Cùng `id` cập nhật bài và tạo phiên bản mới khi xuất bản; đổi `id` để tạo bài riêng.

| `problem.type` | Engine được chọn | Tương tác |
|---|---|---|
| `number_line` | `number_line_2d` | kéo chấm, tìm vị trí/số đối |
| `fraction` | `fraction_bar_2d` | tô phần, chia thanh, phân số bằng nhau |
| `linear_equation` | `algebra_balance_2d` | thay đổi x, quan sát cân, tìm nghiệm |
| `quadratic_graph` | `function_plot_2d` | điều chỉnh a/b/c, khớp và tịnh tiến đồ thị |
| `triangle_angles` | `geometry_2d` | kéo đỉnh, đo góc, ghép góc bẹt |
| `prism_volume` | `geometry_3d_web` | xoay 3D, chọn mặt, xếp lớp và đo thể tích |

Đây là sáu dạng đã triển khai và kiểm thử, chưa phải toàn bộ chương trình Toán 6–9. Trục số/x hỗ trợ [-10,10], phân số mẫu ≤12, hệ số đồ thị [-10,10], khối hộp kích thước nguyên 1–10. Khuôn ngoài khả năng được báo lỗi, không chuyển thành câu hỏi trắc nghiệm.

## Dữ liệu local

Vite dev server cung cấp API **chỉ cho việc phát triển trên máy**, không có đăng nhập. Draft, phiên bản, tiến độ và audit nằm trong `.local/workspace.json` (gitignored). Workspace mới bắt đầu rỗng; không seed hoặc khôi phục bài mẫu. Web không dùng catalog/draft cũ trong localStorage. Không đưa API dev này lên Internet. Bản build tĩnh không chứa API; cần Supabase hoặc chạy dev server để đồng bộ app.

Supabase thật đã triển khai ngày 2026-11-13: project `sbzpmrgsqznaydllqmbm`, 7 migration, 18 bảng public và hai Edge Function progress/generate. Catalog khởi đầu rỗng. Cấu hình web nằm trong `.env.local`, cấu hình Flutter trong `.local/supabase.mobile.json` (đều gitignored). Xem [thiết kế database](../docs/architecture/supabase-database-plan.md) và `../docs/architecture/schema-migrations.md` trước rollout. AI tự do từ văn bản cần provider phía server; luồng JSON không cần AI/API key.

## Kiểm tra và tái tạo assets

```powershell
npm run contracts:generate
npm run typecheck
npm test
npm run test:e2e
npm run build
npm run bundle:mobile
npm run bundle:edge
cd apps/mobile
flutter analyze
flutter test
flutter drive --driver=test_driver/integration_test.dart --target=integration_test/acceptance_test.dart -d emulator-5554
flutter drive --driver=test_driver/integration_test.dart --target=integration_test/math_flow_test.dart -d emulator-5554
```

Ảnh, logs và kết quả: `../docs/qa/`. Node 24.14.0, Flutter 3.47.4/Dart 3.13.3 được dùng trong phiên kiểm thử.


## Supabase đang triển khai

- [Báo cáo triển khai](../docs/architecture/supabase-deployment.md), [kiểm tra hosted](../docs/qa/supabase-hosted-smoke.json).
- Mở trang học, chọn Đăng ký với `pvhldd.1@gmail.com`, xác minh email rồi đăng nhập; backend chỉ cấp admin cho email đã xác minh trong danh sách bootstrap private.
- Các tài khoản khác mặc định student. Không có tài khoản/mật khẩu mẫu.
- `.env.local` đã cấu hình project thật trên máy hiện tại. Đừng ghi đè file này khi chạy lại.
- `npm run contracts:generate` tạo SQL xem trước trong `supabase/generated/`; không sửa lịch sử migration đã apply. Thay đổi schema tiếp theo phải tạo migration mới bằng CLI.
- Đã kiểm tra template generation; AI provider tự do chưa cấu hình, không được coi template mode là AI thật.


## Tạo bài trên admin và tự cập nhật mobile

1. Vào Studio, chọn dạng bài, nhập tên và dữ kiện, bấm **Dựng bài & tự chọn engine**.
2. Xem trước nếu cần, sau đó bấm **Tạo & xuất bản lên app**. Lưu nháp chỉ lưu nội dung cho tác giả.
3. Mobile đã đăng nhập và đang có mạng tự cập nhật danh sách bằng Supabase Realtime; không cần kéo làm mới. Khi quay lại app từ nền, catalog tự đồng bộ lại.
4. Gỡ xuất bản tự ẩn bài khỏi catalog. Người đang học vẫn giữ scene/phiên bản bất biến hiện tại.

Realtime chỉ phát revision trong `catalog_state`, không phát draft hoặc manifest tác giả. Nếu WebSocket tạm mất kết nối, app kiểm tra revision mỗi 30 giây khi ở foreground và giữ danh sách cũ khi mạng lỗi.
Kiểm chứng thật và ảnh: `../docs/qa/live-catalog-hosted-results.json`, `admin-live-published.png`, `android-live-published.png`, `android-live-unpublished.png`.
