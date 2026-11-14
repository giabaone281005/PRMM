import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:mo_hoc/domain.dart';
import 'package:mo_hoc/algebra.dart';
import 'package:mo_hoc/scenes.dart';
import 'fixtures.dart';
void main(){
 IntegrationTestWidgetsFlutterBinding.ensureInitialized();
 testWidgets('ENG-03 eighteen inputs, six steps through physical Android WebView/Dart bridge',(tester)async{
  final fixtures=jsonDecode(integrationFixtureJson['algebra.json']!) as List;
  for(final f in fixtures){
   final lesson=Map<String,dynamic>.from(f['manifest']),s=LessonSession(lesson),key=GlobalKey<SolidViewState>();
   await tester.pumpWidget(MaterialApp(home:Scaffold(body:SafeArea(child:SolidView(key:key,session:s,onInteraction:(event){s.interact(event);})))));
   for(var n=0;n<200&&key.currentState?.ready!=true;n++){await tester.pump(const Duration(milliseconds:100));}expect(key.currentState?.ready,isTrue,reason:lesson['lessonId']);
   Future<dynamic> read(String source)async{dynamic r=await key.currentState!.controller!.runJavaScriptReturningResult(source);for(var n=0;n<2&&r is String;n++){try{r=jsonDecode(r);}catch(_){break;}}return r;}
   Future<void> action(String source)async{await key.currentState!.controller!.runJavaScript(source);await tester.pump(const Duration(milliseconds:110));}
   Future<void> number(String label,num value)async{await action("var element=document.querySelector('input[aria-label=\"$label\"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(element,${jsonEncode(value.toString())});element.dispatchEvent(new Event('input',{bubbles:true}));");}
   Future<void> click(String text)async{await action("Array.from(document.querySelectorAll('button')).find(e=>e.textContent===${jsonEncode(text)}).click()");}
   Future<void> select(String label,num value)async{await action("var element=document.querySelector('select[aria-label=\"$label\"]');element.value='$value';element.dispatchEvent(new Event('change',{bubbles:true}))");}
   await action("window.eng03Root=document.querySelector('.algebra-scene');window.eng03Graph=document.querySelector('.algebra-graph')");
   for(var cp=0;cp<6;cp++){
    final g=lesson['recognition'][cp]['uime']['algebra'] as Map,m=algebraModel(g);expect(s.success,isFalse,reason:'new step $cp');
    if(cp==0){await number('Giá trị thử x',1);}
    else{
     if(g['mode']=='rational_equation'){
      final mask=algebraDomainMask(g);for(var i=0;i<algebraDomainPool(g).length;i++){if((mask&(1<<i))!=0){await action("document.querySelector('input[data-domain-index=\"$i\"]').click()");}}await click('Chốt điều kiện xác định');
     }else if(cp!=2||g['mode']=='viete'){
      final targets=algebraSlotTargets(g),cards=algebraCards(g);for(var i=0;i<targets.length;i++){await action("document.querySelector('[data-card-id=\"${cards[targets[i]]['id']}\"]').click()");await action("document.querySelectorAll('[data-algebra-slot]')[$i].click()");}
     }
     if(cp!=1){
      if(g['mode']=='quadratic_equation'){await select('Bậc phương trình',m['degree']);if(m['degree']==2){await number('Δ · chỉ nhập khi bậc hai',m['delta']);}}
      if(g['mode']=='viete'){await number('Giá trị tổng hai nghiệm',m['sum']);await number('Giá trị tích hai nghiệm',m['product']);}
      if(cp!=2||['product_equation','rational_equation'].contains(g['mode'])){await select('Phép biến đổi đại số',g['mode']=='product_equation'?1:g['mode']=='rational_equation'?0:m['a']!=0?2:5);}
      if(cp!=2||g['mode']=='quadratic_equation'){await select('Số nghiệm thực khác nhau',m['count']);}
      if(cp>=3){final roots=algebraRootInputs(g);for(var i=0;i<roots.length;i++){await number(i==0?'Nghiệm thứ nhất':'Nghiệm thứ hai',roots[i]);}}
      await click('Xác nhận đại số');
     }
    }
    for(var n=0;n<30&&!s.success;n++){await tester.pump(const Duration(milliseconds:100));}
    expect(key.currentState!.error,isEmpty);expect(s.success,isTrue,reason:'${lesson['lessonId']} cp$cp ${jsonEncode(s.snapshot['state'])}');expect(await read("window.eng03Root===document.querySelector('.algebra-scene')&&window.eng03Graph===document.querySelector('.algebra-graph')"),isTrue);expect(LessonSession(lesson,saved:s.snapshot).snapshot,s.snapshot);expect(s.advance(),isTrue);
    if(cp<5){key.currentState!.checkpoint(s.checkpoint['id']);await tester.pump(const Duration(milliseconds:180));}
   }
   expect(s.snapshot['completed'],isTrue);await tester.pumpWidget(const SizedBox());await tester.pump(const Duration(milliseconds:150));
  }
 },timeout:const Timeout(Duration(minutes:12)));
}
