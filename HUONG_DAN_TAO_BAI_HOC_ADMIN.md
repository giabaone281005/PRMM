# Hướng dẫn tạo bài học trên Admin — hiện trạng sau ENG-03

Ngày đóng gói: 14/11/2026. Hướng dẫn được đối chiếu với mã nguồn hiện tại, gồm **19 template authoring**, **15 thẻ mẫu công cụ** và danh mục **24 mã Toán 9**. Một mã có thể có nhiều mục tiêu; có tên trong danh mục không có nghĩa mọi dạng con đã triển khai.

## 1. Mở đúng màn hình và chọn đúng luồng

- Vào `/admin/lessons` → **Thêm bài mới** để mở `/admin/lessons/new`. Đăng nhập tài khoản có quyền admin để xuất bản; author có thể soạn/lưu theo phân quyền hiện có.
- Hoặc vào **Công cụ tương tác** (`/admin/engines`) → phần **Năng lực sáu core engine** → chọn mode có nút **Soạn bài từ mode này**.
- Trong form **Soạn đề theo mẫu**, đổi **Dạng bài và mục tiêu** để chọn đủ 19 template. Đặc biệt `right_triangle` mở mẫu đầu tiên; chọn lại GEO-02/GEO-03 trong dropdown để đổi mục tiêu.
- Phần **Mẫu bài theo công cụ tương tác** dùng nút **Tạo bài từ mẫu**. Hình trụ và parabol đã đi vào form chuẩn; các thẻ còn lại chủ yếu mở **Luồng legacy · chỉnh full manifest**.
- Các mode ghi **Chưa triển khai · không thể xuất bản** không có nút soạn. ENG-04…06 chưa hoàn tất; không dùng mẫu legacy để tuyên bố engine mới đã đủ.

## 2. Quy trình chung cho 19 template chuẩn

1. Chọn template/mục tiêu, nhập **Tên bài học**. Chọn lại template khi có sửa chưa lưu sẽ yêu cầu xác nhận bỏ nội dung đang soạn.
2. Điền **Dữ kiện khám phá · bước 1–4**, **Vận dụng độc lập · bước 5** và **Tự kiểm tra · bước 6**. Ba bộ dữ kiện phải khác nhau. Không chỉ đổi tiêu đề để tạo biến thể bước 5/6.
3. Chỉ sửa dữ kiện và content slot được form cho phép. Ghi chú bối cảnh là ghi chú lưu nguồn, không thay lời hỏi runtime và không nhập lại số/công thức vào đó.
4. Xem **Kết quả tự tính / chỉ đọc cho người soạn**. Không nhập nghiệm, giá trị cấm, tâm hình hoặc hotspot độc lập vào JSON đề.
5. Chọn từng bước ở **Preview theo dữ kiện**, rồi **Preview điện thoại đủ sáu bước**. Thử cả thao tác sai và đúng, kiểm tra đổi dữ kiện làm hình/chấm thay đổi.
6. Bấm **Lưu bản nháp**. Chỉ khi đã kiểm nội dung mới bấm **Xuất bản phiên bản mới**. Xuất bản tạo version mới; không ghi đè manifest/progress cũ.
7. Vào **Bài học** → **Lịch sử** để kiểm version và nguồn template. Muốn bài ID mới: **Tạo bài mới từ nội dung này**; muốn sửa cùng bài: mở **Sửa bài** và xuất bản version tiếp.
8. Trên app Android đã cập nhật, tải lại danh sách và mở bài; kiểm lưu/thoát/mở lại. Máy nhận gói source chưa tự có cấu hình hay tài khoản Supabase.

Sáu vai trò cố định: **Khám phá → Nhận diện → Tìm quy luật → Thực hành có hướng dẫn → Vận dụng độc lập → Tự kiểm tra và chốt kiến thức**. JSON đề không được thêm/xóa/đảo bước. Học sinh phải thao tác để đạt; feedback chứa đáp án chỉ hiện sau thành công.

## 3. Tra nhanh theo template

| Chủ đề/mục tiêu trong form | Mã | Template |
|---|---|---|
| Phương trình hai ẩn · Điểm nghiệm | M9-ALG-01 | `math9-linear-relation@1` |
| Hệ hai đường thẳng | M9-ALG-02 | `math9-linear-system@1` |
| Mở rộng · Đường thẳng và parabol | M9-ALG-09 | `math9-line-parabola@1` |
| Phương trình tích | M9-ALG-03 | `math9-algebra-product-equation@1` |
| Phương trình hữu tỉ · Điều kiện xác định | M9-ALG-03 | `math9-algebra-rational-equation@1` |
| Hệ số, Δ và nghiệm · Hạ bậc có chủ đích | M9-ALG-10 | `math9-algebra-quadratic-equation@1` |
| Viète · Ghép tổng, tích và cặp nghiệm thực | M9-ALG-11 | `math9-algebra-viete@1` |
| Parabol · Hệ số | M9-ALG-09 | `math9-parabola-coefficient@1` |
| Cạnh đối, kề, huyền | M9-GEO-01 | `math9-geometry-01@1` |
| Tỉ số lượng giác | M9-GEO-02 | `math9-geometry-02@1` |
| Góc nhọn và góc đặc biệt | M9-GEO-03 | `math9-geometry-03@1` |
| Đường tròn và đối xứng | M9-GEO-04 | `math9-geometry-04@1` |
| Đường thẳng và đường tròn | M9-GEO-05 | `math9-geometry-05@1` |
| Vị trí hai đường tròn | M9-GEO-06 | `math9-geometry-06@1` |
| Góc ở tâm và góc nội tiếp | M9-GEO-07 | `math9-geometry-07@1` |
| Cung, quạt tròn và vành khuyên | M9-GEO-08 | `math9-geometry-08@1` |
| Nội tiếp và ngoại tiếp tam giác | M9-GEO-09 | `math9-geometry-09@1` |
| Tứ giác nội tiếp và đa giác đều | M9-GEO-10 | `math9-geometry-10@1` |
| Hình trụ · Nhận diện | M9-GEO-11 | `math9-cylinder-recognition@1` |

## 4. Cách soạn từng chủ đề đã có form

Các bảng dưới là dữ kiện ví dụ của từng template trong code. Có thể nhập bằng form; tên key chỉ để đối chiếu file JSON. Các enum trong form có thể hiển thị tiếng Việt.

### 4.1. Phương trình hai ẩn · Điểm nghiệm — M9-ALG-01

Template: `math9-linear-relation@1`; mode `linear_relation`.

Nhập hệ số của G: ax + by = c, kể cả đường đứng/ngang. Bước ghim snap nhận 0 (tự do), 0,5 hoặc 1.

**Giới hạn/phạm vi:** a=b=0 bị từ chối. Hệ số nguyên −12…12. Nếu nghiệm không nằm trên lưới, đổi snap=0 hoặc chọn dữ kiện khác.

| Trường | Bước 1–4 | Bước 5 | Bước 6 |
|---|---|---|---|
| a (`a`) | 1 | 0 | 1 |
| b (`b`) | 1 | 1 | 0 |
| c (`c`) | 4 | 3 | -2 |
| snap (`snap`) | 1 | 1 | 1 |

**Thử ở vai trò học sinh:** Thử di chuyển ghim; chọn điểm thuộc G; các bước sau đặt ghim với tọa độ được nhiệm vụ yêu cầu và xác nhận.

JSON mẫu: [contracts/authoring/math9-linear-relation.example.json](learning-platform/contracts/authoring/math9-linear-relation.example.json).

### 4.2. Hệ hai đường thẳng — M9-ALG-02

Template: `math9-linear-system@1`; mode `linear_system`.

G: ax+by=c; H: dx+ey=f. Hệ số d/e/f thuộc đường thứ hai; snap áp dụng cho ghim nghiệm.

**Giới hạn/phạm vi:** Mỗi đường cần ít nhất một hệ số x/y khác 0. Ví dụ gốc có nghiệm (2;2); biến thể mẫu đã có song song và trùng nhau.

| Trường | Bước 1–4 | Bước 5 | Bước 6 |
|---|---|---|---|
| a (`a`) | 1 | 1 | 1 |
| b (`b`) | 1 | 1 | 1 |
| c (`c`) | 4 | 2 | 2 |
| d (`d`) | 1 | 2 | 2 |
| e (`e`) | -1 | 2 | 2 |
| f (`f`) | 0 | 6 | 4 |
| snap (`snap`) | 1 | 1 | 1 |

**Thử ở vai trò học sinh:** Nhận diện cả G/H; chọn số nghiệm. Hữu hạn: đặt ghim; song song/trùng nhau: kết luận tương ứng rồi xác nhận.

JSON mẫu: [contracts/authoring/math9-linear-system.example.json](learning-platform/contracts/authoring/math9-linear-system.example.json).

### 4.3. Mở rộng · Đường thẳng và parabol — M9-ALG-09

Template: `math9-line-parabola@1`; mode `line_parabola_intersection`.

G: ax+by=c; H: y=qx². q là hệ số parabol; mã vẫn ALG-09, đây là mục tiêu mở rộng.

**Giới hạn/phạm vi:** q nguyên −12…12 khác 0. Có 0/1/2 giao điểm; nếu tọa độ không theo snap đã chọn thì dùng snap=0.

| Trường | Bước 1–4 | Bước 5 | Bước 6 |
|---|---|---|---|
| a (`a`) | 0 | 0 | 0 |
| b (`b`) | 1 | 1 | 1 |
| c (`c`) | 4 | 0 | -1 |
| q (`q`) | 1 | 1 | 1 |
| snap (`snap`) | 1 | 1 | 1 |

**Thử ở vai trò học sinh:** Đặt đủ ghim cho các điểm chung và chọn đúng số giao điểm. Không có giao điểm thì chỉ xác nhận kết luận.

JSON mẫu: [contracts/authoring/math9-line-parabola.example.json](learning-platform/contracts/authoring/math9-line-parabola.example.json).

### 4.4. Phương trình tích — M9-ALG-03

Template: `math9-algebra-product-equation@1`; mode `product_equation`.

Tích (px+q)(rx+s)=0. Nhập p/q cho nhân tử thứ nhất, r/s cho nhân tử thứ hai.

**Giới hạn/phạm vi:** Hệ số nguyên −9…9; p/r khác 0. Không nhập nghiệm riêng. Hai nhân tử có thể cho nghiệm kép.

| Trường | Bước 1–4 | Bước 5 | Bước 6 |
|---|---|---|---|
| Hệ số x · nhân tử tử số thứ nhất (`p`) | 1 | 2 | 1 |
| Hằng số · nhân tử tử số thứ nhất (`q`) | -2 | -1 | -2 |
| Hệ số x · nhân tử tử số thứ hai (`r`) | 1 | 1 | 1 |
| Hằng số · nhân tử tử số thứ hai (`s`) | 3 | -4 | -2 |

**Thử ở vai trò học sinh:** Ghép hai nhân tử; chọn tách tích bằng 0 hoặc phép tương đương hợp lệ; nhập số nghiệm khác nhau và các nghiệm.

JSON mẫu: [contracts/authoring/math9-algebra-product-equation.example.json](learning-platform/contracts/authoring/math9-algebra-product-equation.example.json).

### 4.5. Phương trình hữu tỉ · Điều kiện xác định — M9-ALG-03

Template: `math9-algebra-rational-equation@1`; mode `rational_equation`.

Phân thức (px+q)(rx+s)/[(dx+e)(fx+g)] = k. Chỉ một nhân tử mẫu thì đặt f=0,g=1.

**Giới hạn/phạm vi:** p/r/d khác 0; (f,g) không đồng thời 0; nguyên −9…9. Mẫu gốc quyết định giá trị cấm kể cả sau rút gọn.

| Trường | Bước 1–4 | Bước 5 | Bước 6 |
|---|---|---|---|
| Hệ số x · nhân tử tử số thứ nhất (`p`) | 1 | 1 | 1 |
| Hằng số · nhân tử tử số thứ nhất (`q`) | -2 | -2 | -1 |
| Hệ số x · nhân tử tử số thứ hai (`r`) | 1 | 1 | 1 |
| Hằng số · nhân tử tử số thứ hai (`s`) | 3 | 2 | -2 |
| Hệ số x · nhân tử mẫu thứ nhất (`d`) | 1 | 1 | 1 |
| Hằng số · nhân tử mẫu thứ nhất (`e`) | -2 | -1 | -1 |
| Hệ số x · nhân tử mẫu thứ hai (`f`) | 0 | 1 | 1 |
| Hằng số · nhân tử mẫu thứ hai (`g`) | 1 | 1 | -2 |
| Hằng số vế phải (`k`) | 0 | 1 | 1 |

**Thử ở vai trò học sinh:** Chọn tất cả giá trị làm mẫu bằng 0, chốt điều kiện; khử mẫu trên miền đó, giải và loại nghiệm ngoại lai. Ví dụ gốc loại x=2, giữ x=−3.

JSON mẫu: [contracts/authoring/math9-algebra-rational-equation.example.json](learning-platform/contracts/authoring/math9-algebra-rational-equation.example.json).

### 4.6. Hệ số, Δ và nghiệm · Hạ bậc có chủ đích — M9-ALG-10

Template: `math9-algebra-quadratic-equation@1`; mode `quadratic_equation`.

Nhập a/b/c cho ax²+bx+c=0. Chọn “Chỉ phương trình bậc hai” hoặc “Cho phép hạ bậc khi a=0”.

**Giới hạn/phạm vi:** Nguyên −9…9. Chỉ bậc hai bắt buộc a khác 0. Allow linear xử lý tuyến tính, hằng đúng và hằng sai.

| Trường | Bước 1–4 | Bước 5 | Bước 6 |
|---|---|---|---|
| Hệ số bình phương x (`a`) | 1 | 1 | 1 |
| Hệ số x (`b`) | -3 | 2 | 0 |
| Hằng số tự do (`c`) | 2 | 1 | 2 |
| Quy tắc bậc phương trình (`degreePolicy`) | quadratic_only | quadratic_only | quadratic_only |

**Thử ở vai trò học sinh:** Ghép đúng hệ số có dấu; chọn bậc, tính Δ nếu bậc hai, số nghiệm và nghiệm. Không có/mọi x thì để trống ô nghiệm.

JSON mẫu: [contracts/authoring/math9-algebra-quadratic-equation.example.json](learning-platform/contracts/authoring/math9-algebra-quadratic-equation.example.json).

### 4.7. Viète · Ghép tổng, tích và cặp nghiệm thực — M9-ALG-11

Template: `math9-algebra-viete@1`; mode `viete`.

Nhập a/b/c. Công thức tổng −b/a và tích c/a được suy từ phương trình.

**Giới hạn/phạm vi:** a khác 0, Δ không âm; nguyên −9…9. Chưa có Viète nghiệm phức.

| Trường | Bước 1–4 | Bước 5 | Bước 6 |
|---|---|---|---|
| Hệ số bình phương x (`a`) | 1 | 2 | -1 |
| Hệ số x (`b`) | -3 | 4 | 2 |
| Hằng số tự do (`c`) | 2 | 2 | 3 |

**Thử ở vai trò học sinh:** Ghép công thức tổng/tích, nhập giá trị và cả hai nghiệm. Nghiệm kép nhập hai lần, số nghiệm khác nhau chọn 1.

JSON mẫu: [contracts/authoring/math9-algebra-viete.example.json](learning-platform/contracts/authoring/math9-algebra-viete.example.json).

### 4.8. Parabol · Hệ số — M9-ALG-09

Template: `math9-parabola-coefficient@1`; mode `coefficient`.

Nhập a cho y=ax², không nhập tọa độ đáp án. Điểm kiểm tra và hình do compiler sinh.

**Giới hạn/phạm vi:** a nguyên −5…5, khác 0; ba bộ hệ số khác nhau.

| Trường | Bước 1–4 | Bước 5 | Bước 6 |
|---|---|---|---|
| a (`a`) | 1 | 2 | -2 |

**Thử ở vai trò học sinh:** Khám phá hai dấu, nhận diện hướng mở, so độ rộng, dựng hệ số từ điểm và xác nhận.

JSON mẫu: [contracts/authoring/math9-parabola-coefficient.example.json](learning-platform/contracts/authoring/math9-parabola-coefficient.example.json).

### 4.9. Cạnh đối, kề, huyền — M9-GEO-01

Template: `math9-geometry-01@1`; mode `right_triangle`.

Tam giác vuông tại A; hai cạnh AB=legA, AC=legB quyết định hình. Chọn góc B/C, vai trò đối/kề/huyền và tỉ số.

**Giới hạn/phạm vi:** Hiện nhiệm vụ chính GEO-01 là nhận diện/tính độ dài cạnh theo góc. Không có cot riêng; không coi tên rộng trong danh mục là đã đủ toàn chuyên đề.

| Trường | Bước 1–4 | Bước 5 | Bước 6 |
|---|---|---|---|
| Cạnh góc vuông AB (`legA`) | 3 | 5 | 3 |
| Cạnh góc vuông AC (`legB`) | 4 | 5 | 5.196152422706632 |
| Góc đang xét (`angleAt`) | B | C | B |
| Vai trò cạnh cần chọn (`target`) | opposite | adjacent | hypotenuse |
| Tỉ số cần tính (`ratio`) | sin | cos | tan |
| Đơn vị (`unit`) | cm | cm | cm |

**Thử ở vai trò học sinh:** Kéo điểm cam xoay hình giữ ràng buộc; chọn đúng cạnh theo góc đang xét, tính độ dài và xác nhận.

JSON mẫu: [contracts/authoring/math9-geometry-01.example.json](learning-platform/contracts/authoring/math9-geometry-01.example.json).

### 4.10. Tỉ số lượng giác — M9-GEO-02

Template: `math9-geometry-02@1`; mode `right_triangle`.

Cùng mô hình tam giác vuông; chọn ratio=sin/cos/tan và góc B/C. Đặt hai cạnh bằng nhau để có góc 45°.

**Giới hạn/phạm vi:** Hiện GEO-02 tính tỉ số theo dữ kiện; ví dụ 30°/60° dùng hai cạnh 3 và 5,196152422706632. Chưa có bài ghép hai góc phụ nhau riêng.

| Trường | Bước 1–4 | Bước 5 | Bước 6 |
|---|---|---|---|
| Cạnh góc vuông AB (`legA`) | 3 | 5 | 3 |
| Cạnh góc vuông AC (`legB`) | 4 | 5 | 5.196152422706632 |
| Góc đang xét (`angleAt`) | B | C | B |
| Vai trò cạnh cần chọn (`target`) | opposite | adjacent | hypotenuse |
| Tỉ số cần tính (`ratio`) | sin | cos | tan |
| Đơn vị (`unit`) | cm | cm | cm |

**Thử ở vai trò học sinh:** Chọn đúng cạnh theo vai trò; tính tỉ số lượng giác. Dùng kết quả thập phân với độ chính xác đủ.

JSON mẫu: [contracts/authoring/math9-geometry-02.example.json](learning-platform/contracts/authoring/math9-geometry-02.example.json).

### 4.11. Góc nhọn và góc đặc biệt — M9-GEO-03

Template: `math9-geometry-03@1`; mode `right_triangle`.

Hai cạnh vuông xác định góc B/C; nhiệm vụ tính góc nhọn theo dữ kiện.

**Giới hạn/phạm vi:** Template hiện tính góc từ hai cạnh, không có form nhập một góc + một cạnh để giải mọi dạng hệ thức.

| Trường | Bước 1–4 | Bước 5 | Bước 6 |
|---|---|---|---|
| Cạnh góc vuông AB (`legA`) | 3 | 5 | 3 |
| Cạnh góc vuông AC (`legB`) | 4 | 5 | 5.196152422706632 |
| Góc đang xét (`angleAt`) | B | C | B |
| Vai trò cạnh cần chọn (`target`) | opposite | adjacent | hypotenuse |
| Tỉ số cần tính (`ratio`) | sin | cos | tan |
| Đơn vị (`unit`) | cm | cm | cm |

**Thử ở vai trò học sinh:** Nhận diện cạnh theo góc, tính góc nhọn và nhập theo đơn vị độ.

JSON mẫu: [contracts/authoring/math9-geometry-03.example.json](learning-platform/contracts/authoring/math9-geometry-03.example.json).

### 4.12. Đường tròn và đối xứng — M9-GEO-04

Template: `math9-geometry-04@1`; mode `circle_symmetry`.

Nhập radius, pointDistance=OP, pointAngle (độ), axis=x/y; đơn vị cm/m.

**Giới hạn/phạm vi:** Bán kính 0,5…20, OP 0,5…30, góc P 10°…80°. Trục phản xạ đi cùng cấu hình khi xoay.

| Trường | Bước 1–4 | Bước 5 | Bước 6 |
|---|---|---|---|
| Bán kính ngoài / đường tròn O (`radius`) | 4 | 3 | 2 |
| Khoảng cách OP (`pointDistance`) | 2 | 3 | 4 |
| Góc đặt điểm P (độ) (`pointAngle`) | 35 | 60 | 45 |
| Trục phản xạ (`axis`) | x | y | x |
| Đơn vị (`unit`) | cm | cm | cm |

**Thử ở vai trò học sinh:** Chọn Q đối xứng; phân loại P trong=0, trên=1, ngoài=2 bằng so OP với r.

JSON mẫu: [contracts/authoring/math9-geometry-04.example.json](learning-platform/contracts/authoring/math9-geometry-04.example.json).

### 4.13. Đường thẳng và đường tròn — M9-GEO-05

Template: `math9-geometry-05@1`; mode `line_circle`.

Nhập bán kính, distance từ tâm tới đường thẳng và normalAngle (góc pháp tuyến).

**Giới hạn/phạm vi:** r 0,5…20; distance 0…40; góc 0…359°. Distance là khoảng cách, không phải tung độ hoặc góc của đường.

| Trường | Bước 1–4 | Bước 5 | Bước 6 |
|---|---|---|---|
| Bán kính ngoài / đường tròn O (`radius`) | 4 | 3 | 2 |
| Khoảng cách tới tâm / giữa hai tâm (`distance`) | 2 | 3 | 4 |
| Góc pháp tuyến đường thẳng (độ) (`normalAngle`) | 20 | 70 | 120 |
| Đơn vị (`unit`) | cm | cm | cm |

**Thử ở vai trò học sinh:** So d với r để đếm 0/1/2 giao điểm; bật lớp tiếp tuyến để xem tiếp điểm và bán kính vuông góc.

JSON mẫu: [contracts/authoring/math9-geometry-05.example.json](learning-platform/contracts/authoring/math9-geometry-05.example.json).

### 4.14. Vị trí hai đường tròn — M9-GEO-06

Template: `math9-geometry-06@1`; mode `two_circles`.

radius và radius2 là hai bán kính; distance là khoảng cách tâm O/K.

**Giới hạn/phạm vi:** Bán kính 0,5…20; distance 0…40. Đồng tâm khác bán kính và trùng nhau được xét riêng.

| Trường | Bước 1–4 | Bước 5 | Bước 6 |
|---|---|---|---|
| Bán kính ngoài / đường tròn O (`radius`) | 4 | 3 | 2 |
| Bán kính đường tròn K (`radius2`) | 3 | 2 | 1 |
| Khoảng cách tới tâm / giữa hai tâm (`distance`) | 5 | 5 | 5 |
| Đơn vị (`unit`) | cm | cm | cm |

**Thử ở vai trò học sinh:** Chọn đường tròn K; nhập số giao 0/1/2, hoặc 3 cho trùng nhau (vô số).

JSON mẫu: [contracts/authoring/math9-geometry-06.example.json](learning-platform/contracts/authoring/math9-geometry-06.example.json).

### 4.15. Góc ở tâm và góc nội tiếp — M9-GEO-07

Template: `math9-geometry-07@1`; mode `circle_angles`.

Nhập radius và sweep là góc ở tâm chắn cung nhỏ AB.

**Giới hạn/phạm vi:** sweep 20°…160°, r 0,5…20; đỉnh V bị giữ trên cung lớn để tránh cấu hình mơ hồ.

| Trường | Bước 1–4 | Bước 5 | Bước 6 |
|---|---|---|---|
| Bán kính ngoài / đường tròn O (`radius`) | 4 | 3 | 5 |
| Góc ở tâm chắn cung (độ) (`sweep`) | 60 | 90 | 120 |
| Đơn vị (`unit`) | cm | cm | cm |

**Thử ở vai trò học sinh:** Kéo V trên cung lớn; chọn cung AB và tính góc nội tiếp = sweep/2.

JSON mẫu: [contracts/authoring/math9-geometry-07.example.json](learning-platform/contracts/authoring/math9-geometry-07.example.json).

### 4.16. Cung, quạt tròn và vành khuyên — M9-GEO-08

Template: `math9-geometry-08@1`; mode `arc_sector_annulus`.

Chọn measure: arc=độ dài cung, sector=diện tích quạt, annulus=diện tích vành. Nhập r, innerRadius và sweep.

**Giới hạn/phạm vi:** Bán kính trong dương, nhỏ hơn ngoài; sweep 20°…160°. Ngay cả bài cung/quạt, mẫu hiện vẫn yêu cầu innerRadius hợp lệ.

| Trường | Bước 1–4 | Bước 5 | Bước 6 |
|---|---|---|---|
| Bán kính ngoài / đường tròn O (`radius`) | 4 | 3 | 5 |
| Bán kính trong (`innerRadius`) | 2 | 1 | 3 |
| Góc ở tâm chắn cung (độ) (`sweep`) | 60 | 90 | 120 |
| Đại lượng cần tính (`measure`) | arc | sector | annulus |
| Đơn vị (`unit`) | cm | cm | cm |

**Thử ở vai trò học sinh:** Chọn cung/quạt/vành theo nhiệm vụ; tính với π, nhập số thập phân. Độ dài dùng cm/m; diện tích dùng cm²/m².

JSON mẫu: [contracts/authoring/math9-geometry-08.example.json](learning-platform/contracts/authoring/math9-geometry-08.example.json).

### 4.17. Nội tiếp và ngoại tiếp tam giác — M9-GEO-09

Template: `math9-geometry-09@1`; mode `triangle_circles`.

Nhập ba cạnh sideA=BC, sideB=CA, sideC=AB và chọn incircle/circumcircle.

**Giới hạn/phạm vi:** Mỗi cạnh 0,5…20; phải thỏa bất đẳng thức tam giác và không gần suy biến. Chỉ dựng từ SSS, không nhập tâm/đáp án riêng.

| Trường | Bước 1–4 | Bước 5 | Bước 6 |
|---|---|---|---|
| Cạnh a = BC (`sideA`) | 5 | 5 | 6 |
| Cạnh b = CA (`sideB`) | 4 | 5 | 6 |
| Cạnh c = AB (`sideC`) | 3 | 6 | 6 |
| Đường tròn cần dựng (`construction`) | incircle | circumcircle | incircle |
| Đơn vị (`unit`) | cm | cm | cm |

**Thử ở vai trò học sinh:** Bật lớp nội/ngoại tiếp cần chọn; xem phân giác/trung trực; tính bán kính r=S/p hoặc R=abc/(4S).

JSON mẫu: [contracts/authoring/math9-geometry-09.example.json](learning-platform/contracts/authoring/math9-geometry-09.example.json).

### 4.18. Tứ giác nội tiếp và đa giác đều — M9-GEO-10

Template: `math9-geometry-10@1`; mode `cyclic_polygon`.

Chọn cyclic_quadrilateral hoặc regular_polygon; nhập bán kính. Đa giác đều dùng vertices; tứ giác dùng góc cực B/C/D, với A ở 0°.

**Giới hạn/phạm vi:** vertices nguyên 3…12. Mẫu luôn yêu cầu góc B/C/D tăng dần, mỗi khoảng cung (kể cả D→360°) từ 10°…170°, ngay cả khi chọn đa giác đều.

| Trường | Bước 1–4 | Bước 5 | Bước 6 |
|---|---|---|---|
| Bán kính ngoài / đường tròn O (`radius`) | 4 | 3 | 5 |
| Loại đa giác (`shape`) | cyclic_quadrilateral | regular_polygon | regular_polygon |
| Số đỉnh đa giác đều (`vertices`) | 4 | 6 | 3 |
| Góc cực đỉnh B (độ) (`angleB`) | 70 | 80 | 90 |
| Góc cực đỉnh C (độ) (`angleC`) | 170 | 180 | 190 |
| Góc cực đỉnh D (độ) (`angleD`) | 270 | 260 | 280 |
| Đơn vị (`unit`) | cm | cm | cm |

**Thử ở vai trò học sinh:** Chọn đa giác; tính góc đối trong tứ giác nội tiếp hoặc mỗi góc trong đa giác đều. Không đổi thứ tự đỉnh để tạo hình tự cắt.

JSON mẫu: [contracts/authoring/math9-geometry-10.example.json](learning-platform/contracts/authoring/math9-geometry-10.example.json).

### 4.19. Hình trụ · Nhận diện — M9-GEO-11

Template: `math9-cylinder-recognition@1`; mode `recognition`.

Nhập bán kính r, chiều cao h và đơn vị cm/m. Biến thể bước 5/6 đổi r/h, dùng chung đơn vị.

**Giới hạn/phạm vi:** r/h mỗi số 0,1…100; h/r từ 0,1 đến 10. Chỉ nhận diện; diện tích/thể tích/hình trải chưa thuộc template này.

| Trường | Bước 1–4 | Bước 5 | Bước 6 |
|---|---|---|---|
| radius (`radius`) | 4 | 3 | 5 |
| height (`height`) | 7 | 6 | 8 |
| unit (`unit`) | cm | Kế thừa dữ kiện gốc | Kế thừa dữ kiện gốc |

**Thử ở vai trò học sinh:** Xoay khối, chọn bán kính/chiều cao/đáy/mặt bên theo lời hỏi. Đổi r/h phải làm hình và nhãn đổi thật.

JSON mẫu: [contracts/authoring/math9-cylinder-recognition.example.json](learning-platform/contracts/authoring/math9-cylinder-recognition.example.json).

## 5. AI JSON: tải đúng schema, nhập có xem khác biệt

1. Chọn template trước, bấm **Tải schema đề**, **Tải JSON mẫu** hoặc **Tải bộ hướng dẫn AI**. Mỗi template có schema riêng.
2. Đưa AI schema và mẫu của chính template đó. Yêu cầu trả một JSON object, giữ `authoringVersion`, `namespace`, `templateId`, `templateVersion`, `curriculumCode`, `mode`; chỉ đổi title/dữ kiện/content cho phép.
3. Ví dụ câu lệnh: “Tạo một đề biến thể cùng template/phiên bản và mã chương trình này; giữ đúng schema, thay dữ kiện gốc và hai biến thể bằng ba bộ hợp lệ khác nhau. Không tạo checkpoints, đáp án, mã thực thi, giá trị cấm hay tọa độ vùng chạm.”
4. Bấm **Nạp JSON đề**, hoặc mở **Dán JSON đề do AI trả về** → **Kiểm tra & xem khác biệt**.
5. Xem diff. **Áp dụng vào bản nháp hiện tại** giữ bài hiện tại; **Tạo thành bài biến thể mới** tạo ID mới. Import không tự lưu/publish.
6. Preview đủ sáu bước, lưu rồi xuất bản. JSON không hợp lệ hoặc không thể hoàn thành bị chặn. Không xóa field báo lỗi để lách schema; sửa theo giới hạn đúng template.

Ví dụ đầy đủ để thử import (hệ hai đường thẳng):

```json
{
  "authoringVersion": "1.0.0",
  "namespace": "excel-repo-v1",
  "templateId": "math9-linear-system",
  "templateVersion": 1,
  "curriculumCode": "M9-ALG-02",
  "mode": "linear_system",
  "title": "Khám phá hệ hai đường thẳng",
  "parameters": {
    "a": 1,
    "b": 1,
    "c": 4,
    "d": 1,
    "e": -1,
    "f": 0,
    "snap": 1
  },
  "variants": {
    "practice": {
      "a": 1,
      "b": 1,
      "c": 2,
      "d": 2,
      "e": 2,
      "f": 6,
      "snap": 1
    },
    "assessment": {
      "a": 1,
      "b": 1,
      "c": 2,
      "d": 2,
      "e": 2,
      "f": 4,
      "snap": 1
    }
  }
}
```

## 6. Mẫu legacy trên trang Công cụ tương tác

Dùng khi cần sửa bài cũ hoặc tạo đúng loại mẫu hiện có. Đây là full manifest, không có cùng bảo đảm khóa flow/provenance của authoring chuẩn. Với chủ đề đã có template mới, ưu tiên phần 4.

Quy trình: **Tạo bài từ mẫu** → sửa tên → chọn từng bước bên trái → sửa **Học sinh sẽ đọc / Gợi ý khi học sinh cần / Khi làm đúng** → nếu cần mở **Cấu hình engine JSON** và **Áp dụng cấu hình engine** → **▯ Xem trước** → thử các bước → **Lưu bản nháp** hoặc **Xuất bản ↗**. Đổi hình/nhãn/đáp án cần đồng bộ tất cả bước liên quan; đổi chữ đơn thuần không bảo đảm hình/toán thay đổi.

Quy tắc JSON legacy: `answers` thường dùng chỉ số **bắt đầu từ 0**, trong khi trường `correct` của câu hỏi recognition là chỉ số **bắt đầu từ 1**. Không đổi nhầm hai quy ước. `tokens` là thẻ/nhãn đối tượng; `labels` là nhóm/ô đích tùy kind; hotspot là tọa độ runtime legacy, chỉ chỉnh tại luồng này.

### 6.1. Phân loại phương trình

Thẻ `engine-token-classifier` · loại `TOKEN_CLASSIFIER` · 6 bước.

Đổi tokens thành biểu thức cần phân loại và labels thành các nhóm. answers[i] là chỉ số nhóm đúng cho thẻ i; số answers phải bằng số thẻ. Thử kéo từng thẻ vào nhóm.

Lời hỏi mẫu bước đầu: Phân loại: phương trình bậc nhất hai ẩn hay không?

Cấu hình bước đầu để đối chiếu (chỉ là các trường trích, **không phải JSON hoàn chỉnh để import**):

```json
{
  "labels": [
    "Bậc nhất hai ẩn",
    "Không phải"
  ],
  "tokens": [
    "x + y = 2",
    "x² + y = 3"
  ],
  "answers": [
    0,
    1
  ],
  "min": -5,
  "max": 5,
  "step": 1
}
```

### 6.2. Chạm hệ số

Thẻ `engine-coefficient` · loại `TAP_COEFFICIENT` · 6 bước.

Đặt các giá trị hệ số trong tokens; answers[0] là chỉ số thẻ đúng. Sửa đồng thời biểu thức trong lời hỏi, cả dấu âm và hệ số bị khuyết. Dùng template bậc hai mới nếu cần sinh tự động từ a/b/c.

Lời hỏi mẫu bước đầu: 5x − 7y = 9: chạm hệ số a.

Cấu hình bước đầu để đối chiếu (chỉ là các trường trích, **không phải JSON hoàn chỉnh để import**):

```json
{
  "labels": [],
  "tokens": [
    "5",
    "−7",
    "9"
  ],
  "answers": [
    0
  ],
  "min": -5,
  "max": 5,
  "step": 1
}
```

### 6.3. Trục số bất phương trình

Thẻ `engine-number-line` · loại `NUMBER_LINE_SELECTOR` · 6 bước.

answers gồm [mốc, hướng, đóng/mở]; hướng 0: tia trái, 1: tia phải; đóng/mở 0: rỗng, 1: kín. Mốc trong −10…10, khớp min/max/step. Kiểm trực tiếp hướng tô và dấu ngoặc trong preview.

Lời hỏi mẫu bước đầu: Dựng x ≥ 3.

Cấu hình bước đầu để đối chiếu (chỉ là các trường trích, **không phải JSON hoàn chỉnh để import**):

```json
{
  "labels": [
    "Mốc",
    "Chiều: trái / phải",
    "Đầu mút: mở / kín"
  ],
  "tokens": [
    "Trái",
    "Phải",
    "Mở",
    "Kín"
  ],
  "answers": [
    3,
    1,
    1
  ],
  "min": -10,
  "max": 10,
  "step": 1
}
```

### 6.4. Đổi chiều bất đẳng thức

Thẻ `engine-sign` · loại `INEQUALITY_SIGN_SWITCH` · 6 bước.

tokens là các dấu lựa chọn; answers[0] là chỉ số dấu đúng. Khi đổi phép nhân/chia âm trong câu hỏi, kiểm lại dấu và lời giải. Chưa phải solver bất đẳng thức tổng quát.

Lời hỏi mẫu bước đầu: Cho x < y. Hoàn thành −2x … −2y.

Cấu hình bước đầu để đối chiếu (chỉ là các trường trích, **không phải JSON hoàn chỉnh để import**):

```json
{
  "labels": [],
  "tokens": [
    "<",
    ">",
    "≤",
    "≥"
  ],
  "answers": [
    1
  ],
  "min": -5,
  "max": 5,
  "step": 1
}
```

### 6.5. Ghép công thức nhiều ô

Thẻ `engine-formula` · loại `FORMULA_SNAP_BUILDER` · 6 bước.

labels là các ô đích; tokens là thẻ công thức; mỗi answers[i] chỉ token đúng cho ô i. Giữ số labels bằng số answers. Không nhầm mẫu ghép công thức này với template Viète mới.

Lời hỏi mẫu bước đầu: Ghép tổng hai nghiệm theo Viète.

Cấu hình bước đầu để đối chiếu (chỉ là các trường trích, **không phải JSON hoàn chỉnh để import**):

```json
{
  "labels": [
    "Tử",
    "Mẫu"
  ],
  "tokens": [
    "−b",
    "a",
    "c",
    "b",
    "−c"
  ],
  "answers": [
    0,
    1
  ],
  "min": -5,
  "max": 5,
  "step": 1
}
```

### 6.6. Parabol động

Thẻ `engine-parabola` · loại `PARABOLA_SLIDER` · 6 bước.

Thẻ này hiện mở form parabol chuẩn ở phần 4. Nếu sửa bài slider legacy cũ, kiểm min/max/step và answers[0] là hệ số mục tiêu; ưu tiên tạo biến thể bằng template mới.

Lời hỏi mẫu bước đầu: Dựng y = x², quan sát hướng mở.

### 6.7. Biệt thức và số nghiệm

Thẻ `engine-delta` · loại `DELTA_STATE_TOGGLE` · 6 bước.

tokens là ba trạng thái Δ; answers[0] chỉ trạng thái đúng. Đổi lời hỏi/hệ số cần tự tính lại Δ; template bậc hai mới tự sinh Δ và nghiệm, nên ưu tiên form mới.

Lời hỏi mẫu bước đầu: Chọn Δ > 0, quan sát đồ thị cắt Ox.

Cấu hình bước đầu để đối chiếu (chỉ là các trường trích, **không phải JSON hoàn chỉnh để import**):

```json
{
  "labels": [],
  "tokens": [
    "Δ > 0",
    "Δ = 0",
    "Δ < 0"
  ],
  "answers": [
    0
  ],
  "min": -5,
  "max": 5,
  "step": 1
}
```

### 6.8. Chạm cạnh tam giác vuông

Thẻ `engine-triangle` · loại `TRIANGLE_HOTSPOT_TAP` · 6 bước.

tokens/hotspots là AB/AC/BC; answers[0] chọn cạnh. Nếu đổi góc B sang C, vai trò đối/kề đổi. Hotspot legacy không tự dựng lại theo độ dài; dùng GEO-01…03 chuẩn cho dữ kiện mới.

Lời hỏi mẫu bước đầu: ABC vuông tại A. Chạm cạnh huyền.

Cấu hình bước đầu để đối chiếu (chỉ là các trường trích, **không phải JSON hoàn chỉnh để import**):

```json
{
  "labels": [],
  "tokens": [
    "AB",
    "AC",
    "BC"
  ],
  "answers": [
    2
  ],
  "min": -5,
  "max": 5,
  "step": 1
}
```

### 6.9. Tiếp tuyến và vị trí tương đối

Thẻ `engine-circle` · loại `GEOMETRIC_HOTSPOT_FINDER` · 6 bước.

answers=[khoảng cách mục tiêu, chỉ số bộ phận]. Giữ khoảng cách trong min/max và trên step; hình mẫu có bán kính giả định riêng. Dùng GEO-05 chuẩn để đổi bán kính/đường thẳng đúng mô hình.

Lời hỏi mẫu bước đầu: R = 3: kéo d = 3 rồi chạm H.

Cấu hình bước đầu để đối chiếu (chỉ là các trường trích, **không phải JSON hoàn chỉnh để import**):

```json
{
  "labels": [],
  "tokens": [
    "O",
    "H",
    "Dây cung"
  ],
  "answers": [
    3,
    1
  ],
  "min": 0,
  "max": 5,
  "step": 0.5
}
```

### 6.10. Chạm cung và góc nội tiếp

Thẻ `engine-angle` · loại `ANGLE_MEASURE_TAP` · 6 bước.

tokens/hotspots là các cung; answers[0] chỉ cung đúng. Lời hỏi góc chắn cung phải đúng cấu hình. Dùng GEO-07 chuẩn cho sweep/bán kính và đỉnh chuyển động.

Lời hỏi mẫu bước đầu: Chạm cung AB không chứa C.

Cấu hình bước đầu để đối chiếu (chỉ là các trường trích, **không phải JSON hoàn chỉnh để import**):

```json
{
  "labels": [],
  "tokens": [
    "Cung AB",
    "Cung BC",
    "Cung CA"
  ],
  "answers": [
    0
  ],
  "min": -5,
  "max": 5,
  "step": 1
}
```

### 6.11. Khám phá 3D: Hình nón

Thẻ `engine-solid-cone` · loại `3D_SOLID_INSPECTOR` · 6 bước.

Học sinh xoay khối rồi chọn bộ phận trong tokens; answers[0] là chỉ số bộ phận. Nón/cầu hiện là mẫu nhận diện legacy, không phải engine đo diện tích/thể tích/trải hình. Hình trụ mở form chuẩn.

Lời hỏi mẫu bước đầu: Xoay mô hình rồi chạm bán kính r.

Cấu hình bước đầu để đối chiếu (chỉ là các trường trích, **không phải JSON hoàn chỉnh để import**):

```json
{
  "labels": [],
  "tokens": [
    "r",
    "h",
    "l",
    "Đáy"
  ],
  "answers": [
    0
  ],
  "min": -5,
  "max": 5,
  "step": 1
}
```

### 6.12. Khám phá 3D: Hình trụ

Thẻ `engine-solid-cylinder` · loại `3D_SOLID_INSPECTOR` · 6 bước.

Học sinh xoay khối rồi chọn bộ phận trong tokens; answers[0] là chỉ số bộ phận. Nón/cầu hiện là mẫu nhận diện legacy, không phải engine đo diện tích/thể tích/trải hình. Hình trụ mở form chuẩn.

Lời hỏi mẫu bước đầu: Xoay mô hình rồi chạm bán kính r.

### 6.13. Khám phá 3D: Hình cầu

Thẻ `engine-solid-sphere` · loại `3D_SOLID_INSPECTOR` · 6 bước.

Học sinh xoay khối rồi chọn bộ phận trong tokens; answers[0] là chỉ số bộ phận. Nón/cầu hiện là mẫu nhận diện legacy, không phải engine đo diện tích/thể tích/trải hình. Hình trụ mở form chuẩn.

Lời hỏi mẫu bước đầu: Xoay mô hình rồi chạm bán kính r.

Cấu hình bước đầu để đối chiếu (chỉ là các trường trích, **không phải JSON hoàn chỉnh để import**):

```json
{
  "labels": [],
  "tokens": [
    "r",
    "O"
  ],
  "answers": [
    0
  ],
  "min": -5,
  "max": 5,
  "step": 1
}
```

### 6.14. Đọc biểu đồ tần số

Thẻ `engine-chart` · loại `CHART_BAR_TAP` · 6 bước.

tokens là tên nhóm, labels chứa tần số ở mẫu, answers[0] là chỉ số nhóm. Khi đổi số cần kiểm tổng và tần số, chiều cao/vùng chạm và lời hỏi; chưa có editor đồng bộ bảng–cột–quạt ENG-06.

Lời hỏi mẫu bước đầu: Chạm cột Điểm 8.

Cấu hình bước đầu để đối chiếu (chỉ là các trường trích, **không phải JSON hoàn chỉnh để import**):

```json
{
  "labels": [
    "20",
    "10",
    "10"
  ],
  "tokens": [
    "Điểm 8",
    "Điểm 9",
    "Điểm 10"
  ],
  "answers": [
    0
  ],
  "min": -5,
  "max": 5,
  "step": 1
}
```

### 6.15. Phân loại biến cố

Thẻ `engine-events` · loại `EVENT_CARD_BUCKET` · 6 bước.

labels là Chắc chắn/Không thể/Ngẫu nhiên; tokens là các biến cố; answers[i] chỉ nhóm đúng cho thẻ i. Sửa thí nghiệm trong lời hỏi và phân loại từng thẻ; mẫu này chưa tính xác suất bằng không gian mẫu tổng quát.

Lời hỏi mẫu bước đầu: Phân loại biến cố khi gieo xúc xắc.

Cấu hình bước đầu để đối chiếu (chỉ là các trường trích, **không phải JSON hoàn chỉnh để import**):

```json
{
  "labels": [
    "Chắc chắn",
    "Không thể",
    "Ngẫu nhiên"
  ],
  "tokens": [
    "Số chấm < 7",
    "Số chấm = 0",
    "Số chấm chẵn",
    "Số chấm = 6"
  ],
  "answers": [
    0,
    1,
    2,
    2
  ],
  "min": -5,
  "max": 5,
  "step": 1
}
```

## 7. Danh mục 24 chủ đề: có form nào để dùng?

Mục **Chương trình Toán 9** là danh mục/pilot cũ: nút **Dùng mẫu trong Studio** chỉ bật ở ba pilot ALG-05, ALG-09, STP-02. Dù một thẻ danh mục ghi “Chưa có mẫu”, chủ đề đó vẫn có thể đã có template mới trong dropdown authoring hoặc trong Năng lực sáu core engine.

| Mã | Tên trong danh mục | Đường soạn thực tế hiện có |
|---|---|---|
| M9-ALG-01 | Khái niệm phương trình và hệ hai phương trình bậc nhất hai ẩn | `math9-linear-relation` |
| M9-ALG-02 | Giải hệ hai phương trình bậc nhất hai ẩn | `math9-linear-system` |
| M9-ALG-03 | Phương trình quy về phương trình bậc nhất một ẩn (Phương trình tích & chứa ẩn ở mẫu) | `math9-algebra-product-equation`; `math9-algebra-rational-equation` |
| M9-ALG-04 | Bất đẳng thức và tính chất liên hệ giữa thứ tự và phép cộng/phép nhân | Chưa có form authoring chuẩn; xem mẫu công cụ legacy phù hợp hoặc chờ ENG tiếp theo |
| M9-ALG-05 | Bất phương trình bậc nhất một ẩn | Chưa có form authoring chuẩn; có pilot legacy |
| M9-ALG-06 | Căn bậc hai và căn thức bậc hai | Chưa có form authoring chuẩn; xem mẫu công cụ legacy phù hợp hoặc chờ ENG tiếp theo |
| M9-ALG-07 | Khai căn bậc hai với phép nhân và phép chia (Hằng đẳng thức √A² = |A|) | Chưa có form authoring chuẩn; xem mẫu công cụ legacy phù hợp hoặc chờ ENG tiếp theo |
| M9-ALG-08 | Căn bậc ba | Chưa có form authoring chuẩn; xem mẫu công cụ legacy phù hợp hoặc chờ ENG tiếp theo |
| M9-ALG-09 | Hàm số y = ax² (a ≠ 0) và đồ thị Parabol | `math9-line-parabola`; `math9-parabola-coefficient` |
| M9-ALG-10 | Phương trình bậc hai một ẩn và Công thức nghiệm (Biệt thức Δ) | `math9-algebra-quadratic-equation` |
| M9-ALG-11 | Định lí Viète và ứng dụng nhẩm nghiệm | `math9-algebra-viete` |
| M9-GEO-01 | Tỉ số lượng giác của góc nhọn (sin, cos, tan, cot) | `math9-geometry-01` |
| M9-GEO-02 | Giá trị lượng giác của các góc đặc biệt (30°, 45°, 60°) và hai góc phụ nhau | `math9-geometry-02` |
| M9-GEO-03 | Một số hệ thức về cạnh và góc trong tam giác vuông | `math9-geometry-03` |
| M9-GEO-04 | Mở đầu về đường tròn & Tính đối xứng của đường tròn | `math9-geometry-04` |
| M9-GEO-05 | Vị trí tương đối của đường thẳng và đường tròn (Tiếp tuyến) | `math9-geometry-05` |
| M9-GEO-06 | Vị trí tương đối của hai đường tròn | `math9-geometry-06` |
| M9-GEO-07 | Góc ở tâm, Góc nội tiếp & Số đo cung | `math9-geometry-07` |
| M9-GEO-08 | Độ dài cung tròn, Diện tích hình quạt tròn và hình vành khuyên | `math9-geometry-08` |
| M9-GEO-09 | Đường tròn ngoại tiếp và nội tiếp tam giác | `math9-geometry-09` |
| M9-GEO-10 | Tứ giác nội tiếp & Đa giác đều | `math9-geometry-10` |
| M9-GEO-11 | Hình trụ, Hình nón và Hình cầu | `math9-cylinder-recognition`; chỉ nhận diện hình trụ, nón/cầu còn legacy |
| M9-STP-01 | Bảng tần số, tần số tương đối & Biểu đồ tần số tương đối ghép nhóm | Chưa có form authoring chuẩn; xem mẫu công cụ legacy phù hợp hoặc chờ ENG tiếp theo |
| M9-STP-02 | Phép thử ngẫu nhiên, Không gian mẫu và Xác suất của biến cố | Chưa có form authoring chuẩn; có pilot legacy |

Lưu ý GEO-01…03: tên chuyên đề trong danh mục rộng hơn mục tiêu từng compiler hiện tại. Dùng đúng nhiệm vụ ghi ở phần 4; chưa có cot hoặc bộ giải mọi cấu hình một cạnh+một góc. ALG-04/05 chờ engine trục số đầy đủ; ALG-06/07/08 chờ căn thức; STP-01/02 chờ engine dữ liệu/xác suất đầy đủ. Không thể tạo các mode đó chỉ bằng đổi mã canonical trên một JSON đề khác.

## 8. Lỗi thường gặp và cách xử lý

| Hiện tượng | Cách xử lý |
|---|---|
| Nút xuất bản bị khóa | Sửa dữ kiện/schema, áp dụng hoặc bỏ JSON import còn chờ, đợi lưu xong; kiểm quyền admin. |
| Ba bộ dữ kiện phải khác nhau | Đổi parameters và hai variants thành ba bộ khác nhau; preview lại bước 5/6. |
| Template/version/mã curriculum không khớp | Tải JSON mẫu mới từ chính template đang chọn; không tự đổi mã sang chủ đề khác. |
| Nghiệm không nằm trên lưới | Với graph chọn snap=0 hoặc đổi hệ số tạo nghiệm khớp lưới. |
| Tam giác không dựng được | Kiểm tổng hai cạnh lớn hơn cạnh thứ ba; tránh gần suy biến; mỗi độ dài đúng giới hạn. |
| a=0 không hợp lệ | Bậc hai chọn allow_linear nếu muốn hạ bậc; parabol/Viète bắt buộc a khác 0. |
| Mẫu bằng 0 / nghiệm bị loại | Xem cả hai nhân tử mẫu ban đầu; không nhập giá trị cấm làm nghiệm, kể cả đã rút gọn. |
| Bản nháp đã thay đổi ở nơi khác | Tải lại bài để lấy revision mới; giữ bản JSON export nếu muốn chép lại thay đổi. |
| Không lưu được authoring / lỗi mạng | Kiểm đăng nhập và mạng; dùng backend đã triển khai authoring cùng schema/runtime mới. Không tự sửa sang full manifest để bỏ kiểm tra. |
| App không thấy bài | Kiểm đã publish thành công, cùng Supabase project/tài khoản/quyền; tải lại catalog, dùng APK đã cập nhật. |
| Hình/bộ chọn không đổi dù đã sửa chữ | Mẫu legacy có thể giữ geometry/answer cũ; chuyển sang template dữ kiện tương ứng. |
| Bước tự kiểm tra chưa đạt | Cần thao tác, đúng đối tượng, đủ nghiệm và xác nhận; chỉnh đáp án/miền có thể xóa xác nhận cũ. |

## 9. Dùng gói bàn giao trên máy khác

Đọc [README_DONG_GOI.md](README_DONG_GOI.md) trước. Gói ZIP chứa source hiện tại kể cả thay đổi chưa commit, contracts, migrations, tài liệu và QA; không phải bản sao dữ liệu Supabase, không có mật khẩu/tài khoản/khóa bí mật hoặc APK build.

Thử admin local không cần tài khoản Supabase:

```powershell
cd learning-platform
npm ci
npm run dev:local
```

Mở `http://127.0.0.1:5180/admin/engines`. Bản local bắt đầu rỗng; bài xuất bản tại đây chỉ nằm workspace phát triển, không tự lên app dùng Supabase.

Tài liệu nguồn chi tiết: [graph](docs/architecture/cartesian-engine.md), [geometry](docs/architecture/geometry-engine.md), [algebra](docs/architecture/algebra-engine.md), [authoring](docs/architecture/authoring-contract.md). Các bằng chứng kiểm thử hiện tại nằm trong docs/qa/eng01-20261114, eng02-20261114 và eng03-20261114. Hosted authenticated round-trip, finger gestures toàn bộ và thẩm định sư phạm vẫn là các cổng nghiệm thu riêng.
