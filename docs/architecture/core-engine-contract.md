# ENG-00 — Quyết định contract và registry sáu core engine

Ngày 14/11/2026. Phạm vi ENG-00 là nền tảng contract, inventory và capability gating; không tuyên bố sáu engine đã triển khai đủ. Nguồn registry/schema/coverage nằm tại `learning-platform/contracts/core-engines/`; interface TS tại `packages/lesson-contract/core-engines.ts`, bridge authoring tại `packages/lesson-authoring/core-routing.ts`, adapter resolver Dart tại `apps/mobile/lib/core_engines.dart`.

## Version và tương thích

- **Giữ Lesson runtime 1.0.0 nguyên enum engine hiện tại.** Không đưa sáu ID canonical vào enum rồi gọi renderer legacy bằng phỏng đoán.
- Core config contract **1.0.0** là descriptor tách ngoài manifest hiện tại. Nó định danh canonical engine/mode/version, curriculum, scene, unit/model và viewport policy; không phải Lesson mới, không chứa checkpoint hoặc evaluator code.
- Hai mode có implementation CP-04/05 được ánh xạ rõ tới template/compiler/renderer/evaluator v1. `compileProblem` gọi core gate trước khi compile/lưu/publish; template không khớp adapter bị chặn. Web/local API và Edge dùng cùng hàm này. Những bài legacy đi qua đường cũ, không ép chúng phải có core config.
- **Lesson/runtime 2.0.0 được dành cho canonical scene protocol tổng quát**: object graph, typed constraints/layers/events/metrics/snapshot. Chưa có v2 schema/dispatcher để publish. Registry ghi minRuntimeVersion 2.0.0 cho planned modes và từ chối resolve; đây là mục tiêu thiết kế, không quảng bá app đã hỗ trợ v2.
- Registry chỉ nhận engineVersion 1.0.0 hiện tại. Thay semantic/contract làm đổi published meaning phải tăng engine/template version và giữ implementation cũ; compilerVersion riêng không thay quyền này.
- Snapshot hiện có dùng toàn manifest identity và lesson/version; không chuyển progress legacy sang descriptor/v2. Không thay database/runtime remote trong ENG-00.

## Mô hình config và module boundary

`core-engine-config.schema.json` dùng discriminator engineId/mode với hai nhánh đầy đủ `additionalProperties:false`. Cylinder model r/h/unit; parabola model a. Đối tượng/ID và thao tác của từng adapter được code xác định, không author-supplied pixel hotspots. Có semantic validator riêng cho h/r. Kiểu `CoreConfig` là discriminated union tương ứng, unknown fields/version/mode/curriculum bị từ chối.

Planned modes không có `parameters:any` hoặc schema permissive giả làm hỗ trợ. Chúng có entry registry, capabilities yêu cầu, legacy reuse candidates và missing rõ ràng. ENG-01…06 phải bổ sung schema/mode implementation thực tế trước khi bật publish. Schema chỉ có hai nhánh executable hiện tại là quyết định cố ý, không phải coverage thiếu được che giấu.

V2 module contract được chốt tại `CanonicalEngineModule<Model,State,Event,Metrics>`: validateModel → createState → applyEvent → measure → restore. Web và mobile adapter chỉ nhận model/state và phát allowed events; evaluator không tin renderer báo “completed”. Identity restore gồm lessonId/version/sceneId/configHash. Triển khai hash/typed snapshot v2 thuộc ENG tiếp theo; interface không làm nó tự khả dụng.

Các quy tắc chung cho v2:

| Thành phần | Contract đã chốt |
|---|---|
| Object ID | Semantic stable ID trong scene; tham chiếu được kiểm tồn tại/kind, không dùng index hoặc tọa độ làm identity |
| Units | Model mathematical units và conversion explicit; cylinder hiện cm/m, graph unitless; pixel chỉ ở renderer projection |
| Viewport | Model bounds + deterministic fit/clipping, logical size và world-to-screen chung cho hình/hit/labels; v1 adapter giữ 360×360 |
| Constraints | Typed whitelist, phụ thuộc object graph; validate conflict/degeneracy trước dựng; chưa có solver tổng quát trong ENG-00 |
| Layers | Typed semantic IDs và visibility state, không SVG/script tùy ý; hai adapter hiện không nhận layer tùy chỉnh |
| Events | Tagged union theo mode, allowlist/range/step; metric và derived state chỉ evaluator ghi. Hai adapter dùng event adjust_parameter hiện hữu với names cụ thể trong registry |
| Metrics | Mode declares numeric/boolean measurements, checkpoint AST whitelist tham chiếu; v1 chỉ dùng modelError và parameterChangeCountSinceCheckpoint |
| State | Tách input immutable, learner state, derived metrics; reset/advance không remount scene; restores kiểm identity/version trước dùng |
| Errors | `{path,code,message}`; schema lỗi → trả path; mathematical invalid → cách sửa; unavailable mode/version → reject trước publish |

## Inventory tái sử dụng: không nhầm công cụ legacy với mode canonical hoàn chỉnh

| Canonical owner | Renderer/evaluator hiện có có thể tái sử dụng | Mode còn thiếu |
|---|---|---|
| geometry_2d_canvas | Scene2D/NativeScene: triangle drag/angle measurement/token; pythagorean_2d; TRIANGLE_HOTSPOT_TAP, GEOMETRIC_HOTSPOT_FINDER, ANGLE_MEASURE_TAP qua UimeScene/WebView | Triangle constraints/lượng giác đầy đủ; circle intersections/tangents; layers/nội–ngoại tiếp; cung/quạt/vành/đa giác |
| cartesian_graph_engine | coordinate_2d, linear_plot_2d, function_plot_2d và CustomPainter; TOKEN_CLASSIFIER/PARABOLA_SLIDER legacy; **ParabolaScene + parabola.ts/Dart + compiler CP-05 có explicit adapter** | Linear relation tổng quát, hệ hai đường, vertical/parallel/coincident, intersection pin, line–parabola |
| balance_scale_engine | algebra_balance_2d/NativeMathScene; TAP_COEFFICIENT, FORMULA_SNAP_BUILDER, DELTA_STATE_TOGGLE và uime TS/Dart | Factor/rational AST/domain guard, equivalent transformations, quadratic/viete data-driven full modes |
| area_fraction_grid | fraction_bar_2d, area_2d, percentage_2d helpers; geometry_3d_web/Scene3D/Three.js prism, legacy solid inspector; **CylinderScene + cylinder.ts/Dart + compiler CP-04 có explicit adapter** | Root/domain/absolute value, signed cube roots, cone/sphere parametric measurement, surface/volume, cylinder/cone nets |
| number_line_engine | number_line_2d, NUMBER_LINE_SELECTOR, INEQUALITY_SIGN_SWITCH; native controls và uime evaluator | General inequality solver, reflection/transformation animations, domain/sign adapters |
| data_probability_sim | CHART_BAR_TAP, EVENT_CARD_BUCKET; typed bucket/bar state và TS/Dart replay | Linked table/bar/pie, finite sample selection/event AST, presets/seeded simulation/weighted mode |

Legacy `percentage_2d`, `ratio_2d`, `rectangle_area`, `pythagorean`, `linear_graph` là helper/model reusable, không tạo curriculum owner mới. Geometry3D helper không thành core engine thứ bảy.

Registry ghi `legacyAdapters` chỉ để inventory, **không** cho phép publish mode planned. Hai adapter implemented vẫn ghi acceptance pending tại UI. Các mẫu legacy cũ vẫn tạo/chạy theo chính sách tương thích cũ và được phân biệt với registry canonical.

## Coverage 24 mã

Machine source: `coverage.json`; bảng xem tại `contracts/core-engines/COVERAGE.md`. Toàn bộ 24 mã giữ owner từ `math9-curriculum.json`, mỗi mã có requiredModes/missingModes. Chỉ ALG-09 có một adapter hiện hữu đáp ứng mode hẹp đã khai báo; trạng thái vẫn `partial` vì chưa nghiệm thu tổng thể. GEO-11 partial: chỉ cylinder recognition, thiếu measurement/net. Các mã khác `missing` canonical completion dù có helper legacy. Line–parabola là extra mode, không gán lại hoặc tạo mã curriculum để đổi tổng 24.

## Schema, dữ liệu dùng chung và regenerate

- `npm run core:generate`: copy registry/schema/coverage/vectors vào mobile contract assets, sinh bảng COVERAGE.md và draft SQL schema function ở `supabase/generated/core-engine-contract.sql` (ignored). Không chạy DB, không publish/reseed fixtures.
- `npm run bundle:mobile`: gọi generator này rồi bundle runtime/copy Lesson schema như trước. Contract assets nằm dưới assets/contracts đã khai báo trong pubspec; v2 loader chưa được quảng bá có sẵn.
- TS validator dùng Ajv + math checks; Dart resolver dùng cùng JSON schema/registry và validator vocabulary hiện có. Schema oneOf chứa **các nhánh object đầy đủ**, tránh lệch semantics bởi Dart legacy validator return sớm ở oneOf.
- Shared `validation-vectors.json`: valid adapters và invalid zero/range/aspect/field/curriculum/version/planned mode. Tests TS/Dart đọc cùng vectors.
- Edge authoring compile gate bundled từ cùng TS service khi chạy `bundle:edge`; không cần thêm gate field vào runtime manifest. Chưa deploy artifact mới trong ENG-00. SQL export mới là draft để tích hợp vào migration version mới khi thực sự lưu canonical descriptor/v2; chưa thêm RPC publish v2 vào remote.

## Rollout ENG-01 trở đi

1. Tạo schema typed và model/evaluator/renderer của mode; thêm module implementation theo boundary trên, state/event vectors TS/Dart và adapters cụ thể.
2. Khi cần v2, tạo schema/player support + version negotiation trước; giữ v1 reader/adapters và catalog compatibility. Không sửa lịch sử migrations đã apply.
3. Bổ sung SQL contract/Edge replay và template compiler output đúng runtime mục tiêu. Mode chưa có mobile implementation hoặc không đủ capabilities phải tiếp tục bị chặn.
4. Chỉ bật publishEnabled và supportedModes sau khi resolver thực sự có adapter/model/validator; ghi acceptance riêng. Sync app/backend versions trước khi publish bài mới; snapshots bind đúng version.
5. Device acceptance dùng điện thoại thật đã được người dùng cho phép test ngày 14/11; việc này thay chỉ dẫn “không chạy tests” trước đó. Không coi DOM-dispatched WebView integration tương đương mọi thao tác chạm/kéo vật lý.

## Cập nhật sau ENG-01/02 — 14/11/2026

Inventory/coverage phía trên là quyết định ENG-00 tại thời điểm chỉ có hai adapter. Hiện cartesian có bốn mode ([ENG-01](cartesian-engine.md)); geometry có tám mode, schema/dựng hình/constraints/layers và mười template cho GEO-01…10 ([ENG-02](geometry-engine.md)). Registry/coverage/generated table là nguồn trạng thái hiện hành; implemented_pending_acceptance không đồng nghĩa production acceptance. Các adapter mới vẫn nằm trên legacy Lesson transport, không tự kích hoạt canonical v2; updated learner build cần rollout trước khi publish bài mới.

ENG-03 bổ sung bốn adapter balance_scale_engine cho ALG-03/10/11: product/rational/quadratic/viete với AST/domain/transform/slot evaluator thực. Xem [algebra-engine.md](algebra-engine.md) để biết giới hạn hệ số, miền hữu tỉ, hạ bậc, nghiệm thực và version/rollout. Bài legacy không bị recompile hoặc migrate progress.
