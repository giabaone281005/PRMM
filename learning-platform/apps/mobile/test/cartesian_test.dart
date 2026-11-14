import 'dart:convert';
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:mo_hoc/domain.dart';
import 'package:mo_hoc/cartesian.dart';
void main(){
 final fixtures=jsonDecode(File('../../contracts/generated/cartesian.json').readAsStringSync()) as List;
 final vectors=jsonDecode(File('../../contracts/core-engines/cartesian-vectors.json').readAsStringSync()) as List;
 final schema=jsonDecode(File('../../contracts/lesson.schema.json').readAsStringSync()) as Json;
 for(final v in vectors) {
   test('ENG-01 math ${v['name']}',(){
  expect(validateGraphData(v['data'],v['mode']).isEmpty,v['valid']);
  if(v['valid']==true){final r=graphSolution(v['data'],v['mode']);expect(r['kind'],v['solution']['kind']);expect((r['points'] as List).length,(v['solution']['points'] as List).length);for(var i=0;i<(r['points'] as List).length;i++){expect(r['points'][i]['x'],closeTo(v['solution']['points'][i]['x'],1e-8));expect(r['points'][i]['y'],closeTo(v['solution']['points'][i]['y'],1e-8));}}
 });
 }
 for(final f in fixtures) {
   test('ENG-01 shared replay ${f['manifest']['lessonId']}',(){
  final l=Map<String,dynamic>.from(f['manifest']),s=LessonSession(l);expect(validateLesson(l,schema),isEmpty);
  for(final events in f['steps']){expect(s.success,isFalse);expect(s.advance(),isFalse);for(final v in events){expect(s.interact(Map<String,dynamic>.from(v['event'])),v['accepted'],reason:jsonEncode(v['event']));expect(s.success,v['success'],reason:jsonEncode({'event':v['event'],'state':s.snapshot['state']}));for(final key in (v['state'] as Map).keys) {
    expect(s.snapshot['state'][key],v['state'][key]);
  }expect(LessonSession(l,saved:s.snapshot).snapshot,s.snapshot);}expect(s.advance(),isTrue);}
  expect(s.snapshot['completed'],isTrue);
 });
 }
}
