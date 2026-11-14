# Checkpoint triển khai tiếp theo — Mở Học Toán 9

Ngày lập: 13/11/2026 (Asia/Saigon).

File này là backlog hiện hành cho phần việc tiếp theo. Đây là kế hoạch và tiêu chí nghiệm thu, không phải báo cáo các tính năng đã hoàn thành. Không thay thế đặc tả kỹ thuật hoặc lịch sử trong `task.md`.

## Ưu tiên hiện hành — cập nhật 14/11/2026

Theo yêu cầu mới, **ưu tiên xây đủ năng lực 6 core engine để phục vụ 24 dạng trước khi mở rộng ngân hàng template/bài học**. Kế hoạch có phạm vi, phụ thuộc, mapping và đầu ra tại [CORE_ENGINE_IMPLEMENTATION_PLAN.md](CORE_ENGINE_IMPLEMENTATION_PLAN.md).

Thứ tự mới: **ENG-00 contract/registry → ENG-01 tọa độ → ENG-02 hình học → ENG-03 đại số → ENG-04 diện tích/căn/khối → ENG-05 trục số → ENG-06 dữ liệu/xác suất → ENG-07 tích hợp → CP-07/CP-08 nội dung**. Tích hợp CMS/Flutter theo từng engine, không đợi xong sáu engine mới nối app. Domain/sign cross-engine được chốt trước khi đóng mode liên quan.

CP-04/05/06 giữ code đã làm và trạng thái chờ nghiệm thu; chỉ ưu tiên bug/integration cần thiết. CP-02 tiếp tục là cổng Android. Backend CP-04/05/06 đã rollout ngày 14/11 (authoring v1, progress v4, 12 migrations); các ghi chú “chưa rollout” phía dưới là lịch sử. Người dùng vẫn tự test, không tự chạy full suites. Bắt đầu công việc mới bằng **ENG-00**, không bắt đầu biên soạn hàng loạt 24 bài.

### Cập nhật ENG-00 và quyền chạy test — 14/11/2026

ENG-00 nền tảng đã PASS: registry sáu engine, coverage 24 mã, executable schema/gate cho hai adapter hiện có, interface/version/rollout và inventory. [Quyết định](docs/architecture/core-engine-contract.md), [evidence](docs/qa/eng00-20261114/README.md). Bước tiếp theo **ENG-01**. Planned modes không được bật publish.

Người dùng đã kết nối **Redmi Note 9S / Android 12**, bật USB debugging/Install via USB và cho phép test tự động. Quyền mới thay chỉ dẫn “không chạy test” trước đó. TS 12/Dart 10 contract tests, Android WebView bridge và bundled registry integration PASS; chưa suy ra mọi engine/24 dạng đã được nghiệm thu.

## 1. Mốc xuất phát

- Checkout tại lúc lập: branch `first-version`, commit `f2cee66`; đã chứa commit tính năng `3e15a58`.
- Dữ liệu local đã kiểm đếm: 15 mẫu công cụ, 90 checkpoint, danh mục 24 dạng chương trình.
- Mới có ba mẫu curriculum-specific: M9-ALG-05, M9-ALG-09, M9-STP-02. Đây là mẫu hiện có, chưa phải nghiệm thu đầy đủ theo đặc tả mới.
- Import/export hiện dùng full Lesson manifest. Tầng JSON đề ngắn, template khóa flow và compiler theo đặc tả mới chưa triển khai.
- Renderer 3D còn kích thước cố định; nhiều cảnh 2D chưa dựng đầy đủ theo dữ kiện.
- Android hosted/ANR bài chọn bi chưa có bằng chứng nghiệm thu lại.
- Bàn giao gần nhất ghi 15 bài lớp 9/90 checkpoint trên Supabase; chưa truy vấn lại remote khi lập file này.
- Kết quả kiểm thử lịch sử: 88 TS/SQL tests, 38 browser tests, 48 Flutter tests, build/bundle/analyze PASS. Chưa chạy lại trong lượt lập file.

Nguồn chỉ đạo:

1. [SPEC_TOAN9_CMS_ENGINE_FLOW6.md](SPEC_TOAN9_CMS_ENGINE_FLOW6.md): yêu cầu triển khai chuẩn.
2. [PROJECT_HANDOVER_ENGINE_CHECKPOINTS.md](PROJECT_HANDOVER_ENGINE_CHECKPOINTS.md): hiện trạng bàn giao mới nhất.
3. [PROJECT_HANDOVER.md](PROJECT_HANDOVER.md): kiến trúc và bối cảnh trước đợt sáu checkpoint.
4. [ma_tran_toan_9_cms.md](ma_tran_toan_9_cms.md): nội dung tham khảo; phần 4 slide không còn là flow học sinh chuẩn.
5. [task.md](task.md), [verification-report.md](docs/qa/verification-report.md): lịch sử công việc và bằng chứng.

## 2. Quy ước nghiệm thu

- Mọi task bắt đầu ở trạng thái **TODO** khi lập kế hoạch; trạng thái hiện hành được cập nhật tại từng task và nhật ký cuối file. Chỉ đánh dấu `[x]` khi đủ đầu ra và bằng chứng yêu cầu.
- Trạng thái thực thi: TODO / IN PROGRESS / PASS / FAIL / BLOCKED / NOT RUN. BLOCKED phải ghi nguyên nhân và điều kiện gỡ chặn.
- Có code, build được hoặc test browser đạt không thay cho nghiệm thu Android/hosted.
- Bằng chứng phải ghi commit, lệnh hoặc kịch bản chạy, môi trường, kết quả và đường dẫn log/ảnh/readback. Không ghi mật khẩu, token hoặc secret.
- Mỗi bài chuẩn có sáu vai trò: **Khám phá → Nhận diện → Tìm quy luật → Thực hành có hướng dẫn → Vận dụng độc lập → Tự kiểm tra và chốt kiến thức**.
- Giữ published version và progress cũ; không biên dịch lại nội dung cũ theo template mới một cách ngầm định. Không sửa `rea-main/`.
- Chỉ thay đổi backend sau khi xác minh đúng đích; thay đổi hàng loạt cần backup và diff. Không publish lại toàn bộ mẫu chỉ vì regenerate file.

## 3. Danh sách task và kết quả cần đạt

### CP-01 — Chốt baseline và trạng thái tài liệu

- [x] Hoàn thành — **P0** — Phụ thuộc: không. **PASS — 13/11/2026.**

Bằng chứng: [báo cáo CP-01](docs/qa/cp01-20261113/README.md). Commit nền `f2cee66`, Node 24.7.0, Flutter 3.47.7/Dart 3.13.5. Typecheck, 88 TS/SQL tests, build, bundle mobile/Edge, 38 browser tests, 48 Flutter tests và analyze đều PASS. Đã xác minh web đang chạy dùng Supabase; E2E dùng local memory. Đã cập nhật `task.md` và ma trận, giữ 24 mã canonical và phân biệt 3 mẫu/21 dạng thiếu với nghiệm thu. Android hosted/ANR và các ca NOT RUN vẫn thuộc CP-02, không tính hoàn thành trong CP-01.

**Việc cần làm**

- Ghi commit, cấu hình nguồn dữ liệu và phiên bản toolchain; kiểm tra thay đổi đang có của thành viên.
- Chạy baseline web và Flutter theo script của repository; ghi riêng các ca chưa chạy.
- Đối chiếu các mục cũ trong `task.md`; dẫn tới backlog này cho phần việc hiện hành.
- Làm rõ trong ma trận: bốn thao tác admin khác sáu checkpoint học sinh; trạng thái mẫu khác trạng thái nghiệm thu. Không tự đổi mã curriculum theo số thứ tự của nguồn khác.

**Kết quả cần đạt**

- Có một mốc kiểm thử tái lập được với PASS/FAIL/NOT RUN rõ ràng trong `docs/qa/verification-report.md`.
- Người tiếp nhận xác định được bài đang lấy từ local hay Supabase và đâu là yêu cầu mới chưa triển khai.
- Không còn dùng checkbox Supabase cũ hoặc bảng “Chưa tạo” làm kết luận duy nhất về hiện trạng.

### CP-02 — Xử lý lỗi Android và chứng minh luồng hosted

- [ ] Hoàn thành — **P0** — Phụ thuộc: CP-01.

**Việc cần làm**

- Regenerate runtime mobile, build/cài app mới; tái hiện từ cold launch với bài chọn bi và ba khối trụ/nón/cầu.
- Thu logcat, WebView/bridge logs và ANR traces khi có lỗi; xác định nguyên nhân trước khi sửa.
- Kiểm thao tác đúng/sai, chuyển bước, background/resume và đóng/mở lại.
- Chạy một luồng liên tục bằng account thử theo vai trò: draft → publish → catalog cập nhật → Android học → Edge ghi progress → resume/readback.
- Kiểm không lộ draft/progress khác tài khoản; retry không ghi trùng. Dọn đúng dữ liệu thử sau run.

**Kết quả cần đạt**

- Không trắng vùng tương tác, không ANR trong các kịch bản nghiệm thu; lỗi được tái hiện và sửa có regression nếu xác định được.
- Thao tác thật trên Android hoàn thành đủ sáu checkpoint, Edge chấp nhận progress đúng lesson/version và resume đúng vị trí.
- Có log/ảnh/readback theo cùng run; phân biệt test DOM-dispatched với thao tác chạm/kéo trên thiết bị.
- Khi không tải/render được, có lỗi và thao tác thử lại rõ ràng, không chờ trắng vô hạn.

### CP-03 — Xây contract authoring và registry template

- [x] Hoàn thành — **P1** — Phụ thuộc: CP-01; có thể làm trong khi điều tra CP-02. **PASS — 13/11/2026 (contract/interface local).**

Bằng chứng: [báo cáo CP-03](docs/qa/cp03-20261113/README.md), [quyết định contract và truy vết](docs/architecture/authoring-contract.md). Schema authoring tách runtime, registry hai template/mode có sáu nhiệm vụ cố định, metadata form, validation và compiler interface/receipt; 66 tests mới, tổng 154 TS/SQL tests và build PASS. Hai compiler thực tế vẫn `pending` ở CP-04/05; lưu sidecar/UI ở CP-06. Không thay runtime contract hoặc publish lại bài cũ; Android/hosted không nằm trong PASS này.

**Việc cần làm**

- Định nghĩa ba tầng: template bất biến có phiên bản → JSON đề → Lesson manifest runtime.
- Xây base authoring schema và schema tham số theo template/mode; định nghĩa namespace, mã canonical, variants bước 5/6 và content slots cho phép.
- Xây registry chứa flow sáu bước, metadata form, validate toán và compiler interface.
- Chốt cách lưu authoring input/template version để truy vết, không thêm field trái contract runtime hiện có.

**Kết quả cần đạt**

- JSON đề không chứa mảng checkpoint kỹ thuật, mã thực thi, tọa độ hotspot pixel hoặc đáp án nhập độc lập.
- Template/version lạ, trường lạ, mã curriculum không khớp template và dữ kiện sai bị từ chối bằng lỗi dễ hiểu.
- Flow chuẩn không thể thêm/xóa/đảo bước qua JSON đề.
- Manifest published cũ vẫn đọc và chạy được; có quyết định tương thích và kiểm thử rõ ràng.

### CP-04 — Hoàn thành lát cắt hình trụ theo dữ kiện

- [ ] Hoàn thành — **P1** — Phụ thuộc: CP-03; nghiệm thu Android cần CP-02.

**IN PROGRESS — đã triển khai, chờ người dùng tự nghiệm thu.** Compiler nhận diện, geometry/raycast/fallback theo r/h và ba bộ JSON đã có. Trước yêu cầu dừng test: 162 TS/SQL tests, 6 browser tests (ba đề × hai renderer), 3 Dart parity tests và bundle mobile PASS. Android/native touch và hosted NOT RUN; không đánh dấu hoàn thành. [Báo cáo và cách tự test](docs/qa/cp04-20261113/README.md).

**Việc cần làm**

- Tạo template hình trụ sáu bước cố định; tách mode nhận diện với mode diện tích/thể tích nếu khác mục tiêu.
- Compiler nhận bán kính/chiều cao/đơn vị và variants, sinh mô hình, hình, nhãn, câu hỏi, đáp án và criteria từ cùng dữ kiện.
- Dựng mesh, đoạn đo, vùng chọn, camera và fallback theo mô hình; tránh thông số cố định chỉ đúng đề mẫu.
- Dùng scene/session liên tục qua checkpoint, với quy tắc chuyển sang dữ kiện mới rõ ràng.

**Kết quả cần đạt**

- Ít nhất ba JSON đề khác nhau chạy mà không sửa code; đổi r/h làm tỉ lệ hình và nhãn thay đổi đúng.
- Các bước không tự đạt khi mới vào và đạt được bằng thao tác cho phép; không lộ đáp án bước tự kiểm tra.
- Vùng chạm bám đúng bộ phận sau thay kích thước/hướng nhìn; nhãn đọc được trên điện thoại.
- Web và Android chấm tương đương, WebGL/fallback được kiểm riêng. Hình trải chỉ được tính hoàn thành khi mode đó đã triển khai và nghiệm thu.

### CP-05 — Hoàn thành lát cắt 2D theo dữ kiện

- [ ] Hoàn thành — **P1** — Phụ thuộc: CP-03; nghiệm thu Android cần CP-02.

**IN PROGRESS — đã triển khai parabol y = ax², chờ người dùng tự nghiệm thu.** Chốt mode coefficient, a nguyên khác 0 trong [−5; 5]. Có compiler, ba JSON đề, SVG/point/hit theo mô hình chung, sáu nhiệm vụ và TS/Dart evaluator; tích hợp chọn mẫu Parabol động. Web build và bundle mobile/Edge PASS; unit/browser/SQL/Android NOT RUN theo yêu cầu tự test. [Báo cáo và hướng dẫn](docs/qa/cp05-20261113/README.md).

**Việc cần làm**

- Chọn một template parabol hoặc tam giác vuông và ghi rõ phạm vi trước triển khai.
- Sinh hình, nhãn, nhiệm vụ và đáp án từ mô hình toán chung; dùng ID ngữ nghĩa cho đối tượng.
- Parabol: kiểm hệ số khác 0, đồ thị/điểm và viewport. Tam giác: kiểm dữ kiện dựng được, góc vuông và vai trò đối/kề theo góc đang xét.

**Kết quả cần đạt**

- Ít nhất ba JSON đề chạy đúng mà không sửa code; thay số làm hình đổi thật, không chỉ đổi chữ.
- Dữ kiện không hợp lệ bị chặn; vùng chọn theo đối tượng sau thay vị trí/tỉ lệ.
- Sáu bước đạt đúng vai trò, giữ scene/session; web và Android có bằng chứng tương đương.

### CP-06 — Form admin và luồng AI JSON trong Studio hiện có

- [ ] Hoàn thành — **P1** — Phụ thuộc: CP-03, CP-04, CP-05.

**IN PROGRESS — đã triển khai form/persistence, chờ người dùng tự nghiệm thu và rollout hosted.** Form theo metadata cho hình trụ/parabol, preview/highlight/diff, AI schema/sample/import có review, biến thể ID mới và legacy nâng cao. Server compile lại input; optimistic revision, sidecar snapshot theo published version/hash, trigger immutable và RLS đã có migration/Edge source. Web build và bundle mobile/Edge PASS; không chạy tests/query/migration/deploy remote theo phạm vi lượt này. [Hướng dẫn và trạng thái](docs/qa/cp06-20261113/README.md).

**Việc cần làm**

- Form sinh từ metadata: tên tiếng Việt, ký hiệu alphabet, chú thích, ví dụ, đơn vị và giới hạn; kết quả tính ra ở dạng chỉ đọc.
- Chọn dạng/mode tự nạp flow; chỉ cho sửa content slots được phép. Preview phản ánh dữ kiện và làm nổi đối tượng liên quan khi chỉnh trường.
- Export authoring schema đúng template, JSON mẫu và hướng dẫn AI; import kiểm cấu trúc, toán, dựng hình và khả năng hoàn thành.
- Có preview/diff, phân biệt tạo biến thể với cập nhật bài; cảnh báo chưa lưu. Import không tự publish.
- Giữ màn JSON kỹ thuật ở phần nâng cao và phân biệt rõ luồng legacy.

**Kết quả cần đạt**

- Admin tạo biến thể hình trụ và bài 2D bằng form mà không cần biết LaTeX hoặc sửa key kỹ thuật.
- Lỗi bán kính âm, tần số không hợp lệ và tam giác không dựng được có thông báo cách sửa khi template tương ứng được hỗ trợ.
- Round-trip export → biến thể JSON → import → preview → lưu → publish → learner chạy đúng.
- Published version mới truy vết được authoring input/template version; không ghi đè version hoặc progress cũ.

### CP-07 — Chuẩn hóa 15 mẫu công cụ và thư viện legacy

- [ ] Hoàn thành — **P2** — Phụ thuộc hiện hành: ENG-07; dùng kiến trúc CP-03…06. Tạm hoãn mở rộng cho đến khi core engines đủ năng lực.

**Việc cần làm**

- Chuyển lần lượt 15 mẫu sang template có phiên bản, tham số, mô hình toán và ID ngữ nghĩa.
- Rà sáu vai trò sư phạm, gợi ý hai tầng, nhiệm vụ độc lập bước 5/6; loại lặp câu để đủ số bước hoặc gợi ý lộ đáp án quá sớm.
- Lập kế hoạch cho 10 chủ đề/56 checkpoint và blueprint 3–4 bước: giữ legacy, chuyển đổi có kiểm soát hoặc thay thế khi tương đương đã được chứng minh.
- Phân biệt mẫu công cụ, template chương trình và bài published trong UI/dữ liệu.

**Kết quả cần đạt**

- Mỗi mẫu có tối thiểu ba bộ dữ kiện và bằng chứng đủ sáu bước trên web/Android.
- Không có đường tạo bài chuẩn cho sửa flow tùy ý; bài legacy vẫn truy cập được theo chính sách tương thích.
- Có bảng ánh xạ nguồn cũ → template mới; không xóa dữ liệu hoặc đổi progress ngầm định.

### CP-08 — Phủ ma trận 24 dạng theo template/mode

- [ ] Hoàn thành — **P2** — Phụ thuộc hiện hành: ENG-07 và mode/capability tương ứng đã có; tiếp tục sau ưu tiên core engines.

**Việc cần làm**

- Lập ma trận từng mã/mode → template/version → engine/capability → dữ kiện → sáu bước → test → người duyệt.
- Bổ sung engine/adapter và parity TS/Dart khi thay semantics; cập nhật SQL validator/Edge bundle khi contract hoặc replay thay đổi.
- Triển khai nội dung, kiểm đúng/sai và trường hợp biên; giáo viên/người có chuyên môn duyệt trước publish.

**Kết quả cần đạt**

- Mỗi mode trong phạm vi có template, schema, form, compiler, hình đúng dữ kiện, nội dung duyệt và bằng chứng web/Android.
- Ba mẫu đã có cũng phải nghiệm thu lại theo kiến trúc mới; không mặc định hoàn thành vì từng tồn tại.
- Không gọi “đủ chương trình GDPT” nếu mới phủ danh mục thiết kế chưa được thẩm định độc lập.

| Nhóm mã canonical | Phạm vi cần triển khai/kiểm chứng |
|---|---|
| ALG-01, ALG-02 | Điểm nghiệm, phương trình hai ẩn, hai đường thẳng/giao điểm; xử lý hoặc giới hạn song song/trùng nhau |
| ALG-03 | Mode tích; mode phân thức với điều kiện mẫu khác 0 |
| ALG-04, ALG-05 | Biến đổi bất đẳng thức; nghiệm bất phương trình, mốc/hướng/mở-kín |
| ALG-06, ALG-07, ALG-08 | Căn số học/miền xác định; căn tích/thương/trị tuyệt đối; căn bậc ba và dấu |
| ALG-09, ALG-10, ALG-11 | Parabol; hệ số/biệt thức/số nghiệm; Viète với điều kiện nghiệm phù hợp |
| GEO-01, GEO-02, GEO-03 | Vai trò cạnh theo góc, tỉ số lượng giác, góc phụ/đặc biệt, cạnh và góc |
| GEO-04, GEO-05, GEO-06 | Đối xứng/vị trí điểm; đường thẳng–đường tròn; hai đường tròn và trường hợp đặc biệt |
| GEO-07, GEO-08 | Góc/cung bị chắn; cung/quạt/vành khuyên theo mode |
| GEO-09, GEO-10 | Tâm nội/ngoại tiếp; tứ giác lồi nội tiếp và đa giác đều theo mode |
| GEO-11 | Trụ/nón/cầu; tách nhận diện, diện tích, thể tích và hình trải phù hợp |
| STP-01, STP-02 | Bảng/cột/quạt/ghép nhóm; không gian mẫu, biến cố, xác suất và giả thiết đồng khả năng |

Sáu nhóm core engine là phân loại nghiệp vụ đích; cần adapter ánh xạ tới engine/renderer hiện có. Không tính 15 mẫu công cụ là 24 dạng đã hoàn thành.

### CP-09 — Đồng bộ, hồi quy và bảo toàn dữ liệu

- [ ] Hoàn thành — **P2** — Phụ thuộc: các template chuẩn bị phát hành đã nghiệm thu.

**Việc cần làm**

- Kiểm diff/idempotency trước sync; chỉ publish nội dung đã thay đổi và đã duyệt.
- Regenerate fixtures, runtime mobile và Edge bundle tương ứng; kiểm generated artifact drift.
- Kiểm version cũ, progress isolation, retry/offline/reconnect, đổi account, unpublish/resume và version mới.
- Chạy typecheck/build/unit/browser, Flutter analyze/tests và hosted/device acceptance đúng phạm vi thay đổi.

**Kết quả cần đạt**

- Không tạo version thừa khi dữ liệu không đổi; không mất bản published/progress cũ, không cộng trùng tiến độ.
- Schema/validator/runtime TS/Dart/SQL/Edge nhất quán theo contract liên quan.
- QA gắn với cùng commit và bộ artifact; có readback sau sync cùng cleanup dữ liệu thử.

### CP-10 — Đóng gói phát hành và bàn giao

- [ ] Hoàn thành — **P3** — Phụ thuộc: CP-02, CP-09 và nội dung trong phạm vi release đã duyệt.

**Việc cần làm**

- Hosting HTTPS, SPA fallback và Auth redirect; Android release signing và cấu hình phân phối.
- Kiểm thiết bị Android thật, máy yếu, vòng đời app, accessibility và loading/error/retry. Kiểm iOS trên macOS nếu thuộc phạm vi phát hành; ghi rõ nếu ngoài phạm vi.
- Rà cảnh báo Auth, bundle/performance, logging/monitoring, backup và quy trình rollback.
- Bổ sung CI browser tests và kiểm generated drift; tách hosted/device checks cần secrets và cleanup.
- Cập nhật hướng dẫn máy mới, URL/app version, known issues và kịch bản demo theo bản release.

**Kết quả cần đạt**

- Có URL web, app ký đúng và commit/tag nghiệm thu; người mới chạy được dự án từ source và cấu hình mẫu.
- Demo xuyên suốt: admin tạo → publish → student nhận → học → lưu → resume → xem hoạt động.
- Known issues và NOT RUN được công bố; có người chịu trách nhiệm vận hành, signing và backup.

## 4. Các cổng quyết định — thứ tự hiện hành 14/11/2026

| Cổng | Điều kiện để đi tiếp |
|---|---|
| A — Nền tảng | CP-01/03 có contract/baseline; ENG-00 chốt registry/version/mapping 24 mã |
| B — Năng lực engine | ENG-01…06 triển khai model/schema/evaluator/renderers/config tối thiểu theo từng mode; trạng thái acceptance ghi riêng |
| C — Tích hợp | ENG-07 nối sáu engine vào CMS/Flutter/Edge, giữ legacy/progress và capability coverage rõ |
| D — Nội dung | CP-07/08 chuẩn hóa mẫu và biên soạn template/mode trên các engine đã có; không thay engine bằng bài minh họa tĩnh |
| E — Phát hành | CP-02, CP-09/10 và nội dung release có bằng chứng; NOT RUN không được tính PASS |

**Công việc tiếp theo: ENG-04**, theo [kế hoạch core engines](CORE_ENGINE_IMPLEMENTATION_PLAN.md). ENG-00…03 đã triển khai; người dùng đã cho phép kiểm thử tự động trên điện thoại thật, thay chỉ dẫn tự test trước đó. Trạng thái nghiệm thu phát hành được ghi riêng trong evidence từng ENG.

## 5. Nhật ký cập nhật checkpoint

Mỗi lần triển khai bổ sung một dòng; chỉ đổi checkbox task khi đủ tiêu chí.

| Ngày | CP | Trạng thái | Commit | Kết quả và bằng chứng | Việc còn lại |
|---|---|---|---|---|---|
| 13/11/2026 | Toàn bộ | TODO | Baseline f2cee66 | Lập kế hoạch từ tài liệu và đối chiếu nguồn local; chưa chạy lại ứng dụng hoặc kiểm remote | Bắt đầu CP-01 |
| 13/11/2026 | CP-01 | PASS | Nguồn f2cee66; tài liệu/evidence chưa commit | Typecheck/build/bundles, 88 TS/SQL, 38 browser, 48 Flutter, analyze PASS; [bằng chứng](docs/qa/cp01-20261113/README.md) | CP-02: Android hosted/ANR; CP-03 có thể thiết kế độc lập |
| 13/11/2026 | CP-03 | PASS contract/interface local | Nguồn f2cee66; code/evidence chưa commit | Schema, registry, validate, compiler interface/receipt; 66 tests mới, tổng 154 tests và build PASS; [bằng chứng](docs/qa/cp03-20261113/README.md) | CP-04/05 triển khai compiler; CP-06 UI/lưu sidecar; Android/hosted chưa nghiệm thu |

Mẫu ghi kết quả: `CP-04 / IN PROGRESS — web PASS, Android NOT RUN; evidence: docs/qa/...; còn nghiệm thu hosted và fallback`. Trạng thái hỗn hợp như vậy chưa được đánh dấu hoàn thành.
