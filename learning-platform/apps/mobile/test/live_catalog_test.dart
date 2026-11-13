import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mo_hoc/main.dart';
import 'package:mo_hoc/domain.dart';

Future<void> pumpUntil(
  WidgetTester tester,
  Finder finder, {
  bool absent = false,
}) async {
  for (var i = 0; i < 30; i++) {
    await tester.pump(const Duration(milliseconds: 50));
    if (absent ? finder.evaluate().isEmpty : finder.evaluate().isNotEmpty) {
      return;
    }
  }
  fail('Catalog did not update');
}

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));
  testWidgets(
    'publish and unpublish signals update the visible catalog without pull-to-refresh',
    (tester) async {
      final events = StreamController<void>.broadcast();
      var lessons = <Json>[];
      await tester.pumpWidget(
        MoHocApp(
          catalogLoader: () async => lessons,
          catalogEvents: events.stream,
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.byIcon(Icons.grid_view_outlined));
      await tester.pumpAndSettle();
      final lesson = jsonDecode(
        File('../../contracts/fixtures/integer-minus-three.lesson.json')
            .readAsStringSync(),
      ) as Json;
      lessons = [
        {...lesson, 'status': 'published', 'title': 'Bài vừa được xuất bản'},
      ];
      events.add(null);
      await pumpUntil(tester, find.text('Bài vừa được xuất bản'));
      expect(find.text('Bài vừa được xuất bản'), findsOneWidget);
      expect(
        tester.widget<NavigationBar>(find.byType(NavigationBar)).selectedIndex,
        1,
      );
      lessons = [];
      events.add(null);
      await pumpUntil(tester, find.text('Bài vừa được xuất bản'), absent: true);
      expect(find.text('Bài vừa được xuất bản'), findsNothing);
      expect(tester.takeException(), isNull);
      await tester.pumpWidget(const SizedBox());
      await events.close();
    },
  );
  testWidgets(
    'failed refresh preserves current cards and a later signal recovers',
    (tester) async {
      final events = StreamController<void>.broadcast();
      final lesson = jsonDecode(
        File('../../contracts/fixtures/integer-minus-three.lesson.json')
            .readAsStringSync(),
      ) as Json;
      var fail = false, title = 'Bản hiện tại';
      await tester.pumpWidget(
        MoHocApp(
          catalogEvents: events.stream,
          catalogLoader: () async {
            if (fail) throw Exception('offline');
            return [
              {...lesson, 'title': title},
            ];
          },
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('Bản hiện tại'), findsWidgets);
      fail = true;
      events.add(null);
      await tester.pumpAndSettle();
      expect(find.text('Bản hiện tại'), findsWidgets);
      fail = false;
      title = 'Bản mới';
      events.add(null);
      await pumpUntil(tester, find.text('Bản mới'));
      expect(find.text('Bản mới'), findsWidgets);
      await tester.pumpWidget(const SizedBox());
      await events.close();
    },
  );
}
