# CP-03 — Kết quả local

Ngày 13/11/2026, Asia/Saigon. Nguồn nền `f2cee66d4488e79114a6756e879f4c9accb1d830`; CP-03 nằm trong working tree chưa commit. Có sẵn thay đổi CP-02 ở mobile/runtime/bridge và tài liệu khi bắt đầu; giữ nguyên, không nhận đó là phần triển khai CP-03. Kết quả full suite/build phản ánh working tree dùng chung tại thời điểm chạy.

**PASS trong phạm vi CP-03:** base/discriminated authoring schema, hai template/mode contract, registry bất biến/sáu nhiệm vụ, metadata form, validate dữ kiện, compiler interface và receipt tách runtime. Quyết định persistence/compatibility tại [authoring-contract.md](../../architecture/authoring-contract.md).

| Lệnh / kiểm tra | Kết quả |
|---|---|
| `npm run typecheck` | PASS, exit 0 |
| `npx vitest run tests/authoring-contract.test.ts` | PASS, 66 tests |
| `npm test` | PASS, exit 0, 10 files / 154 tests; [tests.log](tests.log) |
| `npm run build` | PASS, exit 0, TypeScript + Vite; [build.log](build.log) |

66 tests mới bao gồm schema round-trip, đúng 24 mã canonical, từ chối namespace alias/mode/template/version/field lạ, code/checkpoints/hotspot/answer overrides, số sai/NaN/Infinity, tỉ lệ không quan sát được, variants trùng/thiếu và content vượt slot. Kiểm clone/freeze registry, compiler mismatch, identity/flow/completion thay đổi, receipt round-trip và runtime từ chối field authoring. Mười lăm ca legacy đọc toàn bộ file engine-template cũ, chạy đủ bước, giữ objects identity và restore snapshot sau mỗi bước với trạng thái published.

Một lần chạy đầu FAIL ở test adapter vì pilot legacy có thêm topicId engine; đã sửa adapter thử để đáp ứng contract topicId canonical mới. Chạy lại 66/66 PASS; không sửa manifest legacy hoặc nới contract vì lỗi test này.

Vite vẫn cảnh báo configLoader native/import resolution và chunk 1.379,66 kB; không nâng dependency hoặc tắt cảnh báo.

**NOT RUN / ngoài phạm vi:** compiler hình theo dữ kiện CP-04/05, form/import UI và lưu/publish sidecar CP-06; browser E2E authoring; Flutter/Android/hosted/progress Edge; migration/remote writes; nghiệm thu sư phạm. Không đổi semantics evaluator nên không thêm test Dart tương ứng; legacy parity Dart hiện hữu không được coi là đã chạy lại ở CP-03. Không bundle/deploy runtime hay publish lại bài cũ. Hai template có trạng thái compiler pending, chưa thể coi là bài mới đã chạy hoặc phủ đủ curriculum.
