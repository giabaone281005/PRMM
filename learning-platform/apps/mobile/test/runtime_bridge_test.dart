import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:mo_hoc/runtime_bridge.dart';

String envelope(
  String type, {
  String session = 'test',
  String id = 'event',
  Map<String, dynamic> payload = const {},
}) => jsonEncode({
  'protocolVersion': '1.0.0',
  'sessionId': session,
  'requestId': id,
  'type': type,
  'payload': payload,
});

void main() {
  testWidgets(
    'missing READY times out; replacing the bridge retries with the current saved snapshot',
    (tester) async {
      final errors = <String>[], sent = <String>[];
      RuntimeBridge make(String id) => RuntimeBridge(
        sessionId: id,
        initialPayload: () => {
          'snapshot': {'checkpoint': 3, 'revision': 17},
        },
        transmit: (raw) async {
          sent.add(raw);
        },
        onInteraction: (_) {},
        onError: errors.add,
        onReady: () {},
      );
      final first = make('old');
      await tester.pump(const Duration(seconds: 21));
      expect(errors.single, contains('Thử lại'));
      expect(first.ready, isFalse);
      first.dispose();
      final retry = make('new');
      retry.receive(envelope('READY', session: ''));
      final init = jsonDecode(sent.single);
      expect(init['payload']['snapshot']['checkpoint'], 3);
      expect(init['payload']['snapshot']['revision'], 17);
      retry.receive(envelope('ACK', session: 'new', id: init['requestId']));
      expect(retry.ready, isTrue);
      retry.dispose();
    },
  );

  testWidgets(
    'READY alone does not count as loaded; missing INIT ACK has bounded retries',
    (tester) async {
      final errors = <String>[], sent = <String>[];
      final bridge = RuntimeBridge(
        sessionId: 'test',
        initialPayload: () => {},
        transmit: (raw) async {
          sent.add(raw);
        },
        onInteraction: (_) {},
        onError: errors.add,
        onReady: () {},
      );
      bridge.receive(envelope('READY', session: ''));
      expect(bridge.ready, isFalse);
      await tester.pump(const Duration(seconds: 10));
      expect(sent.length, 3);
      expect(errors.single, contains('Thử lại'));
      bridge.dispose();
    },
  );

  testWidgets(
    'immediate ACK cancels retries; stale and duplicate interactions are rejected',
    (tester) async {
      final errors = <String>[],
          sent = <String>[],
          events = <Map<String, dynamic>>[];
      var readyCount = 0;
      late RuntimeBridge bridge;
      bridge = RuntimeBridge(
        sessionId: 'test',
        initialPayload: () => {},
        transmit: (raw) async {
          sent.add(raw);
          bridge.receive(envelope('ACK', id: jsonDecode(raw)['requestId']));
        },
        onInteraction: events.add,
        onError: errors.add,
        onReady: () => readyCount++,
      );
      bridge.receive(envelope('READY', session: ''));
      expect(bridge.ready, isTrue);
      final payload = {
        'event': {'type': 'adjust_parameter', 'name': 'x', 'value': 1},
      };
      bridge.receive(envelope('INTERACTION', session: 'old', payload: payload));
      bridge.receive('not-json');
      bridge.receive(envelope('INTERACTION', payload: payload));
      bridge.receive(envelope('INTERACTION', payload: payload));
      expect(events.length, 1);
      await tester.pump(const Duration(seconds: 25));
      expect(sent.length, 1);
      expect(readyCount, 1);
      expect(errors, isEmpty);
      bridge.dispose();
    },
  );

  testWidgets(
    'renderer and transport errors leave loading with retry guidance',
    (tester) async {
      final errors = <String>[];
      final bridge = RuntimeBridge(
        sessionId: 'test',
        initialPayload: () => {},
        transmit: (_) async {},
        onInteraction: (_) {},
        onError: errors.add,
        onReady: () {},
      );
      bridge.receive(envelope('RENDER_ERROR'));
      expect(errors.single, contains('Thử lại'));
      bridge.dispose();
      final broken = RuntimeBridge(
        sessionId: 'other',
        initialPayload: () => {},
        transmit: (_) async {
          throw StateError('transport unavailable');
        },
        onInteraction: (_) {},
        onError: errors.add,
        onReady: () {},
      );
      broken.receive(envelope('READY', session: ''));
      await tester.pump();
      expect(errors.length, 2);
      broken.dispose();
    },
  );

  testWidgets(
    'disposal cancels timeouts and rejects callbacks from an old WebView',
    (tester) async {
      final errors = <String>[], sent = <String>[];
      final bridge = RuntimeBridge(
        sessionId: 'test',
        initialPayload: () => {},
        transmit: (raw) async {
          sent.add(raw);
        },
        onInteraction: (_) => fail('disposed interaction'),
        onError: errors.add,
        onReady: () => fail('disposed ready'),
      );
      bridge.receive(envelope('READY', session: ''));
      bridge.dispose();
      bridge.receive(envelope('ACK', id: jsonDecode(sent.single)['requestId']));
      await tester.pump(const Duration(seconds: 30));
      expect(sent.length, 1);
      expect(errors, isEmpty);
    },
  );
}
