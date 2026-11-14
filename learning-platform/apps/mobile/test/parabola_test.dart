import 'dart:convert';
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:mo_hoc/domain.dart';
import 'package:mo_hoc/parabola.dart';

void main(){
 final fixtures=jsonDecode(File('../../contracts/generated/parabola-coefficient.json').readAsStringSync()) as List;
 final schema=jsonDecode(File('../../contracts/lesson.schema.json').readAsStringSync()) as Json;
 for(final f in fixtures){
  test('CP-05 shared replay ${f['manifest']['lessonId']} (prepared, not run)',(){
   final lesson=Map<String,dynamic>.from(f['manifest']),s=LessonSession(lesson);
   expect(validateLesson(lesson,schema),isEmpty);
   for(final events in f['steps']){
    expect(s.success,isFalse);expect(s.advance(),isFalse);
    for(final v in events){
     expect(s.interact(Map<String,dynamic>.from(v['event'])),v['accepted']);expect(s.success,v['success']);
     expect(LessonSession(lesson,saved:s.snapshot).snapshot,s.snapshot);
    }
    expect(s.advance(),isTrue);
   }
   expect(s.snapshot['completed'],isTrue);
  });
 }
 test('CP-05 rejects degenerate coefficients and forged derived progress',(){
  for(final a in [0,.5,6,-6,double.nan,double.infinity]) {
    expect(validateParabola({'a':a,'pointX':2,'task':'guided'}),isNotEmpty);
  }
  expect(parabolaAccept({'a':2,'pointX':2,'task':'guided'},'x',0),isFalse);
  expect(parabolaAccept({'a':2,'pointX':2,'task':'explore'},'b',3),isFalse);
 });
}
