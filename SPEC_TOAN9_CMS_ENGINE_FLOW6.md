# ĐẶC TẢ CHUẨN TOÁN 9 — CMS, ENGINE DỰNG HÌNH VÀ FLOW 6 CHECKPOINT

> Yêu cầu của chủ dự án, chốt sau branch `first-version-v2`. Đây là tài liệu thiết kế cho phiên triển khai tiếp theo, không phải báo cáo tính năng đã hoàn thành.
> Hợp nhất từ file Excel/bản trích trong repository, đặc tả fixed-flow đã soạn và tài liệu Markdown chương trình do chủ dự án bổ sung. Excel gốc không còn trong working tree tại lúc hợp nhất; dùng bản trích `learning-platform/contracts/math9-curriculum.json` để đối chiếu mã đang chạy. Hai bản Markdown đầu vào được thay bằng file này sau hợp nhất.
> Đây là tài liệu thiết kế chuẩn duy nhất cho phiên triển khai tiếp. Đọc cùng [bàn giao hiện trạng](PROJECT_HANDOVER_ENGINE_CHECKPOINTS.md) để phân biệt đã có/chưa có. Không coi nội dung thiết kế hoặc JSON minh họa bên dưới là tính năng đã chạy.


## 0. Quyết định hợp nhất và thứ tự ưu tiên

1. Yêu cầu mới nhất của chủ dự án ưu tiên: một flow sáu bước sư phạm, template bất biến theo mode, JSON chỉ đổi đề; hình thể hiện đúng dữ kiện và checkpoint; form admin alphabet + nhãn tiếng Việt + chú thích, không LaTeX.
2. Giữ mã curriculum đang dùng trong `contracts/math9-curriculum.json` để tránh đổi ý nghĩa ID có sẵn. File Markdown bổ sung có mã đại số khác và dùng STA thay STP; chỉ là alias có namespace nguồn, không tự migrate bằng số thứ tự.
3. Quy trình **4 bước thao tác admin** trong tài liệu bổ sung vẫn hữu ích và được giữ ở mục 13. Nó không phải flow học sinh; học sinh luôn có **6 checkpoint**.
4. Bộ ba JSON được gọi là “JSON Schema” trong tài liệu bổ sung thực chất là **payload ví dụ**, không phải schema kiểm định. Mục 15 thay bằng JSON authoring chuẩn đề xuất; phần schema phải được hiện thực riêng.
5. Không yêu cầu admin nhập target_state, forbidden_values, tọa độ hotspot hoặc đáp án tính độc lập. Hệ thống tính từ dữ kiện và nhiệm vụ cố định của template.
6. Có sáu core engine nghiệp vụ. Hình khối dùng renderer 3D chung; theo mã Excel hiện có, GEO-11 thuộc area_fraction_grid, còn geometry_2d_canvas có thể gọi adapter hình học/3D. Không tạo hai hệ phân loại xung đột.
7. Với ALG-04, number_line_engine là nhóm chính theo Excel; balance_scale_engine chỉ là adapter minh họa đại số tùy template. Không mô phỏng “quả cân âm” như khối lượng vật lý: dùng thẻ số đại số và giải thích phép biến đổi.
8. 24 mục là phạm vi ngân hàng đang thiết kế theo tài liệu người dùng. Chưa có bước thẩm định độc lập để kết luận toàn bộ chương trình GDPT đã được phủ đủ hoặc mọi bài đạt mức Nhận biết.

### Đối chiếu mã giữa hai nguồn

Các mã trong bảng được hiểu đầy đủ với tiền tố M9-. Namespace mã nguồn bổ sung: `markdown-supplement-v1`; namespace canonical: `excel-repo-v1`. ID bền vững mới nên dùng topicKey/templateId, không suy ra kiến thức từ số thứ tự.

| Mã trong Markdown bổ sung | Nội dung của mã đó | Mã chuẩn giữ trong repo | Ghi chú |
|---|---|---|---|
| ALG-01 | Phương trình hai ẩn | ALG-01 | Trùng |
| ALG-02 | Hệ hai phương trình | ALG-02 | Trùng |
| ALG-03 | Phương trình tích | ALG-03 / mode product | Tách mode trong dạng gộp hiện có |
| ALG-04 | Điều kiện mẫu số | ALG-03 / mode rational-domain | Không ghi đè ALG-04 hiện tại |
| ALG-05 | Tính chất bất đẳng thức | ALG-04 | Khác số thứ tự |
| ALG-06 | Bất phương trình | ALG-05 | Khác số thứ tự |
| ALG-07 | Căn bậc hai số học | ALG-06 / mode square-root | Tách mode |
| ALG-08 | Điều kiện căn bậc hai | ALG-06 / mode root-domain | Tách mode |
| ALG-09 | Căn bậc ba | ALG-08 | **Không phải parabol** ở namespace nguồn này |
| ALG-10 | Parabol | ALG-09 | Không ghi đè bài bậc hai hiện tại |
| ALG-11 | Bậc hai, biệt thức và Viète | ALG-10 và ALG-11 | Phải chọn mode/template, không nhét mọi mục tiêu vào một bài |
| Không có mục riêng | Căn tích/thương và trị tuyệt đối | ALG-07 | Giữ yêu cầu Excel, không bỏ mất khi hợp nhất |
| GEO-01 đến GEO-11 | Các nhóm hình học tương ứng | GEO-01 đến GEO-11 | Giữ mã; tách mode khi một nhóm có nhiều mục tiêu |
| STA-01 | Thống kê | STP-01 | Alias có namespace |
| STA-02 | Xác suất | STP-02 | Alias có namespace |

Không đổi các topicIds/lessonId/published manifest hiện có chỉ vì file nguồn mới đổi mã. Nếu triển khai import tài liệu cũ phải yêu cầu namespace hoặc cho người dùng chọn nội dung; mã trần ALG-09 không đủ để quyết định.

## 1. Ý tưởng của người dùng — bắt buộc hiểu đúng

Xây sẵn **một khung dẫn dắt chung 6 checkpoint**. Mỗi dạng bài/engine hiện thực khung này thành template hoàn chỉnh. Tạo đề mới chỉ cần thay JSON nội dung/dữ kiện; hệ thống giữ nguyên flow, tự cập nhật hình, nhãn và đáp án theo đề.

**Dùng chung engine không có nghĩa dùng một hình cố định cho mọi câu hỏi.** Hình phải thể hiện đúng đối tượng, dữ kiện và mục tiêu của checkpoint đang học. Đổi góc đang xét thì hình đổi dấu góc và vai trò cạnh; đổi bán kính thì hình và số đo cập nhật; đổi số bi thì hình và không gian mẫu cập nhật.

Không yêu cầu admin hoặc AI viết lại sáu checkpoint kỹ thuật mỗi lần đổi đề. Không tạo một dashboard hoặc trang biên soạn riêng.

### Những phần cố định và phần được thay đổi

| Phần | Cố định trong template | Được thay bằng JSON đề |
|---|---|---|
| Flow | Đúng 6 bước, thứ tự, mục đích sư phạm | Không |
| Tương tác | Những thao tác engine/template hỗ trợ | Chỉ cấu hình trong phạm vi cho phép |
| Chấm bài | Thuật toán, loại điều kiện, nguồn đại lượng cần chấm | Dữ kiện đầu vào; đáp án do hệ thống tính |
| Nội dung | Slot câu hỏi/gợi ý/giải thích của từng bước | Nội dung theo slot, không làm đổi mục tiêu hoặc cơ chế bước |
| Mô hình | Loại đối tượng và quan hệ/ràng buộc hợp lệ | Kích thước, tên, số liệu, dữ liệu, bố trí được phép |
| Hiển thị | Quy tắc hiện/ẩn, đánh dấu và chuyển cảnh từng bước | Giá trị nhãn, màu/hướng nhìn trong phạm vi template |

Muốn đổi thứ tự, số bước, loại tương tác hoặc mục tiêu cốt lõi: tạo phiên bản template mới bằng code. Không để AI tự đổi flow qua file đề.

## 2. Khung dẫn dắt chung

| Bước | Tên cố định | Mục đích | Học sinh làm | Yêu cầu hình và đánh giá |
|---|---|---|---|---|
| 1 | Khám phá | Làm quen đối tượng và thao tác | Kéo, chạm, xoay hoặc thay đổi thử | Có hình đúng với đề; đạt sau một hành động quan sát có ý nghĩa, không chỉ nhấn tiếp tục |
| 2 | Nhận diện | Xác định yếu tố quan trọng | Chọn bộ phận, dữ kiện, hệ số hoặc nhóm | Vùng chọn gắn ID đối tượng; không dựa tọa độ pixel cố định |
| 3 | Tìm quy luật | Thấy quan hệ giữa các yếu tố | Thay một yếu tố, quan sát và xác định quan hệ | Hình và kết quả biến đổi cùng dữ kiện; có nhiệm vụ xác nhận quan hệ |
| 4 | Thực hành có hướng dẫn | Áp dụng với hỗ trợ | Dựng, ghép, chọn hoặc tính theo gợi ý | Có dấu mốc/gợi ý vừa đủ, không tự hoàn thành từ trạng thái đầu |
| 5 | Vận dụng độc lập | Áp dụng cùng dạng với dữ kiện khác | Làm nhiệm vụ mới, giảm hỗ trợ | Biến thể vẫn nằm trong template; hình mới đúng số liệu |
| 6 | Tự kiểm tra và chốt kiến thức | Xác nhận nhận biết/hiểu | Hoàn thành thử thách độc lập | Không lộ đáp án trước; phản hồi giải thích sau khi làm; sai có hướng sửa/thử lại |

Không được đạt yêu cầu bằng cách lặp nguyên một nhiệm vụ sáu lần, dùng hình không liên quan hoặc biến toàn bộ trải nghiệm thành trắc nghiệm chữ. Cơ chế nhận diện vẫn có thể dùng thẻ/chọn khi phù hợp, nhưng checkpoint phải có đối tượng học tập rõ ràng.

Trong một bài giữ session/canvas liên tục. Checkpoint cập nhật trạng thái, nhãn, mục tiêu và tương tác; không remount toàn bộ scene mỗi bước. Khi thực sự cần đổi đối tượng/loại cảnh, template phải khai báo chuyển đổi và quy tắc giữ trạng thái rõ ràng.

## 3. Quy định đặc biệt: admin non-math phải hiểu được tham số

Đây là yêu cầu bắt buộc của chủ dự án, không phải cải tiến tùy chọn.

1. Ký hiệu tham số hiển thị trên form dùng **chữ Latin trong bảng alphabet**: `a`, `b`, `c`, `r`, `h`, `x`, `y`, `N`... Không dùng ký hiệu Hy Lạp/LaTeX làm tên trường admin.
2. Tên tiếng Việt dễ hiểu là thông tin chính; chữ alphabet là ký hiệu phụ để đối chiếu hình. Ví dụ **“Bán kính đáy (r)”**, không chỉ ghi “r”.
3. Mọi trường có chú thích ngắn: ý nghĩa, cách nó tác động lên hình, đơn vị, ví dụ hợp lệ và giới hạn khi cần. Không bắt admin biết công thức để điền.
4. Không hiện `\\frac`, `\\sqrt`, `\\alpha`, `\\Delta`, `x_1`, `a_slider`, `targetX`, `forbidden_values`, `scenePatch`... trong luồng soạn thông thường.
5. Với đại lượng vốn thường dùng chữ Hy Lạp, đặt tên tiếng Việt và một chữ Latin rõ ràng trong admin: “Góc đang xét (g)”, “Số kiểm tra nghiệm (D)”. Renderer học sinh vẫn có thể hiển thị ký hiệu toán học đúng chuẩn; không ép học sinh học ký hiệu sai chỉ để thuận tiện cho admin.
6. Nếu có nhiều đối tượng cùng loại, dùng nhãn như “Bán kính hình thứ nhất (r)” và “Bán kính hình thứ hai (s)”. Tránh ép admin đọc chỉ số dưới. ID nội bộ vẫn phải duy nhất và ổn định.
7. Không ép mọi dữ kiện thành chữ cái: tên nhóm, màu, loại khối, danh sách điểm số dùng nhãn tự nhiên, bảng nhập hoặc dropdown. Quy định alphabet áp dụng cho **ký hiệu tham số**, không thay tên tiếng Việt và mô tả.
8. Đơn vị là trường riêng hoặc hậu tố rõ ràng, ví dụ cm, độ, học sinh. Không nhét đơn vị vào số. Giá trị không hợp lệ phải được giải thích bằng tiếng Việt.
9. Đại lượng tính ra tự động hiển thị dạng chỉ đọc với lời giải thích. Admin không phải nhập lại đáp án hoặc kết quả trung gian.
10. File JSON có thể dùng key kỹ thuật tiếng Anh và ID máy đọc; form phải ánh xạ sang nhãn thân thiện. Màn JSON nâng cao là tùy chọn, không phải cách bắt buộc để tạo/đổi đề.

### Bảng nhãn và chú thích mẫu cho admin

| Đối tượng | Tên trường trên admin | Chú thích mẫu | Kiểu nhập |
|---|---|---|---|
| Hình trụ/nón/cầu | Bán kính (r) | Khoảng cách từ tâm tới mép hình tròn hoặc mặt cầu. Đổi số này làm khối rộng/hẹp hơn. Ví dụ: 3 cm. | Số dương + đơn vị |
| Hình trụ/nón | Chiều cao (h) | Độ cao vuông góc của khối. Hình nón: từ đỉnh xuống tâm đáy. Ví dụ: 5 cm. | Số dương + đơn vị |
| Hình nón | Đường sinh (l) | Đoạn từ đỉnh tới mép đáy; hệ thống tính từ bán kính và chiều cao. | Chỉ đọc |
| Hình học | Góc đang xét (g) | Góc cần học sinh quan sát. Đổi góc sẽ dựng lại hình trong phạm vi bài. Ví dụ: 30 độ. | Số/dropdown + đơn vị độ |
| Tam giác | Độ dài cạnh AB | Khoảng cách giữa điểm A và B. Nhãn AB phải khớp cạnh được tô trên hình. | Số dương + đơn vị |
| Parabol | Hệ số mở đồ thị (a) | Số dương làm đồ thị mở lên; số âm làm đồ thị mở xuống. Không dùng 0 cho bài parabol. | Số khác 0 + ví dụ |
| Phương trình bậc hai | Hệ số trước x (b) | Số đi cùng x, bao gồm dấu âm. Nếu không có phần x thì nhập 0. | Số |
| Phương trình | Số hạng cố định (c) | Phần không chứa x trong dạng phương trình đang soạn. | Số |
| Phương trình bậc hai | Số kiểm tra nghiệm (D) | Hệ thống tính để xác định phương trình có hai nghiệm, một nghiệm kép hoặc không có nghiệm thực. | Chỉ đọc |
| Điểm | Vị trí ngang (x) / Vị trí dọc (y) | Khoảng cách có hướng theo hai trục. Cho phép kéo điểm để nhập thay cho gõ số. | Số hoặc kéo điểm |
| Trục số | Mốc giới hạn (m) | Điểm bắt đầu của miền được chọn. Ví dụ: 3. | Số |
| Trục số | Có lấy mốc không? | Chọn Có nếu giá trị đúng bằng mốc cũng được chấp nhận. | Có/Không |
| Trục số | Phía được chấp nhận | Các số nhỏ hơn mốc ở bên trái; lớn hơn mốc ở bên phải. | Trái/Phải |
| Thống kê | Tổng số quan sát (N) | Tổng tất cả số lượng trong bảng. Hệ thống cộng tự động. | Chỉ đọc |
| Thống kê | Số lượng của nhóm | Ví dụ: nhóm Giỏi có 10 học sinh. Nhập số lượng, hệ thống tính phần trăm. | Bảng nhập số nguyên |
| Xác suất | Số lượng bi đỏ | Số bi đỏ thật sự xuất hiện trong túi của mô hình. | Số nguyên không âm |
| Xác suất | Điều kiện biến cố | Chọn bằng form, ví dụ “Màu là đỏ” hoặc “Số chia hết cho 3”; không yêu cầu viết mã. | Bộ chọn điều kiện |

Tên a/b/c phải theo dạng phương trình cụ thể của template; không dùng cùng một chú thích cứng cho mọi công cụ. Trong form bậc hai, a là hệ số trước x bình phương; trong form phương trình hai ẩn, a là hệ số trước x. Luôn có preview biểu thức đúng dữ kiện, dạng trình bày dễ đọc, không lộ mã LaTeX.

### Nghiệm thu UX admin

- Người không biết LaTeX có thể tạo một biến thể chỉ bằng nhãn tiếng Việt, ví dụ và preview.
- Form không có nhãn chỉ gồm ký hiệu hoặc key kỹ thuật; không xuất hiện chuỗi LaTeX thô.
- Chạm trường bán kính/cạnh/góc thì preview làm nổi đúng đối tượng liên quan.
- Thử ba lỗi: bán kính âm, tổng tần số không hợp lệ, bộ dữ kiện không dựng được tam giác; UI giải thích cụ thể cách sửa.
- Nội dung trợ giúp không được chỉ là công thức mà không giải thích ý nghĩa.

## 4. Kiến trúc dữ liệu cần triển khai

Tách ba tầng; đây là thiết kế đích, không phải schema hiện tại đã hỗ trợ.

### Tầng A — template bất biến theo phiên bản

`templateId + templateVersion` xác định sáu bước, loại nhiệm vụ, khả năng engine, schema tham số, cách tính, slot nội dung, cách dựng cảnh và cách chấm. Flow nằm trong code/registry được tin cậy. JSON do AI trả về chỉ được tham chiếu template này.

Một core engine phục vụ nhiều template. Một template ứng với dạng bài/mode cụ thể. Không dùng một flow thao tác cứng giống hệt nhau cho cả ba khối trụ/nón/cầu hoặc mọi bài hình học; chúng cùng giữ sáu vai trò sư phạm nhưng có cách hiện thực riêng.

### Tầng B — JSON đề dành cho admin/AI

Chứa templateId, phiên bản, dữ kiện, biến thể cho bước 5/6, tên/nhãn và nội dung tùy chọn theo slot. Không chứa mảng checkpoint kỹ thuật, mã thực thi, tọa độ vùng chạm pixel hay đáp án tính độc lập.

Ví dụ minh họa cần hiện thực:

```json
{
  "templateId": "math9-cylinder-recognition",
  "templateVersion": 1,
  "title": "Khám phá chiếc hộp hình trụ",
  "parameters": {
    "radius": 4,
    "height": 7,
    "unit": "cm"
  },
  "variants": {
    "practice": {"radius": 3, "height": 6},
    "assessment": {"radius": 5, "height": 8}
  },
  "content": {
    "context": "Một chiếc hộp có dạng hình trụ.",
    "exploreInstruction": "Xoay để quan sát chiếc hộp."
  }
}
```

Slot nội dung được template cho phép phải có giới hạn và quy tắc. Không coi một câu hỏi bất kỳ do AI viết là tương thích với nhiệm vụ của checkpoint chỉ vì JSON đúng kiểu string. Câu hỏi có số liệu nên sinh bằng binding từ dữ kiện, tránh AI gõ lại số khác.

### Tầng C — manifest chạy bài

Compiler tạo Lesson runtime hiện có: scene, objects, recognition nếu cần, sáu checkpoint, initial state, criteria và completion. Người dùng thường không sửa tầng này. Giữ tương thích hoặc có chuyển đổi rõ ràng cho phiên bản published cũ và progress đang lưu.

### Một nguồn sự thật cho dữ kiện

Tham số đề → mô hình toán → hình + nhãn + câu hỏi có số liệu + đáp án + điều kiện chấm. Không duy trì năm bản số liệu độc lập. Ví dụ đổi r của hình trụ thì mesh, đoạn bán kính, nhãn và mọi phép tính liên quan cùng cập nhật.

Các công thức/ràng buộc tính bằng hàm đã triển khai hoặc AST whitelist; không `eval`, không JavaScript do nội dung cung cấp. Đáp án tự tính có thể được đưa ra JSON chạy bài bởi compiler, nhưng không tin đáp án AI nhập làm nguồn đúng.

## 5. Quy tắc dựng hình theo từng checkpoint

Mỗi đối tượng/bộ phận có ID ngữ nghĩa: đỉnh, cạnh, bán kính, tâm, cột dữ liệu, thẻ kết quả... Câu hỏi và điều kiện chấm tham chiếu ID đó. Nhãn hiển thị có thể đổi mà không làm hỏng ID.

Mỗi bước có cấu hình hiển thị do template định nghĩa:

- Những đối tượng nào hiện, nhãn nào hiện, số đo nào ẩn vì là đại lượng cần tìm.
- Góc/cạnh/cung/nhóm nào được đánh dấu; dữ kiện đã biết và cần tìm phân biệt rõ.
- Những điểm/thanh trượt/bộ phận nào được thao tác, giới hạn ra sao.
- Biến thể dữ kiện nào được áp dụng ở bước 5/6.
- Camera, trục, tỉ lệ, nhãn và vùng chạm được tính theo mô hình, không hardcode pixel cho đề mẫu.

Ví dụ tam giác: đổi góc đang xét từ B sang C phải đổi dấu góc và vai trò đối/kề; đổi cạnh huyền 10 thành 8 và góc 30 thành 45 phải dựng lại tam giác đúng dữ kiện. Không chỉ sửa chữ “10” thành “8” trên hình cũ.

Khối lập phương minh họa căn bậc ba dùng độ lớn hình học dương. Số âm biểu thị qua dấu đại số, không dựng “thể tích âm”. Trường hợp hình suy biến hoặc hệ không xác định phải được xử lý có chủ đích hoặc bị schema/template từ chối.

## 6. Đối chiếu 15 mẫu công cụ hiện có

| Mẫu | Việc cần làm để thay đề là hình thay đúng |
|---|---|
| Phân loại phương trình | Sinh thẻ và nhóm từ mô hình biểu thức; kiểm tra dạng bằng logic toán |
| Chạm hệ số | Tách biểu thức thành phần có ID, vùng chạm bám phần được dựng; hỗ trợ hệ số âm/ẩn |
| Trục số bất phương trình | Sinh mốc, tia, đầu mút, nhãn và viewport từ bất phương trình |
| Đổi chiều bất đẳng thức | Mô hình hai giá trị và phép biến đổi; hoạt ảnh tịnh tiến/phản chiếu, tự tính dấu |
| Ghép công thức Viète | Sinh ô/thẻ và kết quả theo hệ số, điều kiện nghiệm thực |
| Parabol | Dựng đồ thị, điểm và trục từ hệ số; tự fit phạm vi nhìn |
| Biệt thức D | Vẽ đúng phương trình đang hỏi, tự tính D, nghiệm và giao điểm |
| Tam giác vuông | Dựng theo ràng buộc; ID cạnh và góc; đối/kề đổi theo góc đang xét |
| Đường tròn và tiếp tuyến | Dựng tâm/bán kính/đường, khoảng cách và giao điểm thật |
| Góc và cung | Điểm bám đường tròn; tính và tô đúng cung/góc theo đề |
| Hình nón | Param hóa r/h, tự tính l; label, camera, vùng chọn theo khối |
| Hình trụ | Param hóa r/h, hai đáy, mặt bên; mặt cắt/trải phẳng khi template cần |
| Hình cầu | Param hóa r, tâm, đường kính; mặt cắt theo mục tiêu |
| Biểu đồ | Sinh cột/quạt, trục, nhãn, vùng chọn và tỉ lệ từ bảng dữ liệu |
| Biến cố | Sinh đúng đồ vật/số lượng và tập kết quả; tính sự kiện từ cùng cấu hình |

15 mẫu này không bao phủ đầy đủ 24 dạng chương trình. Không đổi nhãn “Chưa có mẫu” thành “Hoàn thành” chỉ vì có engine gần giống.

## 7. Ma trận 24 dạng theo Excel: hình và flow cần hiện thực

Mã trong bảng bỏ tiền tố `M9-` cho gọn. Số 1–6 là sáu vai trò cố định ở mục 2; nội dung bên dưới là cách hiện thực cho từng dạng. Với dạng có nhiều mode, dùng các template con cố định theo mode, không nhét tất cả vào một bài sáu bước quá tải.

### Số và Đại số

| Mã / dạng | Mô hình và dữ kiện | Cách hiện thực sáu checkpoint |
|---|---|---|
| ALG-01: Phương trình hai ẩn | Phương trình; a/b/c, điểm x/y; Oxy và đường nghiệm | 1 kéo điểm quan sát hai vế; 2 nhận dạng phương trình; 3 khám phá điểm thuộc đường nghiệm; 4 đặt điểm có hỗ trợ; 5 kiểm tra điểm mới; 6 tự nhận dạng và chọn nghiệm |
| ALG-02: Hệ hai phương trình | Hai đường thẳng; hai bộ hệ số; giao điểm và đường chiếu | 1 đi theo từng đường; 2 ghép phương trình với đường; 3 tìm điểm chung; 4 đặt ghim có hỗ trợ; 5 hệ mới; 6 tự đọc nghiệm. Xử lý song song/trùng nhau hoặc khóa phạm vi template |
| ALG-03: Tích và ẩn ở mẫu | Nhân tử, mẫu số, thanh x, giá trị cấm | 1 đổi x; 2 chỉ nhân tử/mẫu; 3 khám phá tích bằng 0 hoặc mẫu khác 0; 4 thực hành có gợi ý; 5 biểu thức mới; 6 phân biệt điều kiện với nghiệm. Tách mode tích và mode phân thức nếu cần |
| ALG-04: Bất đẳng thức | Hai điểm a/b, phép toán và giá trị biến đổi | 1 kéo/so sánh; 2 chỉ hai vế và dấu; 3 quan sát cộng/nhân số âm; 4 chọn dấu có minh họa; 5 phép biến đổi mới; 6 tự xác định dấu và quy tắc |
| ALG-05: Bất phương trình | Hệ số/dấu → mốc, hướng và đầu mút | 1 thử x; 2 nhận mốc/dấu; 3 tìm quan hệ miền nghiệm; 4 dựng có gợi ý; 5 đề mới; 6 tự dựng mốc/hướng/mở-kín |
| ALG-06: Căn bậc hai | Hình vuông diện tích/cạnh; biểu thức dưới căn và miền hợp lệ | 1 thay cạnh; 2 phân biệt cạnh/diện tích; 3 căn số học không âm/điều kiện; 4 tìm với hỗ trợ; 5 dữ kiện mới; 6 tự xác định. Có thể tách mode giá trị và điều kiện xác định |
| ALG-07: Quy tắc căn | Vùng diện tích ghép/tách, thừa số/mẫu, dấu A | 1 ghép/tách; 2 nhận thừa số và điều kiện; 3 quy tắc căn tích/thương hoặc trị tuyệt đối; 4 ghép có hỗ trợ; 5 dữ kiện mới gồm dấu âm; 6 chọn đúng quy tắc. Mỗi mode có điều kiện toán riêng |
| ALG-08: Căn bậc ba | Lập phương, cạnh/thể tích theo độ lớn; dấu đại số riêng | 1 đổi cạnh; 2 nhận cạnh/thể tích; 3 liên hệ lập phương và căn; 4 dựng theo thể tích; 5 số âm; 6 tự xác định căn |
| ALG-09: Parabol | a khác 0, điểm thăm dò x/y, miền trục | 1 kéo a; 2 nhận a/đỉnh; 3 dấu a và hướng mở/giá trị y; 4 dựng có gợi ý; 5 tìm a hoặc y theo điểm mới; 6 tự dựng/nhận diện |
| ALG-10: Bậc hai và D | a/b/c, D, đồ thị đúng phương trình, nghiệm/giao điểm | 1 đổi hệ số; 2 nhận hệ số; 3 D và số nghiệm; 4 tính/chọn có hỗ trợ; 5 phương trình mới; 6 tự nhận hệ số/D/số nghiệm |
| ALG-11: Viète | Khay tổng/tích và thẻ nghiệm; hệ số | 1 thử ghép nghiệm; 2 nhận hệ số; 3 liên hệ tổng/tích; 4 ghép công thức; 5 phương trình mới; 6 tự xác định và kiểm cặp nghiệm. Kiểm điều kiện nghiệm thực |

### Hình học và Đo lường

| Mã / dạng | Mô hình và dữ kiện | Cách hiện thực sáu checkpoint |
|---|---|---|
| GEO-01: Tỉ số lượng giác | Tam giác vuông; tên đỉnh/cạnh/góc; đối/kề/huyền theo góc | 1 chọn góc/quan sát; 2 chỉ cạnh; 3 liên hệ tỉ số; 4 ghép có gợi ý; 5 đổi góc/tên/hướng; 6 tự chọn tỉ số đúng |
| GEO-02: Góc đặc biệt/phụ nhau | Tam giác 30/45/60 độ; hai góc phụ; giá trị chính xác | 1 đổi góc; 2 nhận góc phụ; 3 quan hệ sin/cos; 4 ghép giá trị; 5 cặp góc mới; 6 tự xác định quan hệ/giá trị |
| GEO-03: Cạnh và góc | Tam giác theo dữ kiện hợp lệ; biết/ẩn phân biệt | 1 thay góc/cạnh; 2 nhận dữ kiện và đại lượng tìm; 3 chọn quan hệ; 4 ghép có hỗ trợ; 5 số liệu mới; 6 tự chọn công thức/kết quả |
| GEO-04: Đường tròn/đối xứng | O/r, điểm M, trục, điểm đối xứng | 1 kéo điểm/đường; 2 nhận tâm/bán kính/đường kính; 3 đối xứng và khoảng cách; 4 trong-trên-ngoài có gợi ý; 5 hình mới; 6 tự nhận trục/tâm/vị trí |
| GEO-05: Đường thẳng–đường tròn | O/r, đường thẳng, khoảng cách d, giao/tiếp điểm | 1 kéo đường; 2 nhận r/d; 3 ba vị trí; 4 dựng tiếp tuyến có hỗ trợ; 5 bán kính/vị trí mới; 6 tự phân loại và nhận góc vuông |
| GEO-06: Hai đường tròn | Hai tâm, bán kính r/s, khoảng cách d | 1 kéo tâm; 2 nhận ba đại lượng; 3 quan hệ d với tổng/hiệu bán kính; 4 dựng tiếp xúc; 5 số liệu mới; 6 tự phân loại. Xử lý chứa nhau, đồng tâm/trùng nhau đúng toán |
| GEO-07: Góc và cung | Điểm bám đường tròn, cung bị chắn, hai loại góc | 1 kéo điểm; 2 nhận loại góc/cung; 3 quan hệ số đo; 4 tìm góc có gợi ý; 5 đổi điểm/số đo; 6 tự chọn cung và góc đúng |
| GEO-08: Cung/quạt/vành khuyên | r/s, góc g, vùng tô và đơn vị | 1 kéo góc/bán kính; 2 nhận vùng; 3 phần hình so với toàn hình; 4 ghép công thức; 5 số liệu mới; 6 tự tính và chọn đơn vị. Dùng mode riêng cho từng loại vùng |
| GEO-09: Nội/ngoại tiếp tam giác | Ba đỉnh; trung trực/phân giác; tâm/bán kính tính ra | 1 kéo đỉnh; 2 nhận đường dựng; 3 quan sát giao điểm/tâm; 4 dựng/chọn có hỗ trợ; 5 tam giác mới gồm vuông; 6 tự phân biệt hai tâm |
| GEO-10: Nội tiếp/đa giác đều | Bốn điểm bám đường tròn; góc đối; số cạnh đa giác | 1 di chuyển/quan sát; 2 nhận điều kiện; 3 góc đối hoặc tính đều; 4 nhiệm vụ có gợi ý; 5 đổi dữ kiện/hướng/số cạnh; 6 tự nhận và hoàn thành. Tách mode tứ giác và đa giác |
| GEO-11: Trụ/nón/cầu | Loại khối, r/h, l tính ra, mặt/đoạn đo, hình trải khi phù hợp | 1 xoay; 2 nhận bộ phận; 3 đổi kích thước/khám phá quan hệ; 4 thực hành có gợi ý; 5 dữ kiện mới; 6 tự kiểm tra. Có template con trụ/nón/cầu và mục tiêu nhận biết/diện tích/thể tích; không gắn câu hỏi h/l của nón vào cầu |

### Thống kê và Xác suất

| Mã / dạng | Mô hình và dữ kiện | Cách hiện thực sáu checkpoint |
|---|---|---|
| STP-01: Tần số/biểu đồ | Bảng nhóm hoặc khoảng, số lượng; cột/quạt đúng dữ liệu | 1 chạm đọc dữ liệu; 2 nhận số lượng/tổng; 3 quan hệ phần trăm; 4 hoàn thành bảng/biểu đồ có hỗ trợ; 5 dữ liệu mới; 6 tự đọc/tính. Có mode cột, quạt, ghép nhóm |
| STP-02: Phép thử/xác suất | Bi/thẻ/xúc xắc/đồng xu; tập kết quả, điều kiện sự kiện | 1 khám phá kết quả có thể; 2 nhận không gian mẫu/sự kiện; 3 thuận lợi so với tổng đồng khả năng; 4 chọn có hỗ trợ; 5 đổi cấu hình/thử nghiệm; 6 tự phân loại/tính xác suất. Xử lý đúng giả thiết có/không hoàn lại nếu hỗ trợ |

### Sáu core engine theo Excel

Giữ sáu nhóm nghiệp vụ: `geometry_2d_canvas`, `cartesian_graph_engine`, `balance_scale_engine`, `area_fraction_grid`, `number_line_engine`, `data_probability_sim`. Đây là kiến trúc đích, không đồng nhất tên với 13 engine nền hay 13 kiểu U-IME hiện tại. Trong code có thể tách renderer 3D dùng chung cho nhóm diện tích/khối; phải có adapter và ma trận ánh xạ rõ ràng.

## 8. Import/export và Studio phải hoạt động thế nào

1. Bài học là màn quản lý chính. Thêm bài/Sửa bài mới mở Studio. Dùng lại giao diện, Auth, phân quyền và nơi lưu hiện có.
2. Chọn dạng/mode → template tự tạo sáu checkpoint. Admin không phải chọn sáu engine riêng.
3. Form dữ kiện dùng nhãn và chú thích ở mục 3. Đổi số thì preview cập nhật ngay.
4. Danh sách sáu bước cho xem/sửa các slot nội dung hợp lệ; không có thêm/xóa/đổi thứ tự bước trong flow chuẩn.
5. Tải một schema đề của template cùng JSON ví dụ hoặc bundle hướng dẫn cho AI. Cần nói rõ schema mới là authoring schema; `lesson-six.schema.json` hiện tại vẫn là full runtime manifest, chưa đáp ứng thiết kế khóa flow.
6. AI trả về JSON đề, không trả mảng checkpoint kỹ thuật. Import kiểm template/version, kiểu dữ liệu, ràng buộc toán, nội dung slot, khả năng dựng và khả năng hoàn thành.
7. Hiện bản xem trước và các thay đổi so với đề gốc; chưa tự xuất bản. Phân biệt rõ Tạo biến thể mới và Cập nhật bài hiện tại.
8. Publish vẫn tạo version mới, không sửa published cũ. Ghi template version và authoring input để truy vết; cần quyết định cách lưu mà không phá schema runtime cũ. Không thêm field bừa vào contract đang khóa additionalProperties.
9. Đề cũ tiếp tục chạy bằng manifest/version đã xuất bản. Không biên dịch lại progress cũ theo template mới một cách ngầm định.

## 9. Trạng thái thật tại lúc bàn giao

- Branch nền: `first-version-v2`; commit triển khai trước tài liệu này: `3e15a58`.
- Đã có 15 mẫu công cụ, 90 checkpoint; đã đồng bộ 15 bài lớp 9 lên Supabase. 12 mẫu 2D, 3 mẫu 3D trụ/nón/cầu.
- Hình 3D vẫn có kích thước cố định trong `src/UimeSolid.tsx`. Nhiều hình 2D còn hardcode tọa độ hoặc nội dung minh họa.
- Import/export hiện cho sửa full manifest. Có kiểm schema/số bước/khả năng hoàn thành nhưng chưa khóa flow bằng template authoring như thiết kế này.
- Có danh mục 24 dạng Excel, mới ba mẫu curriculum-specific; 21 dòng chưa có mẫu. 15 mẫu công cụ không tương đương phủ hết 24 dạng.
- Còn 10 chủ đề recognition cũ/56 checkpoint và các blueprint 3–4 bước. Cần kế hoạch hợp nhất, không xóa tùy tiện.
- Kiểm thử trước tài liệu: 88 TS/SQL, 38 browser, 48 Flutter, build/bundle/analyze đạt. Đây không phải bằng chứng thiết kế mới đã được triển khai.
- Android hosted/ANR bài bi, iOS, thiết bị thật chưa được nghiệm thu lại; đọc file bàn giao hiện trạng.

## 10. Bản đồ code cho người triển khai

| Vị trí | Việc liên quan |
|---|---|
| `learning-platform/packages/lesson-authoring/engine-checkpoints.ts` | Nội dung sáu bước hiện tại; nguồn để tách registry template |
| `packages/lesson-authoring/uime-bank.ts` | 15 khuôn công cụ |
| `packages/lesson-authoring/math9.ts` | Compiler recognition hiện có; mở rộng hoặc bọc bằng compiler authoring mới |
| `packages/lesson-authoring/curriculum-pilot.ts` | Ba mẫu curriculum, full manifest import/AI bundle cũ cần chuyển đổi |
| `packages/lesson-contract`, `contracts/lesson.schema.json` | Contract runtime; giữ tương thích phiên bản |
| `contracts/lesson-six.schema.json`, `contracts/engine-templates/` | Bộ schema/mẫu runtime hiện có; không nhầm với authoring schema đề mới |
| `src/Admin.tsx`, `LessonLibrary.tsx`, `StudioEditor.tsx` | Luồng dashboard có sẵn, không dựng dashboard khác |
| `src/LessonJsonTools.tsx`, `UimeEditor.tsx`, `Math9Studio.tsx` | Import/export và form cần thân thiện hơn, khóa flow chuẩn |
| `src/UimeScene.tsx`, `UimeSolid.tsx` | Bỏ hình/thông số cứng, nhận mô hình được compiler dựng |
| `packages/lesson-runtime` | Interaction, metrics, replay; không tin cờ đúng từ client |
| `apps/mobile/lib`, `apps/mobile/assets/runtime` | Dart/native và bridge; phải regenerate bundle khi renderer đổi |
| `scripts/export-engine-templates.ts`, `export-math9.ts` | Tái tạo fixtures; không tự publish remote |

Các đường dẫn rút gọn trong bảng tính từ `learning-platform/`. Giữ nguyên `rea-main/` không liên quan. Đọc workspace skill `lesson-platform` trước khi sửa.

## 11. Thứ tự triển khai đề xuất

### Giai đoạn 1 — chứng minh kiến trúc bằng một lát cắt

- Chọn hình trụ làm lát cắt 3D: registry template bất biến, JSON đề ngắn, form r/h có chú thích, compiler, tự dựng hình/camera/nhãn, sáu bước, tự tính đáp án.
- Chọn tam giác hoặc parabol làm lát cắt 2D: chứng minh đổi dữ kiện thì hình và checkpoint đổi đúng, không chỉ thay nhãn.
- Hoàn thành export schema → AI hoặc file biến thể → import → preview → publish → learner. Test cả web và Android.
- Chốt interface dùng chung rồi mới nhân ra các dạng khác, không mở rộng 24 form hardcode riêng biệt.

### Giai đoạn 2 — chuẩn hóa 15 công cụ hiện có

- Chuyển từng công cụ sang mô hình tham số/ID ngữ nghĩa; bảng mục 6 là checklist.
- Khóa sáu bước cho đường tạo bài chuẩn. Luồng legacy được phân biệt để không âm thầm bỏ nội dung cũ.
- Sinh schema đề theo template và metadata form (nhãn alphabet, tiếng Việt, chú thích, đơn vị, giới hạn).

### Giai đoạn 3 — phủ 24 dạng chương trình

- Ma trận từng mã: template/mode → engine → dữ kiện → sáu checkpoint → khả năng còn thiếu → test web/Android.
- Bổ sung các khả năng còn thiếu như giao hai đường thẳng, domain guard, ràng buộc hình học, dựng tâm, quạt/vành khuyên, trải phẳng, biểu đồ ghép nhóm và không gian mẫu.
- Mỗi mẫu phải có nội dung đúng mục tiêu; giáo viên duyệt trước khi gọi là hoàn thiện chương trình.

### Giai đoạn 4 — đồng bộ và bàn giao

- Chỉ đổi remote sau khi xác nhận đúng project và có kết quả validate. Backup trước thay đổi hàng loạt.
- Diff/idempotent sync, publish bài thay đổi thành version mới. Không tạo version mới chỉ vì regenerate file giống nhau.
- Cập nhật `task.md`, `docs/qa/verification-report.md` và bàn giao: PASS/FAIL/NOT RUN cụ thể. Không đánh dấu Android pass từ test browser.

## 12. Tiêu chí nghiệm thu bắt buộc

### Cho mỗi template/dạng bài

- Có đúng sáu checkpoint theo vai trò mục 2, không chỉ đủ số bước.
- Ít nhất ba bộ JSON đề khác nhau; không sửa code giữa ba bộ.
- Thử đổi số liệu, tên/nhãn, hướng nhìn hoặc vị trí hợp lệ, dữ kiện bước 5/6.
- Hình đúng dữ kiện; nhãn không chồng/ra ngoài; đối tượng cần tìm không bị lộ đáp án.
- Vùng chạm đi theo bộ phận; đổi vị trí hoặc tỉ lệ không làm chấm nhầm.
- Đáp án tính từ mô hình; không có dữ kiện/đáp án độc lập bị lệch.
- Mỗi bước chưa tự đạt lúc vào, đạt được bằng tương tác cho phép, chuyển bước giữ scene/session.
- JSON cố thêm bước, đổi thứ tự hoặc đổi cơ chế phải bị từ chối; template/version lạ cũng bị từ chối.
- Lỗi toán/hình suy biến được báo bằng tiếng Việt, không làm crash.
- Web và Android cùng JSON cho kết quả chấm tương đương; kiểm cả WebGL/fallback và lỗi bridge.

### Cho toàn sản phẩm

- Người admin non-math điền được form mà không đọc LaTeX hoặc key kỹ thuật.
- Import không tự publish, không ghi đè bài gốc ngoài ý muốn.
- Published version và progress cũ vẫn hoạt động.
- Có test round-trip JSON, test số liệu không hợp lệ, test hình/nhãn, kiểm thử đầy đủ 6 bước và parity TS/Dart khi đổi semantics.
- Chạy `npm run build`, `npm test`, `npm run test:e2e`; regenerate và kiểm bundle mobile; chạy `flutter test` và `flutter analyze`. Chạy emulator/hosted riêng trước nghiệm thu native.
- Không tuyên bố phủ 24 dạng nếu còn mục chưa có template và bằng chứng đạt.

## 13. Quy trình admin bốn thao tác — khác với sáu checkpoint học sinh

| Thao tác admin | Giao diện cần có | Hệ thống chịu trách nhiệm |
|---|---|---|
| 1. Chọn phân môn, dạng bài và mode | Tên dễ đọc, mã chuẩn, mục tiêu, mẫu minh họa | Chọn template và core engine tương ứng; không bắt admin chọn engine kỹ thuật |
| 2. Nhập dữ kiện hoặc nạp JSON đề | Form động, ký hiệu alphabet + chú thích tiếng Việt; preview liên kết | Kiểm dữ kiện, dựng hình, tính kết quả; hỗ trợ số dễ quan sát và phạm vi template |
| 3. Kiểm tra sáu bước và gợi ý | Sáu bước cố định; sửa slot nội dung được phép, xem hai tầng gợi ý | Sinh nhiệm vụ/criteria từ template; tính đáp án; ngăn nội dung vượt khả năng engine |
| 4. Xem thử, lưu nháp và xuất bản | Preview đủ sáu bước; thông báo lỗi cụ thể, thao tác xuất bản riêng | Validate, compile, lưu authoring input/template version, publish manifest version mới |

Tùy chọn nâng cao dành cho người kỹ thuật có thể xem manifest/schema, nhưng việc này không thay thế form dành cho admin non-math.

### Sáu nhóm core engine và khả năng cần xây

| Core engine canonical | Các dạng chính | Khả năng dựng/tính | Dữ kiện admin thấy |
|---|---|---|---|
| geometry_2d_canvas | GEO-01 đến GEO-10 | Tam giác ràng buộc, góc/cạnh động, đường tròn, giao/tiếp xúc, đối xứng, nội/ngoại tiếp, cung/quạt/vành khuyên, đa giác | Tên điểm, độ dài cạnh, bán kính (r/s), góc (g), số cạnh; công cụ kéo điểm; các lớp dựng hình có tên tiếng Việt |
| cartesian_graph_engine | ALG-01, ALG-02, ALG-09 | Phương trình và điểm nghiệm, hai đường thẳng/giao điểm, parabol, trục tự fit, ghim/snap | Các hệ số có diễn giải riêng, vị trí ngang (x)/dọc (y), khoảng quan sát tùy chọn |
| balance_scale_engine | ALG-03, ALG-10, ALG-11; adapter cho ALG-04 | Biểu thức cấu trúc, nhân tử, domain guard, hệ số và dấu, biệt thức D, khay Viète; thẻ biến đổi đại số | Biểu mẫu phương trình, hệ số, loại phép biến đổi; kết quả tự tính, không nhập đáp án rời |
| area_fraction_grid | ALG-06 giá trị, ALG-07, ALG-08 minh họa khối, GEO-11 | Lưới diện tích, ghép/tách, lập phương; adapter renderer 3D trụ/nón/cầu và hình trải phù hợp | Diện tích (S), cạnh/độ dài, bán kính (r), chiều cao (h), loại khối, đơn vị |
| number_line_engine | ALG-04, ALG-05, ALG-06 domain, ALG-08 dấu/giá trị | Mốc/tia/đầu mút, phép biến đổi, miền hợp lệ và so sánh giá trị | Mốc (m), có lấy mốc không, trái/phải, số kiểm tra (x), số dưới căn |
| data_probability_sim | STP-01, STP-02 | Bảng và biểu đồ, tần số/tỉ lệ, đồ vật và không gian mẫu, sự kiện/đếm xác suất | Tên nhóm, số lượng, kiểu biểu đồ, loại phép thử, điều kiện biến cố bằng form |

GEO-11 có thể dùng helper hình học trong geometry renderer, nhưng curriculum ownership vẫn theo bảng canonical. Một bài căn bậc ba có thể phối hợp number line và cube preview; không cần thêm core engine nghiệp vụ thứ bảy chỉ vì thêm renderer.

## 14. Ví dụ đề, thao tác và gợi ý hai tầng — hợp nhất từ nguồn bổ sung

Các ví dụ dưới đây dùng mã canonical đã đối chiếu ở mục 0. Mỗi cặp gợi ý gắn với mục tiêu cụ thể của checkpoint, không tự động đưa cùng lời giải lên cả sáu bước. Tầng 1 chỉ hướng quan sát/thao tác; tầng 2 giải thích quy tắc. Bước tự kiểm tra không hiện đáp án trước khi người học thực hiện.

| Dạng / ví dụ | Tương tác và biểu thị bắt buộc | Gợi ý 1: trực quan | Gợi ý 2: quy tắc |
|---|---|---|---|
| ALG-01: 2x − y = 3, chọn điểm nghiệm | Hiện các điểm ứng viên, kiểm tra hai vế; chỉ hiện đường nghiệm theo chính sách bước | Thử đưa từng điểm vào hình và quan sát hai vế | Điểm là nghiệm khi thay x/y làm hai vế bằng nhau |
| ALG-02: x + y = 3 và x − y = 1 | Hai đường, ghim tại (2; 1), đường chiếu đọc tọa độ | Tìm điểm cùng nằm trên cả hai đường | Nghiệm hệ phải thỏa mãn cả hai phương trình |
| ALG-03 product: (x − 3)(2x + 4) = 0 | Chạm tách hai nhân tử thành nhánh; thẻ nhiễu không được coi là nghiệm | Quan sát khi một nhân tử bằng 0 | Tích bằng 0 khi ít nhất một nhân tử bằng 0 |
| ALG-03 rational-domain: 2/(x − 3) + 1/(x + 1) = 5 | Tô từng mẫu; thử x = 3 và x = −1 để báo không xác định | Kiểm tra mẫu số trước khi tính | Mỗi mẫu phải khác 0; loại đúng các giá trị làm mẫu bằng 0 |
| ALG-04: a < b, cùng cộng 5 hoặc nhân −2 | Hai điểm và thẻ biến đổi; minh họa đổi vị trí khi nhân số âm | Thử a = 1, b = 2 rồi quan sát | Cộng cùng số giữ chiều; nhân/chia cùng số âm đổi chiều |
| ALG-05: x − 3 > 0 | Mốc 3, tia phải, đầu mở; học sinh tự dựng | Tìm mốc rồi hỏi giá trị tại mốc có được lấy không | Dấu lớn hơn không lấy mốc; dấu lớn hơn hoặc bằng lấy mốc |
| ALG-06 square-root: diện tích 16, 25 hoặc 36 | Kéo cạnh hình vuông; số ô và số đo cập nhật đúng | Đếm số ô theo hàng và cột | Căn số học là cạnh không âm có bình phương bằng diện tích |
| ALG-06 root-domain: căn của 2x − 6 | Trục x liên kết giá trị dưới căn, đỏ/xanh kèm chữ trạng thái | Kéo x để tìm lúc biểu thức hết âm | Căn bậc hai thực yêu cầu biểu thức dưới căn không âm |
| ALG-07: căn của (−5) bình phương; căn của 16 nhân 25 | Thể hiện dấu A và độ dài dương; ghép/tách vùng diện tích | So sánh độ dài với dấu của số ban đầu | Căn của A bình phương là độ lớn của A; quy tắc tích/thương chỉ áp dụng đúng điều kiện |
| ALG-08: căn bậc ba của −27 | Trục có −3, kiểm lập phương, cube preview theo độ lớn | Thử số âm trên trục và kiểm lập phương | Mọi số thực có một căn bậc ba; (−3) mũ 3 bằng −27 |
| ALG-09: y = −2x bình phương | Kéo a qua giá trị dương/âm, bỏ 0 ở mode parabol; điểm x = 3 cho y = −18 | Quan sát hai nhánh khi thay dấu a | a âm mở xuống, a dương mở lên; gốc O vẫn thuộc đồ thị, trục dọc là trục đối xứng |
| ALG-10: 2x bình phương − 5x + 2 = 0 | Hạng tử có thể đổi vị trí; tách hệ số kèm dấu; D và số nghiệm tính đúng | Đưa về dạng chuẩn trước khi chọn hệ số | a phải khác 0; dấu D quyết định số nghiệm thực |
| ALG-11: x bình phương − 7x + 10 = 0 | Khay tổng/tích, thẻ 7 và 10; có thể nhẩm nghiệm 2 và 5 | Tìm hai số có tổng và tích phù hợp | Với nghiệm thực, tổng bằng âm b chia a, tích bằng c chia a |
| GEO-01: ABC vuông tại A, xét góc B | Chạm cạnh AC rồi BC cho sin B; chuyển sang C thì vai trò đổi | Xác định góc đang xét trước | Sin là đối/huyền, cos là kề/huyền, tan là đối/kề, cot là kề/đối |
| GEO-02: 30/45/60 độ; sin 35 độ và cos 55 độ | Thanh góc, cặp góc phụ và cạnh đối/kề đổi tương ứng | Quan sát hai góc có tổng 90 độ | Sin góc này bằng cos góc phụ; tan bằng cot góc phụ |
| GEO-03: huyền 10 cm, góc B 30 độ, tìm AC | Tam giác đúng tỉ lệ, hiện 10 và 30; ẩn AC | Chỉ cạnh cần tìm và góc đối diện | Cạnh góc vuông bằng huyền nhân sin góc đối hoặc cos góc kề |
| GEO-04: đường tròn O, đường kính AB, điểm M | Xoay đường kính, mô phỏng gấp/phản xạ; phân biệt đường tròn và miền tròn khi tô | Thử nhiều đường qua tâm | Tâm O là tâm đối xứng; mọi đường thẳng qua O là trục đối xứng |
| GEO-05: bán kính 4, khoảng cách ban đầu 6 | Kéo đường thẳng đến khoảng cách 4; chân H và dấu vuông hiện khi phù hợp | Đếm giao điểm khi kéo | Tiếp xúc có một điểm chung; bán kính vuông góc tiếp tuyến tại tiếp điểm |
| GEO-06: bán kính 5 và 3, hai tâm cách 8 | Kéo tâm thứ hai, hiện khoảng cách và giao điểm | So sánh khoảng cách với tổng/hiệu độ lớn bán kính | Tiếp xúc ngoài khi khoảng cách bằng tổng; tiếp xúc trong khi bằng hiệu và hai bán kính khác nhau |
| GEO-07: góc ở tâm 80 độ | Giữ cung nhỏ AB; kéo M trên cung lớn, góc AMB bằng 40 độ | Kiểm tra đỉnh ở tâm hay trên đường tròn | Góc nội tiếp bằng nửa cung bị chắn; phải cùng chắn đúng cung khi so với góc ở tâm |
| GEO-08: bán kính 6, góc 60 độ | Tô quạt/cung đúng góc; mode vành khuyên có bán kính trong/ngoài | So sánh phần được tô với cả hình | Cung/quạt chiếm g/360 phần toàn hình; vành khuyên lấy diện tích ngoài trừ trong |
| GEO-09: tam giác bất kỳ hoặc vuông | Bật trung trực/phân giác, tìm O/I; kéo bán kính theo ràng buộc | Phân biệt đi qua đỉnh với chạm cạnh | Ngoại tiếp: tâm là giao trung trực; nội tiếp: tâm là giao phân giác trong |
| GEO-10: A = 110 độ, tìm góc đối C | Ba đỉnh trên đường tròn, kéo D để thành tứ giác lồi nội tiếp; C = 70 độ | Quan sát tổng hai góc đối | Tứ giác lồi nội tiếp có hai góc đối bù nhau; đa giác đều cần đều cả cạnh và góc |
| GEO-11 cone: r = 3, h = 4 | Khối nón thật, chọn r/h/l; l tự tính 5; không nhập ba độ dài độc lập | h vuông góc đáy, l nằm trên mặt bên | Hệ thức l/r/h và công thức diện tích/thể tích phải theo đúng loại khối |
| GEO-11 cylinder/sphere | Trụ r/h và hai đáy; cầu r/O/đường kính; camera/nhãn đúng khối | Chỉ đúng bộ phận trước khi ghép công thức | Trụ: diện tích mặt bên dựa chu vi đáy và h; cầu không có đáy, chiều cao h hay đường sinh kiểu nón |
| STP-01: 40 học sinh, nhóm Giỏi có 10 | Bảng, cột/quạt biểu thị 25%; nếu kéo cột làm bài phải có dữ liệu đích giữ riêng | Cộng số lượng để tìm tổng | Tần số tương đối là số lượng nhóm chia tổng, đổi thành phần trăm |
| STP-02: một xúc xắc hoặc hai đồng xu | Lưới đủ kết quả, chạm tập thuận lợi; xúc xắc chẵn có 3/6 | Liệt kê đầy đủ trước khi đếm thuận lợi | Xác suất bằng số thuận lợi chia tổng khi các kết quả đồng khả năng |

Các công thức dùng để triển khai/chấm có thể hiện trong tài liệu kỹ thuật và hiển thị đã render cho học sinh. Trên admin, người soạn vẫn nhập qua form ý nghĩa và chú thích, không gõ mã LaTeX.

## 15. Ba JSON đề mẫu thay cho payload legacy

**Các object dưới đây là ví dụ authoring đề xuất, không phải JSON Schema và chưa được importer hiện tại hỗ trợ.** Người triển khai phải xây schema, metadata form và compiler trước khi dùng. Mỗi templateId bên dưới đại diện flow sáu bước cố định trong registry. Những dữ kiện bước 5/6 không khai báo trực tiếp phải được template sinh theo quy tắc xác định hoặc từ variant có validate; không sinh ngẫu nhiên không kiểm soát.

### 15.1 Tiếp tuyến — mã chuẩn M9-GEO-05

```json
{
  "authoringVersion": "1.0.0",
  "curriculumNamespace": "excel-repo-v1",
  "curriculumCode": "M9-GEO-05",
  "templateId": "math9-circle-line-tangency",
  "templateVersion": 1,
  "title": "Tìm vị trí tiếp tuyến",
  "parameters": {
    "circle": {"center": [0, 0], "radius": 4, "centerLabel": "O"},
    "line": {"initialDistance": 6, "orientation": "horizontal"},
    "unit": "cm"
  },
  "variants": {
    "practice": {"radius": 3, "initialDistance": 5},
    "assessment": {"radius": 5, "initialDistance": 7}
  },
  "content": {"context": "Di chuyển đường thẳng để quan sát số điểm chung."}
}
```

Khoảng cách đích lấy từ bán kính, không có target_distance nhập riêng. Vị trí H, giao điểm, dấu vuông, phạm vi kéo và sai số do mô hình/template xác định. Form hiện “Bán kính (r)” và “Khoảng cách ban đầu (d)” kèm giải thích; không hiện key circle/initialDistance.

### 15.2 Căn bậc ba — mã chuẩn M9-ALG-08, alias nguồn mới ALG-09

```json
{
  "authoringVersion": "1.0.0",
  "curriculumNamespace": "excel-repo-v1",
  "curriculumCode": "M9-ALG-08",
  "templateId": "math9-cube-root-number-line",
  "templateVersion": 1,
  "title": "Khám phá căn bậc ba",
  "parameters": {"radicand": -27, "initialMarker": 0},
  "variants": {
    "practice": {"radicand": 8},
    "assessment": {"radicand": -8}
  },
  "content": {"context": "Tìm số có lập phương bằng số đã cho."}
}
```

Không nhập prompt_expression có LaTeX hoặc target_value −3 riêng. Compiler sinh biểu thức học sinh, trục chứa được đáp án, căn bậc ba và cube preview. Form hiện “Số cần tìm căn (a)” với ví dụ −27; độ lớn khối dùng 27, dấu âm chỉ ở đại số.

### 15.3 Nhận diện hình nón — mã chuẩn M9-GEO-11 / mode cone-recognition

```json
{
  "authoringVersion": "1.0.0",
  "curriculumNamespace": "excel-repo-v1",
  "curriculumCode": "M9-GEO-11",
  "templateId": "math9-cone-recognition",
  "templateVersion": 1,
  "title": "Nhận biết các bộ phận hình nón",
  "parameters": {"radius": 3, "height": 4, "unit": "cm"},
  "variants": {
    "practice": {"radius": 5, "height": 12},
    "assessment": {"radius": 6, "height": 8}
  },
  "content": {"context": "Quan sát một mô hình có dạng hình nón."}
}
```

Đường sinh, hotspot, label bank, đoạn đo và đáp án do template/renderer sinh. Không nhập slant_height 5 độc lập với r/h. Trong mode recognition có thể ẩn số đo khi cần tập trung nhận diện; compiler vẫn giữ hình đúng kích thước. Template diện tích/thể tích là mode khác cùng sáu vai trò, không để AI biến đổi mục tiêu qua content.

### Hợp đồng schema cần xây

- Một base authoring schema chứa phiên bản, namespace, mã canonical, templateId/version, title, parameters, variants và các slot content được cho phép.
- Schema tham số theo từng template/mode; dùng oneOf/discriminator hoặc registry để chọn schema đúng. Từ chối trường lạ, không dùng một object parameters tùy ý cho mọi engine.
- Lược đồ namespace/alias phải giải quyết xung đột trước compile; templateId phải phù hợp curriculumCode/mode, không chỉ hợp lệ riêng lẻ.
- Schema cấu trúc không thay thế validate toán, binding câu hỏi/hình, ràng buộc geometry và khả năng hoàn thành sáu bước.
- Form metadata dùng cùng registry: label, alphabetSymbol, description, example, unit, bounds, inputType và derived/readOnly. Chú thích này là dữ liệu UI, không suy diễn từ key kỹ thuật.
- Export bundle gồm authoring schema đúng template, JSON mẫu và hướng dẫn AI. Không đưa legacy target_state/validation/hotspot cho AI sửa trong luồng chuẩn.

## 16. Các điểm dễ sai cần kiểm trong lúc hiện thực

1. **Dịch số thứ tự thành kiến thức sai:** bắt buộc dùng bảng alias; ALG-09 có hai nghĩa giữa hai nguồn.
2. **Gọi payload là schema:** ví dụ JSON là dữ liệu; JSON Schema là lược đồ kiểm định có cấu trúc chuẩn. Đặt tên file và nút tải đúng vai trò.
3. **Đổi số nhưng hình cũ:** test kích thước/tọa độ/giao điểm thực tế, không chỉ kiểm text label.
4. **Cân và số âm:** đây là trực quan đại số, không diễn tả số âm như khối có khối lượng âm trong mô phỏng vật lý.
5. **Đồ thị tại gốc O:** nói nằm phía trên/dưới trục ngang phải tính ngoại lệ O, nơi y = 0.
6. **Cung lớn/cung nhỏ:** điểm nội tiếp phải ở cung phù hợp, loại điểm trùng A/B và không áp dụng nửa góc ở tâm khi hai góc không cùng chắn cung.
7. **Tứ giác:** giữ lồi, không tự cắt khi dùng tiêu chí hai góc đối bù nhau.
8. **Hai đường tròn:** dùng độ lớn hiệu bán kính nếu không cố định thứ tự lớn/nhỏ; tách đồng tâm và trùng nhau khỏi tiếp xúc.
9. **Nhãn d trùng nghĩa:** form tiếp tuyến gọi đường là “Đường thẳng” và đại lượng là “Khoảng cách (d)”, tránh cùng chữ d cho cả hai trong lời giải thích admin.
10. **Trụ và nón:** đường sinh của trụ đứng song song trục, có độ dài bằng chiều cao; nếu template cơ bản không hỏi nó thì không đưa thẻ l nhiễu không được giải thích. Cầu không có h/l/đáy kiểu trụ-nón.
11. **Dữ liệu thống kê:** tách dữ liệu đề gốc khỏi trạng thái câu trả lời khi học sinh kéo cột/quạt; không để kéo thay luôn “đáp án đúng”. Hỗ trợ sai số/làm tròn phần trăm có quy tắc.
12. **Xác suất:** kiểm đồng khả năng trước khi đếm số phần tử; các lần gieo hai đồng xu phải phân biệt kết quả theo thứ tự để có không gian mẫu đúng. Phép rút nhiều lần phải khai báo có/không hoàn lại.

## 17. Quy tắc sử dụng tài liệu này cho phiên sau

File này thay hai bản thiết kế đầu vào: bản fixed-flow do trợ lý soạn và Markdown chương trình do chủ dự án bổ sung. Các file nguồn được backup local trước hợp nhất; không dùng bản backup làm tài liệu chỉ đạo mới. File bàn giao hiện trạng giữ vai trò báo cáo đã có/chưa có, không cạnh tranh với đặc tả này.

Khi sửa tiếp, cập nhật ma trận hoàn thành theo template/mode, không chỉ theo mã nhóm lớn. Một mục GEO-11 có thể cần nhiều template trước khi được xem là phủ đủ. Không đếm 15 mẫu công cụ thành 24 dạng chương trình hoặc coi schema đúng là kiến thức đúng.

**Câu chốt của chủ dự án:** giữ flow sáu checkpoint có sẵn; đổi JSON nội dung thì hình, nhãn, dữ kiện và đáp án cùng đổi đúng theo đề; admin không cần biết LaTeX hoặc đọc tham số kỹ thuật để làm việc.

## 18. Prompt để bắt đầu phiên tiếp theo

> Đọc SPEC_TOAN9_CMS_ENGINE_FLOW6.md và PROJECT_HANDOVER_ENGINE_CHECKPOINTS.md ở root. Triển khai trên dashboard admin hiện có của learning-platform. Mục tiêu: template flow sáu checkpoint bất biến, JSON đề chỉ thay nội dung/dữ kiện; compiler tự dựng lại hình, nhãn, câu hỏi và đáp án theo cùng dữ kiện. Admin non-math phải thấy tên trường tiếng Việt, ký hiệu alphabet kèm chú thích; không hiện LaTeX/key kỹ thuật trong form thường. Bắt đầu bằng lát cắt hình trụ và một bài 2D, chốt contract/adapter/test rồi mở rộng theo ma trận 15 công cụ và 24 dạng Excel. Giữ published/progress cũ; kiểm thử web và Android riêng; ghi rõ phần chưa làm. Không tạo dashboard mới, không clone một câu sáu lần để đủ flow, không coi hình cố định là dựng hình theo đề.
