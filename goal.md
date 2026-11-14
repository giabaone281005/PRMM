# Mục tiêu dự án

Nguồn yêu cầu: [Master spec](BRILLIANT_INTERACTIVE_LEARNING_MASTER_SPEC.md).
Yêu cầu bổ sung: tham khảo giao diện https://brilliant.org/; dùng thiết kế và nội dung tiếng Việt riêng.

Xây dựng nền tảng Toán lớp 6–9: React Admin/Smart Lesson Studio, Flutter learner,
Supabase Auth/Postgres/RLS; một bài = một scene liên tục + nhiều checkpoint.

## Điều kiện hoàn tất
- CMS tạo/sửa/lưu/preview/validate/publish/unpublish/version/assign bài học.
- Flutter đọc published manifest, có thao tác 2D/3D thực và phục hồi tiến độ.
- JSON Schema và fixtures dùng chung, TS/Dart thống nhất đánh giá checkpoint.
- Hai bài nghiệm thu: tổng góc tam giác lớp 7; thể tích lăng trụ lớp 8.
- Phân quyền tại backend, published version bất biến, tiến độ riêng từng học sinh.
- Kiểm thử contract, browser, Flutter/device, SQL/RLS; bằng chứng ở docs/qa.
- Không coi chế độ local, bản demo hoặc kiểm thử chưa chạy là hoàn thành production.

## Phạm vi và hiện trạng
Audit xác nhận REA là công cụ reverse engineering, không phải ứng dụng học tập.
Dự án mới ở `learning-platform/`; không sửa hay thay thế REA.
Người dùng đã điều chỉnh ưu tiên: hoàn thiện bản local để thử trước, tự thiết lập Supabase sau.
Luồng trọng tâm: khuôn nội dung JSON → tự chọn một trong 12 engine → dựng scene/checkpoint → preview màn hình điện thoại → xuất bản → học tương tác trên Android emulator.
Web và emulator dùng chung API local để bài vừa tạo xuất hiện ngay trong app (kéo xuống để refresh catalog).
AI provider không cần cho luồng JSON; AI từ đề văn bản tùy ý và rollout Supabase thuộc giai đoạn sau.

Theo dõi thực thi: [task.md](task.md). Trạng thái: bản local sẵn sàng người dùng kiểm thử. Báo cáo: [verification-report](docs/qa/verification-report.md). Các hạng mục production được hoãn rõ ràng, không tính là đã hoàn tất.


## Ưu tiên hiện hành — 14/11/2026

Xây đủ năng lực sáu core engine canonical cho 24 dạng Toán 9 trước khi mở rộng ngân hàng template/bài học. Thực thi ENG-00…ENG-07 theo CORE_ENGINE_IMPLEMENTATION_PLAN.md, tái sử dụng CP-03…06, giữ published/progress legacy. Các mục tiêu lớp 6–9 và rollout local-only ở phần lịch sử trên không phải ưu tiên thực thi hiện tại; backend authoring đã được triển khai lên Supabase. Người dùng tự nghiệm thu, không tự chạy full test suites.
