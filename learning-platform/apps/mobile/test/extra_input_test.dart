import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mo_hoc/domain.dart';
import 'package:mo_hoc/extra_math_scene.dart';
import 'dart:convert';
import 'dart:io';
void main(){testWidgets('numeric input stays active when advancing a persistent native engine',(tester)async{final l=jsonDecode(File('../../contracts/fixtures/percent-of-a-whole.lesson.json').readAsStringSync()) as Json,s=LessonSession(l);await tester.pumpWidget(MaterialApp(home:Scaffold(body:SingleChildScrollView(child:StatefulBuilder(builder:(context,redraw)=>Column(children:[ExtraNativeScene(session:s,onInteraction:(e)=>redraw(()=>s.interact(e))),TextButton(onPressed:()=>redraw(()=>s.advance()),child:const Text('Next'))]))))));final input=find.byKey(const Key('number-x'));await tester.enterText(input,'2');await tester.pump();expect(s.success,isTrue);await tester.ensureVisible(find.text('Next'));await tester.tap(find.text('Next'));await tester.pump();await tester.ensureVisible(input);await tester.enterText(input,'25');await tester.pump();expect(s.snapshot['state']['x'],25);expect(s.success,isTrue);});}
