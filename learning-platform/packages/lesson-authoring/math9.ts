import {validateLesson,type Lesson} from '../lesson-contract';
import {uimeInitial,type UimeConfig} from '../lesson-runtime/uime';
export type RecognitionTask={question:string;mode:'tap'|'drag'|'formula';choices:string[];correct:number;explanation:string;hint:string;diagram:'none'|'triangle'|'circle'|'cone'|'chart';uime?:UimeConfig};
export type RecognitionTopic={id:string;title:string;tasks:RecognitionTask[]};
const q=(question:string,answer:string,others:string[],explanation:string,diagram:RecognitionTask['diagram']='none',mode:RecognitionTask['mode']='drag'):RecognitionTask=>({question,choices:[others[0],answer,...others.slice(1)],correct:2,explanation,hint:'Đối chiếu định nghĩa và các yếu tố đã cho.',diagram,mode});
export const math9Topics:RecognitionTopic[]=[
 {id:'linear-system',title:'Phương trình và hệ hai ẩn',tasks:[
 q('Ghép phương trình bậc nhất hai ẩn vào ô nhận diện.','2x − 3y = 5',['x² + y = 4','0x + 0y = 1','xy = 3'],'Dạng ax + by = c, trong đó a và b không đồng thời bằng 0.'),
 q('Ghép phương trình nhận (2; 1) là nghiệm.','x + y = 3',['2x + y = 4','x − y = 3','3x − y = 2'],'Thay x = 2 và y = 1: 2 + 1 = 3.'),
 q('Điền bộ hệ số (a; b; c) của 5x − 7y = 9.','(5; −7; 9)',['(5; 7; 9)','(−7; 5; 9)'],'Giữ nguyên dấu của hệ số b = −7.','none','formula'),
 q('Nhận diện hệ hai phương trình bậc nhất hai ẩn.','x + y = 3; 2x − y = 0',['x² + y = 3; x − y = 0','xy = 3; x + y = 0'],'Mỗi phương trình đều có dạng ax + by = c với (a; b) khác (0; 0).') ]},
 {id:'inequality',title:'Phương trình và bất phương trình',tasks:[
 q('Nhận diện bất phương trình bậc nhất một ẩn.','4x − 7 > 0',['x² − 1 ≤ 0','2/x + 3 < 0','0x + 5 ≥ 0'],'Dạng ax + b > 0 (hoặc <, ≤, ≥) với a khác 0.'),
 q('Điền dấu: x < y ⇒ −2x … −2y.','>',['<','=','≤'],'Nhân hai vế với số âm phải đổi chiều bất đẳng thức.','none','formula'),
 q('Ghép cách biểu diễn tập nghiệm x ≥ 3.','Chấm kín tại 3, tia sang phải',['Chấm rỗng tại 3, tia sang phải','Chấm kín tại 3, tia sang trái'],'Dấu ≥ lấy cả mốc 3 và các số lớn hơn 3.'),
 q('Nhận diện phương trình bậc nhất một ẩn.','3x − 2 = 0',['x² = 4','0x + 2 = 0'],'Dạng ax + b = 0 với a khác 0.') ]},
 {id:'radicals',title:'Căn bậc hai và căn bậc ba',tasks:[
 q('Ghép căn bậc hai số học của 64.','8',['−8','±8','16'],'Căn bậc hai số học luôn không âm; 8² = 64.'),
 q('Điền điều kiện để √(2x − 6) có nghĩa.','x ≥ 3',['x > 3','x ≤ 3','x ≥ 0'],'2x − 6 ≥ 0 tương đương x ≥ 3.','none','formula'),
 q('Hoàn thành: √(m²) = … với mọi m.','|m|',['m','−m','m²'],'Giá trị tuyệt đối bảo đảm kết quả không âm.','none','formula'),
 q('Ghép giá trị ∛(−125).','−5',['5','Không xác định','±5'],'(−5)³ = −125. Căn bậc ba tồn tại với mọi số thực.'),
 q('Điền định nghĩa √a = x.','x ≥ 0 và x² = a',['x² = a là đủ','x ≤ 0 và x² = a'],'Căn bậc hai số học là nghiệm không âm.','none','formula') ]},
 {id:'quadratic',title:'Parabol, phương trình bậc hai và Viète',tasks:[
 q('Ghép bộ hệ số của 2x² − 4x + 1 = 0.','(2; −4; 1)',['(2; 4; 1)','(−4; 2; 1)'],'Dạng ax² + bx + c = 0 với a khác 0.'),
 q('Điền công thức biệt thức Δ.','b² − 4ac',['b² + 4ac','a² − 4bc'],'Biệt thức của phương trình bậc hai là Δ = b² − 4ac.','none','formula'),
 q('Ghép điều kiện phương trình bậc hai vô nghiệm thực.','Δ < 0',['Δ = 0','Δ > 0'],'Δ < 0: vô nghiệm thực; Δ = 0: nghiệm kép; Δ > 0: hai nghiệm phân biệt.'),
 q('Điền tổng hai nghiệm của x² − 6x + 8 = 0.','6',['−6','8','−8'],'Theo Viète: x₁ + x₂ = −b/a = 6.','none','formula'),
 q('Điền tích hai nghiệm theo Viète.','c/a',['−b/a','−c/a'],'Nếu có hai nghiệm thực (kể cả nghiệm kép), x₁x₂ = c/a.','none','formula'),
 q('Ghép mô tả đồ thị y = ax² khi a < 0.','Đỉnh O, bề lõm quay xuống',['Đỉnh O, bề lõm quay lên','Đỉnh (0; a)'],'Đỉnh luôn ở O; dấu a quyết định hướng bề lõm.') ]},
 {id:'triangle',title:'Tam giác vuông và lượng giác',tasks:[
 q('Tam giác ABC vuông tại A. Chạm nhãn cạnh huyền.','BC',['AB','AC'],'Cạnh đối diện góc vuông A là BC.','triangle','tap'),
 q('Xét góc B. Chạm nhãn cạnh đối.','AC',['AB','BC'],'AC đối diện góc B; AB là cạnh kề.','triangle','tap'),
 q('Điền cos B trong tam giác ABC vuông tại A.','AB/BC',['AC/BC','AC/AB','AB/AC'],'cos = cạnh kề / cạnh huyền.','triangle','formula'),
 q('Điền sin B.','AC/BC',['AB/BC','AB/AC'],'sin = đối / huyền.','triangle','formula'),
 q('Điền tan B.','AC/AB',['AB/AC','AC/BC'],'tan = đối / kề; cot = kề / đối.','triangle','formula'),
 q('AH là đường cao xuống BC. Ghép hệ thức đúng.','AH² = BH × CH',['AH² = AB × AC','BC² = AB² − AC²'],'Bình phương đường cao bằng tích hai hình chiếu.','triangle'),
 q('Ghép hệ thức hình chiếu của cạnh AB.','AB² = BH × BC',['AB² = CH × BC','AB² = BH × CH'],'Bình phương cạnh góc vuông bằng cạnh huyền nhân hình chiếu tương ứng.','triangle'),
 q('Ghép hệ thức diện tích của tam giác vuông.','BC × AH = AB × AC',['BC × AB = AH × AC','AH = AB + AC'],'Hai cách tính hai lần diện tích: BC × AH = AB × AC.','triangle') ]},
 {id:'circle',title:'Đường tròn, dây cung và tiếp tuyến',tasks:[
 q('Chạm nhãn tâm đối xứng của đường tròn.','O',['H','A'],'Tâm O là tâm đối xứng; mọi đường kính là trục đối xứng.','circle','tap'),
 q('Bán kính 5 cm. Ghép độ dài dây cung lớn nhất.','10 cm',['5 cm','25 cm','5π cm'],'Đường kính là dây lớn nhất, dài 2R = 10 cm.','circle'),
 q('Điền điều kiện đường thẳng tiếp xúc đường tròn.','d = R',['d < R','d > R'],'Tiếp xúc: một điểm chung, bán kính vuông góc tiếp tuyến.','circle','formula'),
 q('Ghép số điểm chung khi d < R.','2',['1','0'],'Đường thẳng cắt đường tròn tại hai điểm.','circle'),
 q('Ghép số điểm chung khi d > R.','0',['1','2'],'Khoảng cách lớn hơn bán kính: không giao nhau.','circle'),
 q('Đường kính vuông góc với một dây. Ghép tính chất.','Đi qua trung điểm dây',['Đi qua đầu mút dây','Song song với dây'],'Đường kính vuông góc với dây thì chia đôi dây.','circle') ]},
 {id:'angles',title:'Góc và tứ giác nội tiếp',tasks:[
 q('Ghép tên góc có đỉnh trên đường tròn, hai cạnh chứa hai dây.','Góc nội tiếp',['Góc ở tâm','Góc ngoài đường tròn'],'Đỉnh góc nội tiếp thuộc đường tròn.','circle'),
 q('Ghép tên góc có đỉnh trùng tâm O.','Góc ở tâm',['Góc nội tiếp','Góc bẹt'],'Đỉnh góc ở tâm là tâm đường tròn.','circle'),
 q('Điền góc nội tiếp cùng chắn cung với góc ở tâm 80°.','40°',['80°','160°'],'Góc nội tiếp bằng nửa góc ở tâm cùng chắn một cung.','circle','formula'),
 q('Góc nội tiếp chắn nửa đường tròn bằng bao nhiêu?','90°',['45°','180°'],'Góc nội tiếp chắn đường kính là góc vuông.','circle'),
 q('Tứ giác MNPQ nội tiếp, góc M = 80°. Điền góc P.','100°',['80°','90°','120°'],'Hai góc đối của tứ giác nội tiếp có tổng 180°.','circle','formula'),
 q('Ghép định nghĩa tứ giác nội tiếp.','Bốn đỉnh cùng thuộc một đường tròn',['Bốn cạnh bằng nhau','Hai cạnh song song'],'Điều kiện là cả bốn đỉnh cùng nằm trên một đường tròn.','circle') ]},
 {id:'solids',title:'Hình trụ, hình nón và hình cầu',tasks:[
 q('Chạm nhãn đường sinh của hình nón.','l',['h','r'],'l nối đỉnh với một điểm trên đường tròn đáy.','cone','tap'),
 q('Điền thể tích hình nón.','V = πr²h/3',['V = πr²h','V = 4πr³/3'],'Hình nón có thể tích bằng một phần ba hình trụ cùng đáy và chiều cao.','cone','formula'),
 q('Điền hệ thức của hình nón.','l² = r² + h²',['l = r + h','h² = l² + r²'],'Áp dụng Pythagore trong mặt cắt qua trục.','cone','formula'),
 q('Điền diện tích xung quanh hình nón.','S = πrl',['S = 2πrh','S = πr²'],'Diện tích xung quanh hình nón là πrl.','cone','formula'),
 q('Điền thể tích hình trụ.','V = πr²h',['V = πr²h/3','V = 4πr³/3'],'Diện tích đáy πr² nhân chiều cao h.','none','formula'),
 q('Điền diện tích xung quanh hình trụ.','S = 2πrh',['S = πrl','S = 4πr²'],'Chu vi đáy 2πr nhân chiều cao h.','none','formula'),
 q('Điền diện tích mặt cầu.','S = 4πR²',['S = πR²','S = 2πRh'],'Diện tích mặt cầu là 4πR².','none','formula'),
 q('Điền thể tích hình cầu.','V = 4πR³/3',['V = πR²h','V = 4πR²'],'Thể tích hình cầu là 4πR³/3.','none','formula') ]},
 {id:'statistics',title:'Tần số và tần số tương đối',tasks:[
 q('Chạm cột có tần số 10 trong biểu đồ điểm.','Điểm 10',['Điểm 8','Điểm 9'],'Tần số là số lần xuất hiện của giá trị.','chart','tap'),
 q('40 học sinh, 10 bạn điểm 10. Điền tần số tương đối.','25%',['10%','40%','50%'],'10/40 × 100% = 25%.','chart','formula'),
 q('Điền công thức tần số tương đối.','f = m/N × 100%',['f = N/m × 100%','f = m × N'],'m là tần số; N là cỡ mẫu.','none','formula'),
 q('Ghép biểu đồ thích hợp để biểu diễn tỉ lệ phần trăm.','Biểu đồ quạt tròn',['Trục số','Sơ đồ tam giác'],'Các hình quạt biểu diễn từng phần của toàn thể.') ]},
 {id:'probability',title:'Phép thử và biến cố',tasks:[
 q('Gieo xúc xắc: ghép biến cố chắc chắn.','Số chấm nhỏ hơn 7',['Số chấm bằng 6','Số chấm bằng 0'],'Mọi kết quả 1–6 đều nhỏ hơn 7.'),
 q('Gieo xúc xắc: ghép biến cố không thể.','Số chấm bằng 0',['Số chấm chẵn','Số chấm nhỏ hơn 7'],'Không có mặt 0 chấm.'),
 q('Gieo xúc xắc: ghép biến cố ngẫu nhiên.','Số chấm chẵn',['Số chấm lớn hơn 6','Số chấm nhỏ hơn 7'],'Có thể xảy ra (2, 4, 6) nhưng không luôn xảy ra.'),
 q('Ghép không gian mẫu của một lần gieo xúc xắc.','{1; 2; 3; 4; 5; 6}',['{0; 1; 2; 3; 4; 5}','{2; 4; 6}'],'Không gian mẫu chứa tất cả kết quả có thể xảy ra.'),
 q('Điền công thức xác suất khi các kết quả đồng khả năng.','P(A) = n(A)/n(Ω)',['P(A) = n(Ω)/n(A)','P(A) = n(A) × n(Ω)'],'Lấy số kết quả thuận lợi chia tổng số kết quả đồng khả năng.','none','formula') ]},
];
export function buildRecognition(topic:RecognitionTopic,id:string,title=topic.title):Lesson{
 topic=structuredClone(topic);
 topic.tasks.forEach((t,i)=>{const shift=i%t.choices.length;t.choices=[...t.choices.slice(shift),...t.choices.slice(0,shift)];t.correct=(t.correct-1-shift+t.choices.length)%t.choices.length+1;});
 const checkpoints=topic.tasks.map((t,i)=>({id:`cp-${i+1}`,order:i+1,instruction:t.question,allowedInteractions:['adjust_parameter'] as const,scenePatch:{setState:{x:0,targetX:t.correct,...(t.uime?uimeInitial(t.uime):{})}},successCriteria:{op:'all',conditions:[{op:'gte',path:'metrics.parameterChangeCountSinceCheckpoint',value:1},{op:'approx',path:'metrics.modelError',value:0,tolerance:.000001}]},hints:[t.hint],feedback:{success:t.explanation}}));
 checkpoints.forEach((cp,i)=>{const u=topic.tasks[i].uime;if(u?.kind==='PARABOLA_SLIDER'&&!u.parabola&&!u.graph)cp.scenePatch.setState.x=u.answers[0]===u.min?u.max:u.min;});
 const lesson={schemaVersion:'1.0.0',lessonId:id,version:1,status:'draft',locale:'vi-VN',title,grade:9,subject:'math',topicIds:['math9-recognition',topic.id],learningObjectives:['Nhận biết kiến thức: '+topic.title],engine:{type:'math_explorer_2d',minRuntimeVersion:'1.0.0',requiredCapabilities:['adjust_parameter']},scene:{sceneId:id+'-scene',coordinateSystem:'cartesian_2d',viewport:{width:360,height:360},objects:[{id:'model',kind:'math_model',model:'number_line',parameters:{x:0,targetX:2}}],initialState:{}},recognition:topic.tasks,checkpoints,completion:{requiredCheckpointIds:checkpoints.map(c=>c.id)}} as unknown as Lesson;
 const errors=validateLesson(lesson);if(errors.length)throw Error(errors.join('; '));return lesson;
}
