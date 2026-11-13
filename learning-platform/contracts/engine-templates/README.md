# Mẫu bài 6 checkpoint

15 file `.lesson.json` là các bài cụ thể đã kiểm tra với runtime. Schema dùng chung ở `../lesson-six.schema.json`. Chúng là bài mẫu theo công cụ, không phải bằng chứng đã phủ đủ 24 dạng bài trong Excel.

Đưa cho AI một bài mẫu và schema, hoặc tải bộ JSON cho AI trong Studio. Gợi ý prompt:

> Tạo một biến thể mới cùng mục tiêu học tập với bài mẫu. Giữ đúng 6 checkpoint và các loại tương tác đã được hỗ trợ. Đổi tình huống/số liệu thì cập nhật đồng thời câu hỏi, hình, tokens, answers, gợi ý, lời giải và điều kiện hoàn thành. Đồng bộ recognition.question với checkpoint.instruction và explanation với feedback.success. Trả về duy nhất object Lesson theo schema, grade 9, status draft, không bọc Markdown hoặc bundle, không thêm mã thực thi. Không tạo loại hình/mô phỏng mà cấu hình hiện tại không hỗ trợ.

Nạp JSON bài học trả về bằng nút **Nạp bài từ AI** trong Studio. Import tạo bài mới, chưa tự lưu hoặc xuất bản. Người soạn phải kiểm tra lại kiến thức toán và xem thử đủ sáu bước.

Các file này sinh bởi `npm run templates:generate` từ `packages/lesson-authoring`; sửa nguồn rồi regenerate. Export không tự ghi database. Đọc `PROJECT_HANDOVER_ENGINE_CHECKPOINTS.md` tại workspace root trước khi đồng bộ hoặc thay thế bài đã xuất bản.
