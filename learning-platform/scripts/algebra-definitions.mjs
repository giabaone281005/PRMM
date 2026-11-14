export const obj=properties=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
const coefficient={type:'integer',minimum:-9,maximum:9};
const fields=keys=>Object.fromEntries(keys.map(k=>[k,coefficient]));
export const algebraDataSchemas={
 product_equation:obj(fields(['p','q','r','s'])),
 rational_equation:obj(fields(['p','q','r','s','d','e','f','g','k'])),
 quadratic_equation:obj({...fields(['a','b','c']),degreePolicy:{enum:['quadratic_only','allow_linear']}}),
 viete:obj(fields(['a','b','c'])),
};
const samples={
 product_equation:[{p:1,q:-2,r:1,s:3},{p:2,q:-1,r:1,s:-4},{p:1,q:-2,r:1,s:-2}],
 rational_equation:[{p:1,q:-2,r:1,s:3,d:1,e:-2,f:0,g:1,k:0},{p:1,q:-2,r:1,s:2,d:1,e:-1,f:1,g:1,k:1},{p:1,q:-1,r:1,s:-2,d:1,e:-1,f:1,g:-2,k:1}],
 quadratic_equation:[{a:1,b:-3,c:2,degreePolicy:'quadratic_only'},{a:1,b:2,c:1,degreePolicy:'quadratic_only'},{a:1,b:0,c:2,degreePolicy:'quadratic_only'}],
 viete:[{a:1,b:-3,c:2},{a:2,b:4,c:2},{a:-1,b:2,c:3}],
};
const labels={product_equation:'Phương trình tích',rational_equation:'Phương trình hữu tỉ · Điều kiện xác định',quadratic_equation:'Hệ số, Δ và nghiệm · Hạ bậc có chủ đích',viete:'Viète · Ghép tổng, tích và cặp nghiệm thực'};
const fieldLabels={p:'Hệ số x · nhân tử tử số thứ nhất',q:'Hằng số · nhân tử tử số thứ nhất',r:'Hệ số x · nhân tử tử số thứ hai',s:'Hằng số · nhân tử tử số thứ hai',d:'Hệ số x · nhân tử mẫu thứ nhất',e:'Hằng số · nhân tử mẫu thứ nhất',f:'Hệ số x · nhân tử mẫu thứ hai',g:'Hằng số · nhân tử mẫu thứ hai',k:'Hằng số vế phải',a:'Hệ số bình phương x',b:'Hệ số x',c:'Hằng số tự do',degreePolicy:'Quy tắc bậc phương trình'};
export const algebraCatalog=Object.entries(algebraDataSchemas).map(([mode,schema])=>{
 const templateId='math9-algebra-'+mode.replaceAll('_','-'),curriculumCode=['product_equation','rational_equation'].includes(mode)?'M9-ALG-03':mode==='quadratic_equation'?'M9-ALG-10':'M9-ALG-11',sets=samples[mode];
 return {templateId,curriculumCode,mode,label:labels[mode],schema,form:Object.entries(schema.properties).map(([key,rule])=>({key,label:fieldLabels[key],symbol:key==='degreePolicy'?undefined:key,help:key==='degreePolicy'?'Chỉ bậc hai yêu cầu a khác 0. Cho phép hạ bậc sẽ xử lý cả tuyến tính, hằng đúng và hằng sai.':['d','e','f','g'].includes(key)?'Mẫu là (dx + e)(fx + g). d khác 0; dùng f = 0, g = 1 nếu chỉ cần một nhân tử. Giá trị cấm được suy ra, không nhập đáp án riêng.':mode==='viete'?'Số nguyên −9…9; a khác 0 và Δ không âm để có cặp nghiệm thực.':'Số nguyên −9…9. Tử/tích: (px + q)(rx + s), p và r khác 0; phương trình chuẩn: ax² + bx + c = 0.'})),example:{authoringVersion:'1.0.0',namespace:'excel-repo-v1',templateVersion:1,templateId,curriculumCode,mode,title:labels[mode],parameters:sets[0],variants:{practice:sets[1],assessment:sets[2]}}};
});
