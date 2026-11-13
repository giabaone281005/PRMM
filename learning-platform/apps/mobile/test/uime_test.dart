import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:mo_hoc/domain.dart';
import 'package:mo_hoc/uime.dart';

void main() {
  final lessons = jsonDecode(
    File('../../contracts/uime-fixtures.json').readAsStringSync(),
  ) as List;
  final schema = jsonDecode(
    File('../../contracts/lesson.schema.json').readAsStringSync(),
  ) as Json;
  for (final raw in lessons) {
    test('U-IME parity ${raw['lessonId']}', () {
      final l = Map<String, dynamic>.from(raw);
      expect(validateLesson(l, schema), isEmpty);
      final s = LessonSession(l);
      expect(s.success, isFalse);
      expect(
        s.interact({'type': 'adjust_parameter', 'name': 'x', 'value': 999}),
        isFalse,
      );
      for (final t in l['recognition']) {
        final u = t['uime'];
        for (var i = 0; i < (u['answers'] as List).length; i++) {
          s.interact({
            'type': 'adjust_parameter',
            'name': uimeKeys[i],
            'value': u['answers'][i],
          });
        }
        if (u['kind'] == '3D_SOLID_INSPECTOR') {
          expect(s.success, isFalse);
          s.interact({'type': 'adjust_parameter', 'name': 'a', 'value': .5});
        }
        expect(s.success, isTrue);
        expect(s.advance(), isTrue);
      }
      expect(s.snapshot['completed'], isTrue);
      expect(LessonSession(l, saved: s.snapshot).snapshot['completed'], isTrue);
    });
  }
}
