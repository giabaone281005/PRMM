import 'dart:async';
import 'dart:convert';
import 'dart:math' as math;
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'domain.dart';
const ink=Color(0xff263323),paper=Color(0xfffafbf7);
void drawText(Canvas c,String text,Offset p,double size,Color color){final tp=TextPainter(text:TextSpan(text:text,style:TextStyle(fontSize:size,color:color,fontWeight:FontWeight.w600)),textDirection:TextDirection.ltr)..layout();tp.paint(c,p);}
class NativeScene extends StatefulWidget {
  final LessonSession session;final ValueChanged<Json> onInteraction;
  const NativeScene({super.key,required this.session,required this.onInteraction});
  @override State<NativeScene> createState()=>_NativeSceneState();
}
class _NativeSceneState extends State<NativeScene>{
  String? selected;bool token=false;Offset? pointer;
  @override Widget build(BuildContext context)=>LayoutBuilder(builder:(context,constraints){final w=constraints.maxWidth;
    Offset logical(Offset p)=>p*(360/w);
    return Semantics(label:'Tam giác tương tác. Kéo đỉnh A, B, C. Bước cuối kéo ba mảnh góc xuống dải ghép.',child:GestureDetector(key:const Key('native-scene'),behavior:HitTestBehavior.opaque,
      onPanStart:(d){final p=logical(d.localPosition),s=widget.session;selected=null;token=false;
        if((s.checkpoint['allowedInteractions'] as List).contains('drag_vertex')){for(final id in (s.snapshot['points'] as Map).keys){final v=s.snapshot['points'][id];if((p-Offset((v[0] as num).toDouble(),(v[1] as num).toDouble())).distance<=25){selected=id;break;}}}
        else if((s.checkpoint['allowedInteractions'] as List).contains('drag_angle_token')){final tokens=s.objects.where((o)=>o['kind']=='angle_token').toList();for(var i=0;i<tokens.length;i++){if(!(s.snapshot['tokens'] as List).contains(tokens[i]['id'])&&(p-Offset(65+i*110,275)).distance<30){selected=tokens[i]['id'];token=true;pointer=p;break;}}}
      },onPanUpdate:(d){if(selected==null)return;final p=logical(d.localPosition);if(token){setState(()=>pointer=p);}else{widget.onInteraction({'type':'drag_vertex','id':selected,'position':[p.dx,p.dy]});}},
      onPanEnd:(_){if(selected!=null&&token&&pointer!=null)widget.onInteraction({'type':'drag_angle_token','id':selected,'position':[pointer!.dx,pointer!.dy]});setState((){selected=null;pointer=null;});},onPanCancel:()=>setState((){selected=null;pointer=null;}),
      child:CustomPaint(size:Size(w,w),painter:TrianglePainter(widget.session,dragId:token?selected:null,pointer:pointer))));});
}
class TrianglePainter extends CustomPainter {
  final LessonSession session;final String? dragId;final Offset? pointer;TrianglePainter(this.session,{this.dragId,this.pointer});
  @override void paint(Canvas c,Size size){c.save();c.scale(size.width/360);final p=Paint();c.drawRect(const Rect.fromLTWH(0,0,360,360),p..color=const Color(0xfff1f5e9));
    for(var x=0.0;x<360;x+=20){for(var y=0.0;y<360;y+=20){c.drawCircle(Offset(x,y),1,p..color=const Color(0xffdde5d3));}}
    final tri=session.triangle(),a=angles(tri),path=Path()..moveTo(tri[0][0],tri[0][1])..lineTo(tri[1][0],tri[1][1])..lineTo(tri[2][0],tri[2][1])..close();
    c.drawPath(path,p..color=const Color(0xffcceaa6)..style=PaintingStyle.fill);c.drawPath(path,p..color=ink..style=PaintingStyle.stroke..strokeWidth=2.5);final points=session.snapshot['points'] as Map;var i=0;
    for(final id in points.keys){final v=points[id],o=Offset((v[0] as num).toDouble(),(v[1] as num).toDouble());c.drawCircle(o,7,p..style=PaintingStyle.fill..color=Colors.white);c.drawCircle(o,7,p..style=PaintingStyle.stroke..color=ink);drawText(c,id,o+const Offset(12,-23),15,ink);if(session.snapshot['state']['angleLabelsVisible']==true)drawText(c,'${a[i].toStringAsFixed(1)}°',o+const Offset(-18,15),13,const Color(0xff6850a2));i++;}
    if(session.snapshot['state']['angleLabelsVisible']==true)drawText(c,'α + β + γ = 180°',const Offset(112,12),14,const Color(0xff7a8b63));
    final tokens=session.objects.where((o)=>o['kind']=='angle_token').toList();
    if(tokens.isNotEmpty){c.drawRRect(RRect.fromRectAndRadius(const Rect.fromLTWH(30,290,300,60),const Radius.circular(12)),p..style=PaintingStyle.stroke..strokeWidth=1..color=const Color(0xffa6b88d));drawText(c,(session.snapshot['tokens'] as List).length==3?'180° — Một góc bẹt!':'Thả ba mảnh góc vào đây',const Offset(90,334),11,const Color(0xff7f9368));double assembled=math.pi;
      for(var j=0;j<tokens.length;j++){final snapped=(session.snapshot['tokens'] as List).contains(tokens[j]['id']),center=dragId==tokens[j]['id']?pointer!:snapped?const Offset(180,327):Offset(65+j*110,275),sweep=a[j]*math.pi/180;
        final anglePath=Path()..moveTo(center.dx,center.dy)..arcTo(Rect.fromCircle(center:center,radius:snapped?28:25),snapped?assembled:math.pi,sweep,false)..close();c.drawPath(anglePath,p..style=PaintingStyle.fill..color=[const Color(0xffba9fea),const Color(0xffedc270),const Color(0xff87bee9)][j]);if(snapped){assembled+=sweep;}else{drawText(c,'${a[j].round()}°',center+const Offset(-12,1),11,ink);}}
    }c.restore();}
  @override bool shouldRepaint(TrianglePainter old)=>true;
}
class CoverPainter extends CustomPainter {
  final bool solid;CoverPainter({required this.solid});
  @override void paint(Canvas c,Size s){c.save();c.translate(s.width/2-110,s.height/2-65);final p=Paint()..strokeWidth=2..strokeJoin=StrokeJoin.round;
    if(solid){final a=Path()..moveTo(35,52)..lineTo(112,14)..lineTo(188,52)..lineTo(112,90)..close();c.drawPath(a,p..color=const Color(0xffd9edb7)..style=PaintingStyle.fill);c.drawPath(a,p..color=ink..style=PaintingStyle.stroke);
      for(final spec in [([35.0,52.0,112.0,90.0,112.0,153.0,35.0,115.0],const Color(0xffacd880)),([112.0,90.0,188.0,52.0,188.0,115.0,112.0,153.0],const Color(0xff76b65d))]){final q=spec.$1,path=Path()..moveTo(q[0],q[1])..lineTo(q[2],q[3])..lineTo(q[4],q[5])..lineTo(q[6],q[7])..close();c.drawPath(path,p..style=PaintingStyle.fill..color=spec.$2);c.drawPath(path,p..style=PaintingStyle.stroke..color=ink);}}
    else{final path=Path()..moveTo(30,125)..lineTo(110,22)..lineTo(195,125)..close();c.drawPath(path,p..color=const Color(0xffcce9a6)..style=PaintingStyle.fill);c.drawPath(path,p..color=ink..style=PaintingStyle.stroke);for(final point in [const Offset(30,125),const Offset(110,22),const Offset(195,125)]){c.drawCircle(point,5,p..color=Colors.white..style=PaintingStyle.fill);c.drawCircle(point,5,p..color=ink..style=PaintingStyle.stroke);}drawText(c,'180°',const Offset(88,85),20,ink);}c.restore();}
  @override bool shouldRepaint(CoverPainter old)=>old.solid!=solid;
}
class SolidView extends StatefulWidget {
  final LessonSession session;final ValueChanged<Json> onInteraction;
  const SolidView({super.key,required this.session,required this.onInteraction});
  @override State<SolidView> createState()=>SolidViewState();
}
class SolidViewState extends State<SolidView>{
  WebViewController? controller;String error='';final sessionId='mobile-${DateTime.now().microsecondsSinceEpoch}';int sequence=0;bool ready=false;final seen=<String>{};final pending=<String,({String raw,int retries,Timer timer})>{};
  @override void initState(){super.initState();if(kIsWeb||defaultTargetPlatform==TargetPlatform.windows){error='3D cần Android/iOS WebView. Mở bài trên ứng dụng di động để tương tác.';return;}
    controller=WebViewController()..setJavaScriptMode(JavaScriptMode.unrestricted)..setBackgroundColor(const Color(0xfff1f5e9))..addJavaScriptChannel('LessonChannel',onMessageReceived:(m)=>message(m.message))..setNavigationDelegate(NavigationDelegate(onNavigationRequest:(r)=>r.url.startsWith('file:///android_asset/')||r.url=='about:blank'?NavigationDecision.navigate:NavigationDecision.prevent,onWebResourceError:(e){if(mounted)setState(()=>error='Không tải được 3D: ${e.description}');}))..loadFlutterAsset('assets/runtime/index.html');
  }
  void send(String type,Json payload){final id='$sessionId-${sequence++}',raw=jsonEncode({'protocolVersion':'1.0.0','sessionId':sessionId,'requestId':id,'type':type,'payload':payload});void transmit()=>controller?.runJavaScript('window.lessonBridge(${jsonEncode(raw)})');transmit();late Timer timer;timer=Timer.periodic(const Duration(seconds:3),(_){final item=pending[id];if(item==null){timer.cancel();return;}if(item.retries>=2){timer.cancel();pending.remove(id);if(mounted)setState(()=>error='Runtime 3D không phản hồi. Tiến độ được giữ; mở lại bài để thử lại.');return;}pending[id]=(raw:raw,retries:item.retries+1,timer:timer);transmit();});pending[id]=(raw:raw,retries:0,timer:timer);}
  void message(String raw){if(raw.length>131072)return;try{final m=jsonDecode(raw);if(m['protocolVersion']!='1.0.0'||m['requestId'] is! String)return;if(m['type']=='READY'&&!ready){ready=true;send('INIT',{'manifest':widget.session.lesson,'snapshot':widget.session.snapshot});return;}if(m['sessionId']!=sessionId)return;if(m['type']=='ACK'){pending.remove(m['requestId'])?.timer.cancel();return;}if(!seen.add(m['requestId']))return;if(seen.length>512)seen.remove(seen.first);if(m['type']=='INTERACTION')widget.onInteraction(Map<String,dynamic>.from(m['payload']['event']));if(m['type']=='RENDER_ERROR'&&mounted)setState(()=>error='Runtime 3D: ${m['payload']['message']}');}catch(_){/* Reject malformed bridge input. */}}
  void checkpoint(String id){if(ready)send('SET_CHECKPOINT',{'checkpointId':id});}
  void lifecycle(bool resume){if(ready)send(resume?'RESUME':'PAUSE',{});}
  void reset(){if(ready)send('RESET',{});}
  @override void dispose(){for(final p in pending.values){p.timer.cancel();}super.dispose();}
  @override Widget build(BuildContext context){if(error.isNotEmpty)return ColoredBox(color:const Color(0xfff1f5e9),child:Center(child:Padding(padding:const EdgeInsets.all(25),child:Text(error,textAlign:TextAlign.center))));return controller==null?const Center(child:CircularProgressIndicator()):WebViewWidget(controller:controller!);}
}
