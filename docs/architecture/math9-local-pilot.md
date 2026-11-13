# Thư viện Toán 9 local

Nguồn: `Chuong_Trinh_Toan_9_Nhan_Biet_CMS_Engines.xlsx` ở workspace root. Đã đọc 3 sheet: tổng quan sáu nhóm engine; 24 dạng bài (11 đại số, 11 hình học, 2 thống kê/xác suất); các payload ví dụ CMS. Sheet 3 chứa ví dụ JSON, không phải JSON Schema để validate. Dữ liệu 24 dòng được giữ tại `learning-platform/contracts/math9-curriculum.json`.

Tài liệu Excel dùng 4 slide; bản thử theo yêu cầu hội thoại dùng 6 checkpoint. Sáu tên nhóm trong Excel là thiết kế đích, không đồng nhất với mã runtime hiện có.

Chạy `npm run dev:local` trong learning-platform, mở http://127.0.0.1:5180/admin/lessons. Chế độ local vô hiệu hóa Supabase client dù máy có credentials; không sửa file env. API local lưu dữ liệu vào `.local/workspace.json`. Không triển khai remote.

Danh mục có đủ 24 dòng nguồn. Ba mẫu chạy được: M9-ALG-05 bất phương trình; M9-ALG-09 parabol; M9-STP-02 biến cố/xác suất. Mỗi mẫu có 6 checkpoint, dùng tương tác runtime hiện có. 21 dòng còn lại ghi rõ chưa có mẫu; chưa triển khai toàn bộ cơ chế của sáu core engines theo Excel.

Mở mẫu → tải bộ JSON cho AI (hướng dẫn + schema + bài mẫu) → AI trả JSON bài học → nạp file hoặc dán JSON → kiểm tra → học thử → lưu nháp hoặc xuất bản local. Import tạo ID mới để tránh ghi đè bài gốc. Schema giới hạn 6 bước; importer kiểm tra contract, số bước và đồng bộ câu hỏi/giải thích. Không chứng minh mọi nội dung toán do AI sinh là đúng; người soạn phải duyệt. Không gọi AI provider tự động.

Các mẫu này là thử nghiệm nội dung và luồng biên soạn, chưa phải nghiệm thu toàn chương trình hoặc native Flutter. Gợi ý hiện có thể chứa quy tắc/đáp án; chưa đo lường hiệu quả học tập hay khả năng nhận biết độc lập.

## Tích hợp vào dashboard hiện có
Đã bỏ khối CurriculumPilot riêng khỏi Bài học. Danh mục ở Công cụ tương tác và bộ chọn mẫu trong Studio; chọn mẫu gọi editor hiện có. JSON AI import/export nằm trong toolbar Studio, dùng chung lưu nháp, preview, publish và danh sách bài. Có thể dùng cùng giao diện ở chế độ Supabase; trong lượt sửa này chỉ kiểm tra local, không ghi remote. Studio đồng bộ câu hỏi/phản hồi với recognition và cho chỉnh cấu hình Uime ngay tại checkpoint.
Luồng mới: Công cụ tương tác → Chương trình Toán 9 → Dùng mẫu trong Studio → Tải bộ JSON cho AI / Nạp bài từ AI → Lưu bản nháp / Xuất bản.


## Trạng thái cuối lượt
Mẫu công cụ nay có 15 bài / 90 checkpoint, schema riêng và 15 file JSON trong contracts/engine-templates; đã đồng bộ Supabase. Prototype local vẫn có thể chạy riêng nhưng dashboard 5180 hiện dùng Supabase. Đọc PROJECT_HANDOVER_ENGINE_CHECKPOINTS.md ở workspace root cho số liệu và giới hạn mới nhất.
