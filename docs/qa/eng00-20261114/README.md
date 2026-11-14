# ENG-00 — Contract, registry và thiết bị Android thật

14/11/2026, Asia/Saigon. Working tree branch first-version, nền f2cee66, code chưa commit. Thay đổi trước đó được giữ nguyên. Trong lượt này người dùng cho phép chạy tests tự động và kết nối điện thoại; chỉ dẫn không chạy test trong các báo cáo trước được thay thế bởi yêu cầu mới.

## Đầu ra

- Registry sáu canonical engine, mode/capabilities/status/min-runtime và legacy reuse candidates tại `contracts/core-engines/registry.json`.
- 24 mã canonical giữ nguyên engine owner, required/missing modes tại `coverage.json` và bảng `COVERAGE.md` cùng thư mục. Không tuyên bố đã phủ đủ 24; planned modes bị chặn.
- Executable discriminated config schema cho hai adapter cylinder/parabola hiện có; model constraints và identity/units/viewport rõ. Planned modes không dùng schema parameters:any.
- Resolver/gate TS và Dart; `compileProblem` kiểm canonical adapter trước compiler. UI Công cụ tương tác hiển thị trạng thái từng engine/mode. Không đổi Lesson enum/runtime legacy hoặc published/progress.
- Interface module canonical tương lai; quyết định giữ runtime v1 compatibility và dành runtime v2 cho typed scene/event/constraints/layers/snapshot tổng quát.
- Shared TS/Dart validation vectors, generator copy mobile assets + coverage table và draft SQL schema export, Edge bundle chứa compile gate; chưa apply SQL/deploy remote.
- Quyết định và inventory chi tiết: [core-engine-contract.md](../../architecture/core-engine-contract.md).

## Xác minh

| Hạng mục | Kết quả |
|---|---|
| Web TypeScript + Vite build | PASS, exit 0 — [build.log](build.log) |
| TS contract ENG-00 | PASS, 12 tests — [ts-contract.log](ts-contract.log) |
| Dart contract cùng vectors | PASS, 10 tests — [dart-contract.log](dart-contract.log) |
| Edge bundle | PASS — [edge-bundle.log](edge-bundle.log); chưa deploy |
| Android legacy U-IME WebView bridge | PASS trên Redmi Note 9S, Android 12 — [android-uime-retry.log](android-uime-retry.log) |
| Android bundled ENG-00 registry/schema | PASS trên Redmi Note 9S — [android-core-contract.log](android-core-contract.log) |

Lần test Dart đầu FAIL ở hai config hợp lệ do legacy Dart schema validator xử lý oneOf khác Ajv khi nhánh chỉ có properties không có type. Đã đổi schema mới sang các nhánh object đầy đủ, không sửa semantics evaluator cũ; rerun 10/10 PASS, TS 12/12 PASS.

Điện thoại được ADB nhận sau khi người dùng bật USB debugging. Lần cài integration APK đầu bị MIUI chặn INSTALL_FAILED_USER_RESTRICTED; người dùng bật Install via USB và rerun thành công. Không wipe/clear app data; không chạy acceptance_test.dart có prefs.clear. Test U-IME là một integration case kết hợp nhiều cấu hình legacy, render WebView thực và event bridge tới Dart bằng DOM-dispatched controls; không phải toàn bộ nội dung chuẩn sáu bước/engine hoặc mọi cử chỉ chạm thật.

NOT RUN: runtime v2 (chưa triển khai), toàn bộ planned modes ENG-01…06, coverage acceptance 24 dạng, hosted publish/Edge replay mới, mobile CP-04/05 full gesture acceptance. Không tạo dữ liệu người dùng hoặc publish remote trong ENG-00.

## Trạng thái thiết bị cuối lượt

Build APK entrypoint ứng dụng thường với cấu hình Supabase hiện có PASS ([android-normal-build.log](android-normal-build.log)); cài lại bằng `adb install -r` PASS ([android-normal-install.log](android-normal-install.log)) và mở `vn.mohoc.mo_hoc/.MainActivity`. Không giữ integration-test entrypoint làm bản app cuối. Không xóa data/session bằng pm clear hoặc uninstall. Không dùng launch thành công để tuyên bố đã nghiệm thu login/catalog/hosted round-trip.
