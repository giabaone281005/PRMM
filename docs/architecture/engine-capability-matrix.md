# Engine và phạm vi đã triển khai

| Engine | Nội dung JSON | Web admin/preview | Flutter Android | Semantics |
|---|---|---|---|---|
| number_line_2d | number_line | SVG kéo chấm + tham số | Canvas/GestureDetector + Slider | khoảng cách đến targetX |
| fraction_bar_2d | fraction | kéo tô thanh, chia phần | Canvas/GestureDetector + Slider | tử/mẫu, sai số với tỉ lệ mục tiêu |
| algebra_balance_2d | linear_equation | cân nghiêng, chỉnh x | Canvas + Slider/numeric field | abs(a*x+b-c) |
| function_plot_2d | quadratic_graph | đồ thị mục tiêu và hiện tại | CustomPainter + tham số | độ lệch a/b/c |
| geometry_2d | triangle_angles | SVG kéo đỉnh + ghép mảnh góc | CustomPainter + hit-tested gestures | diện tích ≥500, đo góc, 3 mảnh/180° |
| geometry_3d_web | prism_volume | Three.js/WebGL/raycast | Three.js bundled trong WebView | xoay, chọn mặt, lớp và thể tích |

Chọn engine từ loại bài và registry capabilities. Người nhập không cung cấp executable JS. Manifest không hợp lệ hoặc vượt bounds bị từ chối.

Mỗi bài một scene; checkpoint thay hướng dẫn, targets và scenePatch. Native và TS dùng shared fixtures/math-scenarios. `math_explorer_2d` là adapter nội bộ chung; bốn engine toán có capability riêng và sử dụng chung thành phần vẽ.

Không khai báo hỗ trợ physics/Rive hoặc toàn bộ Toán 6–9 khi chưa có renderer/asset/test. Không fallback sang MCQ. Trường hợp thiếu WebGL hiển thị lỗi thiết bị rõ ràng; chưa có phương án 2D tương đương cho toàn bộ spatial lesson.
