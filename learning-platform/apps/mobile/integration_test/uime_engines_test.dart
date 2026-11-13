import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:mo_hoc/domain.dart';
import 'package:mo_hoc/scenes.dart';

import 'fixtures.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  final lessons =
      jsonDecode(integrationFixtureJson['uime-fixtures.json']!) as List;
  testWidgets('all named U-IME renderers run through real Android WebView bridge', (
    tester,
  ) async {
    final combined = Map<String, dynamic>.from(
      jsonDecode(jsonEncode(lessons[0])),
    );
    combined['lessonId'] = 'uime-device-combined';
    combined['recognition'] = [for (final l in lessons) l['recognition'][0]];
    combined['checkpoints'] = [
      for (var i = 0; i < lessons.length; i++)
        {
          ...Map<String, dynamic>.from(lessons[i]['checkpoints'][0]),
          'id': 'cp-${i + 1}',
          'order': i + 1,
        },
    ];
    combined['completion'] = {
      'requiredCheckpointIds': [
        for (var i = 0; i < lessons.length; i++) 'cp-${i + 1}',
      ],
    };
    for (final raw in [combined]) {
      final l = Map<String, dynamic>.from(raw),
          s = LessonSession(l),
          key = GlobalKey<SolidViewState>();
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SizedBox(
              height: 640,
              child: SolidView(
                key: key,
                session: s,
                onInteraction: (e) {
                  s.interact(e);
                },
              ),
            ),
          ),
        ),
      );
      for (var n = 0; n < 150 && key.currentState?.ready != true; n++) {
        await tester.pump(const Duration(milliseconds: 100));
      }
      expect(key.currentState?.ready, isTrue, reason: l['lessonId']);
      for (
        var checkpointIndex = 0;
        checkpointIndex < lessons.length;
        checkpointIndex++
      ) {
        final u = l['recognition'][checkpointIndex]['uime'];
        for (var n = 0; n < 60; n++) {
          final dom = await key.currentState!.controller!
              .runJavaScriptReturningResult(
                "document.querySelector('.uime-scene')?.getAttribute('data-engine') || ''",
              );
          if (dom.toString().contains(u['kind'])) break;
          await tester.pump(const Duration(milliseconds: 100));
        }
        final actions = <String>[];
        if (['TOKEN_CLASSIFIER', 'EVENT_CARD_BUCKET'].contains(u['kind'])) {
          for (var i = 0; i < (u['answers'] as List).length; i++) {
            actions.add(
              "document.querySelectorAll('.recognition-choices button')[$i].click();document.querySelectorAll('.uime-targets button')[${u['answers'][i]}].click();",
            );
          }
        } else if (u['kind'] == 'FORMULA_SNAP_BUILDER') {
          for (var i = 0; i < (u['answers'] as List).length; i++) {
            actions.add(
              "document.querySelectorAll('.recognition-choices button')[${u['answers'][i]}].click();document.querySelectorAll('.uime-targets button')[$i].click();",
            );
          }
        } else if (u['kind'] == 'NUMBER_LINE_SELECTOR') {
          actions.add(
            "var e=document.querySelector('input[type=range]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,'3');e.dispatchEvent(new Event('input',{bubbles:true}));",
          );
          actions.add(
            "Array.from(document.querySelectorAll('button')).find(e=>e.textContent==='Phải').click();Array.from(document.querySelectorAll('button')).find(e=>e.textContent==='Kín').click();",
          );
        } else if ([
          'PARABOLA_SLIDER',
          'GEOMETRIC_HOTSPOT_FINDER',
          '3D_SOLID_INSPECTOR',
        ].contains(u['kind'])) {
          final v = u['kind'] == '3D_SOLID_INSPECTOR'
              ? '.5'
              : '${u['answers'][0]}';
          actions.add(
            "var e=document.querySelector('input[type=range]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,'$v');e.dispatchEvent(new Event('input',{bubbles:true}));",
          );
          if (u['kind'] == 'GEOMETRIC_HOTSPOT_FINDER') {
            actions.add(
              "document.querySelector('[aria-label=H]').dispatchEvent(new MouseEvent('click',{bubbles:true}));",
            );
          }
          if (u['kind'] == '3D_SOLID_INSPECTOR') {
            actions.add(
              "Array.from(document.querySelectorAll('button')).find(e=>e.textContent==='r').click();",
            );
          }
        } else {
          actions.add(
            "document.querySelectorAll('.recognition-choices button')[${u['answers'][0]}].click();",
          );
        }
        for (final action in actions.expand(
          (s) => s
              .replaceAll('.click();document', '.click();|||document')
              .replaceAll('.click();Array', '.click();|||Array')
              .split('|||'),
        )) {
          await key.currentState!.controller!.runJavaScript(action);
          await tester.pump(const Duration(milliseconds: 250));
        }
        for (var n = 0; n < 30 && !s.success; n++) {
          await tester.pump(const Duration(milliseconds: 100));
        }
        expect(key.currentState!.error, isEmpty, reason: l['lessonId']);
        expect(
          s.success,
          isTrue,
          reason: '${l['lessonId']}: ${jsonEncode(s.snapshot['state'])}',
        );
        expect(s.advance(), isTrue);
        if (s.snapshot['completed'] != true) {
          key.currentState!.checkpoint(s.checkpoint['id']);
          await tester.pump(const Duration(milliseconds: 300));
        }
      }
      await tester.pumpWidget(const SizedBox());
      await tester.pump(const Duration(milliseconds: 200));
    }
  });
}
