# Bàn giao hiện trạng — CP-03 đến CP-06

Cập nhật: **14/11/2026, Asia/Saigon**. Tài liệu này để agent khác tiếp tục trên **chính working tree hiện tại**. Đây là bản bàn giao trạng thái, không phải xác nhận nghiệm thu toàn bộ sản phẩm.

## Cập nhật ENG-00 / quyền test mới — 14/11/2026

ENG-00 nền tảng đã hoàn thành; đọc docs/architecture/core-engine-contract.md và docs/qa/eng00-20261114/README.md. Registry sáu engine và coverage 24 mã có đủ trạng thái thiếu, hai adapter executable, planned modes bị chặn publish; tiếp tục ENG-01.

**Người dùng đã thay yêu cầu không test bằng cho phép chạy test tự động trên điện thoại Android thật.** Redmi Note 9S / Android 12 được ADB nhận; contract TS/Dart và hai Android integration cases PASS. Các đoạn “không chạy tests” phía dưới là lịch sử đã được thay thế. Không wipe/clear app data hoặc suy ra bridge DOM tests thành full physical gesture acceptance.

## Thay đổi ưu tiên sau bản bàn giao — 14/11/2026

Người dùng yêu cầu ưu tiên triển khai **6 core engine đủ khả năng bao phủ 24 dạng trước**, rồi mới mở rộng mẫu/bài. Đọc [CORE_ENGINE_IMPLEMENTATION_PLAN.md](CORE_ENGINE_IMPLEMENTATION_PLAN.md) cho ENG-00…ENG-07. Công việc tiếp theo là ENG-00 (contract/registry/capability mapping), sau đó ENG-01; CP-07/08 chuyển sau ENG-07. Các trạng thái code/deploy và yêu cầu tự test trong tài liệu này giữ nguyên. Những chỉ dẫn cũ về ưu tiên mở rộng template được thay bởi kế hoạch mới.

## 1. Đọc ngay trước khi làm tiếp

- Workspace: `D:/3.FPT/PRM/final project`.
- Repo ứng dụng: thư mục con `learning-platform/`; lệnh npm phải chạy tại đây, root không có package.json.
- Git branch: `first-version`.
- HEAD kiểm tra lúc bàn giao: `f2cee66d4488e79114a6756e879f4c9accb1d830`.
- **Toàn bộ công việc CP-01…CP-06 và lần sửa publish mới nhất chưa được commit.** Có nhiều file modified và untracked; untracked bao gồm code/schema/migration cần thiết, không phải toàn file tạm. Checkout riêng chỉ từ HEAD sẽ thiếu các phần mới.
- Không reset/clean/stash ghi đè working tree. Giữ `.idea/` và công việc có sẵn của người dùng. Không sửa `rea-main/`.
- Root không có `.codegraph/` tại lần kiểm tra trước triển khai. Theo AGENTS: chỉ dùng CodeGraph trước tìm/đọc code nếu repo đã có index; không tự index.
- **Người dùng đã yêu cầu bỏ qua phần test để tự test.** Tiếp tục tôn trọng: không tự chạy lại full TS/Dart/browser/Android suites. Build/bundle đã được dùng để biên dịch; kiểm tra endpoint/schema hẹp được dùng khi sửa lỗi publish. Không coi những việc này là nghiệm thu end-to-end.
- Người dùng đã ủy quyền chọn **Always allow USB debugging trên emulator**. Đã chọn checkbox trong dialog; emulator/ADB có lúc ngắt kết nối, chưa có xác nhận bền vững sau restart. Không khẳng định emulator hiện đang online hoặc APK hiện tại đã được cập nhật.

Tài liệu cần đọc:

1. `SPEC_TOAN9_CMS_ENGINE_FLOW6.md` — đặc tả chuẩn; 24 mã canonical, sáu vai trò học sinh.
2. `PROJECT_CHECKPOINTS.md` — backlog CP-01…CP-10.
3. `.agents/skills/lesson-platform/SKILL.md` và các tài liệu bắt buộc skill dẫn tới.
4. `docs/architecture/authoring-contract.md` — ba tầng và namespace.
5. `docs/architecture/parabola-slice.md` — phạm vi CP-05.
6. `docs/architecture/authoring-persistence.md` — form, trust boundary, sidecar, concurrency.
7. **`docs/qa/authoring-publish-fix-20261114/README.md`** — trạng thái rollout mới nhất, quan trọng hơn những ghi chú “chưa deploy” trong các báo cáo cũ.
8. `docs/qa/verification-report.md`, `task.md` — bằng chứng và lịch sử.

## 2. Trạng thái checkpoint thực tế

| CP | Hiện trạng | Giới hạn / còn thiếu |
|---|---|---|
| CP-01 | PASS baseline local, có evidence | Không thay bằng chứng Android/hosted |
| CP-02 | Có code sửa bridge/mobile và evidence từ công việc trước | Chưa kết luận hoàn thành Android hosted/ANR; xem thư mục evidence, không tự đổi checkbox |
| CP-03 | PASS contract/interface local | Authoring schema/registry riêng, không phải phủ đủ curriculum |
| CP-04 | Compiler/renderer hình trụ nhận diện đã triển khai | Chờ nghiệm thu người dùng, Android touch/hosted; chưa diện tích/thể tích/hình trải |
| CP-05 | Compiler/renderer parabol y = ax² đã triển khai | Tests chuẩn bị nhưng chưa chạy; chờ web/Android parity, không làm tam giác vuông |
| CP-06 | Form/AI JSON/sidecar/local API/Edge/RPC đã triển khai; backend đã rollout ngày 14/11 | Chưa có xác nhận click publish có session và round-trip learner/Android |
| CP-07 trở đi | Backlog | Chưa chuẩn hóa 15 mẫu cũ hoặc phủ 24 dạng theo chuẩn mới |

**Không đánh dấu CP-04/05/06 hoàn thành chỉ vì build/deploy thành công.** Backlog và một số báo cáo có dòng “chờ rollout” được viết trước lần sửa lỗi ngày 14/11; rollout đã xong nhưng acceptance vẫn mở.

## 3. Kiến trúc đã có

### Ba tầng và tương thích

`Template tin cậy có phiên bản → JSON đề authoring → Lesson manifest runtime`.

- JSON đề không nhận checkpoint kỹ thuật, code, hotspot pixel hoặc đáp án nhập độc lập. Root/parameters/variants/content đều khóa field theo schema.
- Namespace chuẩn: `excel-repo-v1`. Mã đầy đủ `M9-…`; không đoán alias từ số thứ tự. `markdown-supplement-v1` và `STA-*` không được tự chuyển thành mã chuẩn trong importer.
- Hai template hiện có:
  - `math9-cylinder-recognition@1` → `M9-GEO-11`, mode `recognition`.
  - `math9-parabola-coefficient@1` → `M9-ALG-09`, mode `coefficient`.
- Registry có metadata form, schema theo mode, sáu task/nguồn dữ kiện, validate toán và compiler interface. Cả hai có `compilerStatus: implemented-local`; tên trạng thái không phải chứng nhận Android/production acceptance.
- ID flow: `explore → identify → discover → guided → practice → assessment`.
- Parameters dùng ở bước 1–4, `variants.practice` ở bước 5, `variants.assessment` ở bước 6. Hai variants bắt buộc khác nhau và khác dữ kiện gốc.
- Runtime vẫn `schemaVersion: 1.0.0`; có thêm **optional** `recognition[].uime.cylinder` và `.parabola`. Legacy thiếu extension giữ đường chạy cũ. Client cũ với schema khóa field không đọc được extension mới: cần app/bundle/schema mới khi phân phối bài mới.
- Không thêm authoring input/receipt vào manifest. Published cũ và progress cũ không được recompile/migrate ngầm.
- Slot `context` v1 là **ghi chú tác giả/AI lưu cùng input**, chưa đưa vào lời dẫn runtime; form nói rõ. Cylinder có `exploreInstruction` trong enum và compiler đã hỗ trợ. Không tự mở câu hỏi/hint tùy ý hoặc âm thầm thay semantics template v1.

### CP-04 — Hình trụ

- Dữ kiện r/h hữu hạn trong [0,1; 100], h/r trong [0,1; 10], unit cm/m. Variants kế thừa unit.
- Sáu bước: xoay → nhận bán kính → đổi bán kính và chọn cả hai đáy → nhận chiều cao có hướng dẫn → nhận bán kính với dữ kiện mới → tự chọn mặt bên với dữ kiện mới.
- Geometry dùng một hệ số fit, giữ đúng h/r. Rod bán kính/chiều cao, hai đáy và mặt bên có ID semantic; raycast theo transform thực.
- Three.js canvas/camera/session giữ khi advance. Khi chuyển dữ kiện reset lựa chọn/cờ riêng bước, giữ góc xoay. SVG fallback chiếu từ chính geometry/camera; dùng khi không tạo được context hoặc context loss.
- Ký hiệu A–E tránh đưa sẵn mapping đáp án ở bước tự kiểm tra; có nút ký hiệu hỗ trợ thao tác.
- TS/Dart cùng tính movement/visited bases từ event hợp lệ; không cho client gán trực tiếp c/y để tự đạt.

### CP-05 — Parabol

- Chỉ y = ax², a nguyên −5…5 khác 0. Không làm ax²+bx+c, biệt thức hoặc tam giác vuông.
- Sáu bước: thử hai dấu → gắn dấu hệ số vào graph → di chuyển probe và so sánh hai graph → dựng qua P có hướng dẫn → dựng qua điểm mới → tự dựng và xác nhận điểm mới.
- Điểm P có x bằng 2, 1 hoặc −2 do template sinh, y = ax². Viewport/path/labels/hit dùng mô hình chung, không nhập pixel hoặc target answer.
- SVG root và các ID `graph-target`, `graph-reference`, `curve-learner`, `point-target`, `point-probe`, `origin` giữ liên tục. Bước dựng chỉ hiện đường người học đang thử và điểm đã cho, không vẽ sẵn đường lời giải.
- Thay a làm mất xác nhận P cũ; phải chạm P lại. TS/Dart có implementation tương ứng; chưa có kết quả chạy test parity mới.

### CP-06 — Studio

- `Thêm bài mới` mở `AuthoringStudio`, không tạo dashboard mới. Mẫu hình trụ/parabol trong Công cụ tương tác cũng chuyển vào form này.
- Form đọc nhãn/symbol/help từ registry, giới hạn/kiểu từ schema, ví dụ từ bundle. Ba bộ dữ kiện, computed read-only, flow cố định, preview/highlight theo field.
- Export schema đúng template/version, sample, JSON đề hiện tại và AI bundle. Import kiểm schema/toán/compile và đường hoàn thành, tạo candidate/diff rồi mới áp dụng; không tự lưu/publish.
- `compileProblem` là validator của sản phẩm: compile lại input và replay các hành động hợp lệ do code xác định để chặn bước auto-complete/unreachable. Không coi validator này là bằng chứng actual browser/Android gestures.
- Chọn rõ cập nhật draft hiện tại hoặc tạo biến thể ID mới. Có diff từ lần lưu, cảnh báo chưa lưu khi rời/refresh/back/logout. Token refresh không tự ghi đè form đang chỉnh.
- Full manifest và các creator cũ nằm trong legacy/nâng cao; managed form chỉ xuất/xem runtime JSON read-only.
- Tần số và tam giác chưa có form template chuẩn; đừng tuyên bố đã hỗ trợ lỗi/validator của các dạng đó trong luồng mới.

## 4. Persistence và quyền

- Client chỉ gửi input + lessonId + expectedRevision + publish, không gửi manifest/receipt được tin là đúng.
- Local API hoặc Edge `authoring` compile phía server; version lấy từ draft hiện tại.
- `lesson_authoring_drafts`: FK lesson, revision, receipt, compiled_manifest; optimistic concurrency.
- `lesson_authoring_revisions`: FK `(lesson_id, version)`, snapshot receipt và hash chính row published; immutable trigger.
- `public.commit_lesson_authoring(...)`: chỉ service_role có EXECUTE; kiểm actor/owner/role/revision/version. Save/publish/receipt nằm cùng transaction.
- Edge tự xác thực bearer qua `/auth/v1/user`, role từ DB. Author lưu bài của mình, admin publish. Không tin user_metadata, không đưa service key vào browser.
- Sidecar chỉ có SELECT cho authenticated theo quyền đọc draft/owner/admin; learner không cần đọc authoring input.
- Trigger chặn legacy save sửa managed manifest; publication trigger tự capture receipt kể cả khi admin gọi publisher cũ. Version/progress cũ giữ nguyên.
- Legacy thiếu sidecar vẫn chạy; API chuẩn không tự gán input cho ID legacy. Chuyển sang authoring bằng ID mới.
- Local demo: `/api/admin/authoring`, file `.local/workspace.json` ghi qua temp+rename. Đây là single-server demo, không phải backend multi-process/RLS. Hash snapshot local SHA-256; DB sidecar bind hash publisher hiện hữu, không hứa hai mode cùng chuỗi hash.
- Lịch sử managed clone/restore lấy input đúng receipt/version. Restore chỉ nạp vào draft, không sửa published cũ.

## 5. Backend remote — đã triển khai

Project: **`sbzpmrgsqznaydllqmbm`**, URL `https://sbzpmrgsqznaydllqmbm.supabase.co`, region `ap-southeast-2`. Đích được đối chiếu từ repo `.temp/project-ref`, log browser và connector. Không lựa chọn project khác chỉ vì connector nhìn thấy nó.

Ngày 14/11, người dùng báo lỗi khi bấm **Xuất bản phiên bản mới**:

- REST hai bảng sidecar trả 404.
- OPTIONS authoring không có HTTP OK nên browser báo CORS; POST net::ERR_FAILED.
- Nguyên nhân: code CP-06 đã có nhưng backend chưa rollout.

Đã áp dụng bằng CLI, đúng ba migration pending, không seed/roles/vault:

1. `20261113160543_cylinder_runtime_contract.sql`
2. `20261113162509_parabola_runtime_contract.sql`
3. `20261113163650_authoring_provenance.sql`

Remote hiện có **12 migration** tại lần readback cuối; dry-run báo upToDate=true. **Không apply lại** hoặc sửa các migration đã áp dụng. Thay DDL tiếp theo phải tạo migration mới.

Edge Functions tại lần deploy cuối:

| Function | Version | Trạng thái |
|---|---:|---|
| authoring | 1 | ACTIVE, mới deploy |
| progress | 4 | ACTIVE, cập nhật evaluator manifest mới |
| generate | 3 | Giữ nguyên remote; local artifact có thể mới hơn, chưa deploy trong lần sửa lỗi |

`verify_jwt=false` có chủ đích: handler tự xác thực bearer trước thao tác; OPTIONS không cần session. Đừng bật/tắt gateway auth máy móc làm browser preflight hỏng.

Xác minh sau rollout:

- OPTIONS authoring từ origin `http://127.0.0.1:5173`, POST, headers authorization/apikey/content-type/x-client-info → **200**, allow-origin `*`.
- POST không có session → **401 Unauthorized**; function boot được, không mở ghi anonymous.
- Hai bảng sidecar tồn tại. Lần readback cuối sidecar chưa có row: **chưa xác nhận người dùng publish managed thành công sau sửa**.
- Snapshot ngay trước apply: **22 versions / 7 progress**, giữ nguyên counts/digests sau apply/deploy. Lần kiểm kê sớm hơn 21 versions; một version đã xuất hiện trước snapshot, không phải migration tự publish.
- Digest versions: `33e27c7c3a9f05a3403579e932efcfd5`.
- Digest progress: `0c4139362dc2e9fdf2c8e75d4b332b8e`.
- Advisors trước/sau không có cảnh báo RLS mới. Có cảnh báo Auth leaked-password protection đã tồn tại; chưa đổi Auth settings.

Snapshot catalog/functions/policies lưu tại `learning-platform/.local/deployment/pre-authoring-snapshot.json`, ignored. `pg_dump` thất bại vì Docker engine không sẵn; **không gọi snapshot này là full database backup**. Evidence rollout: `docs/qa/authoring-publish-fix-20261114/`.

Connector: namespace `mcp__supabase` đã lỗi OAuth refresh. Connector plugin `mcp__codex_apps__supabase_*` có project_id hoạt động; CLI Supabase 3.0.0 cũng hoạt động. Migration apply dùng CLI để giữ timestamp khớp file, deploy functions dùng plugin. Không cần yêu cầu người dùng đăng nhập lại connector hỏng nếu connector còn lại đủ khả năng.

## 6. File nguồn trọng tâm

Đường dẫn dưới đây tính từ workspace root:

| Nhóm | File |
|---|---|
| Authoring schema/examples | `learning-platform/contracts/authoring/` |
| Registry/types/errors/export bundle | `learning-platform/packages/lesson-authoring/template-registry.ts` |
| Trusted compile/import reachability/diff | `learning-platform/packages/lesson-authoring/authoring-service.ts` |
| Cylinder compiler | `learning-platform/packages/lesson-authoring/cylinder-compiler.ts` |
| Parabola compiler | `learning-platform/packages/lesson-authoring/parabola-compiler.ts` |
| TS models/evaluation | `learning-platform/packages/lesson-runtime/{cylinder,parabola,uime,index}.ts` |
| Dart parity implementations | `learning-platform/apps/mobile/lib/{parabola,uime,domain}.dart` |
| New Studio | `learning-platform/src/AuthoringStudio.tsx` |
| Integration/navigation/history | `learning-platform/src/{Admin,EngineTemplates,LessonLibrary,store}.tsx` / `store.ts` (store là .ts) |
| Legacy UI | `learning-platform/src/{BlueprintStudio,StudioEditor,LessonJsonTools}.tsx` |
| Runtime scenes | `learning-platform/src/{CylinderScene,ParabolaScene,UimeScene}.tsx`, `cylinder-visual.ts` |
| Styles | `learning-platform/src/recognition.css` |
| Local persistence | `learning-platform/packages/local-api/index.ts` |
| Remote authoring | `learning-platform/supabase/functions/authoring/{main,index}.ts` |
| Edge sources | `learning-platform/supabase/functions/{progress,generate}/main.ts` |
| SQL source/history | `learning-platform/supabase/contract-validator.sql`, `supabase/migrations/` |
| Generated shared examples/vectors | `learning-platform/contracts/generated/{cylinder-recognition,parabola-coefficient}.json` |
| Generation/bundles | `learning-platform/scripts/{export-cylinder,export-parabola}.ts`, `bundle-{edge,mobile}.mjs`, `create-contract.mjs` |

CP-02 có sẵn các thay đổi trong `src/mobile-runtime.tsx`, mobile `scenes.dart`, `runtime_bridge.dart`, hosted scripts/integration tests và runtime assets. Đừng quy tất cả diff này thành CP-06 hoặc xóa chúng khi sửa authoring.

## 7. Bằng chứng build/test — phân biệt thời điểm

| Mốc | Đã chạy | Không được suy ra |
|---|---|---|
| CP-01 | 88 TS/SQL, 38 browser, 48 Flutter, build/bundles/analyze PASS | Không phải baseline của toàn working tree mới nhất |
| CP-03 | 66 tests mới; tổng 154 TS/SQL; build PASS; 15 manifest legacy TS chạy/restore | Không phải Android native acceptance |
| CP-04 trước khi người dùng dừng test | Tổng 162 TS/SQL, 6 browser (3 input × WebGL/fallback), 3 Dart parity, bundle PASS | Một số chỉnh UI cuối chưa rerun; Android touch chưa chạy |
| CP-05 | Generate 3 manifests, web TypeScript+Vite, mobile/Edge bundle PASS | TS/Dart/browser/Android tests mới chưa chạy |
| CP-06 | Web TypeScript+Vite, mobile/Edge bundle PASS | SQL migration execution và endpoint readback chỉ diễn ra ở lượt sửa lỗi sau đó; chưa có round-trip browser acceptance |
| 14/11 sửa publish | Apply migration, deploy/readback, preflight 200/auth 401, digest cũ giữ nguyên | Không phải click publish có session hoặc nghiệm thu learner/Android |

Logs và hướng dẫn: `docs/qa/cp01-20261113/`, `cp03-20261113/`, `cp04-20261113/`, `cp05-20261113/`, `cp06-20261113/`, `authoring-publish-fix-20261114/`.

Tests/scaffolds đã chuẩn bị: `tests/authoring-contract.test.ts`, `tests/cylinder.test.ts`, `tests/parabola.test.ts`, `tests/e2e/cylinder.spec.ts`, mobile `test/{cylinder,parabola}_test.dart`, integration `cylinder_test.dart`. Không báo chúng đã chạy sau yêu cầu dừng test. Không chạy helper ADB/hosted tự động nếu người dùng vẫn muốn tự nghiệm thu.

## 8. Cách mở để tiếp tục

```powershell
Set-Location 'D:/3.FPT/PRM/final project'
git status --short
Get-Content '.agents/skills/lesson-platform/SKILL.md'
Set-Location 'learning-platform'
```

Chạy web dùng Supabase hiện cấu hình:

```powershell
npm run dev
```

Local demo độc lập (cấu hình script tắt Supabase cho process này):

```powershell
npm run dev:local
```

Local demo dùng port 5180, file `.local/workspace.json`. Web `dev` thường 5173. Kiểm server/port đang chạy trước khi mở thêm; không đổi nguồn dữ liệu của người dùng ngầm định. Trình duyệt từng báo lỗi publish ở `http://127.0.0.1:5173` kết nối Supabase thật.

Điểm vào UI: **Studio → Thêm bài mới** hoặc **Công cụ tương tác → Hình trụ / Parabol động → chọn mẫu**.

Lệnh build/generation có sẵn, chỉ chạy nếu cần cho thay đổi đang làm:

```powershell
npm run build
npm run bundle:mobile
npm run bundle:edge
npm run cylinder:generate
npm run parabola:generate
```

Build Edge chỉ tạo index.ts, không tự deploy. Bundle mobile chỉ tạo assets/schema/fixtures, không tự build/cài APK. Không regenerate/publish toàn bộ 15 bài cũ để “đồng bộ” một sửa đổi nhỏ.

Node 24.7.0, npm 11.6.0; Flutter 3.47.7/Dart 3.13.5 theo các lượt gần nhất. Emulator AVD `Pixel_9_Pro`, Android API35; trạng thái chạy hiện tại chưa kiểm tra. Supabase CLI 3.0.0: database commands local mặc định, remote phải explicit `--remote=<ref>`; mutation cần `--yes` theo CLI. Không in key/token/password từ `.env*`, defines hoặc `.local`.

## 9. Việc nên làm tiếp theo

1. Nhận phản hồi người dùng sau khi reload và bấm publish lại. Root cause missing backend đã sửa; **đừng tiếp tục chẩn đoán như function/bảng vẫn chưa deploy** nếu không có readback mới chứng minh điều đó.
2. Nếu còn lỗi, lấy lỗi response/status/Edge/Postgres logs của lần mới. Phân biệt network/CORS, auth/role, invalid draft/schema, revision conflict và lỗi transaction. Không đổ mọi lỗi thành generic connection error hoặc yêu cầu sửa JSON khi lỗi là backend.
3. Nghiệm thu do người dùng thực hiện: export → sửa JSON → import/diff → preview → save/reload → publish → catalog/learner; provenance đúng `(lesson_id,version,hash)`; phiên bản/progress cũ không đổi. Kiểm hai tab revision conflict và owner/admin/student theo yêu cầu tiếp theo.
4. Android/WebGL/fallback/touch/resume vẫn mở ở CP-02/04/05. Không coi TS/Dart source tương ứng hoặc web build là bằng chứng thiết bị.
5. Chỉ sau khi chốt hai lát cắt và luồng authoring mới mở CP-07/08. Chưa có phủ đủ 15 mẫu hoặc 24 dạng theo contract mới.
6. Khi đủ phạm vi, người dùng có thể yêu cầu commit/đóng gói Git. Chưa commit trong lượt bàn giao này; không tự tạo commit/push hoặc bỏ sót untracked source.

## 10. Prompt khởi động gợi ý cho agent tiếp theo

> Đọc PROJECT_HANDOVER_CP03_CP06_20261114.md và các tài liệu được dẫn ở phần 1 trước khi sửa code. Tiếp tục trên working tree hiện tại, branch first-version, không reset/clean vì CP-03…CP-06 chưa commit và nhiều source quan trọng là untracked. Người dùng muốn tự test; không tự chạy full suites. Backend CP-04/05/06 đã apply ba migration, authoring v1/progress v4 đã ACTIVE trên sbzpmrgsqznaydllqmbm; preflight 200, thiếu session 401 và dữ liệu cũ giữ nguyên. Chưa có xác nhận publish end-to-end sau rollout, nên bắt đầu từ phản hồi/lỗi mới của người dùng. Giữ legacy manifest/progress, chuẩn hóa qua template/input/compiler và sidecar; không sửa published cũ hoặc mở flow tùy ý qua JSON đề.
