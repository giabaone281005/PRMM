import 'dart:convert';
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:mo_hoc/domain.dart';

void main() {
  final fixtures=jsonDecode(File('../../contracts/generated/cylinder-recognition.json').readAsStringSync()) as List;
  final schema=jsonDecode(File('../../contracts/lesson.schema.json').readAsStringSync()) as Json;
  for(final f in fixtures) {
    test('CP-04 TS/Dart parity ${f['manifest']['lessonId']}',(){
      final lesson=Map<String,dynamic>.from(f['manifest']),s=LessonSession(lesson);
      expect(validateLesson(lesson,schema),isEmpty);
      for(final events in f['steps']) {
        expect(s.success,isFalse);expect(s.advance(),isFalse);
        for(final v in events) {
          expect(s.interact(Map<String,dynamic>.from(v['event'])),v['accepted']);
          expect(s.success,v['success']);
          for(final entry in (v['state'] as Map).entries) {
            expect(s.snapshot['state'][entry.key],closeTo((entry.value as num).toDouble(),1e-10));
          }
          expect(LessonSession(lesson,saved:s.snapshot).success,s.success);
        }
        final a=s.snapshot['state']['a'],b=s.snapshot['state']['b'];
        expect(s.advance(),isTrue);expect(s.snapshot['state']['a'],a);expect(s.snapshot['state']['b'],b);
      }
      expect(s.snapshot['completed'],isTrue);
    });
  }
}
