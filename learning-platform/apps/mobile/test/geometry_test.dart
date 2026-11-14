import 'dart:convert';
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:mo_hoc/domain.dart';
import 'package:mo_hoc/geometry.dart';
void main(){
 final vectors=jsonDecode(File('../../contracts/core-engines/geometry-vectors.json').readAsStringSync()) as List;
 final fixtures=jsonDecode(File('../../contracts/generated/geometry.json').readAsStringSync()) as List;
 final schema=jsonDecode(File('../../contracts/lesson.schema.json').readAsStringSync()) as Json;
 for(final v in vectors){test('ENG-02 math/guard ${v['name']}',(){
  final g=v['config'] as Map;expect(validateGeometry(g).isEmpty,v['valid']);
  if(v['valid']==true){final m=geometryMeasure(g);expect(m['value'],closeTo(v['value'],1e-8));expect(m['targetIndex'],v['targetIndex']);expect(m['selectionCount'],v['selectionCount']);for(final key in (v['facts'] as Map).keys){expect(m['facts'][key],closeTo(v['facts'][key],1e-8));}}
 });}
 for(final f in fixtures){test('ENG-02 six steps/restore ${f['manifest']['lessonId']}',(){
  final lesson=Map<String,dynamic>.from(f['manifest']),s=LessonSession(lesson);expect(validateLesson(lesson,schema),isEmpty);
  for(final events in f['steps']){expect(s.success,isFalse);expect(s.advance(),isFalse);for(final v in events){expect(s.interact(Map<String,dynamic>.from(v['event'])),v['accepted'],reason:jsonEncode(v['event']));expect(s.success,v['success'],reason:jsonEncode(s.snapshot['state']));for(final key in (v['state'] as Map).keys){expect(s.snapshot['state'][key],v['state'][key]);}expect(LessonSession(lesson,saved:s.snapshot).snapshot,s.snapshot);}expect(s.advance(),isTrue);}expect(s.snapshot['completed'],isTrue);
 });}
}
