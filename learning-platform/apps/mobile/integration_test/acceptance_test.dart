import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mo_hoc/main.dart' as app;
import 'package:mo_hoc/domain.dart';
import 'package:mo_hoc/player.dart';
import 'package:mo_hoc/scenes.dart';
void main(){
  final binding=IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  Future<void> screenshot(String name)async{await binding.takeScreenshot(name);}
  testWidgets('Android native triangle: gestures, persistent scene, completion and restore',(tester)async{
    final prefs=await SharedPreferences.getInstance();await prefs.clear();app.main();await tester.pumpAndSettle();await binding.convertFlutterSurfaceToImage();await tester.pumpAndSettle();await screenshot('android-home');
    await tester.tap(find.byKey(const ValueKey('lesson-grade7-triangle-angle-sum')));await tester.pumpAndSettle();final scene=find.byKey(const Key('native-scene'));await tester.ensureVisible(scene);await tester.pumpAndSettle();
    Offset point(double x,double y){final r=tester.getRect(scene);return r.topLeft+Offset(x/360*r.width,y/360*r.width);}
    expect(tester.widget<FilledButton>(find.byKey(const Key('continue'))).onPressed,isNull);await screenshot('android-triangle-cp1');
    await tester.dragFrom(point(170,65),point(220,95)-point(170,65));await tester.pumpAndSettle();expect(tester.widget<FilledButton>(find.byKey(const Key('continue'))).onPressed,isNotNull);final element=scene.evaluate().single;
    await tester.ensureVisible(find.byKey(const Key('continue')));await tester.tap(find.byKey(const Key('continue')));await tester.pumpAndSettle();expect(identical(scene.evaluate().single,element),isTrue);await tester.ensureVisible(scene);await screenshot('android-triangle-cp2');
    await tester.dragFrom(point(60,240),point(90,200)-point(60,240));await tester.pumpAndSettle();await tester.ensureVisible(find.byKey(const Key('continue')));await tester.tap(find.byKey(const Key('continue')));await tester.pumpAndSettle();await tester.ensureVisible(scene);await screenshot('android-triangle-cp3');
    for(var i=0;i<3;i++){await tester.dragFrom(point(65+i*110,275),point(180,320)-point(65+i*110,275));await tester.pumpAndSettle();}
    await screenshot('android-triangle-assembled');await tester.ensureVisible(find.byKey(const Key('continue')));expect(tester.widget<FilledButton>(find.byKey(const Key('continue'))).onPressed,isNotNull);await tester.tap(find.byKey(const Key('continue')));await tester.pumpAndSettle();expect(find.text('Bạn đã tự mình khám phá!'),findsOneWidget);
    await tester.tap(find.byKey(const Key('continue')));await tester.pumpAndSettle();await tester.tap(find.byKey(const ValueKey('lesson-grade7-triangle-angle-sum')));await tester.pumpAndSettle();expect(find.text('Bạn đã tự mình khám phá!'),findsOneWidget);await screenshot('android-triangle-restored');
  });
  testWidgets('Android Three.js WebView: READY, gesture orbit, face selection, layers and ACK',(tester)async{
    final l=jsonDecode(await rootBundle.loadString('assets/contracts/fixtures/grade8-solid-volume.lesson.json')) as Json;l['status']='published';await tester.pumpWidget(MaterialApp(debugShowCheckedModeBanner:false,theme:ThemeData(colorScheme:ColorScheme.fromSeed(seedColor:const Color(0xff263323),surface:const Color(0xfffafbf7)),filledButtonTheme:FilledButtonThemeData(style:FilledButton.styleFrom(backgroundColor:const Color(0xff263323)))),home:LessonPage(lesson:l)));await tester.pumpAndSettle();
    await binding.convertFlutterSurfaceToImage();await tester.pumpAndSettle();final view=find.byType(SolidView);for(var i=0;i<30;i++){await tester.pump(const Duration(milliseconds:500));final state=tester.state<SolidViewState>(view);if(state.ready)break;}
    final state=tester.state<SolidViewState>(view);expect(state.ready,isTrue,reason:'Bundled 3D runtime must emit READY');expect(state.error,isEmpty);await tester.ensureVisible(view);await screenshot('android-solid-ready');
    final rect=tester.getRect(view);await tester.dragFrom(rect.center,const Offset(100,0));await tester.pump(const Duration(seconds:1));final s=tester.widget<SolidView>(view).session;
    expect(s.success,isTrue,reason:'Native touch orbit must reach WebView and produce normalized metrics');await tester.ensureVisible(find.byKey(const Key('continue')));await tester.tap(find.byKey(const Key('continue')));await tester.pump(const Duration(seconds:1));await tester.ensureVisible(view);await tester.tapAt(tester.getRect(view).center);await tester.pump(const Duration(seconds:1));expect(s.success,isTrue,reason:'Raycast face selection must unlock checkpoint');await screenshot('android-solid-selected');
    await tester.ensureVisible(find.byKey(const Key('continue')));await tester.tap(find.byKey(const Key('continue')));await tester.pump(const Duration(seconds:1));await tester.ensureVisible(view);
    // Range inputs live in the platform view. Dispatch DOM pointer input through the real renderer.
    Future<void> fill()async{await state.controller!.runJavaScript("var slider=document.querySelector('input[type=range]');var setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(slider,'3');slider.dispatchEvent(new Event('input',{bubbles:true}));slider.dispatchEvent(new Event('change',{bubbles:true}));");await tester.pump(const Duration(seconds:1));}
    await fill();expect(s.metrics['filledLayers'],3);await tester.ensureVisible(find.byKey(const Key('continue')));await tester.tap(find.byKey(const Key('continue')));await tester.pump(const Duration(seconds:1));expect(s.success,isFalse);await fill();expect(s.metrics['volume'],36);await screenshot('android-solid-filled');await tester.ensureVisible(find.byKey(const Key('continue')));await tester.tap(find.byKey(const Key('continue')));await tester.pumpAndSettle();expect(find.text('Bạn đã tự mình khám phá!'),findsOneWidget);expect(state.error,isEmpty);
  });
}


