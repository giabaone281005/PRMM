import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:mo_hoc/domain.dart';
import 'package:mo_hoc/geometry.dart';
import 'package:mo_hoc/scenes.dart';
import 'fixtures.dart';
void main(){
 IntegrationTestWidgetsFlutterBinding.ensureInitialized();
 testWidgets('ENG-02 thirty inputs complete through physical Android WebView/Dart bridge',(tester)async{
  final fixtures=jsonDecode(integrationFixtureJson['geometry.json']!) as List;
  for(final f in fixtures){
   final lesson=Map<String,dynamic>.from(f['manifest']),s=LessonSession(lesson),key=GlobalKey<SolidViewState>();
   await tester.pumpWidget(MaterialApp(home:Scaffold(body:SafeArea(child:SolidView(key:key,session:s,onInteraction:(event){s.interact(event);})))));
   for(var n=0;n<200&&key.currentState?.ready!=true;n++){await tester.pump(const Duration(milliseconds:100));}
   expect(key.currentState?.ready,isTrue,reason:lesson['lessonId']);
   Future<dynamic> read(String source)async{dynamic r=await key.currentState!.controller!.runJavaScriptReturningResult(source);for(var n=0;n<2&&r is String;n++){try{r=jsonDecode(r);}catch(_){break;}}return r;}
   Future<void> action(String source)async{await key.currentState!.controller!.runJavaScript(source);await tester.pump(const Duration(milliseconds:100));}
   Future<void> value(String selector,num value)async{await action("var element=document.querySelector(${jsonEncode(selector)});Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(element,${jsonEncode(value.toString())});element.dispatchEvent(new Event('input',{bubbles:true}));");}
   await action("window.eng02Root=document.querySelector('.geometry-canvas')");
   for(var cp=0;cp<6;cp++){
    final g=lesson['recognition'][cp]['uime']['geometry'] as Map,m=geometryMeasure(g);
    expect(s.success,isFalse,reason:'new step $cp');
    if(cp==0){await value('input[aria-label="Góc xoay hình"]',25);}
    else{
     if(cp!=2){
      await value('input[aria-label="Góc xoay hình"]',45);await value('input[aria-label="Thu phóng hình"]',.75);
      final required=m['requiredLayer'];if(required!=0){await action("document.querySelector('input[data-layer-id=\"${required==4?'incircle':'circumcircle'}\"]').click()");}
      await action("document.querySelectorAll('.geometry-object-controls button')[${m['targetIndex']}].click()");
     }
     if(cp!=1){await value('input[aria-label="Kết quả hình học"]',m['value']);await action("Array.from(document.querySelectorAll('button')).find(e=>e.textContent==='Xác nhận hình học').click()");}
    }
    for(var n=0;n<30&&!s.success;n++){await tester.pump(const Duration(milliseconds:100));}
    expect(key.currentState!.error,isEmpty);expect(s.success,isTrue,reason:'${lesson['lessonId']} cp$cp ${jsonEncode(s.snapshot['state'])}');
    expect(await read("window.eng02Root===document.querySelector('.geometry-canvas')"),isTrue);expect(LessonSession(lesson,saved:s.snapshot).snapshot,s.snapshot);expect(s.advance(),isTrue);
    if(cp<5){key.currentState!.checkpoint(s.checkpoint['id']);await tester.pump(const Duration(milliseconds:150));}
   }
   expect(s.snapshot['completed'],isTrue);await tester.pumpWidget(const SizedBox());await tester.pump(const Duration(milliseconds:150));
  }
 },timeout:const Timeout(Duration(minutes:12)));
}
