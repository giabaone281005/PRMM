import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:mo_hoc/main.dart' as app;
import 'package:mo_hoc/activity.dart';
import 'package:mo_hoc/repository.dart';

void main() {
  final binding = IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  testWidgets(
    'Compact shell, actual study activity and account timeline on Android',
    (tester) async {
      app.main();
      await tester.pumpAndSettle();
      await binding.convertFlutterSurfaceToImage();
      await tester.pumpAndSettle();
      expect(find.text('Home'), findsOneWidget);
      expect(find.byType(app.LessonIconTile), findsNWidgets(6));
      await binding.takeScreenshot('mobile-redesign-home');
      await tester.tap(find.byIcon(Icons.grid_view_outlined));
      await tester.pumpAndSettle();
      await binding.takeScreenshot('mobile-redesign-lessons');
      final icon = find.byKey(const ValueKey('lesson-integer-minus-three'));
      await tester.ensureVisible(icon);
      await tester.tap(icon);
      await tester.pumpAndSettle();
      await tester.ensureVisible(find.text('↺ Bắt đầu lại'));
      await tester.tap(find.text('↺ Bắt đầu lại'));
      await tester.pumpAndSettle();
      final slider = find.byKey(const Key('parameter-x'));
      await tester.ensureVisible(slider);
      await tester.pumpAndSettle();
      final bounds = tester.getRect(slider);
      await tester.tapAt(
        Offset(bounds.left + 24 + (bounds.width - 48) * .6, bounds.center.dy),
      );
      await tester.pumpAndSettle();
      await tester.ensureVisible(find.byKey(const Key('continue')));
      expect(
        tester
            .widget<FilledButton>(find.byKey(const Key('continue')))
            .onPressed,
        isNotNull,
      );
      await tester.tap(find.byKey(const Key('continue')));
      await tester.pumpAndSettle();
      await binding.takeScreenshot('mobile-redesign-player');
      for (final value in [-3, 3]) {
        await tester.ensureVisible(slider);
        await tester.pumpAndSettle();
        final r = tester.getRect(slider);
        await tester.tapAt(
          Offset(r.left + 24 + (r.width - 48) * (value + 10) / 20, r.center.dy),
        );
        await tester.pumpAndSettle();
        await tester.ensureVisible(find.byKey(const Key('continue')));
        await tester.tap(find.byKey(const Key('continue')));
        await tester.pumpAndSettle();
      }
      expect(find.text('Bạn đã tự mình khám phá!'), findsOneWidget);
      await tester.ensureVisible(find.byKey(const Key('continue')));
      await tester.tap(find.byKey(const Key('continue')));
      await tester.pumpAndSettle();
      await tester.tap(find.byIcon(Icons.person_outline_rounded).last);
      await tester.pumpAndSettle();
      final activity = await ActivityStore.load(repository.userId ?? 'local');
      expect(
        activity.events.any((e) => e['lessonId'] == 'integer-minus-three'),
        isTrue,
      );
      expect(activity.streak(DateTime.now()), greaterThanOrEqualTo(1));
      expect(
        activity.events.any(
          (e) =>
              e['lessonId'] == 'integer-minus-three' && e['type'] == 'complete',
        ),
        isTrue,
      );
      expect(find.byType(app.ActivityHeatmap), findsOneWidget);
      await binding.takeScreenshot('mobile-redesign-profile');
      await tester.scrollUntilVisible(
        find.text('Gần đây'),
        150,
        scrollable: find.byType(Scrollable).first,
      );
      await tester.pumpAndSettle();
      await binding.takeScreenshot('mobile-redesign-timeline');
      expect(tester.takeException(), isNull);
    },
  );
}
