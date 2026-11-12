import type {ProblemBlueprint} from './blueprint';
import type {Lesson,Checkpoint} from '../lesson-contract';
import {extraEngineMap,isExtraModel,type ExtraModel} from '../lesson-runtime/extra-models';
export const extraExamples:ProblemBlueprint[]=[
  {formatVersion:'1.0.0',id:'percent-of-a-whole',title:'Một phần trăm là bao nhiêu?',grade:6,problem:{type:'percentage_grid',statement:'Tô 25% và tìm 25% của 80.',given:{total:80,percent:25},answer:{value:20}}},
  {formatVersion:'1.0.0',id:'ratio-double-line',title:'Gấp lên cùng nhau',grade:7,problem:{type:'ratio_table',statement:'Tỉ lệ 2 : 3. Khi gấp 4 lần, hai lượng bằng bao nhiêu?',given:{first:2,second:3,multiplier:4},answer:{first:8,second:12}}},
  {formatVersion:'1.0.0',id:'coordinate-find-point',title:'Đặt điểm vào đúng chỗ',grade:7,problem:{type:'coordinate_plane',statement:'Đặt điểm M tại (3; −2).',given:{x:3,y:-2},answer:{x:3,y:-2}}},
  {formatVersion:'1.0.0',id:'rectangle-area-lab',title:'Kéo cạnh, đếm ô',grade:6,problem:{type:'rectangle_area',statement:'Dựng hình chữ nhật dài 5, rộng 3. Tìm diện tích.',given:{width:5,height:3},answer:{area:15,perimeter:16}}},
  {formatVersion:'1.0.0',id:'right-triangle-squares',title:'Ba cạnh và những ô vuông',grade:8,problem:{type:'pythagorean',statement:'Hai cạnh góc vuông dài 3 và 4. Tìm cạnh huyền.',given:{legA:3,legB:4},answer:{hypotenuse:5}}},
  {formatVersion:'1.0.0',id:'linear-graph-lab',title:'Một đường thẳng biết kể chuyện',grade:8,problem:{type:'linear_graph',statement:'Dựng đồ thị y = 2x + 1.',given:{slope:2,intercept:1},answer:{slope:2,intercept:1}}},
];
export const extraFields:Record<ExtraModel,string[]>={percentage_grid:['total','percent'],ratio_table:['first','second','multiplier'],coordinate_plane:['x','y'],rectangle_area:['width','height'],pythagorean:['legA','legB'],linear_graph:['slope','intercept']};
export function expectedExtra(p:ProblemBlueprint):Record<string,number>{const g=p.problem.given;switch(p.problem.type){
  case'percentage_grid':if(g.total<=0||g.total>1000000||!Number.isInteger(g.percent)||g.percent<0||g.percent>100)throw Error('Tổng ban đầu phải dương; phần trăm là số nguyên 0–100.');return{value:g.total*g.percent/100};
  case'ratio_table':if(g.first<=0||g.second<=0||g.first>100000||g.second>100000||g.multiplier<0||g.multiplier>10)throw Error('Hai lượng phải dương; số lần gấp từ 0 đến 10.');return{first:g.first*g.multiplier,second:g.second*g.multiplier};
  case'coordinate_plane':if(Math.abs(g.x)>10||Math.abs(g.y)>10)throw Error('Vị trí ngang và dọc từ −10 đến 10.');return{x:g.x,y:g.y};
  case'rectangle_area':if([g.width,g.height].some(n=>n<1||n>10))throw Error('Độ dài các cạnh từ 1 đến 10.');return{area:g.width*g.height,perimeter:2*(g.width+g.height)};
  case'pythagorean':if([g.legA,g.legB].some(n=>n<1||n>10))throw Error('Hai cạnh góc vuông từ 1 đến 10.');return{hypotenuse:Math.hypot(g.legA,g.legB)};
  case'linear_graph':if(Math.abs(g.slope)>10||Math.abs(g.intercept)>10)throw Error('Độ dốc và độ cao ban đầu từ −10 đến 10.');return{slope:g.slope,intercept:g.intercept};
  default:throw Error('Dạng bài chưa được hỗ trợ.');
}}
const variation=(n:number)=>n<9?n+1:n-1;
export function buildExtra(p:ProblemBlueprint):Lesson{
  if(!isExtraModel(p.problem.type))throw Error('Unsupported model');const model=p.problem.type,g=p.problem.given;
  const configs:Record<ExtraModel,{params:Record<string,number>;instruction:string;practice:string;patch:Record<string,number>}>= {
    percentage_grid:{params:{x:0,b:g.total,targetX:g.percent},instruction:`Tô ${g.percent}% số ô.`,practice:`Thử tô ${g.percent<=50?g.percent+25:g.percent-25}%.`,patch:{x:0,targetX:g.percent<=50?g.percent+25:g.percent-25}},
    ratio_table:{params:{x:1,a:g.first,b:g.second,targetX:g.multiplier},instruction:`Gấp cả hai lượng ${g.multiplier} lần.`,practice:`Giữ tỉ lệ, thử gấp ${variation(g.multiplier)} lần.`,patch:{x:0,targetX:variation(g.multiplier)}},
    coordinate_plane:{params:{x:0,y:0,targetX:g.x,targetY:g.y},instruction:`Kéo M đến (${g.x}; ${g.y}).`,practice:`Đặt M tại (${-g.x}; ${g.y===0?1:-g.y}).`,patch:{x:0,y:0,targetX:-g.x,targetY:g.y===0?1:-g.y}},
    rectangle_area:{params:{width:1,height:1,targetWidth:g.width,targetHeight:g.height},instruction:`Dựng hình dài ${g.width}, rộng ${g.height}.`,practice:`Giữ chiều rộng, đổi chiều dài thành ${variation(g.width)}.`,patch:{width:1,targetWidth:variation(g.width)}},
    pythagorean:{params:{width:1,height:1,targetWidth:g.legA,targetHeight:g.legB},instruction:`Đặt hai cạnh góc vuông bằng ${g.legA} và ${g.legB}.`,practice:`Đổi cạnh thứ nhất thành ${variation(g.legA)}.`,patch:{width:1,targetWidth:variation(g.legA)}},
    linear_graph:{params:{x:0,a:0,b:0,targetA:g.slope,targetB:g.intercept},instruction:`Khớp đường thẳng y = ${g.slope}x + ${g.intercept}.`,practice:'Dịch đường thẳng lên một đơn vị.',patch:{targetB:g.intercept<10?g.intercept+1:g.intercept-1}},
  };const config=configs[model];if(model==='linear_graph'&&g.intercept>=10)config.practice='Dịch đường thẳng xuống một đơn vị.';
  const step=(order:number,instruction:string,target:boolean,patch:Record<string,number>={}):Checkpoint=>({id:`cp-${order}`,order,instruction,allowedInteractions:['adjust_parameter'],scenePatch:{setState:patch},successCriteria:target?{op:'all',conditions:[{op:'gte',path:'metrics.parameterChangeCountSinceCheckpoint',value:1},{op:'approx',path:'metrics.modelError',value:0,tolerance:.025}]}:{op:'gte',path:'metrics.parameterChangeCountSinceCheckpoint',value:1},hints:[target?'Đưa hình đến vị trí nét đứt.':'Kéo thử trên hình.'],feedback:{success:'Đúng rồi!'}});
  const checkpoints=[step(1,'Kéo thử và quan sát.',false),step(2,config.instruction,true),step(3,config.practice,true,config.patch)];
  return{schemaVersion:'1.0.0',lessonId:p.id,version:1,status:'draft',locale:'vi-VN',title:p.title,grade:p.grade,subject:'math',topicIds:[model],learningObjectives:[p.problem.statement],engine:{type:extraEngineMap[model],minRuntimeVersion:'1.0.0',requiredCapabilities:['adjust_parameter',model]},scene:{sceneId:p.id.slice(0,94)+'-scene',coordinateSystem:'cartesian_2d',viewport:{width:360,height:360},objects:[{id:'model',kind:'math_model',model,parameters:config.params}],initialState:{}},checkpoints,completion:{requiredCheckpointIds:checkpoints.map(c=>c.id)}};
}
