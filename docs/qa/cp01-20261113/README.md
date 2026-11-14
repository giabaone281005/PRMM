# CP-01 — Baseline và trạng thái tài liệu

Ngày chạy: 13/11/2026, Asia/Saigon. Commit nền: `f2cee66d4488e79114a6756e879f4c9accb1d830`, branch `first-version`. Kết quả ứng dụng gắn với nguồn ở commit này; tài liệu CP-01 và evidence được tạo trong working tree, chưa commit.

**CP-01: PASS.** Baseline local đã chạy lại và trạng thái tài liệu đã đối chiếu. Android/hosted/ANR còn mở tại CP-02.

## Môi trường và thay đổi có sẵn

| Thành phần | Máy chạy baseline | Cấu hình CI hiện hành |
|---|---|---|
| Node | 24.7.0 | 24 |
| npm | 11.6.0 | Theo Node/setup-node |
| Flutter | 3.47.7 stable | 3.47.4 stable |
| Dart | 3.13.5 | Theo Flutter CI; pubspec yêu cầu `^3.13.3` |
| Web dependencies | `npm ls --depth=0` exit 0, khớp khai báo package | `npm ci` |

Xem [environment.json](environment.json), [toolchain.log](toolchain.log), [npm-dependencies.log](npm-dependencies.log).

Trước lượt này không có thay đổi tracked. Các đường dẫn untracked có sẵn: `.idea/`, `PROJECT_CHECKPOINTS.md`, `ma_tran_toan_9_cms.md`. Giữ nguyên `.idea/`; hai file Markdown được cập nhật trong phạm vi CP-01. Không reset hoặc ghi đè công việc khác. Không chạy `npm ci` vì dependencies đã có và `npm ls` đạt; baseline này không chứng minh cài đặt từ máy sạch. `flutter analyze` đã resolve dependencies thành công mà không thay lockfile.

## Nguồn dữ liệu được xác minh

| Bối cảnh | Nguồn/giới hạn |
|---|---|
| Web `.env.local` | URL project `sbzpmrgsqznaydllqmbm`, publishable key có giá trị, local demo false |
| Web đang chạy tại 127.0.0.1:5173 | Đọc module Vite `/src/store.ts`, xác nhận env trỏ cùng project và local demo false; giữ server có sẵn |
| Mobile `.local/supabase.mobile.json` | Cùng URL, có publishable key, không override LOCAL_API_URL; chỉ có hiệu lực khi build/run với defines file này |
| App mobile đã cài | NOT VERIFIED: không suy ra cấu hình APK đang chạy từ file defines trên disk |
| Playwright tại 127.0.0.1:5174 | Server test riêng, `MOHOC_TEST_MODE=1`, local demo true, URL/key Supabase rỗng; API lưu trong bộ nhớ |
| `npm run dev:local` khi dùng thủ công | Cổng 5180, tắt Supabase, dùng `.local/workspace.json`; dữ liệu không tự đồng bộ remote |

Các file [data-source.json](data-source.json) và [running-web-source.json](running-web-source.json) chỉ ghi URL/mode/trạng thái có key, không chứa giá trị key. Không đăng nhập hoặc kiểm kê database live; số 15 bài/90 checkpoint remote vẫn là bằng chứng bàn giao trước.

## Kết quả thực thi

Các lệnh npm chạy tại `learning-platform/`; Flutter chạy tại `learning-platform/apps/mobile/`.

| Lệnh | Trạng thái | Kết quả/bằng chứng |
|---|---|---|
| `npm ls --depth=0` | PASS | Exit 0; [log](npm-dependencies.log) |
| `npm run typecheck` | PASS | Exit 0; [log](web-typecheck.log) |
| `npm test` | PASS | 9 files, 88/88 tests; [log](web-tests.log) |
| `npm run build` | PASS | TypeScript + Vite; [log](web-build.log) |
| `npm run bundle:mobile` | PASS | Runtime/schema/test fixtures sinh thành công; [log](mobile-bundle.log) |
| `npm run bundle:edge` | PASS | Bundle progress/generate thành công, không deploy; [log](edge-bundle.log) |
| `npm run test:e2e -- --reporter=list,json` | PASS | 38/38, 0 skipped/flaky/unexpected, khoảng 3.5 phút; [log](browser-e2e.log), [JSON](playwright-results.json) |
| `flutter analyze` | PASS | No issues found, 81.9 giây; [log](flutter-analyze.log) |
| `flutter test` | PASS | 48/48 tests; [log](flutter-tests.log) |

Browser dùng cấu hình Playwright hiện có: Chrome headless, desktop 1440×1050, một worker, API local trong memory. Lệnh đặt `PLAYWRIGHT_JSON_OUTPUT_FILE` tới thư mục evidence của run để không ghi đè JSON kết quả lịch sử. Các test có kịch bản responsive và WebGL riêng; kết quả browser không chứng minh thiết bị Android.

Browser bắt đầu lúc 22:05:46 ngày 13/11/2026 (Asia/Saigon). 24 ảnh có nội dung khác ảnh lịch sử được lưu riêng trong [screenshots](screenshots/), danh sách ở [screenshot-manifest.json](screenshot-manifest.json). Ảnh gốc dưới `docs/qa/` được khôi phục từ bản sao trước run để giữ bằng chứng lịch sử. Đây là ảnh tự động từ test, chưa có lượt kiểm duyệt trực quan/sư phạm riêng.

Sau bundle, `git diff --exit-code` trên runtime mobile, schema assets, fixtures Dart và nguồn/bundle Edge trả 0: không có thay đổi nội dung so với commit nền. Git có cảnh báo LF/CRLF trên một số generated files; không phải drift nội dung. Không chạy generator templates/contracts vì không thay nguồn contract/template trong CP-01.

Đã khôi phục ba generated files có thay đổi kiểu xuống dòng sau khi xác minh nội dung không đổi; working tree cuối chỉ thay tài liệu và thêm evidence trong phạm vi CP-01, bên cạnh `.idea/` có sẵn.

### Cảnh báo được giữ nguyên

- Vite cảnh báo import không có extension/directory index với config loader native tương lai. Không tắt cảnh báo để làm xanh kết quả.
- Web JS chunk khoảng 1,379.66 kB trước gzip, 366.16 kB gzip, vượt ngưỡng cảnh báo 500 kB. Cần tối ưu trong phạm vi performance sau.
- Flutter báo 10 package có bản mới ngoài constraints; không nâng dependency trong baseline.
- Máy phát triển dùng Flutter 3.47.7, CI pin 3.47.4. Chưa chạy CI remote; không suy ra kết quả CI từ test local.

## Kiểm chứng tài liệu

- `task.md` dẫn tới backlog hiện hành, giữ lịch sử; ghi rõ các checkbox Supabase cũ đã được rollout và các cập nhật sau thay thế.
- Ma trận phân biệt bốn thao tác admin với sáu checkpoint học sinh; quy trình authoring mới được ghi là thiết kế cần triển khai.
- Đã giữ nguyên 24 mã canonical; có 3 dòng có mẫu curriculum (ALG-05, ALG-09, STP-02) và 21 dòng chưa có mẫu. Không dòng nào được đánh dấu hoàn thành chuẩn mới/Android hosted.
- Xem [matrix-check.json](matrix-check.json). Tên sáu core engine là kiến trúc nghiệp vụ đích; không đồng nhất với số engine runtime hoặc mẫu công cụ.
- Payload/key kỹ thuật trong ma trận được ghi là tham khảo legacy, không phải schema/importer authoring đã hỗ trợ.

## Các ca NOT RUN trong CP-01

- Build/cài APK mới, Android integration và thao tác thiết bị; tái hiện/sửa ANR bài bi.
- Hosted Auth → publish → Realtime → Android/WebView → Edge progress/resume xuyên suốt, live RLS/advisors và live catalog readback.
- iOS, thiết bị thật/máy yếu, kiểm duyệt giáo viên, production hosting/signing.
- Cài sạch `npm ci`, template/contract generators, CI remote, performance/accessibility audit đầy đủ.

Các ca Android/hosted thuộc CP-02; chúng vẫn là công việc mở, không bị đóng bởi baseline PASS.
