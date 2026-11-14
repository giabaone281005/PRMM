# CP-03 — Contract authoring và registry v1

Quyết định ngày 13/11/2026. CP-03 cung cấp contract và ranh giới compiler; compiler hình trụ/parabol thực tế, UI và lưu backend nằm ở CP-04/05/06. Không đổi runtime schema `1.0.0`, evaluator, player hoặc dữ liệu published.

## Ba tầng

1. **Template tin cậy**: `templateId + templateVersion` xác định mode, curriculum ownership, schema, metadata form, sáu nhiệm vụ/thứ tự, nguồn dữ kiện từng bước và kiểm toán học. Registry nằm tại `learning-platform/packages/lesson-authoring/template-registry.ts`, đóng băng sâu khi chạy. Sửa schema, nhiệm vụ, công thức hoặc cách dựng/chấm phải tạo template version mới; giữ implementation cũ khi còn dùng để truy vết. Thay đổi compiler ảnh hưởng manifest phải tăng version template, không chỉ tăng `compilerVersion`.
2. **JSON đề**: `learning-platform/contracts/authoring/lesson-authoring.schema.json`. Root là base schema khóa field; `oneOf` ràng buộc template/version/curriculum/mode và schema tham số/content riêng. Có hai example JSON cùng thư mục. Đây không phải `lesson-six.schema.json` hoặc full runtime manifest.
3. **Lesson runtime**: adapter code tin cậy nhận JSON đề đã validate, dựng manifest `Lesson` hiện có; `compileAuthoring` kiểm lại runtime contract, identity, engine, curriculum, sáu ID/thứ tự và completion trước khi trả draft. Không truyền authoring JSON trực tiếp cho player.

## Namespace và phạm vi

- Authoring v1 chỉ nhận `namespace: excel-repo-v1` và `curriculumCode` đầy đủ `M9-…`. Enum giữ nguyên 24 mã từ curriculum hiện hành.
- Không đoán namespace từ số thứ tự; từ chối `markdown-supplement-v1`, `STA-*` và mã trần. Luồng import tài liệu nguồn về sau phải chuyển alias có namespace một cách tường minh trước khi gọi `parseAuthoring`; không âm thầm đổi mã published.
- Đăng ký `math9-cylinder-recognition@1`, `M9-GEO-11`, mode `recognition`; và `math9-parabola-coefficient@1`, `M9-ALG-09`, mode `coefficient`. Chưa nhận diện tích/thể tích, hình nón/cầu hoặc template khác. Hai entry đều có `compilerStatus: pending`; metadata task chưa phải bằng chứng renderer/flow đã chạy.
- Cylinder: `radius`, `height` hữu hạn trong [0,1; 100], h/r trong [0,1; 10], đơn vị `cm` hoặc `m`. Parabola: số nguyên `a` từ −5 đến 5, khác 0. Đây là giới hạn authoring đã chọn; compiler CP-04/05 còn phải chứng minh dựng được và hoàn thành được trên runtime mục tiêu. Nếu phải đổi contract, tạo version mới.

## Flow, variants và content

ID cố định: `explore → identify → discover → guided → practice → assessment`. Vai trò là Khám phá → Nhận diện → Tìm quy luật → Thực hành có hướng dẫn → Vận dụng độc lập → Tự kiểm tra và chốt kiến thức. Mỗi template có sáu `taskKey`/mục tiêu riêng trong registry; dữ kiện bốn bước đầu lấy từ `parameters`, bước 5 từ `variants.practice`, bước 6 từ `variants.assessment`.

Hai variants bắt buộc khai báo dữ kiện mới, khác nhau và khác bộ gốc; không có random/default ngầm. Cylinder variants chỉ nhận radius/height và kế thừa unit; parabola variants chỉ nhận a. Đáp án, hình học, labels theo số liệu, tiêu chí và câu hỏi chứa số phải do compiler sinh từ dữ kiện cùng bước. Không nhận answers, target state, công thức thực thi, scene, hotspot, checkpoints, flow, interaction overrides hay completion trong JSON đề.

Content v1 chủ ý hẹp: `context` tùy chọn tối đa 240 ký tự, một dòng không chứa chữ số ASCII, markup/binding/code delimiters; chỉ dùng làm bối cảnh, không được dùng để tính hoặc xác định nhiệm vụ. `exploreInstruction` của cylinder chỉ chọn một trong hai câu xoay quan sát trong enum. Không nhận câu hỏi, hint, feedback hoặc hướng dẫn tùy ý làm đổi nhiệm vụ. Title tối đa 120 ký tự, không rỗng/whitespace; hiển thị như plain text. Kiểm schema không thẩm định ngữ nghĩa bối cảnh viết tự do; CP-06 vẫn cần người soạn duyệt nội dung. Không lấy slot văn bản làm nguồn đúng toán học.

## API và compiler interface

```ts
const bundle = exportAuthoringBundle('math9-cylinder-recognition', 1);
const issues = validateAuthoring(input); // path, code, thông báo tiếng Việt
const problem = parseAuthoring(input); // clone hoặc throw AuthoringError
// Chỉ khi CP-04/05 đã có adapter tin cậy:
const {manifest, receipt} = compileAuthoring(problem, {lessonId, version}, compiler);
```

`exportAuthoringBundle` trả schema độc lập cho đúng template, example, metadata form (nhãn tiếng Việt, ký hiệu, giải thích), flow và hướng dẫn. Bản export là clone; người dùng không thể sửa schema/registry đang chạy. `matchesAuthoringSchema` chỉ kiểm cấu trúc, còn `validateAuthoring`/`parseAuthoring` kiểm cả ràng buộc toán, tỉ lệ và variants. Luồng import chuẩn bắt buộc dùng API sau.

`TemplateCompiler` là code adapter với templateId/version, compilerVersion và hàm `compile(problem, context): Lesson`; không deserialize hàm từ JSON. Context chứa lessonId/version do service cấp. Input/context đưa vào compiler được clone và freeze. Wrapper chỉ nhận draft lớp 9, giữ title, một topicId canonical, engine runtime trong metadata, đủ sáu checkpoint và completion theo thứ tự. Nó không thay kiểm thử reachability, hình/nhãn, tính đúng toán hoặc parity trên thiết bị; CP-04/05 phải có các kiểm thử đó cho implementation. Bộ test CP-03 dùng adapter thử riêng để kiểm ranh giới, không đăng ký compiler giả vào production.

## Quyết định lưu truy vết

`compileAuthoring` trả `{manifest, receipt}` riêng. `receipt` có receiptVersion, templateId/version, compilerVersion, bản clone **toàn bộ input đã validate** và identity lessonId/runtime version. Không nhét receipt/input/templateVersion vào manifest vì runtime đang `additionalProperties: false`.

Thiết kế lưu cho CP-06:

- Lưu input draft trong sidecar riêng theo lesson/draft revision, cùng quyền sở hữu của draft. Cập nhật manifest và sidecar trong cùng transaction, có kiểm revision để tránh ghi đè đồng thời.
- Khi publish, ghi sidecar immutable `lesson_authoring_revisions` theo `(lesson_id, version)`, FK tới cùng published version và lưu `manifest_content_hash` bằng chính hash version được publish. Service kiểm receipt identity/input/template/compiler và bind hash trong transaction publish. Receipt cục bộ chưa có hash, không tự được coi là chứng từ published.
- Quyền đọc sidecar theo quyền đọc draft/admin; learner chỉ cần manifest. Quyền ghi qua service/publish đã kiểm tra; sidecar published không sửa/xóa tùy ý. Không dùng `authoring_jobs` làm nguồn truy vết duy nhất vì job không có ràng buộc identity/version published.
- CP-03 chốt cấu trúc receipt và quyết định này; chưa thêm migration/API lưu remote, chưa tuyên bố lưu qua reload. Việc lưu giao dịch thuộc CP-06.

## Tương thích

Manifest cũ tiếp tục đọc/chạy bằng runtime version và snapshot identity hiện tại. Thiếu sidecar nghĩa là **legacy manifest**, không phải input authoring bị lỗi. Không bắt buộc authoring fields khi đọc published catalog, không biên dịch lại hoặc gán template ngầm cho nội dung/progress cũ. Sửa một bài cũ qua authoring chuẩn phải chọn template, tạo input mới và published version mới; giữ manifest/version/progress cũ.

CP-03 không đổi runtime schema, generated runtime, Dart model/evaluator, fixture cũ hay SQL contract. Test riêng đọc cả 15 file `.lesson.json` trong `contracts/engine-templates`, đặt trạng thái published, validate, thực hiện từng bước bằng runtime events và restore snapshot sau mỗi bước; không qua registry/compiler mới. Đây là kiểm chứng domain TypeScript, không phải thao tác Android/hosted. Báo cáo tại `docs/qa/cp03-20261113/README.md`.


## Cập nhật CP-04 — 13/11/2026

Cylinder @1 đã có implementation đầu tiên, compilerStatus implemented-local; parabol vẫn pending. Runtime bổ sung field tùy chọn uime.cylinder, giữ schemaVersion 1.0.0 và legacy path. Đã thêm schema vào mobile và migration SQL mới; chưa rollout remote. Không thêm provenance vào manifest. Bộ ứng dụng/backend cũ chưa hiểu extension mới cần được cập nhật trước publish các bài mới. Xem docs/qa/cp04-20261113/README.md cho kết quả và phần người dùng tự nghiệm thu. Các mô tả pending/không đổi schema ở phần CP-03 bên trên là mốc lịch sử của CP-03.


## Cập nhật CP-05 — 13/11/2026

Parabol @1 đã có compiler đầu tiên cho y = ax², compilerStatus implemented-local. Sáu task dùng dữ kiện gốc và hai variants; điểm và viewport tính từ mô hình toán. Runtime có thêm extension tùy chọn uime.parabola; legacy không có extension giữ nhánh cũ. Migration SQL mới và bundle Edge/mobile đã chuẩn bị; chưa rollout remote, chưa chạy tests/Android theo yêu cầu người dùng tự test. Xem docs/architecture/parabola-slice.md và docs/qa/cp05-20261113/README.md. Các trạng thái pending trong mô tả CP-03 là mốc lịch sử.


## Cập nhật CP-06 — 13/11/2026

Form chuẩn và export/import JSON đề được tích hợp vào Studio hiện có cho hai template đã triển khai. Save/publish dùng compileProblem phía server và sidecar riêng, không đưa input vào Lesson manifest. Local API lưu file workspace; hosted có Edge authoring và migration authoring_provenance với revision/transaction/RLS/immutable receipt/hash binding. Chưa rollout remote hoặc nghiệm thu round-trip theo yêu cầu người dùng tự test. Xem docs/architecture/authoring-persistence.md và docs/qa/cp06-20261113/README.md. Context v1 là ghi chú tác giả lưu cùng input, không thay lời dẫn runtime; form ghi rõ giới hạn này.
