# Kế hoạch ưu tiên triển khai 6 core engine

**Quyết định ưu tiên của người dùng: 14/11/2026.** Tài liệu này thay thứ tự mở rộng cũ trong PROJECT_CHECKPOINTS.md. Mục tiêu gần nhất là xây bộ engine dùng lại được để có năng lực phục vụ toàn bộ 24 dạng Toán 9, sau đó mới hoàn thiện ngân hàng template/bài học. Đây là kế hoạch, không phải tuyên bố đã có đủ engine.

## 1. Thứ tự thực thi mới

**ENG-00 nền tảng → ENG-01 tọa độ → ENG-02 hình học → ENG-03 đại số → ENG-04 diện tích/căn/khối → ENG-05 trục số → ENG-06 dữ liệu/xác suất → ENG-07 tích hợp → CP-07/CP-08 mở rộng template/nội dung.**

Tận dụng parabol, hình trụ, TS/Dart evaluators, Studio và persistence CP-03…06 hiện có; không viết lại ứng dụng hoặc dashboard. CP-02 tiếp tục là cổng nghiệm thu Android, không bắt phải đóng mọi ca hosted mới được viết engine. Lỗi runtime/publish đang chặn sử dụng vẫn phải sửa ngay; tạm hoãn đánh bóng form/nội dung ngoài những gì cần để sử dụng engine.

Mỗi engine đi qua: **mô hình toán + schema → evaluator/event → renderer web + Flutter → cấu hình tối thiểu trong CMS → bài chứng minh bằng dữ kiện**. Không chờ xây xong cả sáu mới nối mobile hoặc mới phát hiện thiếu contract. Một engine cần nhiều mode; không ép một flow nhiệm vụ duy nhất cho mọi dạng.

## 2. Định nghĩa đầu ra

- Sáu ID canonical phải có registry/dispatcher/capabilities thực, không chỉ là nhãn curriculum. Có thể dùng nhiều renderer/adapter bên dưới: SVG, Flutter CustomPainter, WebView Three.js. Không bắt mọi engine chạy cùng công nghệ và không tạo core engine thứ bảy cho helper 3D.
- Tách **engine config** tin cậy do compiler tạo khỏi **authoring input** admin nhập. Engine mô tả khả năng dựng/tính/thao tác; template quy định flow sáu bước, mục tiêu, dữ kiện/variants và content slots.
- Tiếp tục giữ ba tầng CP-03. `shapes`, constraints, point IDs, token slots và targets là output/config có schema rõ; admin thường nhập dữ kiện toán qua form. `golden_points`, đáp án, giá trị cấm, Δ, nghiệm, tiêu chí và tọa độ hit phải được suy ra khi có thể.
- Ràng buộc/biểu thức dùng AST whitelist; không eval/JS/LaTeX thực thi từ JSON. LaTeX chỉ là trình bày, không làm nguồn toán duy nhất.
- Một lesson giữ scene/session/ID; thao tác tạo event, evaluator có thẩm quyền tính kết quả. Animation không được tự quyết định hoàn thành.
- Hỗ trợ toàn bộ 24 dạng cần đủ **mode/capability cho từng mã**. Có sáu shell rỗng hoặc một demo/engine chưa đủ.
- Giai đoạn engine chỉ cần một màn cấu hình/fixture chuẩn và các bài chứng minh trong Studio hiện có; chưa yêu cầu biên soạn toàn ngân hàng bài học cuối cùng.

## 3. Backlog có thể thực thi

### ENG-00 — Contract và registry năng lực chung

- [x] PASS nền tảng — P0 — 14/11/2026. Sáu registry entry, coverage 24 mã, schema/gate hai adapter hiện có, interface/version/rollout decision; 12 TS + 10 Dart tests và hai integration cases trên Redmi Note 9S PASS. [Quyết định](docs/architecture/core-engine-contract.md), [evidence](docs/qa/eng00-20261114/README.md). Các planned engine mode thuộc ENG-01…06 chưa triển khai.
- Kiểm kê renderer/evaluator có thể tái sử dụng, ánh xạ từng capability hiện có sang sáu ID canonical. Tách rõ legacy adapter và phần còn thiếu.
- Chốt model engine config phân biệt theo engine/mode; object ID, units, viewport, constraints, layers, allowed events, metrics, save/restore và lỗi dữ kiện.
- Tạo registry chung: engineId/version, supportedModes/capabilities, schema, validator, web/mobile adapter và min runtime. Tạo capability coverage manifest cho 24 mã; mỗi mode phải có implementation hoặc trạng thái thiếu rõ ràng.
- Chốt schema/runtime version mới nếu extension vượt semantics của runtime 1.0.0; không gắn sáu giá trị mới vào field enum rồi bỏ dispatcher/evaluator cũ. Published/progress cũ tiếp tục dùng adapter/version hiện có.
- Chốt interface module và vị trí phù hợp với repo hiện tại; không tạo dự án song song. Chuẩn bị vectors dùng chung TS/Dart, contract SQL/Edge và quy trình regenerate.
- **Đầu ra:** quyết định contract, registry có sáu entry, bảng mode/capability 24 mã, kế hoạch rollout tương thích. Entry chưa triển khai không được chọn để publish.

### ENG-01 — cartesian_graph_engine

- [x] PASS implementation — P0 — 14/11/2026. Registry bốn mode, ba template mới và parabol CP-05; TS/Dart/math/SQL/Studio/renderers/Edge đồng bộ. 208 TS/SQL, 94 Flutter, 9 browser và chín input trên Redmi PASS. [Phạm vi](docs/architecture/cartesian-engine.md), [evidence và cổng nghiệm thu còn mở](docs/qa/eng01-20261114/README.md). Hosted authenticated round-trip/native gestures/old-client negotiation chưa nghiệm thu phát hành.
- Tái sử dụng parabol CP-05 và coordinate/linear graph hiện có. Xây model phương trình `ax + by = c` (gồm đường thẳng đứng/ngang); cấm a=b=0 trong mode đường thẳng.
- Mode: kiểm điểm nghiệm phương trình hai ẩn; hệ hai đường thẳng; parabol y=ax²; đường thẳng–parabol là mode mở rộng cùng engine, không gán lại mã canonical.
- Tính giao điểm/điểm nghiệm, trạng thái duy nhất/song song/trùng nhau; đường thẳng–parabol có 0/1/2 giao điểm. Sinh điểm đẹp có kiểm soát khi mode yêu cầu, không tin tọa độ đáp án độc lập do admin nhập.
- Viewport tự fit cả đồ thị/điểm mục tiêu, clipping; kéo điểm/ghim, snap grid cấu hình được, drag hệ số/slider và hit theo đối tượng.
- **Đầu ra:** ba mã ALG-01/02/09 có mode chạy theo dữ kiện; mode tương giao đường thẳng–parabol được ghi riêng về phạm vi. Đổi hệ số làm hình, giao điểm và chấm thay đổi đúng; parity TS/Dart.

### ENG-02 — geometry_2d_canvas

- [x] PASS implementation — P0 — 14/11/2026. Tám mode/schema, mười template GEO-01…10, dependency graph/constraints/layers, TS/Dart evaluator và Studio/SQL/Edge đã nối. 290 TS/SQL, 170 Flutter, 33 browser cases PASS; Android scope và release gates ghi tại [evidence](docs/qa/eng02-20261114/README.md). [Quyết định/phạm vi G1/G2/G3](docs/architecture/geometry-engine.md). Không quảng bá solver ràng buộc tổng quát.
- Chia implementation thành ba phần, mỗi phần có model/schema và trạng thái riêng:
  - **G1 tam giác:** dựng từ dữ kiện đủ xác định, ràng buộc vuông/độ dài/góc, kéo đỉnh hợp lệ, cạnh đối/kề/huyền theo góc xét, lượng giác và góc đặc biệt (GEO-01/02/03).
  - **G2 đường tròn:** tâm/r/bán kính/đối xứng, hai đường tròn, đường thẳng–tròn, giao/tiếp xúc, điểm tiếp tuyến động (GEO-04/05/06).
  - **G3 góc và cấu hình:** góc ở tâm/nội tiếp, cung/quạt/vành khuyên, nội/ngoại tiếp tam giác, tứ giác nội tiếp và đa giác đều (GEO-07/08/09/10).
- Dựng đối tượng phụ thuộc theo graph toán; constraints khóa tự do hợp lệ. Layers có semantic ID cho trung trực/phân giác/tiếp tuyến; bật layer không làm mất scene state.
- Guard: bất đẳng thức tam giác, hình suy biến, độ dài dương, xung đột constraints, nghiệm dựng mơ hồ, góc không phù hợp và viewport. Báo cách sửa, không vẽ hình đẹp nhưng sai dữ kiện.
- **Đầu ra:** đủ capability cho 10 mã GEO-01…10; chạm cạnh/cung/điểm đúng sau kéo/scale; không dùng hotspot tọa độ cố định hoặc ảnh SVG thay cho dựng toán động.

### ENG-03 — balance_scale_engine

- [x] PASS implementation — P0 — 14/11/2026. Bốn mode tích/hữu tỉ/bậc hai/Viète, AST whitelist, miền gốc/loại nghiệm ngoại lai, phép biến đổi có điều kiện, signed cards/semantic slots và plot ENG-01; ALG-03/10/11 giữ mã. 354 TS/SQL, 227 Flutter, 22 browser cases và 18 bài × sáu bước trên Redmi PASS. [Phạm vi](docs/architecture/algebra-engine.md), [evidence/release gates](docs/qa/eng03-20261114/README.md). Không quảng bá CAS hoặc số âm như khối lượng âm.
- Model biểu thức/phương trình có cấu trúc; thẻ số/biến/nhân tử và slots semantic. Tái sử dụng cân tuyến tính, coefficient/formula tools; không coi chúng đã giải đủ ALG-03/10/11.
- Mode tách riêng: phương trình tích; phương trình hữu tỉ và điều kiện mẫu; hệ số bậc hai/Δ/số nghiệm; ghép tổng–tích Viète.
- Tính domain/forbidden values từ mẫu, nghiệm từ biểu thức; loại nghiệm ngoại lai, kiểm phép biến đổi tương đương và điều kiện áp dụng. Giới hạn miền biểu thức hữu tỉ được hỗ trợ bằng schema whitelist, không hứa CAS tổng quát.
- Phân biệt a=0 làm phương trình hạ bậc với template yêu cầu bậc hai; mode phải xử lý có chủ đích hoặc từ chối. Kiểm Δ âm/0/dương và cặp nghiệm kép.
- **Đầu ra:** ba mã ALG-03/10/11 đủ thao tác đại số theo dữ kiện; giá trị cấm và đáp án không nhập rời. Không biểu diễn số âm như khối lượng vật lý âm.

### ENG-04 — area_fraction_grid

- [ ] TODO — P0 — phụ thuộc ENG-00; kết hợp domain/sign của ENG-05 qua adapter khi cần.
- **A1 lưới/căn:** hình vuông/diện tích, căn bậc hai số học, căn tích/thương, √A²=|A|; ghép/tách vùng đồng bộ số đo. Ràng buộc căn thực, mẫu khác 0 và điều kiện dùng các phép khai căn.
- **A2 lập phương:** thay cạnh/số khối để minh họa căn bậc ba; số âm thể hiện bằng dấu đại số, không mesh có cạnh hoặc thể tích âm.
- **A3 khối:** tiếp nối cylinder CP-04, param hóa nón/cầu; phần/đoạn đo/mesh/camera/hit và đơn vị. Tách recognition/surface-area/volume thành mode rõ ràng; l của nón tính từ r/h.
- **A4 trải phẳng:** trụ có hình chữ nhật kích thước 2πr × h và hai đáy; nón có quạt bán kính l, cung 2πr và góc 2πr/l. Chuyển trạng thái trải liên tục, nhãn/chấm đúng mô hình. Không mô tả cầu có net phẳng chính xác.
- **Đầu ra:** đủ capability ALG-06/07/08 và GEO-11, mỗi mode thực sự được hỗ trợ được khai báo riêng. Không tính recognition khối thành đã có surface-area/volume/net.

### ENG-05 — number_line_engine

- [ ] TODO — P0 — phụ thuộc ENG-00; hoàn thiện trước khi đóng các mode domain/sign của ENG-03/04.
- Tái sử dụng endpoint/ray/open/closed; model khoảng/tập hợp với mốc, hướng, điểm thử và phép biến đổi.
- Xây animation cộng/tịnh tiến, nhân/chia số âm đảo thứ tự bằng reflection theo mô hình; số 0, đầu mút và miền nghiệm giữ ý nghĩa đúng. Phép nhân/chia 0 không được xử lý như phép tương đương thông thường.
- Giải ax+b so sánh 0 theo dấu a; lựa chọn mở/kín và tia được suy ra. Adapter miền căn và dấu/giá trị căn bậc ba cho ALG-06/08; không đổi curriculum ownership.
- **Đầu ra:** ALG-04/05 đủ interaction theo dữ kiện; chọn sai mốc/dấu/đầu mút/hướng không đạt; animation không tự pass. Domain/sign adapters có schema và event rõ.

### ENG-06 — data_probability_sim

- [ ] TODO — P0 — phụ thuộc ENG-00; dùng phần/fraction helpers từ ENG-04 khi phù hợp.
- **D1 thống kê:** bảng nhóm, N, tần số nguyên không âm, tổng=N>0, tần số tương đối suy ra. Kéo cột cập nhật bảng/quạt; góc quạt=360×n/N; quy tắc giữ N hay điều chỉnh N phải explicit theo mode.
- **D2 xác suất:** dice/coin/number-card presets và kết quả semantic; model không gian mẫu hữu hạn, phép thử/biến cố dạng AST whitelist; chọn phần tử thuận lợi để đếm P(A).
- Chỉ dùng n(A)/n(Ω) khi đồng khả năng; weighted mode phải có weights/tổng hợp lệ và chấm theo tổng xác suất. Phân biệt mô phỏng thực nghiệm với đáp án xác suất lý thuyết, có seed để tái lập/reset.
- Hiển thị rõ nhóm trùng tần số, phần trăm làm tròn và đơn vị; không chấm bằng đo pixel chiều cao cột hoặc góc người học nhìn thấy.
- **Đầu ra:** STP-01/02 đủ bảng/cột/quạt/thử/chọn sample theo dữ kiện; chặn N=0, tần số âm/lẻ/tổng sai, sample ID trùng và event không hợp lệ bằng lỗi dễ sửa.

### ENG-07 — Nối sáu engine vào CMS/Flutter/Edge và chốt khả năng bao phủ

- [ ] TODO — P0 — phụ thuộc sáu engine; phần tích hợp được làm tăng dần sau mỗi ENG, không đợi cuối mới bắt đầu.
- Dispatcher Flutter và web nhận sáu ID/version, kiểm capabilities/mode trước tải bài; backend/compiler từ chối mode chưa có mobile renderer. Fallback tương đương được khai báo rõ, không đổi sang MCQ ngầm.
- Tích hợp metadata/schema config tối thiểu trong Studio hiện có, tận dụng import/diff/preview/persistence CP-06. Các task demo dùng template sáu bước cố định; engine không cho AI tự viết evaluator hoặc checkpoint code.
- Đồng bộ shared fixtures, TS/Dart/SQL/Edge validators, bundle mobile và snapshot restore. Rollout schema/runtime mới có version negotiation; không ghi đè published/progress legacy.
- **Đầu ra:** coverage manifest 24/24 có engine/mode/capabilities được triển khai; demo dữ kiện dùng lại được cho từng mode; known gaps và trạng thái nghiệm thu riêng. Sau đó mới ưu tiên ngân hàng CP-07/08.

## 4. Ma trận bao phủ bắt buộc

Một hàng canonical có thể cần nhiều mode/template; tổng 24 hàng không đồng nghĩa chỉ có 24 bài hoặc 24 mode.

| Engine chủ quản | Mã canonical | Năng lực cần có trước khi đánh dấu bao phủ |
|---|---|---|
| cartesian_graph_engine | ALG-01 | Phương trình hai ẩn và kiểm điểm nghiệm |
| cartesian_graph_engine | ALG-02 | Hai đường thẳng, nghiệm hệ, song song/trùng nhau |
| cartesian_graph_engine | ALG-09 | Parabol y=ax², hệ số/điểm/đồ thị |
| balance_scale_engine | ALG-03 | Tích và hữu tỉ/điều kiện mẫu, loại nghiệm ngoại lai |
| balance_scale_engine | ALG-10 | Bậc hai, hệ số, Δ và nghiệm |
| balance_scale_engine | ALG-11 | Viète tổng–tích, cặp nghiệm |
| area_fraction_grid | ALG-06 | Căn bậc hai/căn thức; phối hợp domain adapter |
| area_fraction_grid | ALG-07 | Căn tích/thương và √A²=|A| |
| area_fraction_grid | ALG-08 | Lập phương/căn bậc ba; phối hợp dấu/trục số |
| area_fraction_grid | GEO-11 | Trụ/nón/cầu; nhận diện, diện tích, thể tích; net trụ/nón |
| number_line_engine | ALG-04 | Thứ tự, cộng/nhân, reflection khi nhân âm |
| number_line_engine | ALG-05 | Bất phương trình, mốc/tia/đầu mút |
| geometry_2d_canvas | GEO-01 | Cạnh đối/kề/huyền, sin/cos/tan/cot |
| geometry_2d_canvas | GEO-02 | Góc 30/45/60 và góc phụ nhau |
| geometry_2d_canvas | GEO-03 | Dựng tam giác vuông, quan hệ cạnh/góc |
| geometry_2d_canvas | GEO-04 | Đường tròn, tâm/bán kính/đối xứng |
| geometry_2d_canvas | GEO-05 | Đường thẳng–tròn và tiếp tuyến |
| geometry_2d_canvas | GEO-06 | Hai đường tròn, giao/tiếp xúc/vị trí |
| geometry_2d_canvas | GEO-07 | Góc ở tâm/nội tiếp/cung |
| geometry_2d_canvas | GEO-08 | Độ dài cung, quạt và vành khuyên |
| geometry_2d_canvas | GEO-09 | Nội/ngoại tiếp tam giác |
| geometry_2d_canvas | GEO-10 | Tứ giác nội tiếp và đa giác đều |
| data_probability_sim | STP-01 | Bảng/tần số/tỉ lệ, cột và quạt liên kết |
| data_probability_sim | STP-02 | Sample space, event, đếm xác suất, simulation |

Giữ nguyên phân bổ 10 + 3 + 3 + 4 + 2 + 2 trong curriculum hiện tại. Tương giao đường thẳng–parabol là capability/mode bổ sung, không tạo mã canonical mới hoặc tự đổi ALG-01/02/09. Các capability cross-engine phải khai rõ ownership/adapter thay vì đếm thêm một dạng để đủ số.

## 5. Tiêu chí đóng mỗi engine

- Schema có version, dữ kiện sai và suy biến được xử lý có chủ đích; không có independent answer/hotspot pixel do author nhập.
- Mỗi mode có ít nhất ba bộ config: thông thường, biên và dữ kiện khác rõ hình/mục tiêu; có vector đúng/sai và bất khả thi. Có model/evaluator và renderer thực tế trên web/Flutter, không chỉ screenshot hoặc đổi nhãn.
- Interaction thật và đường hoàn thành được mô tả; scene/ID/snapshot liên tục, reset/restore đúng version. Viewport/hit vùng chạm bám hình sau thay dữ kiện.
- Đường adapter → compiler/template sáu bước → preview → published manifest → mobile/Edge có tích hợp tối thiểu. Không yêu cầu biên soạn đủ ngân hàng trước khi đóng phần code engine.
- Tách **IMPLEMENTED / BUILD PASS / ACCEPTANCE PENDING / ACCEPTED**. Theo yêu cầu hiện hành, agent không tự chạy full tests; chuẩn bị fixture/scenario và hướng dẫn để người dùng tự nghiệm thu, ghi NOT RUN cho phần chưa có bằng chứng. Không đánh dấu engine ACCEPTED chỉ từ build.

## 6. Thay đổi ưu tiên các CP hiện hữu

- CP-01/03: giữ kết quả đã có, dùng làm nền.
- CP-02: tiếp tục sửa blocker Android và ghi nhận user acceptance; chạy song hành ở mức quy trình, không tự spawn agent hay chạy test khi chưa được yêu cầu.
- CP-04/05/06: giữ implementation và trạng thái chờ nghiệm thu, chỉ sửa bug/integration cần cho engine mới. Không mở rộng bài lẻ trước khi model/capabilities dùng chung tương ứng đã có.
- CP-07: chuyển **sau ENG-07**, chuẩn hóa 15 mẫu/legacy trên engine đã hoàn thiện.
- CP-08: chuyển **sau ENG-07**, dùng ma trận 24 mã để biên soạn template/mode; không dùng việc có 24 tên để thay năng lực engine.
- CP-09: contract/bundle/backward compatibility thực hiện tăng dần trong ENG; nghiệm thu toàn hệ thống sau ENG-07 và các template release.
- CP-10: vẫn là cổng release, không được bỏ qua device/hosted/rollback.

**ENG-00 đã hoàn thành nền tảng; công việc tiếp theo là ENG-01.** Người dùng đã cho phép chạy test tự động trên điện thoại thật ngày 14/11/2026, thay chỉ dẫn tự test trước đó; tiếp tục phân biệt contract/bridge checks với nghiệm thu đủ gesture/hosted.
