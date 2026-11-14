import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:http/http.dart' as http;
import 'package:mo_hoc/domain.dart';
import 'package:mo_hoc/scenes.dart';
import 'fixtures.dart';

void main(){
 IntegrationTestWidgetsFlutterBinding.ensureInitialized();
 testWidgets('CP-04 three cylinder inputs, Android touch, WebGL and fallback', (tester)async{
  final fixtures=jsonDecode(integrationFixtureJson['cylinder-recognition.json']!) as List;
  Future<void> post(Map data)async{final response=await tester.runAsync(()=>http.post(Uri.parse('http://10.0.2.2:5199'),headers:{'Content-Type':'application/json'},body:jsonEncode(data)));expect(response!.statusCode,200,reason:response.body);}
  for(final fallback in [false,true])for(var sample=0;sample<fixtures.length;sample++){
   final lesson=Map<String,dynamic>.from(fixtures[sample]['manifest']),s=LessonSession(lesson),key=GlobalKey<SolidViewState>();
   await tester.pumpWidget(MaterialApp(home:Scaffold(body:SafeArea(child:SolidView(key:key,session:s,onInteraction:(event){s.interact(event);})))));
   for(var n=0;n<200&&key.currentState?.ready!=true;n++){await tester.pump(const Duration(milliseconds:100));}
   expect(key.currentState?.ready,isTrue);expect(key.currentState!.error,isEmpty);
   Future<dynamic> js(String source)async{final raw=await key.currentState!.controller!.runJavaScriptReturningResult(source);dynamic result=raw;for(var n=0;n<2&&result is String;n++){try{result=jsonDecode(result);}catch(_){break;}}return result;}
   if(fallback){await key.currentState!.controller!.runJavaScript("document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()");await tester.pump(const Duration(seconds:1));}
   expect(await js("document.querySelector('.cylinder-scene').dataset.renderer"),fallback?'fallback':'webgl');
   await key.currentState!.controller!.runJavaScript("window.cp04Canvas=document.querySelector('canvas')");
   Future<void> input(String action,String selector)async{
    await key.currentState!.controller!.runJavaScript("document.querySelector(${jsonEncode(selector)}).scrollIntoView({block:'center'})");await tester.pump(const Duration(milliseconds:150));
    final dom=await js("JSON.stringify((()=>{const r=document.querySelector(${jsonEncode(selector)}).getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,width:innerWidth,height:innerHeight}})())");
    final box=key.currentContext!.findRenderObject() as RenderBox,origin=box.localToGlobal(Offset.zero),factor=box.size.width/(dom['width'] as num),dpr=View.of(key.currentContext!).devicePixelRatio;
    expect(dom['y']+dom['h']/2,lessThan(dom['height']));
    await post({'action':action,'dpr':dpr,'rect':{'x':origin.dx+dom['x']*factor,'y':origin.dy+dom['y']*factor,'w':dom['w']*factor,'h':dom['h']*factor}});
    await tester.pump(const Duration(milliseconds:400));
   }
   for(var cp=0;cp<6;cp++){
    expect(s.success,isFalse,reason:'new step must not auto complete');
    if(cp==0){await input('orbit',fallback?'svg[aria-label="Sơ đồ hình trụ tương tác"]':'.cylinder-canvas canvas');}
    else if(cp==2){await input('scale','input[aria-label="Thay đổi bán kính"]');await input('tap','button[aria-label="Bộ phận C"]');expect(s.success,isFalse);await input('tap','button[aria-label="Bộ phận D"]');}
    else{await input('tap','button[aria-label="Bộ phận ${cp==3?'A':'B'}"]');expect(s.success,isFalse);await input('tap','button[aria-label="Bộ phận ${cp==3?'B':cp==5?'E':'A'}"]');}
    for(var n=0;n<50&&!s.success;n++){await tester.pump(const Duration(milliseconds:100));}
    expect(s.success,isTrue,reason:'sample $sample fallback $fallback step $cp state ${s.snapshot['state']}');
    expect(await js("document.querySelector('.uime-scene').textContent.includes(${jsonEncode(lesson['recognition'][cp]['explanation'])})"),isTrue);
    await post({'action':'shot','name':'android-${fallback?'fallback':'webgl'}-${sample+1}-cp${cp+1}'});
    final before=jsonEncode(s.snapshot);expect(LessonSession(lesson,saved:s.snapshot).success,isTrue);expect(jsonEncode(s.snapshot),before);
    expect(s.advance(),isTrue);
    if(cp<5){key.currentState!.checkpoint(s.checkpoint['id']);await tester.pump(const Duration(milliseconds:400));}
    if(!fallback)expect(await js("window.cp04Canvas===document.querySelector('canvas')"),isTrue);
   }
   expect(s.snapshot['completed'],isTrue);await tester.pumpWidget(const SizedBox());await tester.pump(const Duration(milliseconds:200));
  }
 },timeout:const Timeout(Duration(minutes:8)));
}
