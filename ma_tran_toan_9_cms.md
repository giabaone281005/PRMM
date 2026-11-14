# MA TRẬN CHƯƠNG TRÌNH TOÁN LỚP 9 (NHẬN BIẾT) & KIẾN TRÚC ENGINE CMS

> **Tài liệu thiết kế bài học tương tác chuẩn Brilliant.org cho Web Admin CMS (JSON-Driven, 6 Core Engines trên Flutter Mobile)**  
> **Phạm vi phân môn:** Số & Đại số | Hình học & Đo lường | Thống kê & Xác suất  
> **Chuẩn chương trình:** Bám sát GDPT 2018 (Kết nối tri thức / Chân trời sáng tạo / Cánh diều)

> **Đối chiếu CP-01 — 13/11/2026:** Đây là ma trận thiết kế, chưa phải chứng nhận đủ chương trình hoặc báo cáo engine đã triển khai. Yêu cầu chuẩn dùng [SPEC_TOAN9_CMS_ENGINE_FLOW6.md](SPEC_TOAN9_CMS_ENGINE_FLOW6.md); công việc tiếp theo dùng [PROJECT_CHECKPOINTS.md](PROJECT_CHECKPOINTS.md). Các key kỹ thuật, payload và ví dụ cấu hình bên dưới là tham khảo legacy; form admin chuẩn phải dùng nhãn/chú thích tiếng Việt, ký hiệu alphabet, dữ kiện đầu vào và kết quả tự tính. Không đưa payload minh họa trực tiếp vào importer hiện tại hoặc coi đó là authoring schema đã hỗ trợ.

**Trạng thái mẫu khác trạng thái nghiệm thu:** mới có mẫu curriculum-specific cho M9-ALG-05, M9-ALG-09 và M9-STP-02; cả ba chưa nghiệm thu theo kiến trúc authoring mới và Android hosted. 21 dạng còn lại chưa có mẫu curriculum-specific. Bộ 15 mẫu công cụ/90 checkpoint là thư viện khác. Trạng thái từng dòng bên dưới phản ánh sự hiện diện mẫu trong mã nguồn, không xác nhận nội dung đã được giáo viên duyệt hoặc chạy Android.

Giữ nguyên 24 mã đang dùng trong repository: ALG-01–ALG-11, GEO-01–GEO-11, STP-01–STP-02. Không đổi mã theo số thứ tự từ nguồn khác. Sáu core engine là phân loại nghiệp vụ đích; tên và khả năng trong bảng không chứng minh runtime hiện có đã hỗ trợ đầy đủ. Tuyên bố bám chương trình ở đầu file là mục tiêu thiết kế, cần thẩm định độc lập.

---

## MỤC LỤC
1. [Bảng Tổng Hợp 6 Core Engines & Schema Cấu Hình](#1-bảng-tổng-hợp-6-core-engines-trên-flutter-app--schema-cấu-hình-trên-web-cms)
2. [Quy Trình Admin Build Bài Từng Bước Trên Web CMS](#2-quy-trình-admin-build-bài-từng-bước-trên-web-cms-không-hardcode)
3. [Danh Mục 24 Dạng Bài Toán Lớp 9 (Blueprint Build CMS & Tương Tác Học Sinh)](#3-danh-mục-đầy-đủ-chương-trình-toán-lớp-9-mức-nhận-biết)
4. [Cấu Trúc JSON Payload Mẫu Xuất Bản Sang Flutter App](#4-cấu-trúc-json-payload-chuẩn-để-web-admin-cms-xuất-bản-sang-flutter-app)

---

## 1. BẢNG TỔNG HỢP 6 CORE ENGINES TRÊN FLUTTER APP & SCHEMA CẤU HÌNH TRÊN WEB CMS

| Mã Engine (Flutter) | Tên Mô Hình Tương Tác | Số Dạng Bài Áp Dụng | Phạm Vi Chuyên Đề Lớp 9 | Tham Số JSON Admin Nhập Trên Web CMS | Cơ Chế Tương Tác Cốt Lõi Của Học Sinh |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `geometry_2d_canvas` | Canvas Hình Học 2D & Đường Tròn | 10 | Hệ thức lượng tam giác vuông, Đường tròn, Tiếp tuyến, Góc nội tiếp, Tứ giác nội tiếp, Đa giác đều | `shapes`, `angles`, `constraints` (khóa đỉnh/cạnh), `toggle_layers` (trung trực, phân giác, tiếp tuyến) | Kéo đỉnh/tiếp điểm động, chạm tô màu cạnh đối/kề/huyền, xoay góc quạt, ghép góc đối tứ giác nội tiếp |
| `cartesian_graph_engine` | Hệ Trục Tọa Độ Oxy & Đồ Thị | 3 | PT & Hệ PT bậc nhất hai ẩn, Hàm số y = ax² (Parabol), Tương giao đường thẳng & Parabol | `equations` (hệ số a, b, c), `golden_points` (tọa độ nguyên), `slider_params`, `snap_to_grid` | Kéo điểm kiểm tra nghiệm, thả ghim giao điểm 2 đường thẳng, kéo thanh trượt hệ số `a` làm biến dạng Parabol |
| `balance_scale_engine` | Cân Phương Trình & Khay Đại Số | 3 | PT tích, ĐKXĐ PT chứa ẩn ở mẫu, PT bậc hai (hệ số a, b, c & biệt thức Δ), Hệ thức Viète | `latex_tokens`, `forbidden_values` (mẫu = 0), `coefficient_slots`, `discriminant_mode` | Kéo thả thẻ hệ số (a, b, c) vào khay, kiểm tra giá trị cấm làm mẫu bằng 0, ghép cặp tổng-tích Viète |
| `area_fraction_grid` | Lưới Diện Tích, Căn Thức & Khối 3D | 4 | Căn bậc hai số học, Khai phương tích/thương, Căn bậc ba (lập phương), Hình trụ - Nón - Cầu | `grid_dimension`, `cube_n`, `unfold_3d_net` (trải phẳng hình trụ/nón), `domain_guard` | Kéo cạnh hình vuông/lập phương tìm căn bậc 2 & 3, kéo thanh trải phẳng mặt xung quanh hình trụ thành hình chữ nhật |
| `number_line_engine` | Trục Số Động & Miền Bất Đẳng Thức | 2 | Bất đẳng thức (nhân số âm đổi chiều), Bất phương trình bậc nhất một ẩn & biểu diễn nghiệm | `boundary_value`, `bracket_type` (tròn/vuông), `ray_direction`, `animate_reflection` | Bấm nút nhân số âm xem trục số lật đối xứng qua 0, chạm đổi ngoặc tròn/vuông và vuốt tô miền nghiệm |
| `data_probability_sim` | Mô Phỏng Thống Kê & Không Gian Mẫu | 2 | Bảng tần số, Tần số tương đối, Biểu đồ cột/quạt tròn, Phép thử ngẫu nhiên & Xác suất cổ điển | `sample_size_N`, `group_frequencies`, `preset_experiment` (xúc xắc, đồng xu, thẻ số) | Kéo cột tần số đồng bộ biểu đồ quạt tròn, chạm chọn các phần tử thuận lợi trong không gian mẫu để tính P(A) |
| **TỔNG CỘNG** | **6 Core Engines Chuẩn Hóa** | **24 dạng bài** | | | |

---

## 2. QUY TRÌNH ADMIN BUILD BÀI TỪNG BƯỚC TRÊN WEB CMS (KHÔNG HARDCODE)

**Bốn thao tác admin** là quy trình soạn bài đích, khác với **sáu checkpoint học sinh**:

| Thao tác admin | Kết quả hệ thống cần tạo |
|---|---|
| 1. Chọn phân môn, dạng bài và mode | Chọn template có phiên bản; hệ thống ánh xạ tới engine hỗ trợ |
| 2. Nhập dữ kiện hoặc nạp JSON đề | Validate toán, dựng hình/nhãn và tự tính đáp án; form có tên tiếng Việt, ký hiệu alphabet, chú thích và đơn vị |
| 3. Kiểm tra sáu bước và gợi ý | Template giữ số bước/thứ tự/mục tiêu; admin chỉ sửa slot nội dung được cho phép |
| 4. Xem thử, lưu nháp và xuất bản | Preview đủ sáu bước, duyệt nội dung; publish tạo version mới bằng luồng hiện có |

**Flow học sinh chuẩn:** Khám phá → Nhận diện → Tìm quy luật → Thực hành có hướng dẫn → Vận dụng độc lập → Tự kiểm tra và chốt kiến thức. Các mô tả 4 slide trước đây được thay bằng flow này; đủ sáu bước vẫn cần kiểm đúng vai trò sư phạm, không lặp câu để đủ số lượng.

Kiến trúc JSON đề/template bất biến/compiler ở trên còn cần triển khai. Hiện importer nhận full Lesson manifest. Published manifest được lưu qua RPC và phiên bản bất biến, không dùng các payload legacy bên dưới như chỉ dẫn ghi thẳng `lessons.content_json`. Flutter chỉ nhận nội dung mới không cần build lại khi runtime/contract đã hỗ trợ; sửa renderer, bridge hoặc contract có thể cần bundle/build/cài lại app.

---

## 3. DANH MỤC ĐẦY ĐỦ CHƯƠNG TRÌNH TOÁN LỚP 9 MỨC NHẬN BIẾT
*(Blueprint Build CMS & Tương Tác Học Sinh)*

### Bảng Tổng Hợp 24 Dạng Bài Chuẩn GFM

| Mã Dạng Bài | Phân Môn | Chương / Chủ Đề | Bài Học / Chuyên Đề Con | Yêu Cầu Cần Đạt (Mức Nhận Biết) | Ví Dụ Đề Bài Chuẩn | Core Engine | 1. Cách Build Bài Học Trên Web Admin CMS | 2. Học Sinh Tương Tác Trên App Mobile | Gợi Ý Sư Phạm 2 Tầng (Hints) | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **M9-ALG-01** | Số và Đại số | Chương 1: Phương trình và hệ hai phương trình bậc nhất hai ẩn | Khái niệm phương trình và hệ hai phương trình bậc nhất hai ẩn | Nhận biết phương trình bậc nhất hai ẩn $ax + by = c$ ($a \neq 0$ hoặc $b \neq 0$) và kiểm tra cặp số $(x_0; y_0)$ có phải là nghiệm. | Trong các phương trình sau, phương trình nào là phương trình bậc nhất hai ẩn? Kiểm tra cặp số $(2; -1)$ có là nghiệm của $3x + 2y = 4$ không. | `cartesian_graph_engine` | • Chọn Engine: `cartesian_graph_engine` (chế độ Point-Check).<br>• Nhập hệ số a, b, c (VD: a=3, b=2, c=4) và tọa độ điểm test P(2, -1).<br>• Bật flag `show_line: false` ở bước 1, `snap_to_grid: true`.<br>• Kiểm tra flow 6 checkpoint cố định của template. | • Kéo điểm P(x, y) trên Oxy hoặc nhập giá trị x, y.<br>• Thanh cân bằng hiển thị trực quan giá trị $3x + 2y$ so với 4.<br>• Khi điểm P thỏa mãn, phát sáng xanh và tự vẽ đường thẳng nghiệm qua P. | • **Hint 1 (Trực quan):** Thay x = 2 và y = -1 vào vế trái xem tổng có bằng 4 không.<br>• **Hint 2 (Công thức):** PT bậc nhất 2 ẩn có dạng $ax + by = c$ với $a, b$ không đồng thời bằng 0. | Chưa có mẫu curriculum |
| **M9-ALG-02** | Số và Đại số | Chương 1: Phương trình và hệ hai phương trình bậc nhất hai ẩn | Giải hệ hai phương trình bậc nhất hai ẩn | Nhận biết nghiệm của hệ phương trình bậc nhất hai ẩn qua giao điểm hai đường thẳng và bước khử ẩn cơ bản. | Quan sát đồ thị hai đường thẳng $d_1: x + y = 3$ và $d_2: x - y = 1$. Xác định nghiệm $(x; y)$ của hệ phương trình. | `cartesian_graph_engine` | • Chọn Engine: `cartesian_graph_engine` (chế độ Dual-Line Intersection).<br>• Nhập 2 bộ hệ số sao cho giao điểm nguyên (x=2, y=1).<br>• Bật `interactive_marker: true`.<br>• Tạo trắc nghiệm/nhập tọa độ ghim. | • Chạm và di chuyển con trỏ dọc $d_1, d_2$, hiển thị tọa độ động.<br>• Thả ghim (Pin) tại giao điểm 2 đường thẳng.<br>• App chiếu vuông góc xuống Ox, Oy làm nổi bật nghiệm (2; 1). | • **Hint 1 (Trực quan):** Nghiệm chung là điểm nằm trên cả 2 đường thẳng cùng lúc.<br>• **Hint 2 (Tọa độ):** Đọc hoành độ x trên trục ngang và tung độ y trên trục dọc tại giao điểm. | Chưa có mẫu curriculum |
| **M9-ALG-03** | Số và Đại số | Chương 1: Phương trình và hệ hai phương trình bậc nhất hai ẩn | Phương trình quy về phương trình bậc nhất một ẩn (PT tích & chứa ẩn ở mẫu) | Nhận biết dạng phương trình tích $(ax + b)(cx + d) = 0$ và tìm ĐKXĐ của phương trình chứa ẩn ở mẫu. | Tìm ĐKXĐ của phương trình: $\frac{1}{x-2} + \frac{3}{x+1} = 2$ và nhận diện các nhân tử bằng 0 của $(x - 3)(2x + 4) = 0$. | `balance_scale_engine` | • Chọn Engine: `balance_scale_engine` (chế độ Algebraic Factor & Domain Guard).<br>• Nhập biểu thức dạng LaTeX token blocks.<br>• Cấu hình Forbidden Values: x = 2, x = -1.<br>• Thiết lập thẻ kéo-thả tách nhân tử. | • Kéo thanh trượt x; khi x = 2 hoặc -1, mẫu chuyển đỏ và cảnh báo 'Lỗi chia cho 0'.<br>• Với PT tích, chạm vào từng ngoặc đơn để tách thành 2 nhánh PT bậc nhất độc lập. | • **Hint 1 (Mẫu số):** Phân thức chỉ có nghĩa khi mẫu thức khác 0.<br>• **Hint 2 (Tích):** Tích bằng 0 khi và chỉ khi ít nhất một nhân tử bằng 0. | Chưa có mẫu curriculum |
| **M9-ALG-04** | Số và Đại số | Chương 2: Phương trình và bất phương trình bậc nhất một ẩn | Bất đẳng thức và tính chất liên hệ giữa thứ tự và phép cộng/nhân | Nhận biết bất đẳng thức, vế trái, vế phải và nhận biết sự đổi chiều khi nhân/chia hai vế với số âm. | Cho $a < b$. Điền dấu thích hợp (< hoặc >) vào ô trống: $a + 5 \;[\,?\,]\; b + 5$ và $-2a \;[\,?\,]\; -2b$. | `number_line_engine` | • Chọn Engine: `number_line_engine` (chế độ Inequality Mirror).<br>• Đặt 2 điểm a, b với ràng buộc $a < b$.<br>• Thêm nút phép toán (+5, -3, ×2, ×(-2)).<br>• Bật `animate_reflection: true`. | • Kéo a và b trên trục số (a bên trái b).<br>• Bấm nút '×(-2)': trục số lật đối xứng qua 0, trực quan thấy $-2a$ nhảy sang bên phải $-2b$.<br>• Chọn dấu > hoặc < để khóa đáp án. | • **Hint 1 (Trực quan):** Thử thay a = 1, b = 2, tính -2a và -2b rồi so sánh vị trí trên trục số.<br>• **Hint 2 (Tính chất):** Nhân cả 2 vế với số âm phải đổi chiều bất đẳng thức. | Chưa có mẫu curriculum |
| **M9-ALG-05** | Số và Đại số | Chương 2: Phương trình và bất phương trình bậc nhất một ẩn | Bất phương trình bậc nhất một ẩn | Nhận biết bất phương trình bậc nhất một ẩn $ax + b > 0$ (<, $\ge$, $\le$; $a \neq 0$) và biểu diễn tập nghiệm trên trục số. | Bất phương trình nào là bậc nhất một ẩn? Xác định tập nghiệm của $x - 3 > 0$ trên trục số. | `number_line_engine` | • Chọn Engine: `number_line_engine` (chế độ Interval Ray).<br>• Cấu hình điểm biên Boundary = 3, đầu mút (`open`/`closed`), hướng tia (`right`/`left`).<br>• Cho phép chọn đầu mút và kéo vùng tô. | • Chạm mốc số 3 để chuyển đổi giữa ngoặc tròn '(' (không lấy 3) và ngoặc vuông '[' (lấy 3).<br>• Vuốt tay sang phải/trái để tô màu miền nghiệm $x > 3$. | • **Hint 1 (Đầu mút):** Dấu >, < dùng ngoặc tròn; dấu $\ge$, $\le$ dùng ngoặc vuông.<br>• **Hint 2 (Chiều nghiệm):** Các số lớn hơn 3 nằm về phía bên phải số 3. | Có mẫu curriculum; chưa nghiệm thu chuẩn mới/Android hosted |
| **M9-ALG-06** | Số và Đại số | Chương 3: Căn bậc hai và căn bậc ba | Căn bậc hai và căn thức bậc hai | Nhận biết căn bậc hai số học của số không âm và điều kiện xác định của $\sqrt{A}$ ($A \ge 0$). | Tính $\sqrt{81}$ và tìm điều kiện của x để căn thức $\sqrt{x - 4}$ có nghĩa. | `area_fraction_grid` | • Chọn Engine: `area_fraction_grid` (chế độ Square Area & Domain Slider).<br>• Slide 1: Lưới ô vuông $S = 81$ tìm $\sqrt{81} = 9$.<br>• Slide 2: Slider biểu thức $x - 4$, tô đỏ vùng âm. | • Kéo góc hình vuông đến diện tích 81 ô, cạnh hiện số 9.<br>• Kéo slider x: khi $x < 4$, biểu thức âm và khóa ổ khóa căn thức, kéo về $x \ge 4$ để mở khóa. | • **Hint 1 (Hình học):** $\sqrt{81}$ là độ dài cạnh hình vuông có diện tích 81.<br>• **Hint 2 (Điều kiện):** Biểu thức dưới dấu căn bậc hai phải $\ge 0$. | Chưa có mẫu curriculum |
| **M9-ALG-07** | Số và Đại số | Chương 3: Căn bậc hai và căn thức bậc hai | Khai căn với nhân/chia (Hằng đẳng thức $\sqrt{A^2} = \|A\|$) | Nhận biết quy tắc $\sqrt{A^2} = \|A\|$, $\sqrt{AB} = \sqrt{A}\sqrt{B}$, $\sqrt{A/B} = \sqrt{A}/\sqrt{B}$ ($A \ge 0, B > 0$). | Tính giá trị $\sqrt{(-5)^2}$ và $\sqrt{16 \times 25}$ bằng cách tách thừa số. | `area_fraction_grid` | • Chọn Engine: `area_fraction_grid` (chế độ Visual Factor Split).<br>• Nhập số chính phương dễ tách (16, 25).<br>• Thẻ ghép biến đổi: $\sqrt{(-5)^2} \to \|-5\| \to 5$ (bẫy đáp án -5). | • Chạm khối $\sqrt{16 \times 25}$ tách thành 2 hình vuông diện tích 16 (cạnh 4) và 25 (cạnh 5), nhân 2 cạnh.<br>• Chọn bước trung gian $\|-5\|$ trước khi ra 5. | • **Hint 1 (Dấu):** Căn bậc hai số học luôn không âm, nên $\sqrt{(-5)^2} \neq -5$.<br>• **Hint 2 (Công thức):** Áp dụng hằng đẳng thức $\sqrt{A^2} = \|A\|$. | Chưa có mẫu curriculum |
| **M9-ALG-08** | Số và Đại số | Chương 3: Căn bậc hai và căn thức bậc hai | Căn bậc ba | Nhận biết căn bậc ba của một số thực (kể cả số âm) thông qua thể tích hình lập phương. | Tính $\sqrt[3]{27}$ và $\sqrt[3]{-8}$. | `area_fraction_grid` | • Chọn Engine: `area_fraction_grid` (chế độ 3D Isometric Cube Builder).<br>• Cấu hình khối lập phương đơn vị ($n=3 \to V=27$) và bảng lũy thừa $(-2)^3 = -8$. | • Kéo thanh trượt xếp khối $3 \times 3 \times 3$ (27 khối) đọc cạnh = 3.<br>• Bấm nút kiểm tra $(-2) \times (-2) \times (-2) = -8$ để nhận biết căn bậc ba của số âm. | • **Hint 1 (Thể tích):** Tìm số nhân với chính nó 3 lần bằng 27.<br>• **Hint 2 (Số âm):** Tích 3 số âm là số âm, nên $\sqrt[3]{-8}$ là số âm. | Chưa có mẫu curriculum |
| **M9-ALG-09** | Số và Đại số | Chương 4: Hàm số $y = ax^2$ ($a \neq 0$) & PT bậc hai một ẩn | Hàm số $y = ax^2$ ($a \neq 0$) và đồ thị Parabol | Nhận biết hệ số a, tính chất đồng biến/nghịch biến và bề lõm Parabol ($a > 0$ ngửa lên, $a < 0$ úp xuống). | Cho hàm số $y = -2x^2$. Xác định hệ số a, chiều bề lõm và tính y tại $x = 3$. | `cartesian_graph_engine` | • Chọn Engine: `cartesian_graph_engine` (chế độ Parabola Morphing).<br>• Slider $a \in [-3, 3]$ (bước 0.5, bỏ 0).<br>• Bật `symmetry_axis_highlight` và điểm động. | • Kéo slider $a$: quan sát Parabol lật úp khi $a < 0$ và co dãn khi $\|a\|$ đổi.<br>• Kéo điểm trên đồ thị tới $x = 3$ để đọc tung độ $y = -18$. | • **Hint 1 (Dấu của a):** $a > 0$ bề lõm hướng lên, $a < 0$ bề lõm hướng xuống.<br>• **Hint 2 (Thay số):** Thay $x = 3$ vào $y = -2 \times (3^2)$. | Có mẫu curriculum; chưa nghiệm thu chuẩn mới/Android hosted |
| **M9-ALG-10** | Số và Đại số | Chương 4: Hàm số $y = ax^2$ ($a \neq 0$) & PT bậc hai một ẩn | Phương trình bậc hai một ẩn và Công thức nghiệm (Biệt thức $\Delta$) | Nhận biết $ax^2 + bx + c = 0$ ($a \neq 0$), xác định hệ số $(a, b, c)$ và tính $\Delta = b^2 - 4ac$. | Xác định $a, b, c$ và tính $\Delta$ của $2x^2 - 5x + 2 = 0$. Phương trình có bao nhiêu nghiệm? | `balance_scale_engine` | • Chọn Engine: `balance_scale_engine` (chế độ Coefficient Slot & Discriminant Meter).<br>• Tạo 3 ô thả [a], [b], [c] (bẫy dấu $b = -5$).<br>• Đồng hồ đo $\Delta$ kết nối số giao điểm Ox. | • Kéo thả thẻ số `2`, `-5`, `2` vào khay a, b, c.<br>• Đồng hồ $\Delta$ chỉ 9 (> 0), đồ thị hiện 2 giao điểm Ox $\to$ chọn '2 nghiệm phân biệt'. | • **Hint 1 (Hệ số):** Lưu ý dấu trừ: $b = -5$ chứ không phải 5.<br>• **Hint 2 (Biệt thức):** $\Delta = b^2 - 4ac$. $\Delta > 0$ có 2 nghiệm, $\Delta = 0$ có nghiệm kép, $\Delta < 0$ vô nghiệm. | Chưa có mẫu curriculum |
| **M9-ALG-11** | Số và Đại số | Chương 4: Hàm số $y = ax^2$ ($a \neq 0$) & PT bậc hai một ẩn | Định lí Viète và ứng dụng nhẩm nghiệm | Nhận biết tổng $x_1 + x_2 = -b/a$, tích $x_1 x_2 = c/a$ và nhẩm nghiệm $a + b + c = 0$ hoặc $a - b + c = 0$. | Không giải PT, tính tổng $x_1 + x_2$ và tích $x_1 x_2$ của $x^2 - 7x + 10 = 0$. | `balance_scale_engine` | • Chọn Engine: `balance_scale_engine` (chế độ Viète Sum-Product Puzzle).<br>• Nhập nghiệm nguyên ($x_1=2, x_2=5$).<br>• Cấu hình 2 ô: Tổng $S = -b/a$ và Tích $P = c/a$. | • Chọn cặp số có tổng 7 và tích 10 từ bảng gợi ý hoặc điền trực tiếp.<br>• Khớp nghiệm $\to$ PT tự phân tích thành $(x - 2)(x - 5) = 0$. | • **Hint 1 (Công thức Viète):** Tổng nghiệm bằng $-b/a$, tích nghiệm bằng $c/a$.<br>• **Hint 2 (Dấu):** Với $a=1, b=-7, c=10$ thì $-b/a = -(-7)/1 = 7$. | Chưa có mẫu curriculum |
| **M9-GEO-01** | Hình học và Đo lường | Chương 5: Hệ thức lượng trong tam giác vuông | Tỉ số lượng giác góc nhọn ($\sin, \cos, \tan, \cot$) | Nhận biết cạnh đối, kề, huyền ứng với góc $\alpha$ và nhận biết công thức $\sin, \cos, \tan, \cot$. | Cho $\triangle ABC$ vuông tại A, $\widehat{B} = \alpha$. Xác định $\sin \alpha$ và $\tan \alpha$ theo AB, AC, BC. | `geometry_2d_canvas` | • Chọn Engine: `geometry_2d_canvas` (chế độ Right-Triangle Ratio Highlighter).<br>• Khởi tạo tam giác vuông tại A, góc nhọn tại B.<br>• Bật `color_code_sides: true` (Đối: Đỏ, Kề: Xanh, Huyền: Vàng). | • Chạm góc B: tự động tô AC (Đỏ), AB (Xanh), BC (Vàng).<br>• Kéo thả nhãn cạnh vào tử/mẫu của công thức $\sin \alpha = \text{Đối}/\text{Huyền}$. | • **Hint 1 (Nhận diện cạnh):** Cạnh huyền đối diện góc vuông; cạnh đối nằm đối diện góc nhọn xét.<br>• **Hint 2 (Mẹo nhớ):** Sin đi học (Đối/Huyền), Cos không hư (Kề/Huyền), Tan đoàn kết (Đối/Kề). | Chưa có mẫu curriculum |
| **M9-GEO-02** | Hình học và Đo lường | Chương 5: Hệ thức lượng trong tam giác vuông | Giá trị lượng giác góc đặc biệt (30°, 45°, 60°) & hai góc phụ nhau | Nhận biết giá trị lượng giác 30°, 45°, 60° và tính chất 2 góc phụ nhau ($\sin \alpha = \cos(90^\circ - \alpha)$). | Biết $\sin 35^\circ \approx 0{,}574$. Không dùng máy tính, xác định $\cos 55^\circ$ và $\sin 30^\circ$. | `geometry_2d_canvas` | • Chọn Engine: `geometry_2d_canvas` (chế độ Complementary Angle Swap).<br>• Vẽ tam giác vuông có 2 góc $\alpha$ và $90^\circ - \alpha$.<br>• Nút hoán đổi góc nhìn (Focus Angle swap). | • Bấm đổi điểm nhìn $35^\circ \leftrightarrow 55^\circ$: cạnh đối góc $35^\circ$ thành cạnh kề góc $55^\circ$, trực quan $\sin 35^\circ = \cos 55^\circ$.<br>• Chọn nửa tam giác đều để đọc $\sin 30^\circ = 1/2$. | • **Hint 1 (Góc phụ nhau):** $35^\circ + 55^\circ = 90^\circ$ (phụ nhau).<br>• **Hint 2 (Tính chất):** Hai góc phụ nhau thì sin góc này bằng cos góc kia. | Chưa có mẫu curriculum |
| **M9-GEO-03** | Hình học và Đo lường | Chương 5: Hệ thức lượng trong tam giác vuông | Một số hệ thức về cạnh và góc trong tam giác vuông | Nhận biết công thức cạnh góc vuông qua cạnh huyền ($b = a\sin B = a\cos C$) hoặc cạnh góc vuông kia ($b = c\tan B$). | Cho $\triangle ABC$ vuông tại A có $BC = 10\text{ cm}, \widehat{B} = 30^\circ$. Tính cạnh $AC$. | `geometry_2d_canvas` | • Chọn Engine: `geometry_2d_canvas` (chế độ Triangle Solver).<br>• Cố định $BC = 10, \widehat{B} = 30^\circ$.<br>• Hiển thị chọn phép tính: $10 \times \sin(30^\circ)$ vs $10 \times \cos(30^\circ)$. | • Chạm cạnh cần tìm AC (nét đứt), chọn tỉ số liên kết cạnh đã biết BC (huyền) và AC (đối).<br>• Chọn đúng $10 \times \sin(30^\circ)$, cạnh AC tự điền 5 cm. | • **Hint 1 (Vai trò cạnh):** Với góc B = 30°, AC là cạnh đối, BC = 10 là cạnh huyền.<br>• **Hint 2 (Công thức):** Cạnh góc vuông bằng cạnh huyền nhân sin góc đối. | Chưa có mẫu curriculum |
| **M9-GEO-04** | Hình học và Đo lường | Chương 6: Đường tròn | Mở đầu về đường tròn & Tính đối xứng của đường tròn | Nhận biết tâm đối xứng (tâm O) và trục đối xứng (mọi đường kính qua O) của đường tròn. | Đường tròn (O; R) có bao nhiêu tâm đối xứng và bao nhiêu trục đối xứng? Điểm M nằm trong (O) khi nào? | `geometry_2d_canvas` | • Chọn Engine: `geometry_2d_canvas` (chế độ Circle Symmetry & Point Position).<br>• Vẽ (O; R=5), đường kính xoay tự do, điểm M kéo thả.<br>• Hiển thị đo khoảng cách OM so với R=5. | • Xoay đường thẳng qua O thấy 2 nửa đường tròn luôn gấp khít nhau.<br>• Kéo M vào trong: khi $OM < 5$, vùng tròn sáng lên và hiện trạng thái 'M nằm trong (O)'. | • **Hint 1 (Đối xứng):** Bất kỳ đường kính nào cũng chia đường tròn thành 2 nửa bằng nhau.<br>• **Hint 2 (Vị trí điểm):** So sánh độ dài đoạn thẳng OM với bán kính R. | Chưa có mẫu curriculum |
| **M9-GEO-05** | Hình học và Đo lường | Chương 6: Đường tròn | Vị trí tương đối của đường thẳng và đường tròn (Tiếp tuyến) | Nhận biết 3 vị trí tương đối qua khoảng cách $d$ so với $R$, tính chất tiếp tuyến vuông góc bán kính tại tiếp điểm. | Cho (O; 6 cm) và đường thẳng a có khoảng cách $d = 6\text{ cm}$. Xác định vị trí tương đối và góc tạo bởi tiếp tuyến với bán kính. | `geometry_2d_canvas` | • Chọn Engine: `geometry_2d_canvas` (chế độ Tangent Distance Slider).<br>• Vẽ (O; R=6), đường thẳng $a$ trượt khoảng cách $d \in [0, 10]$.<br>• Tự động hiện góc vuông khi $d = R$. | • Kéo $a$ lại gần O: $d > 6$ (0 điểm chung), $d = 6$ (chạm 1 điểm, hiện ký hiệu $90^\circ$ đỏ), $d < 6$ (cắt 2 điểm).<br>• Xác nhận vị trí tiếp xúc và góc 90°. | • **Hint 1 (So sánh d và R):** Khi $d = R$, đường thẳng chạm đường tròn tại duy nhất 1 điểm.<br>• **Hint 2 (Góc tiếp tuyến):** Tiếp tuyến luôn vuông góc bán kính tại tiếp điểm. | Chưa có mẫu curriculum |
| **M9-GEO-06** | Hình học và Đo lường | Chương 6: Đường tròn | Vị trí tương đối của hai đường tròn | Nhận biết cắt nhau, tiếp xúc (ngoài/trong), không giao qua hệ thức giữa đoạn nối tâm $OO'$ với $R + r$ và $R - r$. | Cho (O; 5 cm) và (O'; 3 cm) có $OO' = 8\text{ cm}$. Xác định vị trí tương đối của hai đường tròn. | `geometry_2d_canvas` | • Chọn Engine: `geometry_2d_canvas` (chế độ Two-Circle Collider).<br>• Cố định (O; 5) và di động (O'; 3).<br>• Thanh đo $OO'$, mốc đặc biệt: $R-r = 2$ và $R+r = 8$. | • Kéo tâm O' dọc trục: quan sát ở ngoài nhau, tiếp xúc ngoài ($OO' = 8$), cắt nhau ($2 < OO' < 8$), tiếp xúc trong ($OO' = 2$). | • **Hint 1 (Tổng bán kính):** Tính tổng $R + r = 5 + 3$ so với $OO' = 8$.<br>• **Hint 2 (Nhận biết):** Khi $OO' = R + r$, hai đường tròn tiếp xúc ngoài. | Chưa có mẫu curriculum |
| **M9-GEO-07** | Hình học và Đo lường | Chương 6: Đường tròn | Góc ở tâm, Góc nội tiếp & Số đo cung | Nhận biết góc ở tâm, góc nội tiếp: góc nội tiếp bằng nửa số đo cung bị chắn (và bằng nửa góc ở tâm cùng chắn cung). | Cho (O), góc ở tâm $\widehat{AOB} = 80^\circ$. Tính số đo cung nhỏ AB và góc nội tiếp $\widehat{ACB}$ cùng chắn cung AB. | `geometry_2d_canvas` | • Chọn Engine: `geometry_2d_canvas` (chế độ Inscribed Angle Theorem).<br>• Khóa cung AB = 80°.<br>• Đặt C chạy tự do trên cung lớn AB, vẽ đồng thời góc ở tâm $\widehat{AOB}$ và góc nội tiếp $\widehat{ACB}$. | • Kéo C dọc cung lớn AB: $\widehat{AOB}$ giữ $80^\circ$, trong khi $\widehat{ACB}$ luôn giữ $40^\circ$ dù C ở đâu.<br>• Nhập đáp án 80° và 40°. | • **Hint 1 (Góc ở tâm):** Số đo cung nhỏ bằng số đo góc ở tâm chắn cung đó.<br>• **Hint 2 (Góc nội tiếp):** Góc nội tiếp có số đo bằng nửa số đo cung bị chắn. | Chưa có mẫu curriculum |
| **M9-GEO-08** | Hình học và Đo lường | Chương 6: Đường tròn | Độ dài cung tròn, Diện tích hình quạt tròn & hình vành khuyên | Nhận biết công thức độ dài cung $l = \frac{\pi R n}{180}$ và diện tích hình quạt tròn $S = \frac{\pi R^2 n}{360}$. | Tính độ dài cung 60° của đường tròn bán kính $R = 6\text{ cm}$ (làm tròn theo $\pi$). | `geometry_2d_canvas` | • Chọn Engine: `geometry_2d_canvas` (chế độ Sector Pie-Slice).<br>• Vẽ (O; R=6), góc quạt $n = 60^\circ$ (1/6 đường tròn).<br>• Tô màu cung l, quạt S, hiện tỉ lệ $n/360^\circ$. | • Kéo góc quạt $0^\circ \to 60^\circ$ thấy hình quạt chiếm đúng 1/6 diện tích và chu vi.<br>• Chọn công thức $\frac{\pi \times 6 \times 60}{180} \to 2\pi\text{ cm}$. | • **Hint 1 (Tỉ lệ góc):** Cung 60° chiếm $60/360 = 1/6$ cả đường tròn.<br>• **Hint 2 (Công thức):** Độ dài cung n° là $l = \frac{\pi R n}{180}$. | Chưa có mẫu curriculum |
| **M9-GEO-09** | Hình học và Đo lường | Chương 7: Đường tròn ngoại tiếp, nội tiếp & Đa giác đều | Đường tròn ngoại tiếp và nội tiếp tam giác | Nhận biết tâm ngoại tiếp (giao 3 trung trực) và tâm nội tiếp (giao 3 phân giác) của tam giác. | Tâm đường tròn ngoại tiếp tam giác là giao 3 đường nào? Với tam giác vuông, tâm ngoại tiếp ở đâu? | `geometry_2d_canvas` | • Chọn Engine: `geometry_2d_canvas` (chế độ Triangle Centers Toggle).<br>• Tam giác ABC đỉnh A kéo tự do.<br>• Nút bật/tắt 3 trung trực (vẽ đường tròn ngoại tiếp) và 3 phân giác (vẽ đường tròn nội tiếp). | • Bật 'Đường trung trực', kéo A vuông $\widehat{A}=90^\circ$: tâm O chuyển đến trung điểm cạnh huyền BC.<br>• Đổi sang 'Đường phân giác': thấy đường tròn nội tiếp nằm gọn trong tam giác. | • **Hint 1 (Khoảng cách):** Tâm ngoại tiếp cách đều 3 đỉnh (tính chất đường trung trực).<br>• **Hint 2 (Tam giác vuông):** Trong tam giác vuông, trung điểm cạnh huyền cách đều 3 đỉnh. | Chưa có mẫu curriculum |
| **M9-GEO-10** | Hình học và Đo lường | Chương 7: Đường tròn ngoại tiếp, nội tiếp & Đa giác đều | Tứ giác nội tiếp & Đa giác đều | Nhận biết tứ giác nội tiếp và tính chất tổng hai góc đối bằng 180°; nhận biết đa giác đều. | Cho tứ giác ABCD nội tiếp (O) có $\widehat{A} = 110^\circ$. Tính số đo góc đối diện $\widehat{C}$. | `geometry_2d_canvas` | • Chọn Engine: `geometry_2d_canvas` (chế độ Cyclic Quad Protractor).<br>• Vẽ (O) với 4 đỉnh A, B, C, D.<br>• Thanh ghép góc động: ghép góc A và C kề nhau chứng minh tổng 180°. | • Kéo đỉnh B, D: góc A và C thay đổi nhưng tổng luôn bằng $180^\circ$.<br>• Bấm 'Ghép 2 góc đối': xem hoạt ảnh tạo thành góc bẹt $180^\circ \to \widehat{C} = 70^\circ$. | • **Hint 1 (Tính chất):** Tứ giác nội tiếp có tổng 2 góc đối diện bằng 180°.<br>• **Hint 2 (Phép tính):** Lấy $180^\circ - 110^\circ$. | Chưa có mẫu curriculum |
| **M9-GEO-11** | Hình học và Đo lường | Chương 8: Một số hình khối trong thực tiễn (Trụ, Nón, Cầu) | Hình trụ, Hình nón và Hình cầu | Nhận biết bán kính đáy, chiều cao, đường sinh và công thức diện tích xung quanh, thể tích trụ, nón, cầu. | Một hình trụ có $R = 3\text{ cm}, h = 5\text{ cm}$. Nhận diện công thức và tính diện tích xung quanh. | `area_fraction_grid` | • Chọn Engine: `area_fraction_grid` (chế độ 3D Net Unfolder).<br>• Cấu hình trụ 3D có thanh trượt 'Trải phẳng mặt xung quanh'.<br>• Nhãn động: rộng $= h = 5$, dài $= 2\pi R$. | • Kéo thanh trượt 'Mở hình': mặt xung quanh duỗi phẳng thành hình chữ nhật kích thước $2\pi R \times h$.<br>• Ghép 2 kích thước nhận biết $S_{xq} = 2\pi Rh = 30\pi\text{ cm}^2$. | • **Hint 1 (Trực quan):** Trải phẳng mặt xung quanh hình trụ ta được hình chữ nhật.<br>• **Hint 2 (Công thức):** Diện tích xung quanh bằng chu vi đáy nhân chiều cao: $S_{xq} = 2\pi Rh$. | Chưa có mẫu curriculum |
| **M9-STP-01** | Thống kê và Xác suất | Chương 9: Một số yếu tố thống kê và xác suất | Bảng tần số, tần số tương đối & Biểu đồ ghép nhóm | Nhận biết tần số, tần số tương đối $f = \frac{m}{N} \times 100\%$ và đọc số liệu từ biểu đồ cột/quạt tròn. | Khảo sát 40 học sinh, có 10 em đạt điểm Giỏi. Tính tần số tương đối của nhóm điểm Giỏi. | `data_probability_sim` | • Chọn Engine: `data_probability_sim` (chế độ Frequency Bar & Pie Sync).<br>• Nhập cỡ mẫu $N = 40$, tần số nhóm $m = 10$.<br>• Đồng bộ biểu đồ cột với biểu đồ quạt tròn. | • Chỉnh cột tần số đến mức 10 trên 40 mẫu; biểu đồ quạt tròn tự tô sáng góc tương ứng 25%.<br>• Chọn kết quả 25%. | • **Hint 1 (Công thức):** Tần số tương đối bằng tỉ số giữa tần số m và cỡ mẫu N (nhân 100%).<br>• **Hint 2 (Phép tính):** Tính $(10 / 40) \times 100\%$. | Chưa có mẫu curriculum |
| **M9-STP-02** | Thống kê và Xác suất | Chương 9: Một số yếu tố thống kê và xác suất | Phép thử ngẫu nhiên, Không gian mẫu & Xác suất biến cố | Nhận biết không gian mẫu $\Omega$, số phần tử $n(\Omega)$ và tính xác suất cổ điển $P(A) = \frac{n(A)}{n(\Omega)}$. | Gieo xúc xắc cân đối 1 lần. Xác định $n(\Omega)$ và xác suất biến cố A: 'Xuất hiện mặt chẵn'. | `data_probability_sim` | • Chọn Engine: `data_probability_sim` (chế độ Sample Space Grid).<br>• Chọn preset 'Xúc xắc 6 mặt' ({1, 2, 3, 4, 5, 6}).<br>• Chạm chọn các thẻ thỏa mãn A để tự đếm $n(A)$. | • Chạm các mặt chẵn (2, 4, 6) trong lưới 6 kết quả.<br>• Hệ thống tự lập phân số $\frac{n(A)}{n(\Omega)} = \frac{3}{6} = \frac{1}{2}$. | • **Hint 1 (Không gian mẫu):** Xúc xắc có 6 mặt từ 1 đến 6 nên $n(\Omega) = 6$.<br>• **Hint 2 (Kết quả thuận lợi):** Mặt chẵn gồm {2, 4, 6}, có 3 kết quả thuận lợi. | Có mẫu curriculum; chưa nghiệm thu chuẩn mới/Android hosted |

---

## 4. CẤU TRÚC JSON PAYLOAD CHUẨN ĐỂ WEB ADMIN CMS XUẤT BẢN SANG FLUTTER APP

> **Nguyên tắc thiết kế:** Mỗi bài học được cấu trúc thành các Slide (Micro-Arc) dùng chung 1 `engine` ID, giúp Admin nhân bản (Clone) và đổi tham số nhanh chóng mà không cần lập trình lại App.

### 4.1. Ví Dụ 1: M9-GEO-05 (Tiếp Tuyến Đường Tròn)
* **Core Engine:** `geometry_2d_canvas`
* **Form CMS:**
  - `radius`: 6
  - `initial_distance`: 9
  - `target_distance`: 6
  - `show_right_angle`: true
* **Payload JSON (`lessons.content_json`):**

```json
{
  "lesson_id": "M9-GEO-05",
  "engine": "geometry_2d_canvas",
  "mode": "tangent_distance_slider",
  "params": {
    "circle": {
      "center": [0, 0],
      "radius": 6
    },
    "line": {
      "initial_d": 9,
      "min_d": 0,
      "max_d": 10,
      "step": 1
    },
    "target_condition": {
      "d_equals_r": true,
      "highlight_90_deg": true
    }
  },
  "hints": [
    "Kéo đường thẳng tiến sát mép đường tròn cho đến khi chỉ còn đúng 1 điểm chung.",
    "Tiếp tuyến vuông góc với bán kính tại tiếp điểm (góc 90°)."
  ]
}
```

---

### 4.2. Ví Dụ 2: M9-ALG-09 (Đồ Thị Hàm Số $y = ax^2$)
* **Core Engine:** `cartesian_graph_engine`
* **Form CMS:**
  - `a_min`: -3, `a_max`: 3
  - `target_a`: -2
  - `test_x`: 3
  - `expected_y`: -18
* **Payload JSON (`lessons.content_json`):**

```json
{
  "lesson_id": "M9-ALG-09",
  "engine": "cartesian_graph_engine",
  "mode": "parabola_morphing",
  "params": {
    "a_slider": {
      "min": -3,
      "max": 3,
      "step": 0.5,
      "exclude_zero": true
    },
    "target_a": -2,
    "probe_point": {
      "x": 3,
      "lock_x": true
    },
    "show_symmetry_axis": true
  },
  "hints": [
    "Kéo thanh trượt hệ số a về giá trị âm (-2) để quan sát chiều bề lõm.",
    "Thay x = 3 vào y = -2x² ta được y = -2 × 9 = -18."
  ]
}
```

---

### 4.3. Ví Dụ 3: M9-GEO-11 (Diện Tích Xung Quanh Hình Trụ)
* **Core Engine:** `area_fraction_grid`
* **Form CMS:**
  - `shape`: cylinder
  - `radius`: 3, `height`: 5
  - `unfold_animation`: true
* **Payload JSON (`lessons.content_json`):**

```json
{
  "lesson_id": "M9-GEO-11",
  "engine": "area_fraction_grid",
  "mode": "3d_net_unfolder",
  "params": {
    "solid": "cylinder",
    "radius": 3,
    "height": 5,
    "unfold_progress": 0.0,
    "labels": {
      "width": "h = 5",
      "length": "2πR = 6π"
    }
  },
  "hints": [
    "Kéo thanh trượt mở hình để trải phẳng mặt xung quanh thành hình chữ nhật.",
    "Diện tích xung quanh = Chu vi đáy × Chiều cao = 2πRh."
  ]
}
```
