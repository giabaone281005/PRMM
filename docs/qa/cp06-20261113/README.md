# CP-06 — Form authoring và AI JSON trong Studio

13/11/2026, Asia/Saigon. Nền `f2cee66d4488e79114a6756e879f4c9accb1d830`; code/evidence trong working tree chưa commit cùng CP-02/03/04/05 có sẵn. **IN PROGRESS — đã triển khai, chờ người dùng tự nghiệm thu và rollout hosted.** Không chạy bộ kiểm thử theo yêu cầu người dùng.

## Đã triển khai

- Studio → Thêm bài mới mở form hình trụ/parabol theo registry; nhãn tiếng Việt, ký hiệu, help, ví dụ, đơn vị/giới hạn từ schema. Kết quả tính read-only; variants riêng bước 5/6.
- Nạp dạng/mode tự giữ flow sáu bước. Preview runtime và đối tượng highlight theo field đang focus. Không có nút thêm/xóa/sắp xếp checkpoint hoặc sửa criteria trong luồng chuẩn.
- Tải schema đề đúng template/version, JSON mẫu, input hiện tại và bộ hướng dẫn AI. Import schema/math/compile/reachability, xem diff rồi chọn cập nhật draft hoặc tạo ID mới; không tự publish.
- Diff so với lần lưu, cảnh báo chưa lưu khi điều hướng/refresh/back/logout. Manifest nâng cao của form chỉ đọc; trình sửa legacy được phân biệt rõ trong phần nâng cao.
- Save/publish managed đi qua compiler server (local API hoặc Edge mới), optimistic revision và sidecar. Khôi phục/nhân bản từ lịch sử giữ input/template của đúng version. Local lưu reload từ workspace file; hosted có migration/RLS/transactional RPC và trigger immutable/bind hash.
- Nguồn quyết định và giới hạn: [authoring-persistence.md](../../architecture/authoring-persistence.md).

Phạm vi form chuẩn chỉ có **hình trụ nhận diện** và **parabol hệ số**. Bán kính/chiều cao âm, a=0, a không nguyên/vượt giới hạn, variants trùng/thiếu, template/version/mã nguồn/mã curriculum/mode/field lạ bị từ chối bằng validator; form có gợi ý cách sửa. Tần số và tam giác chưa có authoring template tương ứng, nên không tuyên bố đã có form/validator cho chúng.

`context` v1 là ghi chú tác giả được lưu/truy vết; form không hứa nó thay câu hỏi runtime. Chỉ `exploreInstruction` hình trụ có enum câu hiển thị đã được compiler v1 hỗ trợ. Không mở slot arbitrary question/hint/answer.

## Lệnh chạy và phạm vi bằng chứng

| Lệnh / hạng mục | Kết quả |
|---|---|
| `npm run build` (TypeScript + Vite) | PASS, exit 0 — [build.log](build.log) |
| `npm run bundle:edge` | PASS, exit 0 — [edge-bundle.log](edge-bundle.log); gồm authoring mới, chưa deploy |
| `npm run bundle:mobile` | PASS, exit 0 — [mobile-bundle.log](mobile-bundle.log) |
| TS/Dart/SQL/PGlite/browser tests, advisors | NOT RUN theo yêu cầu người dùng |
| Round-trip browser/local, reload/concurrency | NOT RUN; code đã có, chưa có bằng chứng thực nghiệm |
| Migration apply / Postgres function execution | NOT RUN; mới tạo file migration |
| Hosted Auth/RLS/publish/catalog/progress và Android | NOT RUN; chưa deploy/ghi remote |

Không dùng build PASS thay nghiệm thu publish hoặc quyền dữ liệu. Migration SQL chưa được thực thi trên PostgreSQL; RLS/trigger/RPC phải được kiểm trước rollout production. Giữ cảnh báo Vite import resolution/configLoader và kích thước chunk; không tắt cảnh báo/nâng dependency.

## Tự kiểm tra local

Tại `learning-platform`, chạy `npm run dev:local` (server 5180; môi trường local demo, không gửi Supabase). Mở `/admin/lessons/new`:

1. Chọn **Hình trụ · Nhận diện**. Đổi r/h ở dữ kiện gốc và bước 5/6, focus từng field để kiểm preview/highlight. Nhập bán kính âm hoặc để trống: phải có thông báo tiếng Việt, khóa lưu/publish. Sửa lại hợp lệ.
2. Chuyển **Parabol · Hệ số**. Thử a=0, .5, 6; thử variants trùng. Chọn dữ kiện hợp lệ và preview đủ sáu bước, không tự đạt khi mới vào.
3. Xuất schema/JSON/bundle AI. Sửa các số và title trong JSON đề rồi nạp lại: xem diff; thử thêm checkpoints/answer/unknown field và sai namespace/template/version/curriculum. File sai phải bị từ chối, input đang soạn không bị ghi đè.
4. Áp dụng candidate vào draft, preview, lưu. Reload/mở lại từ Danh sách bài học: form phải khôi phục đúng dữ kiện. Mở hai tab cùng revision, lưu một tab; tab kia phải bị từ chối ghi đè và được yêu cầu tải lại.
5. Publish bằng nút riêng. Vào learner/catalog học manifest mới. Sửa dữ kiện, publish lần nữa; lịch sử phải có hai version và hai input/receipt/hash riêng. Phiên bản/progress cũ không bị ghi đè.
6. Tạo biến thể mới từ form, từ import và từ danh sách: mỗi biến thể dùng ID mới, bản gốc giữ nguyên. Khôi phục version cũ chỉ nạp input vào draft, không sửa version cũ.
7. Rời form đang chỉnh, back/refresh/logout: phải có cảnh báo. Mở bài legacy: công cụ và tên nút phải ghi rõ full manifest/legacy. Không gọi legacy save cho managed ID để bỏ sidecar.

## Tự kiểm tra hosted sau rollout

Sau khi đối chiếu project đích và rollout theo [quyết định persistence](../../architecture/authoring-persistence.md), lặp lại flow trên bằng account admin/author/student. Kiểm:

- Author chỉ sửa bài của mình, không publish; admin có quyền publish. Client authenticated không được gọi RPC service-only để giả receipt, sửa/xóa sidecar published hoặc sửa managed manifest qua legacy endpoint.
- Published receipt có cùng `(lesson_id, version)`, runtime identity và hash với row version; không lẫn input draft mới nhất vào version trước. Học sinh không đọc được draft/input tác giả của người khác.
- Catalog/Android nhận manifest mới; đủ sáu bước, Edge nhận event journal và resume đúng version. Không suy ra Android PASS từ preview web.

Chưa có kết quả người dùng cho các bước này, nên checkbox hoàn thành CP-06 vẫn mở.
