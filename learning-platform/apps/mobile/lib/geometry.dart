import 'dart:math' as math;
const geometryModes=['right_triangle','circle_symmetry','line_circle','two_circles','circle_angles','arc_sector_annulus','triangle_circles','cyclic_polygon'];
Map<String,dynamic> geometryMeasure(Map g){
 final d=g['data'] as Map,mode=g['mode'];num n(String k)=>d[k] as num;
 num value=0;var target=0,count=0,mask=0,requiredLayer=0;
 final facts=<String,num>{};
 if(mode=='right_triangle'||mode=='triangle_circles'){
  final a=mode=='right_triangle'?math.sqrt(n('legA')*n('legA')+n('legB')*n('legB')):n('sideA'),b=mode=='right_triangle'?n('legB'):n('sideB'),c=mode=='right_triangle'?n('legA'):n('sideC'),s=(a+b+c)/2,area=math.sqrt(math.max(0,s*(s-a)*(s-b)*(s-c))),r=area/s,R=a*b*c/(4*area);
  facts.addAll({'area':area,'inradius':r,'circumradius':R});count=mode=='right_triangle'?12:16;mask=mode=='right_triangle'?3:15;
  if(mode=='right_triangle'){
   final opposite=d['angleAt']=='B'?b:c,adjacent=d['angleAt']=='B'?c:b,side=d['target']=='hypotenuse'?a:d['target']=='opposite'?opposite:adjacent;
   target=d['target']=='hypotenuse'?5:d['target']=='opposite'?(d['angleAt']=='B'?4:3):(d['angleAt']=='B'?3:4);
   final ratio=d['ratio']=='sin'?opposite/a:d['ratio']=='cos'?adjacent/a:opposite/adjacent,angle=math.atan2(opposite,adjacent)*180/math.pi;
   value=g['curriculumCode']=='M9-GEO-01'?side:g['curriculumCode']=='M9-GEO-02'?ratio:angle;
   facts.addAll({'rightAngle':90,'opposite':opposite,'adjacent':adjacent,'hypotenuse':a,'ratio':ratio,'acuteAngle':angle});
  }else{final inc=d['construction']=='incircle';value=inc?r:R;target=inc?12:14;requiredLayer=inc?4:8;}
 }else if(mode=='circle_symmetry'){
  value=n('pointDistance')<n('radius')-1e-8?0:(n('pointDistance')-n('radius')).abs()<=1e-8?1:2;target=3;count=7;
  final x=n('pointDistance')*math.cos(n('pointAngle')*math.pi/180),y=n('pointDistance')*math.sin(n('pointAngle')*math.pi/180);facts.addAll({'reflectionX':d['axis']=='x'?x:-x,'reflectionY':d['axis']=='x'?-y:y});
 }else if(mode=='line_circle'){
  value=n('distance')>n('radius')+1e-8?0:(n('distance')-n('radius')).abs()<=1e-8?1:2;target=2;count=8+value.toInt();mask=16;facts.addAll({'distance':n('distance'),'radius':n('radius')});
 }else if(mode=='two_circles'){
  final r=n('radius'),s=n('radius2'),h=n('distance');value=h<1e-8?((r-s).abs()<1e-8?3:0):h>r+s+1e-8||h<(r-s).abs()-1e-8?0:(h-r-s).abs()<1e-8||(h-(r-s).abs()).abs()<1e-8?1:2;
  target=1;count=5+(value==1?1:value==2?2:0);facts['centerDistance']=h;
 }else if(mode=='circle_angles'){
  value=n('sweep')/2;target=6;count=11;facts.addAll({'centralAngle':n('sweep'),'inscribedAngle':value});
 }else if(mode=='arc_sector_annulus'){
  final arc=math.pi*n('radius')*n('sweep')/180,sector=math.pi*n('radius')*n('radius')*n('sweep')/360,annulus=math.pi*(n('radius')*n('radius')-n('innerRadius')*n('innerRadius'));
  value=d['measure']=='arc'?arc:d['measure']=='sector'?sector:annulus;target=d['measure']=='arc'?6:d['measure']=='sector'?7:9;count=10;facts.addAll({'arcLength':arc,'sectorArea':sector,'annulusArea':annulus});
 }else{
  final regular=d['shape']=='regular_polygon',vertices=regular?n('vertices').toInt():4;value=regular?(vertices-2)*180/vertices:n('angleC')/2;target=2+2*vertices;count=target+1;facts.addAll({'oppositeAngleSum':180,'centralStep':regular?360/vertices:0});
 }
 return {'value':value,'targetIndex':target,'selectionCount':count,'layerMask':mask,'requiredLayer':requiredLayer,'facts':facts};
}
List<String> validateGeometryData(Map d,String mode){
 final e=<String>[];num n(String k)=>d[k] is num?d[k]:double.nan;
 void positive(List<String> keys){for(final k in keys){if(!n(k).isFinite||n(k)<.5||n(k)>20){e.add('Length $k must be .5..20');}}}
 if(!geometryModes.contains(mode)){return ['Unknown geometry mode'];}
 if(!['cm','m'].contains(d['unit'])){e.add('Invalid unit');}
 if(mode=='right_triangle'){
  positive(['legA','legB']);if(n('legA')/n('legB')<.1||n('legA')/n('legB')>10){e.add('Invalid leg ratio');}
  if(!['B','C'].contains(d['angleAt'])||!['opposite','adjacent','hypotenuse'].contains(d['target'])||!['sin','cos','tan'].contains(d['ratio'])){e.add('Invalid angle, side or ratio');}
 }else if(mode=='triangle_circles'){
  positive(['sideA','sideB','sideC']);final a=n('sideA'),b=n('sideB'),c=n('sideC'),s=(a+b+c)/2,area2=s*(s-a)*(s-b)*(s-c);
  if(a+b<=c||a+c<=b||b+c<=a||area2<=0||math.sqrt(area2)/math.pow(math.max(a,math.max(b,c)),2)<.03){e.add('Triangle cannot be constructed clearly');}
  if(!['incircle','circumcircle'].contains(d['construction'])){e.add('Invalid construction');}
 }else{
  positive(['radius']);
  if(mode=='circle_symmetry'){if(!n('pointDistance').isFinite||n('pointDistance')<.5||n('pointDistance')>30){e.add('Invalid OP');}if(!n('pointAngle').isFinite||n('pointAngle')<10||n('pointAngle')>80||!['x','y'].contains(d['axis'])){e.add('Invalid reflection');}}
  if(mode=='line_circle'||mode=='two_circles'){if(!n('distance').isFinite||n('distance')<0||n('distance')>40){e.add('Invalid distance');}}
  if(mode=='line_circle'&&(!n('normalAngle').isFinite||n('normalAngle')<0||n('normalAngle')>359)){e.add('Invalid normal angle');}
  if(mode=='two_circles'){positive(['radius2']);}
  if(mode=='circle_angles'||mode=='arc_sector_annulus'){if(!n('sweep').isFinite||n('sweep')<20||n('sweep')>160){e.add('Invalid sweep');}}
  if(mode=='arc_sector_annulus'){positive(['innerRadius']);if(n('innerRadius')>=n('radius')||!['arc','sector','annulus'].contains(d['measure'])){e.add('Invalid annulus or measure');}}
  if(mode=='cyclic_polygon'){
   if(!['regular_polygon','cyclic_quadrilateral'].contains(d['shape'])||!n('vertices').isFinite||n('vertices')!=n('vertices').round()||n('vertices')<3||n('vertices')>12){e.add('Invalid polygon');}
   final angles=<num>[0,n('angleB'),n('angleC'),n('angleD'),360];for(var i=1;i<angles.length;i++){if(!angles[i].isFinite||angles[i]-angles[i-1]<10||angles[i]-angles[i-1]>170){e.add('Degenerate or unordered cyclic vertices');}}
  }
 }
 return e;
}
List<String> validateGeometry(Map g){
 final e=validateGeometryData(g['data'],g['mode']),index=int.tryParse((g['curriculumCode'] as String).split('-').last)??0;
 if(index<1||index>10||geometryModes[index<=3?0:index-3]!=g['mode']){e.add('Geometry curriculum mismatch');}
 if(!['explore','identify','discover','guided','practice','assessment'].contains(g['task'])){e.add('Invalid geometry task');}return e;
}
bool geometryAccept(Map g,String name,num value){
 if(!value.isFinite){return false;}
 if(name=='x'){return value>=-180&&value<=180;}
 if(name=='y'){return value>=.6&&value<=1;}
 if(name=='a'){return g['mode']=='circle_angles'&&value>=g['data']['sweep']+5&&value<=355;}
 final m=geometryMeasure(g);
 if(name=='b'){return value==value.round()&&value>=0&&value<m['selectionCount'];}
 if(name=='c'){return value==value.round()&&value>=0&&(value.toInt()&~(m['layerMask'] as int))==0;}
 if(name=='numerator'){return value>=-100000&&value<=100000;}
 return name=='width'&&value==1&&g['task']!='explore';
}
void applyGeometryInteraction(Map g,Map s,String name,num value){s[name]=value;if(['b','numerator','a'].contains(name)){s['width']=0;}}
num geometryError(Map g,Map s){
 if(g['task']=='explore'){return (s['x'] as num).abs()>=5||g['mode']=='circle_angles'&&((s['a'] as num)-240).abs()>=5?0:1;}
 final m=geometryMeasure(g),selected=s['b']==m['targetIndex'],visible=m['requiredLayer']==0||((s['c'] as num).toInt()&(m['requiredLayer'] as int))!=0;
 if(g['task']=='identify'){return selected&&visible?0:1;}
 if(s['width']!=1){return 1;}
 final value=m['value'] as num,tolerance=math.max(.005,value.abs()*.0001),numeric=((s['numerator'] as num)-value).abs()<=tolerance;
 return numeric&&(g['task']=='discover'||selected&&visible)?0:1;
}
