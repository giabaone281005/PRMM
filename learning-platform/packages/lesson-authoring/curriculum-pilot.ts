import source from '../../contracts/math9-curriculum.json';
import schema from '../../contracts/lesson.schema.json';
import {buildRecognition,type RecognitionTask} from './math9';
import {validateLesson,type Lesson} from '../lesson-contract';
import type {UimeConfig} from '../lesson-runtime/uime';
import {LessonSession} from '../lesson-runtime';
import {uimeKeys} from '../lesson-runtime/uime';
function checkReachable(lesson:Lesson){const session=new LessonSession(lesson);for(const [i,t] of lesson.recognition!.entries()){if(!t.uime)throw Error(`Bước ${i+1}: thiếu cấu hình công cụ tương tác.`);if(session.success)throw Error(`Bước ${i+1}: tự hoàn thành khi chưa thao tác.`);t.uime.answers.forEach((v,j)=>session.interact({type:'adjust_parameter',name:uimeKeys[j],value:v}));if(t.uime.kind==='3D_SOLID_INSPECTOR')session.interact({type:'adjust_parameter',name:'a',value:.5});if(!session.success)throw Error(`Bước ${i+1}: không thể đạt đáp án với cấu hình hiện tại.`);session.advance();}}
export const curriculum=source;
export const phases=['Khám phá','Dấu hiệu chính','Tên và ý nghĩa','Phân biệt','Tình huống mới','Tự kiểm tra'];
function task(question:string,explanation:string,config:Partial<UimeConfig>):RecognitionTask{return{question,explanation,hint:'Quan sát hình và đối chiếu định nghĩa. '+explanation,mode:'tap',choices:['Tương tác','Khám phá'],correct:1,diagram:'none',uime:{kind:'TOKEN_CLASSIFIER',labels:[],tokens:[],answers:[0],min:-10,max:10,step:1,solid:'cone',hotspots:[],...config}};}
const line=(question:string,answer:number[])=>task(question,'Mốc là giá trị biên; dấu ≥, ≤ lấy đầu mút kín; >, < dùng đầu mút mở.',{kind:'NUMBER_LINE_SELECTOR',tokens:['Trái','Phải','Mở','Kín'],labels:['Mốc','Chiều','Đầu mút'],answers:answer});
const bucket=(question:string,tokens:string[],answers:number[])=>task(question,'Chắc chắn xảy ra với mọi kết quả; không thể không có kết quả thuận lợi; ngẫu nhiên có thể xảy ra nhưng không chắc chắn.',{kind:'EVENT_CARD_BUCKET',labels:['Chắc chắn','Không thể','Ngẫu nhiên'],tokens,answers});
const parabola=(question:string,a:number)=>task(question,'Với y = ax² và a khác 0: a > 0 mở lên, a < 0 mở xuống; |a| lớn hơn cho đồ thị hẹp hơn.',{kind:'PARABOLA_SLIDER',labels:['Hệ số a'],answers:[a],min:-4,max:4,step:.5});
const bank:Record<string,RecognitionTask[]>={
 'M9-ALG-05':[
 line('Khám phá tia nghiệm: dựng x ≥ 3 bằng cách kéo mốc, chọn chiều và đầu mút.',[3,1,1]),
 line('Giữ mốc 3, dựng x > 3. Quan sát điều gì thay đổi ở đầu mút.',[3,1,0]),
 line('Dựng x ≤ −2: xác định mốc, chiều và kiểu đầu mút.',[-2,0,1]),
 task('Phân loại các số theo điều kiện x > 2.', 'x > 2 không lấy 2 và chỉ lấy các số lớn hơn 2.',{labels:['Thỏa mãn','Không thỏa mãn'],tokens:['2','3','−1','5'],answers:[1,0,1,0]}),
 line('Một trò chơi yêu cầu điểm x không nhỏ hơn 4. Dựng miền điểm được chấp nhận.',[4,1,1]),
 line('Tự kiểm tra: từ −2x > 4, dựng tập nghiệm của x.',[-2,0,0])],
 'M9-ALG-09':[
 parabola('Khám phá: kéo a để dựng y = x²; quan sát hướng mở.',1),
 parabola('Dựng một parabol mở xuống với a = −1.',-1),
 task('Phân loại các biểu thức thuộc dạng y = ax² với a ≠ 0.', 'Dạng yêu cầu chỉ có hạng tử ax², hệ số a khác 0.',{labels:['Đúng dạng','Khác dạng'],tokens:['y = 2x²','y = 0x²','y = −x²','y = x² + 1'],answers:[0,1,0,1]}),
 parabola('Đổi từ y = −x² sang y = −3x². Quan sát đồ thị hẹp hơn.',-3),
 parabola('Một parabol đi qua (2; 8). Dùng 8 = a × 2² để tìm và dựng hệ số a.',2),
 task('Tự kiểm tra: ghép đặc điểm với y = −2x².', 'a = −2: mở xuống; thay x = 3 được y = −18; đỉnh tại O.',{kind:'FORMULA_SNAP_BUILDER',labels:['Hướng mở','Giá trị tại x = 3','Đỉnh'],tokens:['Xuống','Lên','−18','18','O','(0; −2)'],answers:[0,2,4]})],
 'M9-STP-02':[
 bucket('Gieo xúc xắc sáu mặt. Kéo mỗi biến cố vào nhóm.', ['Số chấm < 7','Số chấm = 0','Số chấm chẵn'],[0,1,2]),
 task('Ghép không gian mẫu và kết quả thuận lợi khi gieo một đồng xu cân đối.', 'Không gian mẫu gồm sấp và ngửa. Biến cố xuất hiện mặt ngửa có một kết quả thuận lợi.',{kind:'FORMULA_SNAP_BUILDER',labels:['Không gian mẫu','Thuận lợi cho mặt ngửa'],tokens:['{Sấp; Ngửa}','{Ngửa}','{Sấp}','{1; 2; 3; 4; 5; 6}'],answers:[0,1]}),
 task('Ghép số kết quả và xác suất xuất hiện số chấm chẵn trên xúc xắc cân đối.', 'Ba kết quả chẵn là 2, 4, 6; xác suất 3/6 = 1/2.',{kind:'FORMULA_SNAP_BUILDER',labels:['Tổng kết quả','Số thuận lợi','Xác suất'],tokens:['6','3','1/2','1/3','2'],answers:[0,1,2]}),
 bucket('Túi có 5 bi đỏ và 3 bi xanh. Rút một bi, phân loại biến cố.', ['Bi đỏ hoặc xanh','Bi vàng','Bi đỏ','Bi xanh'],[0,1,2,2]),
 task('Rút đều một thẻ trong các thẻ 1, 2, 3, 4, 5. Ghép thông tin biến cố số lớn hơn 3.', 'Thuận lợi là {4; 5}, có 2 kết quả trong 5 kết quả đồng khả năng.',{kind:'FORMULA_SNAP_BUILDER',labels:['Thuận lợi','Xác suất'],tokens:['{4; 5}','{3; 4; 5}','2/5','3/5'],answers:[0,2]}),
 bucket('Tự kiểm tra: rút một thẻ trong các thẻ 1 đến 10.', ['Số từ 1 đến 10','Số bằng 11','Số chia hết cho 3','Số không lớn hơn 5'],[0,1,2,2])]
};
export function pilotLesson(id:string):Lesson|undefined{const tasks=bank[id],row=curriculum.find(r=>r.id===id);if(!tasks||!row)return;const lesson=buildRecognition({id,title:row.title,tasks},'pilot-'+id);lesson.topicIds=[id,row.engine];lesson.learningObjectives=[row.objective];lesson.checkpoints.forEach((cp,i)=>{cp.hints=[tasks[i].hint]; const u=tasks[i].uime!; if(u.kind==='PARABOLA_SLIDER')cp.scenePatch.setState!.x=u.answers[0]===u.min?u.max:u.min;});return lesson;}
export function importPilot(raw:string):Lesson{const parsed=JSON.parse(raw);const errors=validateLesson(parsed);if(errors.length)throw Error(errors.join('\n'));const lesson=parsed as Lesson;if(lesson.grade!==9||lesson.checkpoints.length!==6||lesson.recognition?.length!==6)throw Error('Bản thử yêu cầu bài lớp 9 với đúng 6 bước recognition.');lesson.recognition.forEach((t,i)=>{if(t.question!==lesson.checkpoints[i].instruction||t.explanation!==lesson.checkpoints[i].feedback.success)throw Error(`Bước ${i+1}: câu hỏi/giải thích không khớp checkpoint.`);});checkReachable(lesson);return{...lesson,lessonId:'lesson-import-'+crypto.randomUUID(),status:'draft',version:1};}
export function aiBundle(lesson:Lesson){return{instructions:'Tạo biến thể bài Toán 9 cùng mục tiêu, đúng 6 checkpoint. Trả về CHỈ JSON bài học, không bọc bundle. Đồng bộ recognition.question với checkpoints.instruction và explanation với feedback.success; cập nhật tokens/answers, scenePatch và điều kiện đạt. Chỉ dùng engine đang có; không thêm mã thực thi. Giữ schemaVersion 1.0.0, grade 9, status draft. Nội dung toán phải được người soạn duyệt.',schema:{...schema,required:[...new Set([...schema.required,'recognition'])],properties:{...schema.properties,grade:{...schema.properties.grade,const:9},status:{...schema.properties.status,const:'draft'},checkpoints:{...schema.properties.checkpoints,minItems:6,maxItems:6},recognition:{...schema.properties.recognition,minItems:6,maxItems:6}}},lesson};}
