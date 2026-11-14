import {graphSolution,type GraphData,type GraphMode} from './cartesian';
export const algebraModes=['product_equation','rational_equation','quadratic_equation','viete'] as const;
export type AlgebraMode=typeof algebraModes[number];
export type AlgebraData=Record<string,number|string>;
export type AlgebraConfig={mode:AlgebraMode;data:AlgebraData;task:'explore'|'identify'|'discover'|'guided'|'practice'|'assessment'};
export type Expr={id:string}&({op:'const';value:number}|{op:'var';name:'x'}|{op:'add'|'mul';terms:Expr[]}|{op:'div';numerator:Expr;denominator:Expr});
export type AlgebraCard={id:string;kind:'number'|'variable'|'factor'|'formula';label:string;value?:number};
export type PolynomialResult={degree:0|1|2;delta:number|null;kind:'none'|'one'|'two'|'all';roots:number[]};
const eps=1e-8;
const unique=(values:number[])=>values.sort((a,b)=>a-b).filter((v,i,a)=>i===0||Math.abs(v-a[i-1])>eps);
export const algebraFormat=(value:number)=>String(Number(value.toFixed(6)));
const constant=(id:string,value:number):Expr=>({id,op:'const',value});
const variable=(id:string):Expr=>({id,op:'var',name:'x'});
const linear=(id:string,a:number,b:number):Expr=>({id,op:'add',terms:[{id:id+'-ax',op:'mul',terms:[constant(id+'-a',a),variable(id+'-x')]},constant(id+'-b',b)]});
export function evaluateExpr(expr:Expr,x:number):number|null{
 switch(expr.op){
  case 'const':return expr.value;
  case 'var':return x;
  case 'add':case 'mul':{const values=expr.terms.map(t=>evaluateExpr(t,x));return values.some(v=>v===null)?null:expr.op==='add'?values.reduce<number>((a,b)=>a+b!,0):values.reduce<number>((a,b)=>a*b!,1);}
  case 'div':{const n=evaluateExpr(expr.numerator,x),d=evaluateExpr(expr.denominator,x);return n===null||d===null||Math.abs(d)<=eps?null:n/d;}
  default:throw Error('Phép toán ngoài AST đại số cho phép.');
 }
}
export function expressionText(e:Expr):string{
 if(e.op==='add'&&e.terms.length===2){const [term,c]=e.terms;if(term.op==='mul'&&term.terms.length===2&&term.terms[0].op==='const'&&term.terms[1].op==='var'&&c.op==='const'){const a=term.terms[0].value,b=c.value;if(a===0)return String(b);return `${a===1?'':a===-1?'−':a}x${b===0?'':b<0?' − '+Math.abs(b):' + '+b}`;}}
 switch(e.op){case 'const':return e.value<0?`(${e.value})`:String(e.value);case 'var':return 'x';case 'add':return e.terms.map(expressionText).join(' + ');case 'mul':return e.terms.map(t=>`(${expressionText(t)})`).join(' × ');case 'div':return `[${expressionText(e.numerator)}] / [${expressionText(e.denominator)}]`;}
}
export function algebraEquationText(g:AlgebraConfig){const eq=algebraEquation(g);return `${expressionText(eq.left)} = ${expressionText(eq.right)}`;}
export function algebraEquation(g:AlgebraConfig):{left:Expr;right:Expr}{
 const d=g.data,n=(k:string)=>Number(d[k]);
 if(g.mode==='product_equation'||g.mode==='rational_equation'){
  const numerator:Expr={id:'numerator',op:'mul',terms:[linear('factor-L',n('p'),n('q')),linear('factor-R',n('r'),n('s'))]};
  return {left:g.mode==='product_equation'?numerator:{id:'fraction',op:'div',numerator,denominator:{id:'denominator',op:'mul',terms:[linear('denominator-L',n('d'),n('e')),linear('denominator-R',n('f'),n('g'))]}},right:constant('rhs',g.mode==='product_equation'?0:n('k'))};
 }
 return {left:{id:'polynomial',op:'add',terms:[{id:'term-square',op:'mul',terms:[constant('coefficient-a',n('a')),variable('square-x-1'),variable('square-x-2')]},{id:'term-linear',op:'mul',terms:[constant('coefficient-b',n('b')),variable('linear-x')]},constant('coefficient-c',n('c'))]},right:constant('rhs',0)};
}
export function solvePolynomial(a:number,b:number,c:number):PolynomialResult{
 if(a===0){if(b===0)return {degree:0,delta:null,kind:c===0?'all':'none',roots:[]};return {degree:1,delta:null,kind:'one',roots:[-c/b]};}
 const delta=b*b-4*a*c,r=graphSolution({a:b,b:1,c:-c,q:a,snap:0},'line_parabola_intersection'),roots=r.points.map(p=>p.x);
 return {degree:2,delta,kind:roots.length===0?'none':roots.length===1?'one':'two',roots};
}
export function algebraModel(g:AlgebraConfig){
 const d=g.data,n=(k:string)=>Number(d[k]);
 const product=g.mode==='product_equation'||g.mode==='rational_equation',rational=g.mode==='rational_equation',a=product?n('p')*n('r')-(rational?n('k')*n('d')*n('f'):0):n('a'),b=product?n('p')*n('s')+n('q')*n('r')-(rational?n('k')*(n('d')*n('g')+n('e')*n('f')):0):n('b'),c=product?n('q')*n('s')-(rational?n('k')*n('e')*n('g'):0):n('c');
 const forbidden=rational?unique([-n('e')/n('d'),...(n('f')!==0?[-n('g')/n('f')]:[])]):[],candidate=solvePolynomial(a,b,c),isAllowed=(x:number)=>!rational||(Math.abs(n('d')*x+n('e'))>eps&&Math.abs(n('f')*x+n('g'))>eps),roots=candidate.roots.filter(isAllowed),extraneous=candidate.roots.filter(x=>!isAllowed(x));
 const kind=candidate.kind==='all'?'all':roots.length===0?'none':roots.length===1?'one':'two',sum=a!==0?-b/a:null,productValue=a!==0?c/a:null;
 return {a,b,c,degree:candidate.degree,delta:candidate.delta,candidates:candidate.roots,forbidden,roots,extraneous,kind,count:kind==='all'?3:roots.length,sum,product:productValue,equation:algebraEquation(g)};
}
export function algebraDomainPool(g:AlgebraConfig){return unique([...algebraModel(g).forbidden,-2,-1,0,1,2]);}
export function algebraDomainMask(g:AlgebraConfig){const m=algebraModel(g);return algebraDomainPool(g).reduce((mask,x,i)=>mask|(m.forbidden.some(f=>Math.abs(f-x)<eps)?1<<i:0),0);}
export function algebraCards(g:AlgebraConfig):AlgebraCard[]{
 const d=g.data;
 if(g.mode==='viete'&&g.task!=='identify')return [{id:'formula-sum',kind:'formula',label:'−b / a'},{id:'formula-product',kind:'formula',label:'c / a'},{id:'formula-sign-sum',kind:'formula',label:'b / a'},{id:'formula-sign-product',kind:'formula',label:'−c / a'}];
 if(g.mode==='product_equation')return [{id:'factor-L',kind:'factor',label:expressionText(linear('factor-L',Number(d.p),Number(d.q)))},{id:'factor-R',kind:'factor',label:expressionText(linear('factor-R',Number(d.r),Number(d.s)))},{id:'variable-x',kind:'variable',label:'x'},{id:'number-zero',kind:'number',label:'0',value:0}];
 if(g.mode==='rational_equation')return [];
 return [...unique([Number(d.a),Number(d.b),Number(d.c),-Number(d.a),-Number(d.b),-Number(d.c),0,1]).map((value,i)=>({id:'number-'+i,kind:'number' as const,label:String(value),value})),{id:'variable-x',kind:'variable',label:'x'}];
}
export function algebraSlotTargets(g:AlgebraConfig){if(g.mode==='product_equation'||g.mode==='viete'&&g.task!=='identify')return [0,1];if(g.mode==='rational_equation')return [];const cards=algebraCards(g);return ['a','b','c'].map(k=>cards.findIndex(card=>card.kind==='number'&&card.value===Number(g.data[k])));}
export function algebraSlotsCorrect(g:AlgebraConfig,s:Record<string,number|boolean>){const targets=algebraSlotTargets(g),values=['a','b','c'].slice(0,targets.length).map(k=>Number(s[k]));return g.mode==='product_equation'?values.length===2&&new Set(values).size===2&&values.every(v=>v===0||v===1):targets.every((v,i)=>v===values[i]);}
export const algebraOperations=[
 {id:'clear-denominator',label:'Nhân hai vế với mẫu, giữ điều kiện xác định'},
 {id:'zero-product',label:'Tách tích bằng 0 thành các nhân tử bằng 0'},
 {id:'divide-leading',label:'Chia hai vế cho hệ số a khác 0'},
 {id:'divide-first-factor',label:'Chia hai vế cho nhân tử thứ nhất'},
 {id:'square-both',label:'Bình phương hai vế · ngoài phạm vi kiểm chứng tổng quát'},
 {id:'negate-both',label:'Đổi dấu cả hai vế'},
 {id:'divide-zero',label:'Chia hai vế cho 0'},
] as const;
export function algebraDomainCorrect(g:AlgebraConfig,s:Record<string,number|boolean>){return g.mode!=='rational_equation'||s.targetWidth===1&&s.denominator===algebraDomainMask(g);}
export function algebraOperationAllowed(g:AlgebraConfig,operation:number,domainAcknowledged:boolean){
 if(g.mode==='rational_equation'&&!domainAcknowledged)return false;
 if(operation===0)return g.mode==='rational_equation';
 if(operation===1)return g.mode==='product_equation';
 if(operation===2)return algebraModel(g).a!==0;
 if(operation===3)return g.mode==='rational_equation'&&algebraModel(g).forbidden.some(x=>Math.abs(Number(g.data.p)*x+Number(g.data.q))<eps);
 return operation===5;
}
export function algebraTransformed(g:AlgebraConfig,operation:number,domainAcknowledged:boolean):string|null{
 if(!algebraOperationAllowed(g,operation,domainAcknowledged))return null;const m=algebraModel(g),left=expressionText(m.equation.left),right=expressionText(m.equation.right),polynomial=`(${m.a})x² + (${m.b})x + (${m.c}) = 0`;
 if(operation===0)return polynomial+' (trên miền đã chốt)';
 if(operation===1)return `${expressionText(linear('L',Number(g.data.p),Number(g.data.q)))} = 0 hoặc ${expressionText(linear('R',Number(g.data.r),Number(g.data.s)))} = 0`;
 if(operation===2)return `x² + ((${m.b}) / (${m.a}))x + ((${m.c}) / (${m.a})) = 0`;
 if(operation===3){const factor=expressionText(linear('L',Number(g.data.p),Number(g.data.q)));return `(${left}) / (${factor}) = (${right}) / (${factor}), nhân tử này khác 0 trên miền đã chốt`;}return `−(${left}) = −(${right})`;
}
export function algebraInitial(){return {x:0,a:-1,b:-1,c:-1,y:-1,width:-999999,height:-999999,numerator:-1,denominator:0,targetY:0,targetWidth:0,targetA:-999999,targetB:-999999};}
export function validateAlgebraData(d:AlgebraData,mode:string):string[]{
 if(!algebraModes.includes(mode as AlgebraMode))return ['Mode đại số chưa được hỗ trợ.'];const errors:string[]=[],keys=mode==='product_equation'?['p','q','r','s']:mode==='rational_equation'?['p','q','r','s','d','e','f','g','k']:['a','b','c'];
 for(const key of keys)if(typeof d[key]!=='number'||!Number.isInteger(d[key])||Math.abs(Number(d[key]))>9)errors.push(`${key}: nhập số nguyên từ −9 đến 9.`);
 if(errors.length)return errors;
 if((mode==='product_equation'||mode==='rational_equation')&&(d.p===0||d.r===0))errors.push('Hệ số x của cả hai nhân tử tử số phải khác 0.');
 if(mode==='rational_equation'&&(d.d===0||d.f===0&&d.g===0))errors.push('Mẫu cần nhân tử bậc nhất d khác 0; nhân tử mẫu thứ hai không được đồng nhất bằng 0. Dùng f = 0, g = 1 nếu chỉ cần một nhân tử mẫu.');
 if(mode==='quadratic_equation'&&(!['quadratic_only','allow_linear'].includes(String(d.degreePolicy))||d.degreePolicy==='quadratic_only'&&d.a===0))errors.push('Mẫu bậc hai yêu cầu a khác 0. Chọn chế độ cho phép hạ bậc nếu cần a = 0.');
 if(mode==='viete'&&(d.a===0||Number(d.b)**2-4*Number(d.a)*Number(d.c)<0))errors.push('Viète trong phạm vi nghiệm thực cần a khác 0 và Δ không âm; đổi hệ số hoặc dùng mode Δ để xét vô nghiệm thực.');
 if(errors.length)return errors;
 const m=algebraModel({mode:mode as AlgebraMode,data:d,task:'guided'});if([...m.roots,...m.forbidden,...m.candidates].some(x=>!Number.isFinite(x)||Math.abs(x)>1000))errors.push('Nghiệm hoặc giá trị cấm vượt khoảng thao tác −1000…1000; giảm hệ số.');return errors;
}
export function validateAlgebra(g:AlgebraConfig){return [...validateAlgebraData(g.data,g.mode),...(!['explore','identify','discover','guided','practice','assessment'].includes(g.task)?['Nhiệm vụ đại số không hợp lệ.']:[])];}
export function algebraAccept(g:AlgebraConfig,name:string,value:number){
 if(!Number.isFinite(value))return false;
 if(name==='x')return value>=-1000&&value<=1000;
 if(g.task==='explore')return false;
 if(['a','b','c'].includes(name))return (name!=='c'||['quadratic_equation','viete'].includes(g.mode)&&g.task==='identify'||name==='c'&&g.mode==='quadratic_equation')&&Number.isInteger(value)&&value>=0&&value<algebraCards(g).length;
 if(name==='denominator')return Number.isInteger(value)&&value>=0&&(g.mode==='rational_equation'?value<(1<<algebraDomainPool(g).length):g.mode==='quadratic_equation'&&value<=2);
 if(name==='targetWidth')return g.mode==='rational_equation'&&value===1;
 if(g.task==='identify')return false;
 if(name==='y')return Number.isInteger(value)&&value>=0&&value<algebraOperations.length;
 if(name==='numerator')return Number.isInteger(value)&&value>=0&&value<=3;
 if(name==='width'||name==='height')return value===-999999||value>=-1000&&value<=1000;
 if(name==='targetA'||name==='targetB')return Math.abs(value)<=1000000&&(name==='targetA'||g.mode==='viete');
 return name==='targetY'&&value===1;
}
export function applyAlgebraInteraction(_g:AlgebraConfig,s:Record<string,number|boolean>,name:string,value:number){s[name]=value;if(name==='denominator')s.targetWidth=0;if(!['x','targetY'].includes(name))s.targetY=0;}
export function algebraRootInputs(g:AlgebraConfig){const m=algebraModel(g);return g.mode==='viete'&&m.roots.length===1?[m.roots[0],m.roots[0]]:m.roots;}
export function algebraRootsCorrect(g:AlgebraConfig,s:Record<string,number|boolean>){const roots=algebraRootInputs(g),m=algebraModel(g);if(s.numerator!==m.count)return false;const values=[Number(s.width),Number(s.height)],match=(a:number,b:number)=>Math.abs(a-b)<=1e-5;if(roots.length===0)return values.every(x=>x===-999999);if(g.mode==='rational_equation'&&values.filter(x=>x!==-999999).some(x=>m.forbidden.some(f=>Math.abs(x-f)<eps)))return false;return roots.length===1?match(values[0],roots[0])&&values[1]===-999999:match(values[0],roots[0])&&match(values[1],roots[1])||match(values[0],roots[1])&&match(values[1],roots[0]);}
export function algebraError(g:AlgebraConfig,s:Record<string,number|boolean>){
 const m=algebraModel(g),domain=algebraDomainCorrect(g,s),operation=algebraOperationAllowed(g,Number(s.y),domain),slots=algebraSlotsCorrect(g,s),close=(a:number,b:number)=>Math.abs(a-b)<=1e-5;
 if(g.task==='explore')return Math.abs(Number(s.x))>=.01?0:1;
 if(g.task==='identify')return (g.mode==='rational_equation'?domain:slots)?0:1;
 if(s.targetY!==1)return 1;
 const viete=slots&&close(Number(s.targetA),m.sum!)&&close(Number(s.targetB),m.product!);
 const quadratic=s.denominator===m.degree&&(m.degree!==2||close(Number(s.targetA),m.delta!))&&s.numerator===m.count;
 if(g.task==='discover')return (g.mode==='quadratic_equation'?quadratic:g.mode==='viete'?viete:domain&&operation)?0:1;
 return domain&&operation&&algebraRootsCorrect(g,s)&&(g.mode==='quadratic_equation'?slots&&quadratic:g.mode==='viete'?viete:g.mode==='product_equation'?slots:true)?0:1;
}
export function algebraSolutionEvents(g:AlgebraConfig){
 const event=(name:string,value:number)=>({type:'adjust_parameter' as const,name,value}),events:ReturnType<typeof event>[]=[],m=algebraModel(g);
 if(g.task==='explore')return [event('x',1)];
 if(g.mode==='rational_equation')events.push(event('denominator',algebraDomainMask(g)),event('targetWidth',1));
 if(g.mode!=='rational_equation'&&(g.task!=='discover'||g.mode==='viete'))algebraSlotTargets(g).forEach((v,i)=>events.push(event(['a','b','c'][i],v)));
 if(g.task==='identify')return events;
 if(g.mode==='quadratic_equation'){events.push(event('denominator',m.degree),event('numerator',m.count));if(m.degree===2)events.push(event('targetA',m.delta!));}
 if(g.mode==='viete')events.push(event('targetA',m.sum!),event('targetB',m.product!));
 events.push(event('y',g.mode==='product_equation'?1:g.mode==='rational_equation'?0:m.a!==0?2:5));
 if(g.task!=='discover'){events.push(event('numerator',m.count));algebraRootInputs(g).forEach((x,i)=>events.push(event(i?'height':'width',x)));}
 events.push(event('targetY',1));return events;
}
/** Reuses ENG-01 projection/curve interpretation; no independent graph answer data. */
export function algebraGraph(g:AlgebraConfig):{data:GraphData;mode:GraphMode}{const m=algebraModel(g);return m.a!==0?{data:{a:m.b,b:1,c:-m.c,q:m.a,snap:0},mode:'line_parabola_intersection'}:{data:{a:m.b,b:-1,c:-m.c,snap:0},mode:'linear_relation'};}
