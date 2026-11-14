import 'dart:math' as math;

Map<String,num> relationPoint(Map g,[int index=0]){
 final t=[0,2,-2,1][index%4];return g['b']!=0?{'x':t,'y':(g['c']-g['a']*t)/g['b']}:{'x':g['c']/g['a'],'y':t};
}
Map<String,dynamic> graphSolution(Map g,String mode){
 if(mode=='linear_relation')return {'kind':'unique','points':[relationPoint(g)]};
 if(mode=='linear_system'){
  final det=g['a']*g['e']-g['d']*g['b'];
  if(det.abs()>1e-8)return {'kind':'unique','points':[{'x':(g['c']*g['e']-g['f']*g['b'])/det,'y':(g['a']*g['f']-g['d']*g['c'])/det}]};
  return {'kind':(g['a']*g['f']-g['d']*g['c']).abs()<1e-8&&(g['b']*g['f']-g['e']*g['c']).abs()<1e-8?'coincident':'parallel','points':<Map>[]};
 }
 final A=g['b']*g['q'],B=g['a'],C=-g['c'];
 if(A.abs()<1e-8){final x=-C/B;return {'kind':'unique','points':[{'x':x,'y':g['q']*x*x}]};}
 final delta=B*B-4*A*C;
 if(delta < -1e-8)return {'kind':'none','points':<Map>[]};
 if(delta.abs()<=1e-8){final x=-B/(2*A);return {'kind':'unique','points':[{'x':x,'y':g['q']*x*x}]};}
 final v=-.5*(B+(B>=0?1:-1)*math.sqrt(delta)),xs=<num>[v/A,C/v]..sort();
 return {'kind':'two','points':xs.map((x)=>{'x':x,'y':g['q']*x*x}).toList()};
}
List<Map> graphTargets(Map g)=>g['mode']=='linear_relation'?[relationPoint(g,g['task']=='practice'?2:g['task']=='assessment'?3:1)]:List<Map>.from(graphSolution(g,g['mode'])['points']);
int graphClass(Map g){final k=graphSolution(g,g['mode'])['kind'];return k=='parallel'||k=='none'?0:k=='unique'?1:k=='coincident'?3:2;}
Map<String,num> graphBounds(Map g,String mode){
 final points=<Map>[for(var i=0;i<4;i++)relationPoint(g,i),...List<Map>.from(graphSolution(g,mode)['points'])];
 if(mode=='linear_system'){final o={'a':g['d'],'b':g['e'],'c':g['f']};points.addAll([relationPoint(o),relationPoint(o,1)]);}
 if(mode=='line_parabola_intersection')points.addAll([{'x':2,'y':4*g['q']},{'x':-2,'y':4*g['q']}]);
 final x=points.fold<num>(5,(v,p)=>math.max(v,(p['x'] as num).abs()))*1.3,y=points.fold<num>(5,(v,p)=>math.max(v,(p['y'] as num).abs()))*1.3;
 return {'xMin':-x,'xMax':x,'yMin':-y,'yMax':y};
}
List<String> validateGraphData(Map g,String mode){
 final errors=<String>[];
 for(final key in ['a','b','c',if(mode=='linear_system')...['d','e','f'],if(mode=='line_parabola_intersection')'q']){
  final v=g[key];if(v is! num||!v.isFinite||v!=v.round()||v.abs()>12)errors.add('Invalid graph coefficient $key');
 }
 if(g['a']==0&&g['b']==0)errors.add('Degenerate line');
 if(mode=='linear_system'&&g['d']==0&&g['e']==0)errors.add('Degenerate second line');
 if(mode=='line_parabola_intersection'&&g['q']==0)errors.add('Degenerate parabola');
 if(![0,.5,1].contains(g['snap']))errors.add('Invalid snap grid');
 if(errors.isNotEmpty)return errors;
 final targets=mode=='linear_relation'?[for(var i=0;i<4;i++)relationPoint(g,i)]:List<Map>.from(graphSolution(g,mode)['points']);
 for(final p in targets)for(final key in ['x','y']){
  final n=p[key] as num;
  if(!n.isFinite||n.abs()>1000)errors.add('Target outside bounds');
  if(g['snap']!=0&&(n/g['snap']-(n/g['snap']).round()).abs()>1e-8)errors.add('Target unreachable on grid');
 }
 return errors;
}
List<String> validateGraph(Map g)=>!['linear_relation','linear_system','line_parabola_intersection'].contains(g['mode'])||!['explore','identify','discover','guided','practice','assessment'].contains(g['task'])?['Invalid graph mode/task']:validateGraphData(g,g['mode']);
bool graphAccept(Map g,String name,num value){
 if(!value.isFinite)return false;
 if(['x','y','width','height'].contains(name)){
  if(['width','height'].contains(name)&&g['mode']!='line_parabola_intersection')return false;
  final bounds=graphBounds(g,g['mode']),limit=bounds[['x','width'].contains(name)?'xMax':'yMax']!;
  return value.abs()<=limit+1e-8&&(g['snap']==0||(value/g['snap']-(value/g['snap']).round()).abs()<1e-8);
 }
 if(name=='a')return g['task']=='explore'&&g['mode']=='line_parabola_intersection'&&value==value.round()&&value!=0&&value.abs()<=12;
 if(name=='b')return g['task']=='identify'&&[1,2].contains(value);
 if(name=='c')return !['explore','identify'].contains(g['task'])&&g['mode']!='linear_relation'&&[0,1,2,3].contains(value);
 if(name=='numerator')return value==1;
 return false;
}
void applyGraphInteraction(Map g,Map s,String name,num value){
 if(['x','y','width','height','a','c'].contains(name))s['numerator']=0;
 if(name=='b'){s['b']=(s['b'] as num).toInt()|value.toInt();return;}
 s[name]=value;
}
num graphError(Map g,Map s){
 if(g['task']=='explore')return (s['x'] as num).abs()+(s['y'] as num).abs()>.2||(g['mode']=='line_parabola_intersection'&&s['a']!=0)?0:1;
 if(g['task']=='identify'&&g['mode']!='linear_relation')return s['b']==3?0:1;
 if(g['task']=='discover'&&g['mode']!='linear_relation')return s['numerator']==1&&s['c']==graphClass(g)?0:1;
 if(!['explore','identify'].contains(g['task'])&&g['mode']!='linear_relation'&&s['c']!=graphClass(g))return 1;
 final points=graphTargets(g),pin={'x':s['x'],'y':s['y']};
 if(g['task']=='identify')return s['numerator']==1&&(g['a']*s['x']+g['b']*s['y']-g['c']).abs()/math.sqrt(g['a']*g['a']+g['b']*g['b'])<1e-5?0:1;
 if(points.isEmpty)return s['numerator']==1&&s['c']==graphClass(g)?0:1;
 if(s['numerator']!=1)return 1;
 num distance(Map p,Map q)=>math.sqrt(math.pow(p['x']-q['x'],2)+math.pow(p['y']-q['y'],2));
 if(points.length==1)return distance(points[0],pin)<1e-5?0:1;
 final pin2={'x':s['width'],'y':s['height']};
 return math.min(distance(points[0],pin)+distance(points[1],pin2),distance(points[1],pin)+distance(points[0],pin2))<1e-5?0:1;
}
