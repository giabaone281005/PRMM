import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'package:mo_hoc/main.dart' as app;
import 'package:mo_hoc/domain.dart';
import 'package:mo_hoc/player.dart';
import 'package:mo_hoc/math_scene.dart';
import 'package:mo_hoc/repository.dart';
void main(){final binding=IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  Future<void> setSlider(WidgetTester tester,String name,num value)async{final finder=find.byKey(Key('parameter-$name'));await tester.ensureVisible(finder);await tester.pumpAndSettle();final slider=tester.widget<Slider>(finder),r=tester.getRect(finder);final x=r.left+24+(r.width-48)*(value-slider.min)/(slider.max-slider.min);await tester.tapAt(Offset(x,r.center.dy));await tester.pumpAndSettle();}
  for(final id in ['integer-minus-three','fraction-three-fourths','balance-linear-equation','quadratic-transformations']){
    testWidgets('Android native math interaction and progression: $id',(tester)async{
      final prefs=await SharedPreferences.getInstance();await prefs.clear();final l=jsonDecode(await rootBundle.loadString('assets/contracts/fixtures/$id.lesson.json')) as Json;l['status']='published';
      await tester.pumpWidget(MaterialApp(debugShowCheckedModeBanner:false,theme:ThemeData(colorScheme:ColorScheme.fromSeed(seedColor:const Color(0xff263323),surface:const Color(0xfffafbf7)),filledButtonTheme:FilledButtonThemeData(style:FilledButton.styleFrom(backgroundColor:const Color(0xff263323)))),home:LessonPage(lesson:l)));await tester.pumpAndSettle();await binding.convertFlutterSurfaceToImage();await tester.pumpAndSettle();final view=find.byType(NativeMathScene),element=view.evaluate().single,s=tester.widget<NativeMathScene>(view).session,model=s.objects.firstWhere((o)=>o['kind']=='math_model')['model'];
      expect(s.success,isFalse);await setSlider(tester,model=='fraction_bar'?'numerator':model=='quadratic_graph'?'a':'x',2);expect(s.success,isTrue);await tester.ensureVisible(find.byKey(const Key('continue')));await tester.tap(find.byKey(const Key('continue')));await tester.pumpAndSettle();expect(identical(view.evaluate().single,element),isTrue);expect(s.success,isFalse);
      if(model=='number_line')await setSlider(tester,'x',-3);if(model=='fraction_bar')await setSlider(tester,'numerator',3);if(model=='linear_balance')await setSlider(tester,'x',4);if(model=='quadratic_graph'){await setSlider(tester,'a',2);await setSlider(tester,'b',-1);await setSlider(tester,'c',1);}expect(s.success,isTrue);await binding.takeScreenshot('android-math-$id');await tester.ensureVisible(find.byKey(const Key('continue')));await tester.tap(find.byKey(const Key('continue')));await tester.pumpAndSettle();
      if(model=='number_line')await setSlider(tester,'x',3);if(model=='fraction_bar')await setSlider(tester,'numerator',6);if(model=='linear_balance')await setSlider(tester,'x',5);if(model=='quadratic_graph')await setSlider(tester,'c',2);expect(s.success,isTrue);await tester.ensureVisible(find.byKey(const Key('continue')));await tester.tap(find.byKey(const Key('continue')));await tester.pumpAndSettle();expect(find.text('Bạn đã tự mình khám phá!'),findsOneWidget);
    });
  }
  testWidgets('Local author publish is visible and playable in the Android learner',(tester)async{
    final l=jsonDecode(await rootBundle.loadString('assets/contracts/fixtures/balance-linear-equation.lesson.json')) as Json;l['lessonId']='local-android-cross-client';l['title']='Bài từ admin: 3x + 2 = 17';l['scene']['objects'][0]['parameters']={'x':0,'a':3,'b':2,'c':17};l['checkpoints'][1]['instruction']='Tìm x để 3x + 2 = 17.';
    final published=await http.post(Uri.parse('$localApiUrl/admin/publish'),headers:{'Content-Type':'application/json'},body:jsonEncode({'manifest':l}));expect(published.statusCode,200,reason:'Local authoring API must accept the contract');
    app.main();await tester.pumpAndSettle();for(var i=0;i<12;i++){if(find.byKey(ValueKey('lesson-${l['lessonId']}')).evaluate().isNotEmpty)break;await tester.pump(const Duration(milliseconds:300));}await tester.tap(find.byKey(ValueKey('lesson-${l['lessonId']}')));await tester.pumpAndSettle();await setSlider(tester,'x',2);await tester.ensureVisible(find.byKey(const Key('continue')));await tester.tap(find.byKey(const Key('continue')));await tester.pumpAndSettle();await setSlider(tester,'x',5);final s=tester.widget<NativeMathScene>(find.byType(NativeMathScene)).session;expect(s.success,isTrue);expect(s.metrics['modelValue'],17);await binding.convertFlutterSurfaceToImage();await tester.pumpAndSettle();await binding.takeScreenshot('android-local-created-lesson');await http.post(Uri.parse('$localApiUrl/admin/unpublish'),headers:{'Content-Type':'application/json'},body:jsonEncode({'id':l['lessonId']}));
  });
}
