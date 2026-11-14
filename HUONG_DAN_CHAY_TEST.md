# Hai file BAT tự thao tác giao diện — toàn bộ nội dung hiện có

Nhấp đúp file ở thư mục gốc, hoặc chạy các lệnh dưới đây. Cửa sổ giữ lại kết quả; thêm `--no-pause` để kết thúc ngay trong terminal/CI.

## Admin: tất cả lựa chọn tạo bài

```bat
test-admin.bat
test-admin.bat --headless --no-pause
test-admin.bat --list --no-pause
```

Mặc định mở Chromium thật, chậm 300 ms mỗi thao tác. Bộ chạy tự lấy inventory từ registry/code hiện tại trước mỗi lượt, rồi đối chiếu với dropdown hiển thị. Hiện có **49 ca**:

- **19 form authoring chuẩn:** từng template đều được chọn qua UI, nhập tên, kiểm preview, lưu nháp, reload, xuất bản và kiểm bài trong thư viện sau reload.
- **25 lựa chọn chủ đề trong legacy:** 10 nhóm Toán 9 và 15 mẫu engine. Mỗi lựa chọn được dựng bài, lưu nháp, xuất bản và kiểm thư viện qua UI.
- **3 mẫu chương trình có nút tạo:** ALG-05, ALG-09, STP-02; chọn từ card chương trình, lưu và xuất bản.
- **1 ca kiểm kê:** đủ 24 mã chương trình, số option dropdown, trạng thái nút tạo của từng card.
- **1 luồng sửa/gỡ:** tạo bài → mở bài đã lưu → sửa tên/dữ kiện → reload → xuất bản → kiểm catalog → gỡ xuất bản → kiểm lịch sử/bản nháp và bài đã ẩn khỏi catalog.

24 mã chương trình không đồng nghĩa 24 engine/form chuẩn đã hoàn thiện. Các card chưa có nút tạo được ghi nhận đúng là chưa có mẫu; các nhóm legacy vẫn được kiểm theo chức năng hiện có. `topic-inventory.json` liệt kê mã nào có template chuẩn hoặc pilot. Không gọi gỡ xuất bản là xóa vĩnh viễn.

Toàn bộ thay đổi bài đi qua click/fill/select trên giao diện. Server test dùng workspace trong bộ nhớ, cổng 5181, không đổi `.local/workspace.json`, `.env.local` hoặc bài thật trên Supabase. Đổi cổng bằng biến `PLAYWRIGHT_PORT`. `--full` gọi bộ regression trình duyệt cũ và unit/typecheck; bộ cũ có lỗi legacy lịch sử, không phải mặc định.

Yêu cầu Node.js 24+, npm; lần đầu cần Internet để tự tải dependencies và Chromium. Báo cáo tại `docs/qa/automated/admin/<thời-điểm>/`: log, summary, HTML, results JSON, topic inventory và ảnh từng bài trong artifacts.

## User: tất cả bài đang xuất bản trong catalog

```bat
test-user.bat
test-user.bat --list --no-pause
test-user.bat --device emulator-5554 --no-pause
test-user.bat --device 121ea06b
test-user.bat --emulator Pixel_9
```

Thay ID bằng kết quả `--list`. Có một thiết bị thì tự chọn, nhiều thiết bị thì chọn trong terminal hoặc dùng `--device`. Không có thiết bị sẽ chọn/khởi động AVD có sẵn. `--emulator` khởi động lạnh AVD để tránh snapshot boot bị treo; không wipe dữ liệu AVD. Nếu AVD đã mở, dùng `--device emulator-5554`.

**Mặc định không còn giới hạn ở năm fixture mẫu.** Bộ user nhận toàn bộ manifest của catalog, đăng ký một test riêng cho từng bài/phiên bản và thực hiện tất cả checkpoint. Bản snapshot lấy từ project cấu hình `sbzpmrgsqznaydllqmbm` ngày 14/11/2026 lúc 03:52 (UTC+7) hiện có **19 bài đang xuất bản / 114 checkpoint**. Bài nháp hoặc đã gỡ xuất bản không thuộc catalog của người học.

Nguồn dữ liệu được in trong log và ghi trong `catalog-inventory.json`:

1. Nếu có cả `MOHOC_TEST_EMAIL` và `MOHOC_TEST_PASSWORD` trong môi trường, script đăng nhập bằng cấu hình `.local/supabase.mobile.json`, gọi RPC `published_catalog` để lấy mới toàn bộ bài trước mỗi lượt. Credentials/token không được in log hoặc ghi vào source/APK; phiên đăng nhập mới chỉ được sign out với scope local.
2. Nếu chưa cấp tài khoản để refresh, script dùng cache `.local/ui-catalog.snapshot.json`; khi cache chưa tồn tại, dùng snapshot kèm source `learning-platform/tests/fixtures/published-catalog.snapshot.json`. Đây là bản chụp danh mục có timestamp, không tự nhận là dữ liệu live mới nhất.
3. Có thể chỉ định snapshot khác: `test-user.bat --catalog "tests/fixtures/published-catalog.snapshot.json"`. Đường dẫn tương đối tính từ `learning-platform/`; cấu trúc JSON gồm `source` và `lessons` (mảng manifest).

Các bước được kiểm cho **từng bài**:

- Mở tab danh sách bài và chọn đúng lesson ID qua giao diện app.
- Chạm/kéo các controls hiển thị để giải từng checkpoint, kiểm bước không tự hoàn thành, nút Tiếp tục chỉ mở sau thao tác đúng, scene giữ liên tục khi đổi checkpoint.
- Sau checkpoint đầu, thoát rồi mở lại qua catalog để kiểm phục hồi bước đang học.
- Hoàn thành, chụp ảnh, thoát và mở lại để kiểm trạng thái hoàn thành còn lưu.

Với WebView/3D, đáp án được thao tác bằng **ADB tap/swipe/input text thật trên Android**. JavaScript chỉ đo vị trí/đọc controls và cuộn tới control; không gọi `.click()`, setter value hay dispatch sự kiện để giải bài. Nút/navigation Flutter dùng pointer test của integration framework. Ứng dụng test dùng chính UI/runtime của app, catalog và ACK tiến độ nằm trong backend test cục bộ; không ghi tiến độ hoặc thay bài trên Supabase.

Một bài gặp lỗi không làm các bài sau bị bỏ qua. Mỗi bài/checkpoint có kết quả riêng; thiếu bất kỳ PASS nào, catalog rỗng hoặc test chưa chạy đủ đều làm BAT trả FAIL. Renderer mới chưa có recipe thao tác cũng được báo lỗi cụ thể, không tính là đã bao phủ.

Tùy chọn bổ sung:

```bat
test-user.bat --device emulator-5554 --lesson template-engine-formula
test-user.bat --device emulator-5554 --smoke
```

`--lesson ID` chỉ chạy một bài để chẩn đoán, summary ghi rõ bộ lọc. `--smoke` chạy lại năm fixture UI cũ. Hai tùy chọn này không được tính là đã kiểm toàn bộ catalog. Không cần `--headed` hoặc `--flutter` để hiện app Android.

Yêu cầu Node.js, Flutter SDK/Android SDK/JDK đã cấu hình (`flutter doctor`), ADB trong PATH. Mở khóa điện thoại, bật USB debugging và authorize máy tính. MIUI cần Install via USB và có thể yêu cầu bấm Cho phép/Cài đặt; nếu bị `INSTALL_FAILED_USER_RESTRICTED`, test chưa bắt đầu. Có thể dùng AVD để chạy tự động mà không chờ xác nhận MIUI.

## Cách ly app và đọc kết quả

App test có package **vn.mohoc.mo_hoc.uitest**, tên **Mở Học UI Test**. Runner kiểm package trong APK bằng aapt trước khi cài; app kiểm native identity trước khi mở/xóa preferences. Test chỉ reset storage của package này. App thường `vn.mohoc.mo_hoc` giữ package cũ; không gọi uninstall/clear data cho app thường. Gradle tách package khi target là `integration_test/user_ui_test.dart`; build `lib/main.dart` giữ tên/package thông thường.

User report tại `docs/qa/automated/user-device/<thời-điểm>/`:

- `summary.json`: nguồn catalog, số bài/checkpoint dự kiến và PASS, số input Android, trạng thái toàn lượt.
- `catalog-inventory.json`, `catalog.snapshot.json`: danh sách/phiên bản/hash và bản nội dung được kiểm.
- `lesson-results.json`: START, từng CHECKPOINT, PASS/FAIL cho từng bài.
- `android-input.jsonl`: các tap/swipe/text đã gửi qua ADB; PNG sau checkpoint đầu, khi hoàn thành hoặc khi lỗi.
- `run.log`: build/install/driver logs. User không dùng HTML Playwright.

Mã thoát 0 chỉ khi mọi bước được yêu cầu đã PASS. Các giới hạn hosted auth/RLS/progress và kiểm chứng sư phạm không được coi là đã đạt chỉ vì UI test PASS. Kết quả và sự cố các lượt trước được lưu trong `docs/qa/verification-report.md`.
## Kết quả kiểm chứng lượt mở rộng

- Admin: **49/49 ca PASS**, báo cáo HTML tại `docs/qa/automated/admin/2026-11-13T21-06-59-638Z-31632/html/index.html`.
- User trên Pixel 9 AVD: lượt tổng **18 bài / 108 checkpoint PASS**, còn một assertion góc camera geometry; sau chỉnh assertion, bài đó chạy lại **6/6 checkpoint PASS**. Mức bao phủ đã xác minh qua hai lượt là **19 bài / 114 checkpoint**, có đối chiếu cùng version/hash; xem `docs/qa/automated/user-device/catalog-coverage-final-20261114.json`. Bản FAIL lượt tổng được giữ; chưa có một lượt sạch toàn bộ 19 bài sau sửa assertion.
- Redmi: MIUI từ chối USB install nên bộ 19 bài chưa chạy trên điện thoại thật trong lượt này. Lần chạy tới có thể dùng `test-user.bat --device emulator-5554` khi AVD đang mở.
- Dữ liệu catalog được đọc lại sau kiểm thử, vẫn đúng 19 manifest và nội dung không thay đổi. Các giới hạn và lượt chẩn đoán được ghi chi tiết trong `docs/qa/verification-report.md`.

## Cập nhật kiểm chứng Redmi

Đã chạy trên điện thoại thật sau khi cho phép cài: lượt tổng 18 bài PASS, một bài geometry phát hiện lỗi nhập 0.8 thành 8. Mã nguồn/asset runtime đã sửa cách giữ số đang gõ và commit khi rời ô/nhấn xác nhận; geometry chạy lại PASS đủ sáu checkpoint. Tổng mức bao phủ đã xác minh trên Redmi là 19 bài/114 checkpoint qua hai lượt, không phải một lượt sạch toàn bộ sau sửa. Báo cáo: `docs/qa/automated/user-device/redmi-coverage-final-20261114.json`.

30 ca browser geometry và regression gõ số thập phân cũng PASS. Bản sửa hiện nằm trong source và APK UI test; app thường cần được build/cài APK mới để nhận sửa, chưa được cập nhật trong lượt này.

## Nội dung lưu trên GitHub

Repo giữ mã nguồn, dữ liệu fixture và báo cáo JSON/JSONL gọn. HTML, trace, video và ảnh do hai BAT sinh được giữ trên máy để tránh đưa bản ghi lớn vào Git; chạy lại BAT để tái tạo chúng. Cấu hình thật trong `.env`/`.local`, APK và thư mục IDE không nằm trong commit.
