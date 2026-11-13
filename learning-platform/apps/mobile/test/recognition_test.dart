import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mo_hoc/domain.dart';
import 'package:mo_hoc/recognition_scene.dart';

void main() {
  final lessons = jsonDecode(
    File('../../contracts/math9-recognition.json').readAsStringSync(),
  ) as List;
  final schema = jsonDecode(
    File('../../contracts/lesson.schema.json').readAsStringSync(),
  ) as Json;
  for (final raw in lessons) {
    final l = Map<String, dynamic>.from(raw);
    testWidgets('native recognition ${l['lessonId']}', (tester) async {
      expect(validateLesson(l, schema), isEmpty);
      final s = LessonSession(l);
      for (final t in l['recognition']) {
        await tester.pumpWidget(
          MaterialApp(
            home: Scaffold(
              body: SingleChildScrollView(
                child: RecognitionScene(
                  session: s,
                  onInteraction: (e) {
                    s.interact(e);
                  },
                ),
              ),
            ),
          ),
        );
        final wrong = t['correct'] == 1 ? 1 : 0;
        await tester.tap(
          find.widgetWithText(OutlinedButton, t['choices'][wrong]),
        );
        expect(s.success, isFalse);
        await tester.tap(
          find.widgetWithText(OutlinedButton, t['choices'][t['correct'] - 1]),
        );
        expect(s.success, isTrue);
        expect(s.advance(), isTrue);
      }
      expect(s.snapshot['completed'], isTrue);
    });
  }
}
