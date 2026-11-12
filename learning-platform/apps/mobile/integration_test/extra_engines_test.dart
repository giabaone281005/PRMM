import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:mo_hoc/domain.dart';
import 'package:mo_hoc/player.dart';
import 'package:mo_hoc/extra_math_scene.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  testWidgets('Six new native engines complete shared mathematical scenarios', (
    tester,
  ) async {
    final scenarios = jsonDecode(
      await rootBundle.loadString('assets/contracts/math-scenarios.json'),
    ) as List;
    for (final scenario in scenarios.skip(4)) {
      final l = jsonDecode(
        await rootBundle.loadString(
          'assets/contracts/fixtures/${scenario['lessonId']}.lesson.json',
        ),
      ) as Json;
      await tester.pumpWidget(
        MaterialApp(
          key: ValueKey(l['lessonId']),
          home: LessonPage(lesson: l),
        ),
      );
      await tester.pumpAndSettle();
      // Reset any progress retained from an earlier manual run.
      await tester.ensureVisible(find.text('↺ Bắt đầu lại'));
      await tester.tap(find.text('↺ Bắt đầu lại'));
      await tester.pumpAndSettle();
      final scene = find.byType(ExtraNativeScene),
          element = scene.evaluate().single;
      for (final event in scenario['events']) {
        if (event['kind'] == 'interaction') {
          final e = event['event'],
              input = find.byKey(Key('parameter-${e['name']}'));
          await tester.ensureVisible(input);
          await tester.pumpAndSettle();
          final slider = tester.widget<Slider>(input),
              r = tester.getRect(input),
              value = e['value'] as num;
          await tester.tapAt(
            Offset(
              r.left +
                  24 +
                  (r.width - 48) *
                      (value - slider.min) /
                      (slider.max - slider.min),
              r.center.dy,
            ),
          );
          await tester.pumpAndSettle();
        } else {
          await tester.ensureVisible(find.byKey(const Key('continue')));
          expect(
            tester
                .widget<FilledButton>(find.byKey(const Key('continue')))
                .onPressed,
            isNotNull,
            reason: l['lessonId'],
          );
          await tester.tap(find.byKey(const Key('continue')));
          await tester.pumpAndSettle();
        }
      }
      expect(
        find.text('Bạn đã tự mình khám phá!'),
        findsOneWidget,
        reason: l['lessonId'],
      );
      expect(identical(scene.evaluate().single, element), isTrue);
      expect(tester.takeException(), isNull);
    }
  });
}
