const parabolaTasks=['explore','identify','compare','guided','practice','assessment'];

List<String> validateParabola(Map c) {
  final a=c['a'];
  return a is! num || !a.isFinite || a != a.round() || a == 0 || a.abs()>5 ||
      ![1,2,-2].contains(c['pointX']) || !parabolaTasks.contains(c['task'])
    ? ['Parabol cần a nguyên khác 0 trong [−5; 5], điểm có x khác 0 và nhiệm vụ được hỗ trợ.'] : [];
}
bool parabolaAccept(Map c,String name,num value) {
  if(!value.isFinite)return false;
  final task=c['task'];
  if(name=='x')return task!='identify'&&task!='compare'&&value==value.round()&&value!=0&&value.abs()<=5;
  if(name=='a')return task=='compare'&&value==value.round()&&value>=1&&value<=2;
  if(name=='y') {
    return task=='identify'||task=='compare'?value==0||value==1:
    ['guided','practice','assessment'].contains(task)&&value==0;
  }
  return false;
}
void applyParabolaInteraction(Map c,Map state,String name,num value) {
  if(name=='x') {
    if(c['task']=='explore') {
      state['b']=(state['b'] as num).toInt()|(value>0?1:2);
    } else {
      state['y']=-1;
    }
  }
  if(name=='a')state['y']=-1;
  state[name]=value;
}
num parabolaError(Map c,Map state) {
  final task=c['task'],a=c['a'] as num;
  if(task=='explore')return state['b']==3?0:1;
  if(task=='identify')return state['y']==(a>0?0:1)?0:1;
  if(task=='compare') {
    final reference=a>0?a/2:a*2,narrower=a.abs()>reference.abs()?0:1;
    return state['a']==2&&state['y']==narrower?0:1;
  }
  return state['x']==a&&state['y']==0?0:1;
}
