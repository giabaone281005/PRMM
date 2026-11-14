// Explicit hosted acceptance harness. Test credentials come from ignored defines.
// WebView inspection is read-only; the host sends taps/swipes through Android ADB.
import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:integration_test/integration_test.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:mo_hoc/main.dart';
import 'package:mo_hoc/repository.dart';
import 'package:mo_hoc/catalog_sync.dart';
import 'package:mo_hoc/scenes.dart';

const controlUrl = String.fromEnvironment('CP02_CONTROL_URL');
const runKey = String.fromEnvironment('CP02_RUN_KEY');
const domInspection = r'''JSON.stringify({
  width:innerWidth,height:innerHeight,scrollY,scrollHeight:document.documentElement.scrollHeight,
  engine:document.querySelector('.uime-scene')?.getAttribute('data-engine'),
  text:document.body.innerText,
  controls:Array.from(document.querySelectorAll('button,input,canvas')).map((e,i)=>{
    const r=e.getBoundingClientRect();return {i,tag:e.tagName,text:e.textContent,
      label:e.getAttribute('aria-label'),type:e.getAttribute('type'),value:e.value,
      min:e.min,max:e.max,x:r.x,y:r.y,w:r.width,h:r.height};})
})''';

void main() {
  final binding = IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  binding.framePolicy = LiveTestWidgetsFlutterBindingFramePolicy.fullyLive;
  binding.shouldPropagateDevicePointerEvents = true;
  testWidgets('hosted catalog and Android touch checkpoint acceptance', (
    tester,
  ) async {
    expect(controlUrl, startsWith('http://10.0.2.2:'));
    expect(runKey, isNotEmpty);
    final savedSession = await repository.sessionStore?.read();
    final events = StreamController<void>.broadcast();
    StreamSubscription<void>? subscription;
    final client = http.Client();
    bool joined = false, stop = false;
    Map<String, dynamic> response = {'status': 'starting'};
    Map<String, dynamic> rect(Rect r) => {
      'x': r.left,
      'y': r.top,
      'w': r.width,
      'h': r.height,
    };
    try {
      await tester.runAsync(
        () => repository.signIn(
          const String.fromEnvironment('CP02_EMAIL'),
          const String.fromEnvironment('CP02_PASSWORD'),
        ),
      );
      subscription = catalogChanges(
        repository,
        pollInterval: const Duration(days: 1),
        onSubscribed: () => joined = true,
      ).listen((_) => events.add(null));
      await tester.pumpWidget(MoHocApp(catalogEvents: events.stream));
      await tester.pump(const Duration(seconds: 2));
      await tester.tap(find.byIcon(Icons.grid_view_outlined));
      await tester.pump(const Duration(seconds: 1));
      final deadline = DateTime.now().add(const Duration(minutes: 25));
      while (!stop && DateTime.now().isBefore(deadline)) {
        final command = await tester.runAsync(() async {
          final result = await client
              .post(
                Uri.parse('$controlUrl/exchange'),
                headers: {
                  'Content-Type': 'application/json',
                  'X-Run-Key': runKey,
                },
                body: jsonEncode(response),
              )
              .timeout(const Duration(seconds: 10));
          if (result.statusCode != 200) {
            throw StateError('Control server rejected exchange');
          }
          return jsonDecode(result.body) as Map<String, dynamic>;
        });
        response = {'id': command?['id'], 'joined': joined};
        try {
          switch (command?['op']) {
            case 'open':
              final card = find.byKey(
                ValueKey('lesson-${command!['lessonId']}'),
              );
              await tester.ensureVisible(card);
              await tester.pump(const Duration(milliseconds: 300));
              await tester.tap(card);
            case 'close':
              await tester.tap(find.byTooltip('Thoát bài học'));
            case 'ensureNext':
              await tester.ensureVisible(find.byKey(const Key('continue')));
            case 'ensureScene':
              await tester.ensureVisible(find.byType(SolidView));
            case 'stop':
              stop = true;
          }
          await tester.pump(const Duration(milliseconds: 250));
          response['cards'] = tester
              .widgetList<Widget>(
                find.byWidgetPredicate(
                  (w) =>
                      w.key is ValueKey<String> &&
                      (w.key as ValueKey<String>).value.startsWith('lesson-'),
                ),
              )
              .map((w) => (w.key as ValueKey<String>).value)
              .toList();
          response['dpr'] = tester.view.devicePixelRatio;
          final views = find.byType(SolidView);
          if (views.evaluate().isNotEmpty) {
            final view = tester.state<SolidViewState>(views);
            response.addAll({
              'ready': view.ready,
              'error': view.error,
              'snapshot': view.widget.session.snapshot,
              'success': view.widget.session.success,
              'lessonId': view.widget.session.lesson['lessonId'],
              'version': view.widget.session.lesson['version'],
            });
            final web = find.byType(WebViewWidget);
            if (web.evaluate().isNotEmpty) {
              response['webRect'] = rect(tester.getRect(web));
            }
            if (view.ready) {
              response['dom'] = await tester.runAsync(
                () => view.controller!.runJavaScriptReturningResult(
                  domInspection,
                ),
              );
            }
            final next = find.byKey(const Key('continue'));
            if (next.evaluate().isNotEmpty) {
              response['nextRect'] = rect(tester.getRect(next));
              response['nextEnabled'] =
                  tester.widget<FilledButton>(next).onPressed != null;
            }
            response['syncError'] = find
                .textContaining('Chưa đồng bộ.')
                .evaluate()
                .isNotEmpty;
          }
        } catch (error) {
          response['harnessError'] = error.toString();
        }
      }
      await tester.runAsync(
        () => client.post(
          Uri.parse('$controlUrl/exchange'),
          headers: {'Content-Type': 'application/json', 'X-Run-Key': runKey},
          body: jsonEncode(response),
        ),
      );
      expect(
        stop,
        isTrue,
        reason: 'Host did not finish acceptance before deadline',
      );
    } finally {
      await tester.pumpWidget(const SizedBox());
      await subscription?.cancel();
      await events.close();
      try {
        await tester.runAsync(repository.signOut);
      } catch (_) {}
      if (savedSession != null) {
        await repository.sessionStore!.write(savedSession);
        await tester.runAsync(repository.restoreSession);
      }
      client.close();
    }
  }, timeout: const Timeout(Duration(minutes: 30)));
}
