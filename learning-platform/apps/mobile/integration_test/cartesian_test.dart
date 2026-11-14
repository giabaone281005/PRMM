import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:mo_hoc/domain.dart';
import 'package:mo_hoc/cartesian.dart';
import 'package:mo_hoc/scenes.dart';
import 'fixtures.dart';

void main(){
 IntegrationTestWidgetsFlutterBinding.ensureInitialized();
 testWidgets('ENG-01 nine Cartesian inputs complete in physical Android WebView bridge',(tester)async{
  final fixtures=jsonDecode(integrationFixtureJson['cartesian.json']!) as List;
  for(final f in fixtures){
   final lesson=Map<String,dynamic>.from(f['manifest']),s=LessonSession(lesson),key=GlobalKey<SolidViewState>();
   await tester.pumpWidget(MaterialApp(home:Scaffold(body:SafeArea(child:SolidView(key:key,session:s,onInteraction:(event){s.interact(event);})))));
   for(var n=0;n<200&&key.currentState?.ready!=true;n++){await tester.pump(const Duration(milliseconds:100));}
   expect(key.currentState?.ready,isTrue,reason:lesson['lessonId']);
   Future<dynamic> read(String source)async{dynamic r=await key.currentState!.controller!.runJavaScriptReturningResult(source);for(var n=0;n<2&&r is String;n++){try{r=jsonDecode(r);}catch(_){break;}}return r;}
   Future<void> action(String source)async{await key.currentState!.controller!.runJavaScript(source);await tester.pump(const Duration(milliseconds:120));}
   Future<void> number(String label,num value)async{await action("var element=document.querySelector('input[aria-label=\"$label\"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(element,${jsonEncode(value.toString())});element.dispatchEvent(new Event('input',{bubbles:true}));");}
   Future<void> click(String text)async{await action("Array.from(document.querySelectorAll('button')).find(e=>e.textContent===${jsonEncode(text)}).click()");}
   await action("window.eng01Root=document.querySelector('.cartesian-canvas')");
   for(var cp=0;cp<6;cp++){
    final g=lesson['recognition'][cp]['uime']['graph'] as Map;
    expect(s.success,isFalse,reason:'new step $cp');
    if(g['task']=='explore'){await number('Hoành độ ghim',1);}
    else if(g['task']=='identify'&&g['mode']!='linear_relation'){await click('Chạm G · nét liền');expect(s.success,isFalse);await click('Chạm H · nét đứt');}
    else{
     if(g['mode']!='linear_relation'){await action("var select=document.querySelector('select[aria-label=\"Số nghiệm hoặc giao điểm\"]');select.value='${graphClass(g)}';select.dispatchEvent(new Event('change',{bubbles:true}))");}
     if(g['task']!='discover'||g['mode']=='linear_relation'){
      final targets=graphTargets(g);
      for(var i=0;i<targets.length;i++){
       if(g['mode']=='line_parabola_intersection'){await click(i==0?'Kéo ghim P₁':'Kéo ghim P₂');}
       await number('Hoành độ ghim',targets[i]['x']);await number('Tung độ ghim',targets[i]['y']);
      }
     }
     await click('Xác nhận ghim / kết luận');
    }
    for(var n=0;n<30&&!s.success;n++){await tester.pump(const Duration(milliseconds:100));}
    expect(key.currentState!.error,isEmpty);expect(s.success,isTrue,reason:'${lesson['lessonId']} cp$cp ${jsonEncode(s.snapshot['state'])}');
    expect(await read("window.eng01Root===document.querySelector('.cartesian-canvas')"),isTrue);
    expect(LessonSession(lesson,saved:s.snapshot).snapshot,s.snapshot);
    expect(s.advance(),isTrue);
    if(cp<5){key.currentState!.checkpoint(s.checkpoint['id']);await tester.pump(const Duration(milliseconds:200));}
   }
   expect(s.snapshot['completed'],isTrue);await tester.pumpWidget(const SizedBox());await tester.pump(const Duration(milliseconds:200));
  }
 },timeout:const Timeout(Duration(minutes:8)));
}
