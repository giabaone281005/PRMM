import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mo_hoc/main.dart';

import 'dart:convert';
import 'dart:io';

import 'package:mo_hoc/domain.dart';

Future<List<Json>> catalogFixtures() async =>
    Directory('../../contracts/fixtures')
        .listSync()
        .whereType<File>()
        .map((file) => jsonDecode(file.readAsStringSync()) as Json)
        .toList();

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));
  testWidgets('compact three-tab catalog and real empty account activity', (
    tester,
  ) async {
    await tester.pumpWidget(MoHocApp(catalogLoader: catalogFixtures));
    await tester.pumpAndSettle();
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Bài học'), findsOneWidget);
    expect(find.text('Hồ sơ'), findsOneWidget);
    expect(find.byType(LessonIconTile), findsNWidgets(6));
    expect(find.text('Hiểu sâu hơn.\nBằng chính đôi tay.'), findsNothing);
    await tester.tap(find.byIcon(Icons.grid_view_outlined));
    await tester.pumpAndSettle();
    expect(find.text('Bài học'), findsNWidgets(2));
    expect(find.byType(LessonIconTile), findsNWidgets(12));
    await tester.tap(find.byIcon(Icons.person_outline_rounded).last);
    await tester.pumpAndSettle();
    expect(find.text('Tài khoản trên thiết bị'), findsOneWidget);
    expect(find.byType(ActivityHeatmap), findsOneWidget);
    expect(find.text('0%'), findsOneWidget);
    await tester.scrollUntilVisible(
      find.text('Học một bài để bắt đầu.'),
      200,
      scrollable: find.byType(Scrollable).first,
    );
    expect(find.text('Học một bài để bắt đầu.'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
  testWidgets(
    'small phone and larger system text retain navigation without overflow',
    (tester) async {
      tester.view.physicalSize = const Size(320, 760);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
      await tester.pumpWidget(
        MaterialApp(
          theme: ThemeData(),
          builder: (context, child) => MediaQuery(
            data: MediaQuery.of(context)
                .copyWith(textScaler: TextScaler.linear(1.35)),
            child: child!,
          ),
          home: HomePage(catalogLoader: catalogFixtures),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.byIcon(Icons.grid_view_outlined));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      await tester.tap(find.byIcon(Icons.person_outline_rounded).last);
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
    },
  );
}
