# Mobile: bố cục gọn và hoạt động học

Yêu cầu: chữ lớn hơn, ba tab Home/Bài học/Hồ sơ, bài học hiển thị icon thay ảnh lớn, tiến độ và lịch hoạt động kiểu GitHub.

## Đã thay đổi
- Home: tiếp tục học, thống kê ngắn và lưới icon. Bài học: lọc lớp và lưới 3 cột (2 cột trên màn hình hẹp). Nhãn ngắn, tên bài đầy đủ trong tooltip/semantics.
- Chữ giao diện chính 16–18sp, hướng dẫn bài 24sp, hint/phản hồi 15–16sp; bỏ đoạn giới thiệu lặp lại và các card minh họa lớn.
- Hồ sơ: tên có thể sửa, định danh tài khoản hiện tại, số bài hoàn thành, tiến độ checkpoint, thời gian học và chuỗi ngày.
- Heatmap 20 tuần và timeline lấy từ checkpoint/completion thực tế. Không thêm hoạt động giả để lấp lịch.
- Thời gian chỉ tính gần thao tác hợp lệ; ngừng khi idle quá 30 giây hoặc app vào nền. Phân bổ đúng ngày khi qua nửa đêm. Event milestone theo lesson/version/checkpoint không đếm trùng khi chơi lại.
- Activity và tên hiển thị lưu trên thiết bị theo user/local account. Chưa đồng bộ lịch hoạt động qua Supabase (vẫn hoãn theo yêu cầu trước).

## Kiểm chứng
- PASS: flutter analyze, không issue.
- PASS: 11 Flutter tests, bao gồm idle/background time, ranh giới ngày, streak, idempotency và cách ly account.
- PASS: widget layout 320px và system text scale 135%, không overflow.
- PASS: Android integration mở ba tab, học bài bằng thao tác, hoàn thành, kiểm tra activity/chuỗi ngày và chụp ảnh.
- Đã xem ảnh Home, Bài học và Hồ sơ; chi tiết tại mobile-redesign-*.png. Log: mobile-redesign-integration.log.

Lỗi phát hiện khi kiểm tra: hàng tiêu đề và ô icon tràn khi tăng text scale, và reload trả Future trong setState. Đã sửa layout co giãn và callback đồng bộ; các kiểm tra trên đã qua.
