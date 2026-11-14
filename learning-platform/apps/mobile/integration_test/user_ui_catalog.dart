import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'package:mo_hoc/main.dart' as app;
import 'package:mo_hoc/scenes.dart';
import 'package:mo_hoc/geometry.dart';

import 'user_catalog_index.g.dart';

const _url = String.fromEnvironment('UI_CONTROL_URL');
const _token = String.fromEnvironment('UI_CONTROL_TOKEN');
Future<dynamic> _request(String route, [Map<String, dynamic>? body]) async {
  final uri = Uri.parse('$_url$route'),
      headers = {'X-UI-Token': _token, 'Content-Type': 'application/json'};
  final response =
      await (body == null
              ? http.get(uri, headers: headers)
              : http.post(uri, headers: headers, body: jsonEncode(body)))
          .timeout(const Duration(seconds: 30));
  if (response.statusCode != 200) {
    throw StateError('UI host ${response.statusCode}: ${response.body}');
  }
  return jsonDecode(response.body);
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  if (_url.isEmpty) {
    throw StateError(
      'Use test-user.bat to start the catalog and Android input host',
    );
  }
  final index =
      jsonDecode(utf8.decode(base64Decode(uiCatalogIndexBase64))) as List;
  if (index.isEmpty) {
    throw StateError('Refuse an empty catalog index; use test-user.bat');
  }
  late List<Map<String, dynamic>> lessons;
  setUpAll(() async {
    final package = await const MethodChannel('mohoc/app-identity')
        .invokeMethod<String>('packageName');
    expect(
      package,
      'vn.mohoc.mo_hoc.uitest',
      reason: 'Refuse storage operations outside the isolated test APK',
    );
    final snapshot = await _request('/catalog') as Map;
    lessons = (snapshot['lessons'] as List)
        .map((l) => Map<String, dynamic>.from(l))
        .toList();
    expect(lessons.length, index.length);
    expect(
      lessons.map((l) => '${l['lessonId']}:${l['version']}').toSet(),
      index.map((l) => '${l['id']}:${l['version']}').toSet(),
    );
    await (await SharedPreferences.getInstance()).clear();
  });
  for (final identity in index) {
    testWidgets(
      'Published lesson ${identity['id']} v${identity['version']}: all ${identity['checkpoints']} checkpoints via Android touch',
      (tester) async {
        final previousInputPolicy =
            tester.binding.shouldPropagateDevicePointerEvents;
        tester.binding.shouldPropagateDevicePointerEvents = true;
        final lesson = lessons.singleWhere(
          (l) =>
              l['lessonId'] == identity['id'] &&
              l['version'] == identity['version'],
        );
        final id = lesson['lessonId'] as String;
        final slug = id.replaceAll(RegExp('[^a-zA-Z0-9_-]'), '-');
        Future<dynamic> post(String route, Map<String, dynamic> data) =>
            tester.runAsync(() => _request(route, data));
        Future<void> event(
          String status, {
          int? checkpoint,
          String? message,
        }) async {
          await post('/event', {
            'lessonId': id,
            'version': lesson['version'],
            'status': status,
            'checkpoint': ?checkpoint,
            'message': ?message,
          });
        }

        Future<void> capture(String suffix) async {
          await post('/capture', {
            'name':
                '${slug.length > 110 ? slug.substring(0, 110) : slug}-$suffix',
          });
        }

        Future<void> settle() async {
          await tester.pumpAndSettle(
            const Duration(milliseconds: 100),
            EnginePhase.sendSemanticsUpdate,
            const Duration(seconds: 40),
          );
        }

        Future<void> widgetTap(Finder finder) async {
          await tester.ensureVisible(finder);
          await settle();
          await tester.tap(finder);
          await settle();
        }

        Future<void> open() async {
          final tile = find.byKey(ValueKey('lesson-$id'));
          if (tile.evaluate().isEmpty) {
            await tester.scrollUntilVisible(
              tile,
              250,
              maxScrolls: 40,
              scrollable: find.byType(Scrollable).first,
            );
          }
          await widgetTap(tile);
        }

        SolidViewState? active;
        final view = find.byType(SolidView);
        Future<void> ready() async {
          for (var n = 0; n < 300; n++) {
            await tester.pump(const Duration(milliseconds: 100));
            if (view.evaluate().length == 1) {
              active = tester.state<SolidViewState>(view);
              if (active!.ready) break;
              if (active!.error.isNotEmpty) throw StateError(active!.error);
            }
          }
          expect(active?.ready, isTrue, reason: 'WebView did not become READY');
          expect(active!.error, isEmpty);
        }

        Future<dynamic> inspect(String source) async {
          dynamic result = await active!.controller!
              .runJavaScriptReturningResult(source);
          for (var i = 0; i < 2 && result is String; i++) {
            try {
              result = jsonDecode(result);
            } catch (_) {
              break;
            }
          }
          return result;
        }

        String element(String selector, int index) =>
            'document.querySelectorAll(${jsonEncode(selector)})[$index]';
        Future<Map> locate(String selector, [int index = 0]) async {
          await tester.ensureVisible(view);
          await settle();
          // Only viewport positioning/measurement uses JavaScript. All answers use ADB input.
          await active!.controller!.runJavaScript(
            '${element(selector, index)}?.scrollIntoView({block:"center",inline:"nearest"})',
          );
          await tester.pump(const Duration(milliseconds: 150));
          final result = await inspect(
            'JSON.stringify((()=>{const e=${element(selector, index)};if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,vw:innerWidth,vh:innerHeight,value:e.value??"",min:Number(e.min),max:Number(e.max),step:Number(e.step)||1}})())',
          );
          if (result is! Map) {
            throw StateError('UI control not found: $selector [$index]');
          }
          if ((result['y'] as num) + (result['h'] as num) / 2 < 0 ||
              (result['y'] as num) + (result['h'] as num) / 2 >
                  (result['vh'] as num)) {
            throw StateError('UI control outside WebView: $selector');
          }
          return result;
        }

        Offset physical(Map box, {double fraction = .5}) {
          final r = tester.getRect(view),
              scale = r.width / (box['vw'] as num),
              dpr = View.of(active!.context).devicePixelRatio;
          return Offset(
            (r.left +
                    ((box['x'] as num) + (box['w'] as num) * fraction) *
                        scale) *
                dpr,
            (r.top + ((box['y'] as num) + (box['h'] as num) / 2) * scale) * dpr,
          );
        }

        Future<void> touch(Map<String, dynamic> body) async {
          await post('/touch', body);
          await tester.pump(const Duration(milliseconds: 220));
        }

        Future<void> tap(String selector, [int index = 0]) async {
          final box = await locate(selector, index), p = physical(box);
          await touch({'kind': 'tap', 'x': p.dx, 'y': p.dy});
        }

        Future<void> text(String selector, num value) async {
          final box = await locate(selector), p = physical(box);
          await touch({
            'kind': 'text',
            'x': p.dx,
            'y': p.dy,
            'text': value
                .toStringAsFixed(7)
                .replaceFirst(RegExp(r'\.?0+$'), ''),
            'clearLength': box['value'].toString().length,
          });
        }

        Future<void> range(String selector, num target,{double? tolerance}) async {
          var box = await locate(selector);
          final min = box['min'] as num, max = box['max'] as num;
          if (max <= min || target < min || target > max) {
            throw StateError(
              'Range target invalid: $selector $target [$min,$max]',
            );
          }
          Future<void> set(num value) async {
            box = await locate(selector);
            double fraction(num n) =>
                (8 + ((box['w'] as num) - 16) * (n - min) / (max - min)) /
                (box['w'] as num);
            final current = num.tryParse(box['value'].toString()) ?? min,
                start = physical(box, fraction: fraction(current)),
                end = physical(
                  box,
                  fraction: fraction(value),
                );
            await touch({
              'kind': 'swipe',
              'x': start.dx,
              'y': start.dy,
              'x2': end.dx,
              'y2': end.dy,
            });
          }

          if ((num.tryParse(box['value'].toString()) ?? min) == target) {
            await set(target == min ? max : min);
          }
          await set(target);
          final actual = num.tryParse(
            (await inspect('${element(selector, 0)}.value')).toString(),
          );
          expect(
            actual,
            closeTo(target, tolerance??((box['step'] as num) / 2).toDouble() + .00001),
            reason: selector,
          );
        }

        Future<void> button(String label) async {
          final index = await inspect(
            'Array.from(document.querySelectorAll("button")).findIndex(e=>e.textContent.trim()===${jsonEncode(label)})',
          );
          if (index is! num || index < 0) {
            throw StateError('Button not found: $label');
          }
          await tap('button', index.toInt());
        }

        Future<void> solve(Map u) async {
          if (u['geometry'] != null) {
            final g = u['geometry'] as Map,
                m = geometryMeasure(g),
                task = g['task'];
            if (task == 'explore') {
              // Camera angle is exploratory, not a mathematical answer. Native
              // slider quantization may differ by a degree on a narrow phone.
              await range('input[aria-label="Góc xoay hình"]', 45,tolerance:2);
              return;
            }
            if (task != 'discover') {
              await range('input[aria-label="Góc xoay hình"]', 45,tolerance:2);
              await range('input[aria-label="Thu phóng hình"]', .75);
              final required = m['requiredLayer'] as int;
              if (required != 0) {
                throw StateError(
                  'Geometry layered selection needs a native UI recipe for ${g['mode']}',
                );
              }
              await tap(
                '.geometry-object-controls button',
                m['targetIndex'] as int,
              );
            }
            if (task != 'identify') {
              await text(
                'input[aria-label="Kết quả hình học"]',
                m['value'] as num,
              );
              await button('Xác nhận hình học');
            }
            return;
          }
          if (u['parabola'] != null) {
            final c = u['parabola'] as Map, a = c['a'] as num, task = c['task'];
            if (task == 'explore') {
              await range('input[aria-label="Hệ số parabol"]', 0);
              await range('input[aria-label="Hệ số parabol"]', 9);
            } else if (task == 'identify') {
              await button(a > 0 ? 'a > 0' : 'a < 0');
              await tap('[aria-label="Gắn dấu vào đồ thị G"]');
            } else if (task == 'compare') {
              await range('input[aria-label="Hoành độ điểm dò"]', 2);
              await button(a > 0 ? 'Chọn G · nét liền' : 'Chọn H · nét đứt');
            } else {
              final values = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5];
              await range(
                'input[aria-label="Hệ số parabol"]',
                values.indexOf(a.toInt()),
              );
              await tap('[data-object-id="point-target"]');
            }
            return;
          }
          if (u['cylinder'] != null) {
            final task = (u['cylinder'] as Map)['task'];
            if (task == 'orbit') {
              await range('input[aria-label="Xoay ngang"]', 1);
            } else if (task == 'equal-bases') {
              await range('input[aria-label="Thay đổi bán kính"]', 1.4);
              await tap('button[aria-label="Bộ phận C"]');
              await tap('button[aria-label="Bộ phận D"]');
            } else {
              await tap(
                'button[aria-label="Bộ phận ${task == 'radius'
                    ? 'A'
                    : task == 'height'
                    ? 'B'
                    : 'E'}"]',
              );
            }
            return;
          }
          final kind = u['kind'], answers = u['answers'] as List;
          if (kind == 'TOKEN_CLASSIFIER' || kind == 'EVENT_CARD_BUCKET') {
            for (var i = 0; i < answers.length; i++) {
              await tap('.recognition-choices button', i);
              await tap('.uime-targets button', answers[i] as int);
            }
          } else if (kind == 'FORMULA_SNAP_BUILDER') {
            for (var i = 0; i < answers.length; i++) {
              await tap('.recognition-choices button', answers[i] as int);
              await tap('.uime-targets button', i);
            }
          } else if (kind == 'NUMBER_LINE_SELECTOR') {
            await range('input[aria-label="Tham số động"]', answers[0] as num);
            await button(answers[1] == 0 ? 'Trái' : 'Phải');
            await button(answers[2] == 0 ? 'Mở' : 'Kín');
          } else if (kind == 'GEOMETRIC_HOTSPOT_FINDER') {
            await range('input[aria-label="Tham số động"]', answers[0] as num);
            await tap('.uime-scene svg [role="button"]', answers[1] as int);
          } else if (kind == 'PARABOLA_SLIDER') {
            await range('input[aria-label="Tham số động"]', answers[0] as num);
          } else if (kind == '3D_SOLID_INSPECTOR') {
            await range('input[aria-label="Góc xoay 3D"]', .5);
            await button((u['tokens'] as List)[answers[0] as int] as String);
          } else if ([
            'TAP_COEFFICIENT',
            'TRIANGLE_HOTSPOT_TAP',
            'INEQUALITY_SIGN_SWITCH',
            'ANGLE_MEASURE_TAP',
            'CHART_BAR_TAP',
            'DELTA_STATE_TOGGLE',
          ].contains(kind)) {
            await tap('.recognition-choices button', answers[0] as int);
          } else {
            throw StateError('No native touch recipe for renderer $kind');
          }
        }

        try {
          await event('START');
          await tester.pumpWidget(
            app.MoHocApp(key: ValueKey(id), catalogLoader: () async => lessons),
          );
          await settle();
          await widgetTap(find.byIcon(Icons.grid_view_outlined));
          await open();
          await ready();
          var state = active!;
          final count = (lesson['checkpoints'] as List).length;
          for (var cp = 0; cp < count; cp++) {
            expect(state.widget.session.snapshot['checkpoint'], cp);
            expect(
              state.widget.session.success,
              isFalse,
              reason: 'Checkpoint must require an interaction',
            );
            final task = lesson['recognition'][cp] as Map;
            if (task['uime'] == null) {
              throw StateError(
                'Lesson ${lesson['lessonId']} needs a native recipe for a non-UIME checkpoint',
              );
            }
            await solve(task['uime'] as Map);
            for (
              var retry = 0;
              retry < 50 && !state.widget.session.success;
              retry++
            ) {
              await tester.pump(const Duration(milliseconds: 100));
            }
            expect(
              state.widget.session.success,
              isTrue,
              reason:
                  'UI interaction did not solve checkpoint ${cp + 1}; state=${state.widget.session.snapshot['state']}',
            );
            await event('CHECKPOINT', checkpoint: cp + 1);
            if (cp == 0) await capture('checkpoint-1');
            final original = state;
            await widgetTap(find.byKey(const Key('continue')));
            if (cp < count - 1) {
              expect(
                identical(tester.state<SolidViewState>(view), original),
                isTrue,
              );
            }
            if (cp == 0 && count > 1) {
              await widgetTap(find.byTooltip('Thoát bài học'));
              await open();
              await ready();
              state = active!;
              expect(state.widget.session.snapshot['checkpoint'], 1);
            }
          }
          expect(find.text('Bạn đã tự mình khám phá!'), findsOneWidget);
          await capture('completed');
          await widgetTap(find.byKey(const Key('continue')));
          await open();
          expect(find.text('Bạn đã tự mình khám phá!'), findsOneWidget);
          await widgetTap(find.byKey(const Key('continue')));
          expect(tester.takeException(), isNull);
          await event('PASS');
        } catch (error) {
          await event('FAIL', message: error.toString());
          await capture('failed');
          rethrow;
        } finally {
          tester.binding.shouldPropagateDevicePointerEvents =
              previousInputPolicy;
          await tester.pumpWidget(const SizedBox.shrink());
          await tester.pump(const Duration(milliseconds: 250));
        }
      },
      timeout: const Timeout(Duration(minutes: 5)),
    );
  }
}
