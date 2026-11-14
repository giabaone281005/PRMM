# CP-05 — Phạm vi parabol theo dữ kiện

Chốt trước triển khai ngày 13/11/2026: chọn `math9-parabola-coefficient@1`, mã canonical `M9-ALG-09`, mode `coefficient`, hàm **y = ax²**. Chỉ nhận a nguyên từ −5 đến 5, khác 0, theo schema CP-03. Không làm y = ax² + bx + c, biệt thức, giao điểm hai đồ thị hoặc lát cắt tam giác vuông trong CP-05.

Sáu nhiệm vụ cố định: thay hệ số để khám phá hai hướng mở → gắn dấu hệ số vào đồ thị → dùng điểm dò để so sánh độ lớn hệ số/độ rộng hai đồ thị → dựng đồ thị qua điểm với gợi ý → dựng qua điểm mới không gợi ý trực tiếp → tự dựng và xác nhận qua điểm mới. Bốn bước đầu dùng parameters; bước 5/6 dùng variants.practice/assessment. Điểm, đường cong, nhãn, viewport và đáp án đều tính bằng hàm toán dùng chung. Không nhập đáp án hoặc tọa độ pixel từ JSON đề.

Giữ nguyên session, SVG root, ID đối tượng và miền hoành độ khi chuyển checkpoint. Khi đổi bộ dữ kiện, reset riêng lựa chọn/cờ khám phá và đường cong đang dựng; viewport tung độ có fit xác định cho các đồ thị của bước. Tiến trình vẫn có identity lesson/version hiện tại; không biên dịch lại manifest đã xuất bản.

Theo yêu cầu người dùng từ CP-04: không chạy test tự động; chuẩn bị code, ba JSON đề, test TS/Dart tương ứng và hướng dẫn tự nghiệm thu. Trạng thái acceptance là NOT RUN cho đến khi có kết quả người dùng.
