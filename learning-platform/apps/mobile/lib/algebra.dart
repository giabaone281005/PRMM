import 'dart:math' as math;
const algebraModes=['product_equation','rational_equation','quadratic_equation','viete'];
const algebraEpsilon=1e-8;
List<num> _unique(List<num> values){values.sort();final result=<num>[];for(final value in values){if(result.isEmpty||(value-result.last).abs()>algebraEpsilon){result.add(value);}}return result;}
Map<String,dynamic> solveAlgebraPolynomial(num a,num b,num c){
 if(a==0){if(b==0){return {'degree':0,'delta':null,'kind':c==0?'all':'none','roots':<num>[]};}return {'degree':1,'delta':null,'kind':'one','roots':<num>[-c/b]};}
 final delta=b*b-4*a*c;
 if(delta< -algebraEpsilon){return {'degree':2,'delta':delta,'kind':'none','roots':<num>[]};}
 if(delta.abs()<=algebraEpsilon){return {'degree':2,'delta':delta,'kind':'one','roots':<num>[-b/(2*a)]};}
 final v=-.5*(b+(b>=0?1:-1)*math.sqrt(delta)),roots=<num>[v/a,c/v]..sort();return {'degree':2,'delta':delta,'kind':'two','roots':roots};
}
Map<String,dynamic> algebraEquation(Map g){
 final d=g['data'] as Map;num n(String key)=>d[key];
 Map constant(String id,num value)=>{'id':id,'op':'const','value':value};
 Map variable(String id)=>{'id':id,'op':'var','name':'x'};
 Map linear(String id,num a,num b)=>{'id':id,'op':'add','terms':[{'id':'$id-ax','op':'mul','terms':[constant('$id-a',a),variable('$id-x')]},constant('$id-b',b)]};
 if(['product_equation','rational_equation'].contains(g['mode'])){
  final numerator={'id':'numerator','op':'mul','terms':[linear('factor-L',n('p'),n('q')),linear('factor-R',n('r'),n('s'))]};
  return {'left':g['mode']=='product_equation'?numerator:{'id':'fraction','op':'div','numerator':numerator,'denominator':{'id':'denominator','op':'mul','terms':[linear('denominator-L',n('d'),n('e')),linear('denominator-R',n('f'),n('g'))]}},'right':constant('rhs',g['mode']=='product_equation'?0:n('k'))};
 }
 return {'left':{'id':'polynomial','op':'add','terms':[{'id':'term-square','op':'mul','terms':[constant('coefficient-a',n('a')),variable('square-x-1'),variable('square-x-2')]},{'id':'term-linear','op':'mul','terms':[constant('coefficient-b',n('b')),variable('linear-x')]},constant('coefficient-c',n('c'))]},'right':constant('rhs',0)};
}
num? evaluateAlgebraExpr(Map expr,num x){
 switch(expr['op']){
  case 'const':return expr['value'];
  case 'var':return x;
  case 'add':case 'mul':final values=(expr['terms'] as List).map((t)=>evaluateAlgebraExpr(t,x)).toList();if(values.contains(null)){return null;}return expr['op']=='add'?values.fold<num>(0,(a,b)=>a+b!):values.fold<num>(1,(a,b)=>a*b!);
  case 'div':final n=evaluateAlgebraExpr(expr['numerator'],x),d=evaluateAlgebraExpr(expr['denominator'],x);return n==null||d==null||d.abs()<=algebraEpsilon?null:n/d;
  default:throw StateError('Operation outside algebra AST whitelist');
 }
}
Map<String,dynamic> algebraModel(Map g){
 final d=g['data'] as Map;num n(String key)=>d[key];
 final product=['product_equation','rational_equation'].contains(g['mode']),rational=g['mode']=='rational_equation';
 final a=product?n('p')*n('r')-(rational?n('k')*n('d')*n('f'):0):n('a'),b=product?n('p')*n('s')+n('q')*n('r')-(rational?n('k')*(n('d')*n('g')+n('e')*n('f')):0):n('b'),c=product?n('q')*n('s')-(rational?n('k')*n('e')*n('g'):0):n('c');
 final forbidden=rational?_unique(<num>[-n('e')/n('d'),if(n('f')!=0)-n('g')/n('f')]):<num>[],candidate=solveAlgebraPolynomial(a,b,c);
 bool isAllowed(num x)=>!rational||((n('d')*x+n('e')).abs()>algebraEpsilon&&(n('f')*x+n('g')).abs()>algebraEpsilon);
 final roots=(candidate['roots'] as List<num>).where(isAllowed).toList(),extraneous=(candidate['roots'] as List<num>).where((x)=>!isAllowed(x)).toList(),kind=candidate['kind']=='all'?'all':roots.isEmpty?'none':roots.length==1?'one':'two';
 return {'a':a,'b':b,'c':c,'degree':candidate['degree'],'delta':candidate['delta'],'roots':roots,'candidates':candidate['roots'],'forbidden':forbidden,'extraneous':extraneous,'kind':kind,'count':kind=='all'?3:roots.length,'sum':a!=0?-b/a:null,'product':a!=0?c/a:null,'equation':algebraEquation(g)};
}
List<num> algebraDomainPool(Map g)=>_unique(<num>[...algebraModel(g)['forbidden'],-2,-1,0,1,2]);
int algebraDomainMask(Map g){final forbidden=algebraModel(g)['forbidden'] as List<num>,pool=algebraDomainPool(g);var mask=0;for(var i=0;i<pool.length;i++){if(forbidden.any((x)=>(x-pool[i]).abs()<algebraEpsilon)){mask|=1<<i;}}return mask;}
List<Map> algebraCards(Map g){
 final d=g['data'] as Map;
 if(g['mode']=='viete'&&g['task']!='identify'){return [for(final id in ['formula-sum','formula-product','formula-sign-sum','formula-sign-product']){'id':id,'kind':'formula'}];}
 if(g['mode']=='product_equation'){return [{'id':'factor-L','kind':'factor'},{'id':'factor-R','kind':'factor'},{'id':'variable-x','kind':'variable'},{'id':'number-zero','kind':'number','value':0}];}
 if(g['mode']=='rational_equation'){return [];}
 final values=_unique(<num>[d['a'],d['b'],d['c'],-d['a'],-d['b'],-d['c'],0,1]);return [for(var i=0;i<values.length;i++){'id':'number-$i','kind':'number','value':values[i]},{'id':'variable-x','kind':'variable'}];
}
List<int> algebraSlotTargets(Map g){
 if(g['mode']=='product_equation'||g['mode']=='viete'&&g['task']!='identify'){return [0,1];}
 if(g['mode']=='rational_equation'){return [];}
 final cards=algebraCards(g);return [for(final key in ['a','b','c'])cards.indexWhere((card)=>card['kind']=='number'&&card['value']==g['data'][key])];
}
bool algebraSlotsCorrect(Map g,Map s){final targets=algebraSlotTargets(g),values=[for(final k in ['a','b','c'].take(targets.length))s[k]];return g['mode']=='product_equation'?values.toSet().length==2&&values.every((v)=>v==0||v==1):List.generate(targets.length,(i)=>targets[i]==values[i]).every((v)=>v);}
bool algebraDomainCorrect(Map g,Map s)=>g['mode']!='rational_equation'||s['targetWidth']==1&&s['denominator']==algebraDomainMask(g);
bool algebraOperationAllowed(Map g,num operation,bool domainAcknowledged){
 if(g['mode']=='rational_equation'&&!domainAcknowledged){return false;}
 if(operation==0){return g['mode']=='rational_equation';}
 if(operation==1){return g['mode']=='product_equation';}
 if(operation==2){return algebraModel(g)['a']!=0;}
 if(operation==3){return g['mode']=='rational_equation'&&(algebraModel(g)['forbidden'] as List<num>).any((x)=>(g['data']['p']*x+g['data']['q']).abs()<algebraEpsilon);}
 return operation==5;
}
List<String> validateAlgebraData(Map d,String mode){
 if(!algebraModes.contains(mode)){return ['Unknown algebra mode'];}
 final errors=<String>[],keys=mode=='product_equation'?['p','q','r','s']:mode=='rational_equation'?['p','q','r','s','d','e','f','g','k']:['a','b','c'];
 for(final key in keys){final value=d[key];if(value is! num||!value.isFinite||value!=value.round()||value.abs()>9){errors.add('Integer coefficient $key in -9..9 required');}}
 if(errors.isNotEmpty){return errors;}
 if(['product_equation','rational_equation'].contains(mode)&&(d['p']==0||d['r']==0)){errors.add('Both numerator factors must be linear');}
 if(mode=='rational_equation'&&(d['d']==0||d['f']==0&&d['g']==0)){errors.add('Zero/degenerate denominator');}
 if(mode=='quadratic_equation'&&(!['quadratic_only','allow_linear'].contains(d['degreePolicy'])||d['degreePolicy']=='quadratic_only'&&d['a']==0)){errors.add('a cannot be zero in strict quadratic mode');}
 if(mode=='viete'&&(d['a']==0||d['b']*d['b']-4*d['a']*d['c']<0)){errors.add('Viete requires quadratic with real roots');}
 if(errors.isNotEmpty){return errors;}
 final m=algebraModel({'mode':mode,'data':d,'task':'guided'});if(<num>[...m['roots'],...m['forbidden'],...m['candidates']].any((x)=>!x.isFinite||x.abs()>1000)){errors.add('Root/domain outside reachable bounds');}return errors;
}
List<String> validateAlgebra(Map g)=>[...validateAlgebraData(g['data'],g['mode']),if(!['explore','identify','discover','guided','practice','assessment'].contains(g['task']))'Invalid algebra task'];
bool algebraAccept(Map g,String name,num value){
 if(!value.isFinite){return false;}
 if(name=='x'){return value>=-1000&&value<=1000;}
 if(g['task']=='explore'){return false;}
 if(['a','b','c'].contains(name)){return (name!='c'||['quadratic_equation','viete'].contains(g['mode'])&&g['task']=='identify'||name=='c'&&g['mode']=='quadratic_equation')&&value==value.round()&&value>=0&&value<algebraCards(g).length;}
 if(name=='denominator'){return value==value.round()&&value>=0&&(g['mode']=='rational_equation'?value<(1<<algebraDomainPool(g).length):g['mode']=='quadratic_equation'&&value<=2);}
 if(name=='targetWidth'){return g['mode']=='rational_equation'&&value==1;}
 if(g['task']=='identify'){return false;}
 if(name=='y'){return value==value.round()&&value>=0&&value<7;}
 if(name=='numerator'){return value==value.round()&&value>=0&&value<=3;}
 if(name=='width'||name=='height'){return value==-999999||value>=-1000&&value<=1000;}
 if(name=='targetA'||name=='targetB'){return value.abs()<=1000000&&(name=='targetA'||g['mode']=='viete');}
 return name=='targetY'&&value==1;
}
void applyAlgebraInteraction(Map g,Map s,String name,num value){s[name]=value;if(name=='denominator'){s['targetWidth']=0;}if(!['x','targetY'].contains(name)){s['targetY']=0;}}
List<num> algebraRootInputs(Map g){final roots=algebraModel(g)['roots'] as List<num>;return g['mode']=='viete'&&roots.length==1?[roots[0],roots[0]]:roots;}
bool algebraRootsCorrect(Map g,Map s){
 final roots=algebraRootInputs(g),m=algebraModel(g),values=<num>[s['width'],s['height']];bool match(num a,num b)=>(a-b).abs()<=1e-5;
 if(s['numerator']!=m['count']){return false;}
 if(roots.isEmpty){return values.every((x)=>x==-999999);}
 if(g['mode']=='rational_equation'&&values.where((x)=>x!=-999999).any((x)=>(m['forbidden'] as List<num>).any((f)=>(x-f).abs()<algebraEpsilon))){return false;}
 return roots.length==1?match(values[0],roots[0])&&values[1]==-999999:match(values[0],roots[0])&&match(values[1],roots[1])||match(values[0],roots[1])&&match(values[1],roots[0]);
}
num algebraError(Map g,Map s){
 final m=algebraModel(g),domain=algebraDomainCorrect(g,s),operation=algebraOperationAllowed(g,s['y'],domain),slots=algebraSlotsCorrect(g,s);bool close(num a,num b)=>(a-b).abs()<=1e-5;
 if(g['task']=='explore'){return (s['x'] as num).abs()>=.01?0:1;}
 if(g['task']=='identify'){return (g['mode']=='rational_equation'?domain:slots)?0:1;}
 if(s['targetY']!=1){return 1;}
 final viete=g['mode']=='viete'&&slots&&close(s['targetA'],m['sum'])&&close(s['targetB'],m['product']),quadratic=g['mode']=='quadratic_equation'&&s['denominator']==m['degree']&&(m['degree']!=2||close(s['targetA'],m['delta']))&&s['numerator']==m['count'];
 if(g['task']=='discover'){return (g['mode']=='quadratic_equation'?quadratic:g['mode']=='viete'?viete:domain&&operation)?0:1;}
 return domain&&operation&&algebraRootsCorrect(g,s)&&(g['mode']=='quadratic_equation'?slots&&quadratic:g['mode']=='viete'?viete:g['mode']=='product_equation'?slots:true)?0:1;
}
