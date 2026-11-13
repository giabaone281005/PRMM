# Bàn giao Mở Học — bài mẫu 6 checkpoint và JSON cho AI

Cập nhật 13/11/2026. Đọc file này trước khi sửa tiếp. `PROJECT_HANDOVER.md` giữ bối cảnh dự án trước đợt thay đổi; các số liệu trong đó là lịch sử. File này mô tả trạng thái sau các yêu cầu mới trong hội thoại. Không có mật khẩu hoặc secret key trong tài liệu.

## 1. Mục tiêu sản phẩm đã thống nhất

Tập trung Toán lớp 9. Có một dashboard quản trị chung, trong đó Bài học quản lý bài hiện có; chỉ mở Studio khi thêm hoặc sửa bài. Công cụ tương tác chứa mẫu để tạo bài trong chính Studio đó.

Luồng đích: xây sẵn engine phù hợp từng dạng bài → mỗi bài có 6 checkpoint hoàn chỉnh → xuất một JSON Schema dùng chung cùng JSON bài mẫu → admin đưa cho AI tạo đề tương đương → nạp JSON vào Studio → kiểm tra cấu trúc và khả năng hoàn thành → xem thử → duyệt nội dung toán → lưu nháp/xuất bản → học sinh tải từ Supabase.

Engine là code xử lý tương tác, không phải toàn bộ nội dung bài. Một engine có thể dùng cho nhiều bài; một bài có thể kết hợp nhiều kiểu tương tác. JSON chứa dữ liệu, không chứa mã thực thi. AI chỉ tạo biến thể trong khả năng engine đã hỗ trợ; không thể thêm một cơ chế mô phỏng hoàn toàn mới bằng cách đổi JSON.

## 2. Toàn cảnh dự án

| Thành phần | Vai trò / thư mục |
|---|---|
| React + TypeScript + Vite | Dashboard admin, Studio, learner web trong `learning-platform/src` |
| Contract | Schema và kiểu Lesson, validate JSON tại `learning-platform/packages/lesson-contract` |
| Authoring | Khuôn bài, Toán 9, mẫu tương tác tại `learning-platform/packages/lesson-authoring` |
| Runtime TypeScript | Scene, trạng thái, điều kiện checkpoint, replay tại `learning-platform/packages/lesson-runtime` |
| Three.js / SVG | Mô hình 3D và tương tác 2D; không cần ảnh do AI sinh cho các mô hình toán |
| Flutter | App học sinh tại `learning-platform/apps/mobile`; dùng Dart runtime và WebView bridge cho cảnh tương tác tương ứng |
| Supabase | Auth, vai trò, draft, phiên bản xuất bản, catalog, progress, activity, audit, hai Edge Functions theo kiến trúc hiện có |
| Local API | Môi trường phát triển độc lập ở `learning-platform/packages/local-api`; không phải bản sao tự đồng bộ của Supabase |
| REA | `rea-main` là công cụ riêng, không thuộc phạm vi sản phẩm học tập; không sửa trong đợt này |

Đọc thêm: `docs/architecture/BRILLIANT_INTERACTIVE_LEARNING_MASTER_SPEC.md`, `audit.md`, `supabase-deployment.md`, `docs/qa/verification-report.md`. Không dùng các báo cáo cũ để suy ra một kiểm thử mới đã chạy.

## 3. Trước và sau thay đổi

| Hạng mục | Trước | Sau |
|---|---|---|
| Nguồn danh sách | Dashboard thử chạy local, chỉ có một bài lớp 9 dù Supabase có ba | Server web 5180 đã chạy chế độ Supabase; đọc đúng project |
| Phạm vi lớp | Có bài lớp 6–8 trong local/catalog | Dashboard và web learner chỉ hiển thị lớp 9; bài lớp 7 remote đã gỡ xuất bản, không xóa lịch sử |
| Navigation | Studio có mục riêng; prototype JSON nằm thành khối riêng ở Bài học | Bỏ Studio khỏi sidebar; Bài học là danh sách, thêm/sửa mới mở Studio; có nút quay lại |
| Danh mục Excel | Chưa đưa vào CMS | Đọc 3 sheet; giữ 24 dạng bài và 6 nhóm engine trong dữ liệu nguồn |
| U-IME | 15 khuôn / 13 kiểu tương tác, đa số một checkpoint | 15 khuôn, mỗi khuôn 6 checkpoint; đủ 90 checkpoint chạy được |
| Hình trụ remote | Ba bước gồm hình trụ rồi hai câu đại số | Sáu bước cùng chủ đề hình trụ, nhận diện r/h/đáy và xoay mô hình |
| Hai bài lớp 9 còn lại | Parabol 3 bước; chọn bi 1 bước | Mỗi bài 6 bước, xuất bản phiên bản mới |
| Hình 3D | Nhãn/bộ phận chưa rõ; hình trụ còn có lựa chọn l không khớp mô hình | Thêm nhãn trên khối, đường viền, chú giải, chọn bộ phận; bỏ l khỏi hình trụ; có sơ đồ thay thế khi WebGL không khả dụng |
| Một số cảnh 2D | Canvas trống chỉ có lời nhắc | Thêm khay phân loại, ô công thức, biểu thức hệ số, cung được chọn |
| JSON cho AI | Chưa có luồng thống nhất | Toolbar Studio có tải bài JSON, tải schema riêng, tải bundle và nạp bài AI |

Đăng nhập admin dùng Supabase Auth. Email được cấp admin theo yêu cầu: `khazim2810@gmail.com`; giữ nguyên mật khẩu của người dùng. Quyền nằm ở `public.user_roles`, không lấy từ metadata client.

## 4. Những gì đã thực sự có — không nhầm với “full chương trình”

Có 13 engine nền trong registry trước đó. Bộ U-IME có 13 kiểu tương tác, tạo 15 khuôn vì bộ khám phá 3D có ba hình khác nhau:

| Mẫu / loại | Nội dung 6 bước |
|---|---|
| Phân loại phương trình | Nhận dạng, hệ số 0, hệ số âm, dấu bằng, tình huống vé, tự kiểm tra |
| Chạm hệ số | a/b/c, hệ số âm, hệ số −1, tự kiểm tra |
| Trục số | Biên, hướng, mở/kín, miền nghiệm, đổi tình huống, chia số âm |
| Đổi chiều bất đẳng thức | Bốn loại dấu và hai ví dụ số |
| Ghép công thức | Tổng/tích Viète, công thức chung và ba phương trình cụ thể |
| Parabol | Mở lên/xuống, độ hẹp và tìm a từ điểm |
| Biệt thức Δ | Hai nghiệm, nghiệm kép, vô nghiệm và ba phương trình |
| Tam giác vuông | Huyền/đối/kề theo góc B/C và liên hệ sin |
| Đường tròn | Cắt/tiếp xúc/không giao, tâm và tiếp điểm |
| Góc/cung | Nhận diện ba cung và cung bị chắn bởi từng góc |
| Nón / Trụ / Cầu | Mỗi hình một bài 6 bước nhận diện bộ phận, đổi hướng nhìn |
| Biểu đồ | Đọc nhãn, tần số, nhóm lớn nhất và tần số tương đối |
| Biến cố | Chắc chắn/không thể/ngẫu nhiên qua nhiều phép thử |

**Chưa phải đã build đầy đủ 24 dạng bài trong Excel.** Danh mục 24 dòng mới có ba mẫu curriculum-specific: M9-ALG-05, M9-ALG-09, M9-STP-02. 21 dòng còn lại vẫn ghi “Chưa có mẫu”. Bộ 15 khuôn theo công cụ là một lớp thư viện khác, không được lấy 15 khuôn đó để tuyên bố phủ đủ 24 mục tiêu chương trình.

**Cũng còn thư viện cũ** `math9Topics`: 10 chủ đề, 56 checkpoint, số bước chưa đồng nhất là 6. Các blueprint cơ bản cũ còn phục vụ runtime/test. Không xóa chúng vì app và tests còn tham chiếu; cần hợp nhất có kế hoạch ở lượt sau.

## 5. Supabase sau đồng bộ

Project: `sbzpmrgsqznaydllqmbm` — đã xác định từ cấu hình workspace.

- 15 bài lớp 9 đang xuất bản, tổng 90 checkpoint; không có bài xuất bản nào trong nhóm này khác 6 checkpoint.
- Ba ID bài cũ được giữ: Parabol lên version 2, Chọn bi lên version 2, Hình trụ lên version 3.
- Thêm 12 bài mẫu còn lại với tiền tố `template-engine-...`, version 1.
- Bài lớp 7 vẫn còn trong database nhưng không xuất bản và bị ẩn khỏi UI hiện tại.
- Lưu và xuất bản qua hàm có sẵn, trong transaction, với vai trò authenticated của admin; không thêm schema/migration, không sửa bản published cũ hoặc xóa progress.
- Backup trước đồng bộ ở `.local/pre-engine-sync-20261113.json` trên máy thực hiện. File bị Git ignore và không đi theo pull. Nội dung là response SQL bao gồm lessons + lesson_versions; không phải migration tự chạy để restore.
- Supabase đã đồng bộ dữ liệu; hosting web production chưa được triển khai trong đợt này. Web dev và bundle mobile thay đổi ở code; app mobile đã cài phải build/cài lại để nhận code renderer mới.

Đã đọc lại từ remote: 15 bài lớp 9 / 90 checkpoint / 0 sai số bước. Đừng publish lại toàn bộ mẫu mỗi lần pull: sẽ tạo thêm version không cần thiết. Chỉ publish bài đã sửa, bằng Studio hoặc quy trình có kiểm tra diff.

Advisors: health không có finding; security có cảnh báo leaked password protection chưa bật; performance có 4 unused index mức INFO. Chưa đổi cấu hình Auth hoặc xóa index. Tham khảo [password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) và [unused index](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).

## 6. File nguồn quan trọng để làm tiếp

- `packages/lesson-authoring/engine-checkpoints.ts`: nội dung sáu bước cho từng kiểu tương tác.
- `packages/lesson-authoring/uime-bank.ts`: 15 khuôn, gọi bộ sáu bước; seed ban đầu chỉ là cấu hình cơ sở.
- `packages/lesson-authoring/math9.ts`: compiler recognition → Lesson. Khởi tạo slider parabol khác đáp án để tránh checkpoint tự đạt hoặc không có thao tác.
- `packages/lesson-authoring/curriculum-pilot.ts`: ba mẫu curriculum, bundle AI và importer. Tên file là lịch sử prototype, chức năng nay đã tích hợp dashboard.
- `contracts/math9-curriculum.json`: dữ liệu 24 dòng trích Excel. Excel gốc ở root workspace.
- `contracts/lesson.schema.json`: contract runtime chung.
- `contracts/lesson-six.schema.json`: schema tác giả cho bài lớp 9, đúng sáu bước; không thay thế contract runtime chung.
- `contracts/engine-templates/*.lesson.json`: 15 JSON mẫu cụ thể, dễ đưa cho AI và import.
- `contracts/generated/engine-six-checkpoints.json`: tập hợp 15 bài dùng để đối chiếu/sync trong lượt này.
- `src/EngineTemplates.tsx`, `CurriculumTemplates.tsx`: hai bộ chọn mẫu trong dashboard.
- `src/StudioEditor.tsx`, `LessonJsonTools.tsx`, `UimeEditor.tsx`: soạn bài, import/export và cấu hình hình.
- `src/UimeScene.tsx`, `UimeSolid.tsx`: renderer tương tác mới.
- `apps/mobile/assets/runtime/`: runtime web được bundle cho Flutter WebView. Cần regenerate khi sửa renderer.

## 7. Cách admin đổi đề bằng AI

1. Bài học → Thêm bài mới; hoặc Công cụ tương tác → chọn mẫu → Studio. Sửa bài đang có bằng nút Sửa bài trong danh sách.
2. Trong Studio tải **JSON bài học**, **JSON Schema** hoặc **bộ JSON cho AI** có cả schema, bài mẫu và hướng dẫn.
3. Đưa schema và mẫu cho AI. Yêu cầu trả duy nhất object Lesson; giữ mục tiêu, đúng sáu bước; đổi đề phải cập nhật cả hình, token, đáp án, gợi ý và điều kiện đạt. Không tự thêm loại engine hay Javascript.
4. Nạp bài từ AI. Import tạo ID mới để tránh ghi đè bài gốc. Kiểm tra contract, đồng bộ câu hỏi/feedback, cấu hình đáp án và mô phỏng khả năng hoàn thành sáu checkpoint.
5. Xem trước từng bước, thử cả đáp án sai/đúng và kiểm tra toán. Sau đó lưu nháp/xuất bản.

Schema chỉ kiểm cấu trúc. Importer kiểm một số điều kiện logic và khả năng đạt, **không chứng minh đề/lời giải đúng về toán hay đúng chương trình**. Chưa gọi AI provider tự động. Chưa có preview diff trước khi chấp nhận biến thể. Chưa có editor thân thiện cho mọi trường; nhiều cấu hình vẫn sửa bằng JSON.

## 8. Chạy sau khi pull

Tại `learning-platform`:

```powershell
npm ci
Copy-Item .env.example .env.local
# Điền URL và publishable key của project; VITE_ENABLE_LOCAL_DEMO=false
npm run dev -- --port 5180 --strictPort
```

Mở `http://127.0.0.1:5180/admin/lessons`, đăng nhập tài khoản có quyền admin. Không đưa service_role/secret key vào biến VITE_. `.env.local` bị ignore nên người pull phải tự cấu hình. Pull code không sao chép tài khoản, password hoặc database; cùng project Supabase thì thấy dữ liệu đã đồng bộ.

Nếu cần làm offline: `npm run dev:local` (cũng dùng cổng 5180; dừng server cũ trước). Chế độ này chủ động tắt Supabase và dùng `.local/workspace.json`. Dữ liệu local không tự lên Supabase; đừng nhầm số bài giữa hai nguồn.

Tái tạo dữ liệu/bundle:

```powershell
npx tsx scripts/export-engine-templates.ts
npx tsx scripts/export-math9.ts
npm run bundle:mobile
npm run build
npm test
npm run test:e2e
Set-Location apps/mobile
flutter test
flutter analyze
```

Export không tự publish database. Các test browser dùng API local tạm trong memory, không ghi Supabase. `export-math9.ts` vẫn xuất cả thư viện recognition cũ; không nhầm nó với bộ 15 bài đã đồng bộ.

Để chạy Android cần Flutter/Android SDK, thiết bị/emulator và cấu hình theo `PROJECT_HANDOVER.md` / `apps/mobile/README` nếu có. Tạo lại các define Supabase của mobile ở máy mới; không copy credential bằng commit. iOS cần môi trường macOS riêng.

## 9. Kiểm thử và giới hạn bằng chứng

- PASS: build web, 88 Vitest tests (contract, runtime, database, authoring); kiểm tra cả 90 checkpoint đạt được và không tự hoàn thành.
- PASS: 48 Flutter tests và Flutter analyze không báo lỗi; fixtures U-IME đã regenerate thành sáu bước.
- PASS: bundle runtime mobile mới.
- PASS: nhóm Playwright 16 tests cho luồng AI round-trip và 15 bài × 6 checkpoint, kiểm tra canvas WebGL cho ba khối và giữ scene container qua checkpoint. Có kiểm thử chỉnh JSON/SVG riêng.
- PASS: toàn bộ 38 Playwright tests trong lượt cuối, gồm luồng cũ, danh sách chỉ lớp 9, AI round-trip, SVG inert, 15 bài × 6 checkpoint và ba canvas 3D. Test cũ được cập nhật fixture lớp 9 theo phạm vi mới; một selector trùng tên được sửa, rồi chạy lại toàn bộ đạt 38/38.
- NOT RUN trong đợt này: nghiệm thu hosted Auth → Flutter Android → WebView → Edge progress xuyên suốt, iOS, thiết bị thật, hiệu quả sư phạm. ANR Android của bài chọn bi được ghi trong bàn giao cũ **chưa có bằng chứng nghiệm thu lại**.
- WebGL browser hiển thị đúng không đồng nghĩa Android đã nhận bundle mới hoặc hết ANR. Chưa publish hosting web hoặc release APK.

## 10. Việc cần làm tiếp theo — theo đúng mục tiêu “full từng bài”

1. **Ưu tiên P0: nghiệm thu Android.** Build/cài app từ code mới; thử bài bi và cả ba khối với catalog hosted, ghi log WebView/ADB, xác nhận không ANR và progress được Edge chấp nhận. Sửa nguyên nhân rồi mới đánh dấu hoàn thành.
2. **Phủ đủ 24 mục trong Excel bằng nội dung thật.** Lập ma trận 24 dòng ↔ bài mẫu ↔ engine ↔ sáu checkpoint ↔ tiêu chí đạt ↔ bằng chứng. Không clone cùng một câu sáu lần hoặc gắn hình không liên quan để đủ số bước.
3. **Hoàn thiện engine theo mục tiêu thiếu.** Hiện chưa có đầy đủ giao điểm hai đường thẳng, domain guard phân thức, căn bậc hai/ba bằng diện tích/thể tích, vị trí hai đường tròn, quạt/vành khuyên, trải phẳng trụ/nón, mô phỏng mẫu ngẫu nhiên và biểu đồ ghép nhóm/quạt tròn như Excel. Phải bổ sung code và parity tests trước khi cho AI dùng các dạng đó.
4. **Hợp nhất thư viện.** Tách rõ mẫu công cụ, bài theo chương trình và bài đã xuất bản; chuẩn hóa 10 chủ đề/56 checkpoint cũ và blueprint 3–4 bước theo chính sách sáu bước. Tránh hai nơi tạo bài khác nhau với trải nghiệm khác nhau.
5. **Một schema tác giả ổn định.** Thêm schema chuyên biệt theo mode engine; định nghĩa trường nào AI được đổi, ràng buộc toán, đơn vị, phạm vi số và error message tiếng Việt. Tránh hỏi AI sửa cả cấu trúc checkpoint kỹ thuật khi chỉ đổi số liệu; có thể thêm tầng authoring JSON ngắn rồi compiler sinh Lesson.
6. **Kiểm duyệt nội dung.** Sáu bước cần có khám phá → dấu hiệu → tên/ý nghĩa → phân biệt → tình huống mới → tự kiểm tra. Một số bộ hiện là bài luyện nhận diện bộ phận, chưa phải chuỗi khám phá đầy đủ; một số gợi ý còn chứa quy tắc/đáp án quá sớm. Cần giáo viên rà soát.
7. **Cải thiện UI.** Form edit token/answer/label/đơn vị thay JSON thô; xem diff khi import; phân biệt tạo biến thể với cập nhật bài; cảnh báo chưa lưu; refresh danh sách khi quay lại tab, tránh nghĩ database lệch khi thực ra dữ liệu UI cũ.
8. **Hình và 3D.** Param hóa bán kính/chiều cao, camera, chọn mặt đáy trên/dưới; tối ưu nhãn và khả năng đọc trên điện thoại, test WebGL fallback và dispose context. Hiện khối là hình chuẩn kích thước cố định, chưa phải engine dựng mọi mô hình 3D từ đề.
9. **Kỷ luật xuất bản.** Diff/idempotent sync; preview/approve trước publish hàng loạt; version mới giữ progress cũ. Thêm bài test chứng minh toàn bộ AI output hợp lệ chạy được trên cả web và native/bridge.
10. **Chuẩn bị production.** Cấu hình hosting/redirect Auth, xem cảnh báo mật khẩu, performance/bundle splitting, signing app, monitoring. Không suy ra production-ready từ việc test local pass.

## 11. Trước khi push / người nhận pull

Theo yêu cầu cuối của chủ dự án, đợt này được commit và push lên branch `first-version-v2` (tên Git hợp lệ cho “first-version v2”), dựa trên `first-version`. Commit gồm code, các schema, JSON mẫu, Excel nguồn và file bàn giao này. Không commit `.env*` thật, `.local/`, auth token, service key hoặc database backup. Runtime mobile và fixtures được theo dõi trong repo nên phải đi cùng thay đổi renderer/authoring.

Người nhận nên chạy các lệnh ở mục 8 và đọc mục 10 trước khi mở rộng. Tránh reapply migration đã tồn tại hoặc seed đè dữ liệu remote. Nếu dùng project Supabase khác, phải tự chuẩn bị schema/Auth/RLS và publish mẫu đã validate; pull repository đơn thuần không tạo backend.
