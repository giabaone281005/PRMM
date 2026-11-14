# CP-05 — Parabol y = ax² theo dữ kiện

Ngày 13/11/2026, Asia/Saigon. Commit nền `f2cee66d4488e79114a6756e879f4c9accb1d830`; thay đổi CP-02/03/04 và CP-05 nằm trong working tree chưa commit. Giữ công việc trước đó. **IN PROGRESS — code đã triển khai, người dùng tự nghiệm thu web/Android.** Không chạy test tự động theo yêu cầu người dùng.

## Phạm vi và implementation

Đã chốt trước khi viết code tại [parabola-slice.md](../../architecture/parabola-slice.md): `math9-parabola-coefficient@1`, canonical `M9-ALG-09`, mode `coefficient`, y = ax², a nguyên trong [−5; 5], khác 0. Chưa làm tam giác vuông, y = ax² + bx + c, biệt thức hoặc giao điểm hai đồ thị.

- `packages/lesson-authoring/parabola-compiler.ts` biên dịch input CP-03 thành manifest runtime cùng receipt riêng. Registry chuyển parabol sang `implemented-local` (implementation đầu tiên của version 1, chưa có published version authoring parabol cần chuyển đổi).
- Bốn bước đầu dùng parameters, bước 5/6 dùng variants. Các nhiệm vụ khác nhau: khám phá hai hướng mở bằng thay a; ghép dấu hệ số vào hình; di chuyển điểm dò rồi chọn đồ thị hẹp hơn; dựng qua điểm có gợi ý; vận dụng độc lập; tự dựng qua điểm mới và xác nhận. Không nhân bản một câu hỏi sáu lần.
- `packages/lesson-runtime/parabola.ts` là mô hình toán chung: y = ax², điểm P, đồ thị tham chiếu, đáp án so sánh, miền nhìn và phép chiếu tọa độ. Compiler không nhận answer/point/hotspot pixel từ JSON đề. Điểm có hoành độ khác 0 do template sinh (2, 1 hoặc −2) nên a = y/x² xác định duy nhất.
- Bước khám phá có cờ đã thử hai dấu được tính từ interaction hợp lệ; không cho client gán cờ trực tiếp. Bước so sánh cần di chuyển điểm dò tới x=2 trước khi chọn đúng đồ thị. Bước dựng cần chỉnh hệ số và xác nhận P; đổi a làm mất xác nhận cũ. Mỗi checkpoint bắt đầu với lựa chọn/cờ riêng chưa đạt.
- `src/ParabolaScene.tsx` giữ SVG root/scene/session và các ID semantic `graph-target`, `graph-reference`, `curve-learner`, `point-target`, `point-probe`, `origin`. Hình, nhãn tọa độ và vùng chạm P đều dùng cùng phép chiếu; đường hit của G/H dùng chính path đồ thị, không có hotspot pixel độc lập. Có kéo điểm điều khiển, kéo điểm dò, kéo thẻ dấu; slider/nút hỗ trợ thao tác tương đương.
- Miền x cố định [−2,5; 2,5]; đường cong lấy mẫu trong [−2,2; 2,2]. Miền y fit xác định cho hệ số cho phép và đồ thị so sánh; không đổi tỉ lệ riêng giữa G và H trong cùng bước. SVG và ID giữ nguyên khi bước mới đổi dữ kiện/viewport y; reset phần thử dựng và lựa chọn của bước, không tạo session mới.
- Không vẽ đồ thị lời giải ẩn phía sau đường đang dựng ở bước 4/5/6. Trước khi tự kiểm tra đạt, UI chỉ hiện điểm đã cho, hệ số người học đang thử và gợi nhắc không chứa hệ số đúng. Feedback sinh phép tính chỉ hiện sau khi evaluator chấp nhận.
- TS và Dart cùng nhận `adjust_parameter` đã kiểm whitelist/range và cùng quy tắc chấm. Đã chuẩn bị tests cùng fixture cho hai bên, chưa chạy nên chưa có bằng chứng parity thực nghiệm hoặc Android acceptance.

## Ba JSON đề

Trong `learning-platform/contracts/authoring/`:

| JSON đề | a gốc | a bước 5 | a bước 6 |
|---|---:|---:|---:|
| `math9-parabola-coefficient.example.json` | 1 | 2 | −2 |
| `parabola-downward.example.json` | −3 | −1 | 3 |
| `parabola-narrow.example.json` | 5 | −4 | 1 |

`npm run parabola:generate` đã chạy để tạo `contracts/generated/parabola-coefficient.json` (input, manifest, receipt và các vector expected khai báo). Exporter không chạy session/replay/test và không ghi database. Việc compiler kiểm schema khi sinh manifest không chứng minh sáu bước đã chạy đúng trên player.

## Build và trạng thái xác minh

| Hạng mục | Trạng thái |
|---|---|
| Sinh ba manifest từ schema CP-03 | PASS, exporter hoàn tất |
| Web TypeScript + Vite (`npm run build`) | PASS, exit 0 — [build.log](build.log) |
| Mobile runtime + schema/fixtures (`npm run bundle:mobile`) | PASS, exit 0 — [mobile-bundle.log](mobile-bundle.log) |
| Edge artifact (`npm run bundle:edge`) | PASS, exit 0 — [edge-bundle.log](edge-bundle.log); chưa deploy |
| TS/Dart unit, SQL/PGlite, browser E2E | NOT RUN theo yêu cầu người dùng |
| Flutter analyze/test/build/cài APK | NOT RUN |
| Android gestures, parity thiết bị, background/resume | NOT RUN; người dùng tự test |
| Hosted migration/publish/Edge/progress | NOT RUN; không ghi remote |

Build đầu phát hiện lỗi `this` thiếu annotation trong file browser-test CP-04. Đã thêm `this: HTMLCanvasElement` để biên dịch được; không chạy test CP-04. Build web hiện cảnh báo import resolution/configLoader và chunk 1.416,60 kB (gzip 377,41 kB); không tắt cảnh báo hoặc nâng dependency.

Tests chuẩn bị: `tests/parabola.test.ts` và `apps/mobile/test/parabola_test.dart`, dùng cùng vector đúng/sai, chặn 0/NaN/Infinity/hệ số vượt phạm vi, trạng thái bước mới, restore, tính điểm/viewport và xác nhận lại P. Chưa chạy các test này và chưa thêm bằng chứng browser/native touch; không được ghi chúng là PASS.

## Tự nghiệm thu

1. Mở admin → **Công cụ tương tác → Parabol động**. Chọn một trong ba bộ dữ kiện rồi **Tạo bài từ mẫu → preview**. Lặp lại với cả ba bộ để kiểm hình và điểm thay đổi theo dữ kiện, không chỉ đổi chữ.
2. Bước 1 thay a sang dấu đối rồi trở lại; quan sát đồ thị mở lên/xuống. Bước 2 chọn/kéo thẻ dấu rồi gắn lên đồ thị G; thử sai trước đúng.
3. Bước 3 kéo điểm dò (hoặc thanh hoành độ) đến x=2; chọn đồ thị có |y| lớn hơn ở cùng x. G là nét liền, H nét đứt. Chọn đúng khi chưa di chuyển điểm dò phải chưa đạt.
4. Bước 4 dựng đường qua P bằng kéo điểm điều khiển hoặc thanh hệ số, rồi chạm P. Thử chạm P khi đồ thị chưa qua điểm: bước phải chưa đạt. Sau khi đổi a cần xác nhận P lại.
5. Bước 5/6 có điểm mới từ variants. Kiểm hệ số đúng không hiển thị trong câu hỏi, hint hoặc đồ thị mẫu; chỉ xuất hiện trong giải thích sau khi hoàn thành. Thử đóng/mở và resume đúng lesson/version.
6. Trên Android, build/cài app với bundle/schema mới; kiểm các thao tác kéo/chạm thật, đủ sáu bước, không remount cảnh và so sánh với web. Kéo/chạm P phải bám điểm sau khi hệ số/miền y thay đổi; kiểm nhãn ở màn hình nhỏ.

## Tương thích và rollout

Runtime `schemaVersion: 1.0.0` có extension **tùy chọn** `recognition[].uime.parabola`. Bài legacy không có field này giữ nhánh renderer/evaluator cũ. Không chèn authoring input vào manifest, không đổi published/progress cũ. Player cũ có schema khóa field sẽ từ chối manifest mới; cần cập nhật app trước khi phân phối bài dùng extension.

Schema canonical, schema sáu bước và schema mobile đã đồng bộ. Migration mới `20261113162509_parabola_runtime_contract.sql` cập nhật contract private và ràng buộc model-binding; không sửa các migration trước, không tạo/xóa bảng hay ghi nội dung. Migration chưa được chạy trên local PostgreSQL hoặc remote. Artifacts Edge đã bundle cùng evaluator mới nhưng chưa deploy. Rollout migration + Edge + ứng dụng phải hoàn tất trước khi publish bài mới; form/AI import và sidecar persistence đầy đủ vẫn thuộc CP-06.
