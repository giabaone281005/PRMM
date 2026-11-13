import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:mo_hoc/main.dart';
import 'package:mo_hoc/repository.dart';
import 'package:mo_hoc/catalog_sync.dart';
import 'package:mo_hoc/math_scene.dart';

const lessonId = String.fromEnvironment('LIVE_TEST_LESSON_ID');
Future<void> pumpUntil(WidgetTester tester, bool Function() condition) async {
  final deadline = DateTime.now().add(const Duration(seconds: 120));
  while (!condition()) {
    if (DateTime.now().isAfter(deadline)) {
      fail('Timed out waiting for live catalog');
    }
    await tester.pump(const Duration(milliseconds: 200));
  }
}

void main() {
  final binding = IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  testWidgets(
    'admin publication reaches native mobile over authenticated Realtime',
    (tester) async {
      expect(lessonId, isNotEmpty);
      final savedSession = await repository.sessionStore?.read();
      final events = StreamController<void>.broadcast();
      StreamSubscription<void>? subscription;
      bool joined = false;
      try {
        await repository.signIn(
          const String.fromEnvironment('LIVE_TEST_EMAIL'),
          const String.fromEnvironment('LIVE_TEST_PASSWORD'),
        );
        subscription = catalogChanges(
          repository,
          pollInterval: const Duration(days: 1),
          onSubscribed: () => joined = true,
        ).listen((_) => events.add(null));
        await tester.pumpWidget(MoHocApp(catalogEvents: events.stream));
        await tester.pumpAndSettle();
        await pumpUntil(tester, () => joined);
        await tester.tap(find.byIcon(Icons.grid_view_outlined));
        await tester.pumpAndSettle();
        final card = find.byKey(const ValueKey('lesson-$lessonId'));
        expect(card, findsNothing);
        await repository.request('rest/v1/engine_requests', {
          'id': const String.fromEnvironment('LIVE_TEST_READY'),
          'problem': 'live-catalog-test ready',
        });
        await pumpUntil(tester, () => card.evaluate().isNotEmpty);
        await tester.ensureVisible(card);
        await tester.pumpAndSettle();
        await binding.convertFlutterSurfaceToImage();
        await tester.pumpAndSettle();
        await binding.takeScreenshot('android-live-published');
        await tester.tap(card);
        await tester.pumpAndSettle();
        expect(find.byType(NativeMathScene), findsOneWidget);
        await tester.tap(find.byIcon(Icons.close).first);
        await tester.pumpAndSettle();
        await repository.request('rest/v1/engine_requests', {
          'id': const String.fromEnvironment('LIVE_TEST_SEEN'),
          'problem': 'live-catalog-test seen and opened',
        });
        await pumpUntil(tester, () => card.evaluate().isEmpty);
        await binding.takeScreenshot('android-live-unpublished');
        await repository.request('rest/v1/engine_requests', {
          'id': const String.fromEnvironment('LIVE_TEST_REMOVED'),
          'problem': 'live-catalog-test removed',
        });
      } finally {
        await tester.pumpWidget(const SizedBox());
        await subscription?.cancel();
        await events.close();
        try {
          await repository.signOut();
        } catch (_) {}
        if (savedSession != null) {
          await repository.sessionStore!.write(savedSession);
          await repository.restoreSession();
        }
      }
    },
  );
}
