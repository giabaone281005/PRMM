# Gói bàn giao dự án Mở Học — 14/11/2026

Mở [HUONG_DAN_TAO_BAI_HOC_ADMIN.md](HUONG_DAN_TAO_BAI_HOC_ADMIN.md) để xem hướng dẫn **19 template**, **15 thẻ công cụ** và đường soạn cho **24 mã chủ đề** trên admin.

## Nội dung và trạng thái

- Đây là snapshot **toàn bộ source workspace hiện tại, gồm thay đổi chưa commit** sau ENG-03. Không dùng `git archive`, vì lệnh đó bỏ sót các phần đang phát triển chưa commit.
- `learning-platform/`: React Studio, Flutter player, shared TS/Dart contracts/evaluators, templates, tests, migrations, generated runtime assets và Edge Functions.
- `docs/`, các file kế hoạch/bàn giao ở root và file Excel chương trình: tài liệu thiết kế và bằng chứng QA. Tài liệu cũ phản ánh trạng thái lịch sử; ưu tiên hướng dẫn admin mới và báo cáo ENG-01/02/03.
- `rea-main/`: công cụ khác có sẵn trong workspace, giữ nguyên source để bàn giao đầy đủ; không cần chạy nó để dùng Mở Học.
- `PACKAGE_MANIFEST.json` nằm **trong ZIP**: danh sách file và SHA-256 từng file. File `.sha256` bên ngoài dùng kiểm ZIP tải về.

Không kèm `.git`, cấu hình môi trường thật, thư mục `.local`, tài khoản/session, khóa ký, dependencies, cache, APK/build, test-results/trace hoặc database dump. Cấu hình mẫu `.env.example` được giữ. Không có mật khẩu Supabase/service role trong gói. Gói này không sao chép catalog hay tiến độ đang lưu trên Supabase; phải cấp cấu hình/quyền hợp lệ riêng để truy cập backend đó.

## Chạy admin local, không cần Supabase

Yêu cầu Node/npm theo `learning-platform/package.json` và lockfile; môi trường đã kiểm trước đó là Node 24, npm 11.

```powershell
cd learning-platform
npm ci
npm run dev:local
```

Mở `http://127.0.0.1:5180/admin/engines` hoặc `http://127.0.0.1:5180/admin/lessons/new`. Bản local mở workspace rỗng và lưu vào `learning-platform/.local/workspace.json` sau khi thao tác; tạo bài từ template trong giao diện. Publish local **không đồng bộ** tới app dùng Supabase.

## Chạy với backend Supabase

Từ `learning-platform/`, sao chép `.env.example` sang `.env.local` nếu chưa có, điền `VITE_SUPABASE_URL` và `VITE_SUPABASE_PUBLISHABLE_KEY`, giữ `VITE_ENABLE_LOCAL_DEMO=false`; chạy `npm ci` rồi `npm run dev`. Vào URL Vite báo (thường `http://127.0.0.1:5173/admin/engines`) và đăng nhập tài khoản đã có quyền. Chỉ dùng public/publishable key ở frontend; không dùng service role.

Backend đang cấu hình trong môi trường bàn giao là project `sbzpmrgsqznaydllqmbm`. ENG-03 đã rollout migration `20261113185213_algebra_engine_contract.sql`, authoring v6 và progress v9; generate v3 giữ nguyên. Đây là thông tin hiện trạng, không phải lệnh tự động triển khai lại. Máy nhận source cần người quản lý cấp quyền/cấu hình riêng. Nếu dùng project khác, thực hiện quy trình provisioning/migrations/Edge theo tài liệu kiến trúc; không tự seed lại bài người dùng hoặc áp migration vào project chưa xác minh.

## Flutter trên Android

Cần Flutter SDK và Android SDK; môi trường kiểm trước đó Flutter 3.47.7/Dart 3.13.5. Tạo file **riêng trên máy nhận**, không chia sẻ khóa bí mật:

`learning-platform/.local/supabase.mobile.json`:

```json
{
  "SUPABASE_URL": "https://YOUR_PROJECT.supabase.co",
  "SUPABASE_PUBLISHABLE_KEY": "YOUR_PUBLISHABLE_KEY"
}
```

```powershell
cd learning-platform/apps/mobile
flutter pub get
flutter devices
flutter run -d YOUR_DEVICE_ID --dart-define-from-file=../../.local/supabase.mobile.json
```

File `android/local.properties` được tạo theo đường SDK trên máy nhận, không sao chép đường dẫn máy cũ. APK không được đính kèm; build từ source bằng `flutter build apk --debug --dart-define-from-file=../../.local/supabase.mobile.json`. App thường không chứa catalog fixture kiểm thử.

## Regenerate và kiểm chứng khi tiếp tục phát triển

Từ `learning-platform/`, khi thay contracts/templates: chạy generator liên quan (`algebra:generate`, `geometry:generate`, `cartesian:generate`, `parabola:generate`, `cylinder:generate`), sau đó `contracts:generate`, `templates:generate`, `core:generate`, `bundle:mobile` và `bundle:edge`. Đợi generator hoàn thành trước khi chạy Flutter để tránh khóa file fixture trên Windows. Không sửa migration đã apply; thêm migration mới.

Kiểm tra web: `npm test`, `npm run build`; Flutter: `flutter analyze`, `flutter test`. Device integration có bộ test riêng và cần cài APK kiểm thử. Gói bàn giao không tự chạy chúng khi giải nén.

Kết quả ENGINE gần nhất đã ghi trước lượt đóng gói: **354 TS/SQL tests, 227 Flutter tests, 22 browser cases; 18 bài đại số × sáu bước trên Redmi PASS**. Flutter analyze còn bốn informational braces lints lịch sử. Xem [ENG-03 QA](docs/qa/eng03-20261114/README.md), [ENG-02 QA](docs/qa/eng02-20261114/README.md) và [ENG-01 QA](docs/qa/eng01-20261114/README.md). Lượt đóng gói chỉ kiểm nội dung, link, CRC/hash và tập file; không chạy lại toàn bộ suites hay thay backend.

ENG-00…03 đã triển khai; tiếp theo ENG-04. Hosted authenticated end-to-end, native finger gestures đầy đủ, old APK negotiation và duyệt sư phạm vẫn là các cổng nghiệm thu. Các template mới cần player đã cập nhật; không suy ra tương thích APK cũ chỉ vì schemaVersion nền vẫn 1.0.0.

## Kiểm tra gói tải về

```powershell
Get-FileHash -Algorithm SHA256 .\MoHoc_source_after_ENG03_20261114.zip
```

So sánh với file `.sha256` đi kèm. Giải nén vào thư mục mới để tránh chồng source đang làm việc; ZIP có một thư mục gốc riêng. `PACKAGE_MANIFEST.json` cho biết branch/baseline, số file, SHA-256 và chính sách loại file. Đây là source snapshot, không chứa lịch sử Git và không tự push/commit/deploy.
