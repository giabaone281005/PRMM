import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mo_hoc/main.dart' as app;
import 'package:mo_hoc/domain.dart';
import 'package:mo_hoc/math_scene.dart';

import 'fixtures.dart';

// This entrypoint is installed only in vn.mohoc.mo_hoc.uitest by test-user.bat.
// No widget callbacks, session.interact or WebView JavaScript are used to solve steps.
void main() {
  final binding = IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  HttpServer? server;
  const names = [
    'integer-minus-three',
    'fraction-three-fourths',
    'balance-linear-equation',
    'quadratic-transformations',
  ];
  Json lesson(String name) => {
    ...jsonDecode(integrationFixtureJson['$name.lesson.json']!) as Json,
    'status': 'published',
  };
  final catalog = [
    for (final name in names) lesson(name),
    lesson('grade7-triangle-angle-sum'),
  ];

  setUpAll(() async {
    final package = await const MethodChannel('mohoc/app-identity')
        .invokeMethod<String>('packageName');
    expect(
      package,
      'vn.mohoc.mo_hoc.uitest',
      reason: 'Refuse to touch storage in the ordinary app',
    );
    // A deterministic backend inside the test APK acknowledges local progress only.
    server = await HttpServer.bind(InternetAddress.loopbackIPv4, 18765);
    server!.listen((request) async {
      await request.drain<void>();
      request.response.headers.contentType = ContentType.json;
      request.response.write(
        jsonEncode(
          request.uri.path.endsWith('/catalog') ? catalog : {'ok': true},
        ),
      );
      await request.response.close();
    });
    final prefs = await SharedPreferences.getInstance();
    await prefs
        .clear(); // Test package storage only; ordinary app has a different ID.
  });
  tearDownAll(() async {
    await server?.close(force: true);
  });

  Future<void> tap(WidgetTester tester, Finder target) async {
    await tester.ensureVisible(target);
    await tester.pumpAndSettle();
    await tester.tap(target);
    await tester.pumpAndSettle();
  }

  Future<void> next(WidgetTester tester) async {
    final target = find.byKey(const Key('continue'));
    await tester.ensureVisible(target);
    await tester.pumpAndSettle();
    expect(tester.widget<FilledButton>(target).onPressed, isNotNull);
    await tap(tester, target);
  }

  Future<void> slide(WidgetTester tester, String name, num value) async {
    final target = find.byKey(Key('parameter-$name'));
    await tester.ensureVisible(target);
    await tester.pumpAndSettle();
    final slider = tester.widget<Slider>(target), rect = tester.getRect(target);
    Offset position(num v) => Offset(
      rect.left +
          24 +
          (rect.width - 48) * (v - slider.min) / (slider.max - slider.min),
      rect.center.dy,
    );
    await tester.dragFrom(
      position(slider.value),
      position(value) - position(slider.value),
    );
    await tester.pumpAndSettle();
  }

  Future<void> shot(String name) async {
    await binding.takeScreenshot(name);
    debugPrint('[USER UI] Captured $name');
  }

  testWidgets(
    'User navigates catalog, drags native math controls, completes and restores four lessons',
    (tester) async {
      await tester.pumpWidget(app.MoHocApp(catalogLoader: () async => catalog));
      await tester.pumpAndSettle();
      await binding.convertFlutterSurfaceToImage();
      await tester.pumpAndSettle();
      await shot('01-home');
      await tap(tester, find.byIcon(Icons.grid_view_outlined));
      await shot('02-catalog');
      for (final name in names) {
        await tap(tester, find.byKey(ValueKey('lesson-$name')));
        final scene = find.byType(NativeMathScene);
        final element = scene.evaluate().single;
        expect(
          tester
              .widget<FilledButton>(find.byKey(const Key('continue')))
              .onPressed,
          isNull,
        );
        await slide(
          tester,
          name.startsWith('fraction')
              ? 'numerator'
              : name.startsWith('quadratic')
              ? 'a'
              : 'x',
          2,
        );
        await next(tester);
        expect(identical(scene.evaluate().single, element), isTrue);
        // Leave mid-lesson through the real close button, then reopen from the catalog.
        await tap(tester, find.byTooltip('Thoát bài học'));
        await tap(tester, find.byKey(ValueKey('lesson-$name')));
        expect(find.text('2 / 3'), findsOneWidget);
        final targets = switch (name) {
          'integer-minus-three' => <String, num>{'x': -3},
          'fraction-three-fourths' => <String, num>{'numerator': 3},
          'balance-linear-equation' => <String, num>{'x': 4},
          _ => <String, num>{'a': 2, 'b': -1, 'c': 1},
        };
        for (final entry in targets.entries) {
          await slide(tester, entry.key, entry.value);
        }
        await shot('03-$name-checkpoint');
        await next(tester);
        await slide(
          tester,
          name.startsWith('fraction')
              ? 'numerator'
              : name.startsWith('quadratic')
              ? 'c'
              : 'x',
          switch (name) {
            'integer-minus-three' => 3,
            'fraction-three-fourths' => 6,
            'balance-linear-equation' => 5,
            _ => 2,
          },
        );
        await next(tester);
        expect(find.text('Bạn đã tự mình khám phá!'), findsOneWidget);
        await shot('04-$name-completed');
        await next(tester);
        await tap(tester, find.byKey(ValueKey('lesson-$name')));
        expect(find.text('Bạn đã tự mình khám phá!'), findsOneWidget);
        await next(tester);
      }
      await tap(tester, find.byIcon(Icons.person_outline_rounded).last);
      expect(find.byType(app.ActivityHeatmap), findsOneWidget);
      await shot('05-profile');
      await tester.scrollUntilVisible(
        find.text('Gần đây'),
        150,
        scrollable: find.byType(Scrollable).first,
      );
      await tester.pumpAndSettle();
      await shot('06-activity');
      expect(tester.takeException(), isNull);
    },
  );

  testWidgets(
    'User drags triangle vertices and assembles angles using native touch gestures',
    (tester) async {
      await tester.pumpWidget(
        app.MoHocApp(
          key: const ValueKey('triangle-ui'),
          catalogLoader: () async => catalog,
        ),
      );
      await tester.pumpAndSettle();
      await binding.convertFlutterSurfaceToImage();
      await tester.pumpAndSettle();
      await tap(tester, find.byIcon(Icons.grid_view_outlined));
      await tap(
        tester,
        find.byKey(const ValueKey('lesson-grade7-triangle-angle-sum')),
      );
      final scene = find.byKey(const Key('native-scene'));
      await tester.ensureVisible(scene);
      await tester.pumpAndSettle();
      Offset point(double x, double y) {
        final r = tester.getRect(scene);
        return r.topLeft + Offset(x / 360 * r.width, y / 360 * r.width);
      }

      final element = scene.evaluate().single;
      expect(
        tester
            .widget<FilledButton>(find.byKey(const Key('continue')))
            .onPressed,
        isNull,
      );
      await tester.dragFrom(point(170, 65), point(220, 95) - point(170, 65));
      await tester.pumpAndSettle();
      await next(tester);
      expect(identical(scene.evaluate().single, element), isTrue);
      await tester.ensureVisible(scene);
      await tester.pumpAndSettle();
      await tester.dragFrom(point(60, 240), point(90, 200) - point(60, 240));
      await tester.pumpAndSettle();
      await next(tester);
      await tester.ensureVisible(scene);
      await tester.pumpAndSettle();
      for (var i = 0; i < 3; i++) {
        await tester.dragFrom(
          point(65 + i * 110, 275),
          point(180, 320) - point(65 + i * 110, 275),
        );
        await tester.pumpAndSettle();
      }
      await shot('07-triangle-assembled');
      await next(tester);
      expect(find.text('Bạn đã tự mình khám phá!'), findsOneWidget);
      await shot('08-triangle-completed');
      expect(tester.takeException(), isNull);
      await next(tester);
      await tester.pumpWidget(const SizedBox.shrink());
      await tester.pumpAndSettle();
    },
  );
}
