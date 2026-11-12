# Mở Học — nền tảng học qua thao tác

React Lesson Studio + Flutter learner. Sáu engine nhận bài khai báo bằng JSON, giữ scene xuyên suốt checkpoint, đo thao tác và đánh giá kết quả toán học.

## Chạy bản local

Từ `D:\PRMM\learning-platform`:

```powershell
npm ci
npm run dev
```

- Studio: http://127.0.0.1:5173/admin/studio
- Trang học: http://127.0.0.1:5173/
- API local và nội dung đã xuất bản: http://127.0.0.1:5173/api/catalog

Ở terminal khác:

```powershell
cd apps/mobile
flutter pub get
flutter run -d emulator-5554 --dart-define=LOCAL_API_URL=http://10.0.2.2:5173/api
```

Emulator Android dùng `10.0.2.2` để truy cập máy tính. Bật web server trong lúc thử. App có các bài mẫu bundled khi server không hoạt động. Kéo xuống trang khám phá để tải bài mới sau khi xuất bản.

## Luồng tạo và học

1. Mở Smart Studio, chọn khuôn hoặc nạp/paste JSON từ `contracts/problems/`.
2. Sửa dữ kiện trong biểu mẫu hoặc JSON. Đáp án nhập sẵn phải đúng với dữ kiện.
3. Chọn **Dựng bài & tự chọn engine**. Bộ định tuyến chọn engine theo loại nội dung và capabilities; không dựa vào tên bài.
4. **Preview điện thoại** chạy bài thật trong khung 360/390/430 px. Thao tác để mở checkpoint; canvas giữ identity.
5. **Tinh chỉnh checkpoint** để sửa hướng dẫn, gợi ý, phản hồi, điều kiện bằng form; chỉnh tọa độ, undo/redo; JSON nâng cao là tùy chọn.
6. Lưu draft hoặc xuất bản phiên bản bất biến. App Android tải phiên bản đó qua API local.
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

Vite dev server cung cấp API **chỉ cho việc phát triển trên máy**, không có đăng nhập. Draft, phiên bản, tiến độ và audit nằm trong `.local/workspace.json` (gitignored). Không đưa API dev này lên Internet. Bản build tĩnh không chứa API; cần Supabase hoặc chạy dev server để đồng bộ app.

Supabase được hoãn theo yêu cầu của người dùng. Migration, RLS, client adapter và Edge Function đã chuẩn bị trong `supabase/`; chưa triển khai remote. Đọc `../docs/architecture/schema-migrations.md` trước rollout. AI tự do từ văn bản cần provider phía server; luồng JSON không cần AI/API key.

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
