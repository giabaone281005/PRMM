# CP-06 — Form và persistence authoring

Ngày 13/11/2026. Đây là quyết định/implementation trong working tree; migration và Edge Function chưa triển khai remote. Chưa có nghiệm thu round-trip trên browser/Android, theo yêu cầu người dùng tự test.

## Luồng chuẩn trong Studio

`Thêm bài mới` mở form template tại Studio hiện có. Hình trụ nhận diện và parabol hệ số lấy metadata `form`, schema tham số, content slots, example và flow từ registry CP-03. Form dùng nhãn tiếng Việt/ký hiệu/chú thích, lấy giới hạn/kiểu từ schema và ví dụ từ bundle. Trường đơn vị chỉ có ở dữ kiện gốc; variants dùng chung đơn vị. Các đại lượng tính ra chỉ đọc.

Preview dùng runtime hiện tại; focus trường chuyển tới bước có dữ kiện đó và làm nổi đoạn radius/height hoặc đường parabol. Chỉ có sáu nút xem bước, không thêm/xóa/đổi thứ tự hoặc sửa criteria. Phần runtime manifest ở form là read-only. Công cụ full-manifest cũ vẫn có nhãn legacy và nằm trong phần nâng cao; không tự đoán authoring input cho bài cũ.

Export gồm schema đúng template/version, JSON mẫu, input hiện tại và bundle hướng dẫn cho AI. Import chỉ nhận JSON đề, kiểm schema, namespace/curriculum/mode, toán và compile; `compileProblem` còn replay các thao tác hợp lệ do compiler xác định để chặn bước tự đạt hoặc không có đường hoàn thành. Đây là validator của sản phẩm, không phải bằng chứng browser/mobile acceptance. Import dựng candidate/diff; phải chọn áp dụng vào bản nháp hoặc tạo bài biến thể mới. Không tự lưu/publish.

Các slot v1 giữ nguyên semantics: `exploreInstruction` hình trụ là câu cho phép trong enum; `context` là ghi chú bối cảnh lưu/truy vết cho người soạn/AI, chưa được hai compiler v1 đưa vào lời dẫn runtime. Form ghi rõ điều này. Không sửa ngầm compiler/template v1 để biến ghi chú thành một câu hỏi khác. Nếu cần mở thêm nội dung hiển thị cho learner, tạo template version mới.

## Ranh giới tin cậy

Client gửi **input + lessonId + expectedRevision + publish**, không gửi manifest/receipt được tin là đúng. Server local hoặc Edge `authoring` dùng cùng `compileProblem` để compile/validate lại. Version runtime lấy từ draft hiện tại, không lấy từ JSON AI. Edge xác thực bearer bằng `/auth/v1/user`, đọc role DB, chỉ author/admin được lưu và admin được publish. RPC cuối kiểm actor/owner/role/revision/version lần nữa.

`public.commit_lesson_authoring` chỉ cấp EXECUTE cho service_role; client authenticated không gọi trực tiếp để giả receipt. Function SECURITY DEFINER dùng search_path rỗng. Service key chỉ nằm trong môi trường Edge; không đưa vào web. RPC dùng actor đã xác thực để gọi publisher hiện hữu trong cùng transaction. Không tin user_metadata làm quyền.

## Sidecar và transaction

- `lesson_authoring_drafts`: FK lesson, revision, receipt và compiled_manifest. Một save tăng revision; revision sai bị từ chối, không ghi đè đồng thời.
- `lesson_authoring_revisions`: FK `(lesson_id, version)` tới published version, receipt của đúng version và `manifest_content_hash` lấy **chính hash** từ row published. Trigger immutable cấm update/delete; không có client write grant.
- RLS SELECT của cả hai sidecar theo quyền đọc draft/owner/admin hiện hữu, không mở cho learner. Chỉ cấp SELECT cho authenticated. Không thêm field vào Lesson runtime và không cần learner đọc sidecar.
- Save mới insert lesson rồi sidecar; save hiện hữu khóa lesson và sidecar, update cả hai. Published version và receipt snapshot được ghi trong cùng transaction publish. Sau publish cập nhật version draft/receipt chuẩn bị lần chỉnh sau. Không sửa published manifest cũ hoặc progress.
- Trigger chặn thay nội dung draft đã managed qua legacy save/full manifest (ngoại trừ thay version đơn thuần). Trigger sau insert published version kiểm body khớp compiled_manifest và tự snapshot receipt, kể cả khi admin gọi publisher cũ. Không có cửa publish managed content mà bỏ provenance.
- Bài legacy thiếu sidecar vẫn dùng RPC cũ. API chuẩn từ chối nhận một ID legacy để tự gán input; muốn chuyển sang authoring phải tạo biến thể ID mới. Lịch sử không bị biên dịch lại.

Hash published DB hiện hữu là giá trị do publisher cũ sinh; sidecar chỉ bind đúng giá trị này, không coi đó là chữ ký mật mã. Local demo chưa có cột hash published nên tạo SHA-256 cho manifest serialized trong snapshot sidecar. Hai mode không hứa cùng chuỗi hash; mỗi receipt vẫn gắn với đúng version/manifest trong kho của mode đó.

## Local demo

`/api/admin/authoring` compile phía server, kiểm expectedRevision, lưu input/receipt và immutable version snapshots trong `.local/workspace.json`. Ghi toàn bộ workspace qua file tạm + rename theo cơ chế cũ, không dùng localStorage giả backend. Thiết kế này dành cho một Vite server local; không phải dịch vụ nhiều process có authentication/RLS. Legacy save bị chặn khi ID đã có sidecar. Local publish không tự ghi remote.

## UI khi mở lại và lịch sử

`loadLessons` đọc sidecar riêng ngoài manifest. Reload/edit bài managed mở đúng form, input và revision. Nhân bản bài managed đi qua authoring endpoint với ID mới; khôi phục published version đưa input từ receipt lịch sử vào draft hiện tại, không ghi ngược version cũ. Lịch sử hiển thị template/version/compiler/hash và input. Bài thiếu receipt lịch sử không được giả nhận input mới nhất làm input của version cũ.

Có diff từ lần lưu gần nhất và diff candidate import, cảnh báo nội dung chưa lưu khi rời/refresh/back/logout. Auth token refresh không tự tải lại và ghi đè form đang soạn. Quyền publish bị ẩn chức năng bằng disabled cho author và được kiểm độc lập phía server.

## Rollout

Migration mới: `20261113163650_authoring_provenance.sql`, sau hai migration runtime cylinder/parabola CP-04/05. Build Edge tạo `supabase/functions/authoring/index.ts`; config entrypoint được thêm. Chưa apply migration, deploy function hoặc chạy query remote trong CP-06.

Để dùng hosted: đối chiếu target/config và backup theo quy trình repository; rollout ba migration CP-04/05/06, deploy artifacts progress/generate/authoring, cập nhật web/mobile trước khi phân phối manifest mới. Sau đó người dùng nghiệm thu round-trip và quyền owner/admin/student. Nếu sidecar chưa có trên backend, catalog legacy vẫn đọc được; save form chuẩn báo lỗi rõ thay vì âm thầm bỏ provenance để gọi legacy save.

## Cập nhật rollout — 14/11/2026

Sau phản hồi lỗi publish, đã triển khai ba migration CP-04/05/06 và Edge authoring/progress lên project cấu hình. OPTIONS authoring trả 200; giữ nguyên snapshot versions/progress. Xem docs/qa/authoring-publish-fix-20261114/README.md. Các mục “chưa rollout” ở trên là lịch sử tại lượt CP-06; nghiệm thu end-to-end vẫn chờ người dùng tự test.
