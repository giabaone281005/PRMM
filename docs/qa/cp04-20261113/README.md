# CP-04 — Hình trụ theo dữ kiện

Ngày 13/11/2026, Asia/Saigon. Nền `f2cee66d4488e79114a6756e879f4c9accb1d830`, thay đổi chưa commit; giữ các thay đổi CP-02/03 có sẵn. **Đã triển khai; chờ người dùng tự nghiệm thu Android.** Người dùng yêu cầu dừng test và tự test trước khi chạy integration trên thiết bị; không đánh dấu CP-04 hoàn thành nghiệm thu.

## Phần đã làm

- `math9-cylinder-recognition@1` có compiler đầu tiên, trạng thái `implemented-local`. Chỉ nhận diện, không có mode diện tích/thể tích/hình trải.
- Sáu bước: xoay → nhận bán kính → đổi bán kính và chọn cả hai đáy → nhận chiều cao có gợi ý → tìm bán kính với dữ kiện practice → chọn mặt bên với dữ kiện assessment. Câu hỏi/số đo/model/đáp án/criteria cùng sinh từ dữ kiện. Ba JSON đề: r4/h7 cm, r2/h16 cm, r8/h2 m; mỗi đề có hai variants riêng.
- Bốn bước đầu dùng parameters; bước 5/6 chuyển bộ dữ kiện sau khi advance thành công. Giữ session, objects, canvas/camera và góc xoay; reset lựa chọn, số đo khám phá và số liệu tiến trình riêng bước. Khi vào bước mới không tự đạt. Khám phá thay đổi bán kính hai đáy cùng hệ số, height giữ nguyên; bước sau trở lại bộ dữ kiện của bước đó.
- Geometry giữ đúng h/r bằng một hệ số scale thống nhất, camera fit cho miền dữ kiện cho phép. Rods, hai disk đáy và mặt bên có semantic part IDs; raycasting theo mesh được transform cùng mô hình. Ký hiệu A–E cùng đi theo bộ phận; dùng nút ký hiệu tối thiểu 44px như thao tác hỗ trợ. Không đưa nhãn đáp án “mặt bên = E” hoặc giải thích trước khi bước tự kiểm tra đạt.
- Fallback chiếu tam giác từ chính geometry/camera/rotation của WebGL thành SVG tương tác; cùng điều khiển và evaluator. Chuyển sang fallback khi không tạo được context hoặc context bị mất. Chưa tuyên bố có hình trải.
- Runtime có extension tùy chọn `recognition[].uime.cylinder`; bài legacy thiếu field này giữ đường chạy cũ. TS/Dart cùng tính movement/visited bases từ interaction, không nhận sự kiện ghi trực tiếp state c/y. Input authoring vẫn không chứa technical checkpoint, đáp án hoặc hotspot.
- Tích hợp mẫu hình trụ trong trang Công cụ tương tác hiện có: chọn một trong ba bộ dữ kiện, Tạo bài từ mẫu → preview. Đây là nối mẫu vào UI có sẵn; form authoring đầy đủ vẫn thuộc CP-06.
- Migration mới `20261113160543_cylinder_runtime_contract.sql` thêm khả năng validate cấu hình hình trụ, không sửa published manifest hoặc progress. Đã chạy với PGlite qua full suite; chưa apply/deploy remote. Giữ migration history cũ. Không publish/reseed bài cũ.

## Kết quả trước yêu cầu dừng test

| Kiểm tra | Kết quả |
|---|---|
| TypeScript typecheck sau compiler/renderer | PASS |
| Full TS/SQL suite | PASS, 162 tests / 11 files — [tests.log](tests.log) |
| Browser ba đề × WebGL/fallback | PASS, 6 tests, đủ sáu bước — [browser.log](browser.log) |
| Dart replay cùng vector TypeScript | PASS, 3 tests — [dart-parity.log](dart-parity.log) |
| Bundle mobile | PASS — [mobile-bundle.log](mobile-bundle.log) |
| Android integration/native touch | NOT RUN; dừng theo yêu cầu người dùng |
| Full Flutter suite/analyze, build web cuối, UI selector mới | NOT RUN sau thay đổi cuối; người dùng tự test |
| Hosted migration/Edge/publish/progress | NOT RUN; chưa deploy hoặc ghi dữ liệu remote |

Ảnh browser: `webgl-1-cp1.png` đến `webgl-1-cp6.png`, `fallback-1-cp1.png` đến `fallback-1-cp6.png`, ảnh bước 5 cho bộ cao/thấp. Đã xem ảnh WebGL trên viewport 390px; tăng renderOrder của nhãn để tránh lớp trong suốt che chữ. Browser suite trước thay đổi hiển thị nhãn cuối và selector UI; chưa chạy lại sau yêu cầu dừng test. Fallback kiểm bằng cưỡng bức không tạo được context. Browser có click raycast radius/height, nút ký hiệu và một ca SVG DOM-dispatched; không gộp thành bằng chứng Android touch.

Vector replay và manifest nằm trong `learning-platform/contracts/generated/cylinder-recognition.json`. `npm run cylinder:generate` tạo lại từ ba input (không ghi database). Tests dự kiến: `tests/cylinder.test.ts`, `tests/e2e/cylinder.spec.ts`, `apps/mobile/test/cylinder_test.dart`, `apps/mobile/integration_test/cylinder_test.dart`. Helper `node scripts/cylinder-device-input.mjs` chỉ phục vụ integration local qua ADB, không liên quan tài khoản/backend.

## Tự kiểm tra

1. Mở web admin → Công cụ tương tác → Hình trụ → chọn bộ dữ kiện → Tạo bài từ mẫu → preview. Thử cả ba bộ, đổi góc nhìn trước khi chọn đoạn; chọn sai phải giữ khóa bước, chọn đúng mới tiếp tục. Ở bước 3 phải vừa đổi bán kính vừa chọn cả hai đáy.
2. Kiểm bước 5/6 đổi kích thước và số đo đúng variants, giữ góc nhìn, xóa lựa chọn cũ; bước 6 chưa thao tác không hiện giải thích đáp án. Kiểm các ký hiệu dễ đọc trên điện thoại.
3. Android cần build/cài ứng dụng với bundle và schema mới. Kiểm WebGL và context-loss fallback, xoay/chọn trực tiếp, resume từng bước. Integration scaffold có sẵn nhưng chưa chạy.
4. Chưa publish manifest mới lên backend hiện hành trước khi rollout migration và Edge bundle có evaluator mới. Runtime cũ không hiểu extension sẽ từ chối qua schema; giữ các phiên bản bài đã xuất bản nguyên trạng. Cần phối hợp rollout ứng dụng/backend trước phát hành.

Giới hạn: hỗ trợ nhận diện hình trụ; chưa diện tích/thể tích/hình trải, chưa thiết bị thật/iOS, chưa nghiệm thu hosted hoặc Android. Những phần này không được tính PASS từ browser hoặc Dart unit tests.
