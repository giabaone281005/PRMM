import 'dart:async';
import 'dart:convert';

/// Transport-independent WebView handshake. A missing READY or INIT ACK must
/// leave the loading state, and a disposed/replaced view must reject old events.
class RuntimeBridge {
  final String sessionId;
  final Map<String, dynamic> Function() initialPayload;
  final Future<void> Function(String raw) transmit;
  final void Function(Map<String, dynamic> event) onInteraction;
  final void Function(String message) onError;
  final void Function() onReady;
  final Duration retryInterval;
  final _pending = <String, Timer>{};
  final _seen = <String>{};
  late final Timer _startup;
  int _sequence = 0;
  String? _initId;
  bool ready = false, _disposed = false, _failed = false;

  RuntimeBridge({
    required this.sessionId,
    required this.initialPayload,
    required this.transmit,
    required this.onInteraction,
    required this.onError,
    required this.onReady,
    Duration startupTimeout = const Duration(seconds: 20),
    this.retryInterval = const Duration(seconds: 3),
  }) {
    _startup = Timer(
      startupTimeout,
      () => fail(
        'Chưa mở được phần tương tác. Tiến độ được giữ; chạm Thử lại để tải lại.',
      ),
    );
  }

  void fail(String message) {
    if (_disposed || _failed) return;
    _failed = true;
    ready = false;
    _startup.cancel();
    for (final timer in _pending.values) {
      timer.cancel();
    }
    _pending.clear();
    onError(message);
  }

  String? send(String type, Map<String, dynamic> payload) {
    if (_disposed || _failed) return null;
    final id = '$sessionId-${_sequence++}';
    if (type == 'INIT') _initId = id;
    final raw = jsonEncode({
      'protocolVersion': '1.0.0',
      'sessionId': sessionId,
      'requestId': id,
      'type': type,
      'payload': payload,
    });
    var retries = 0;
    // Register before transmitting so even an immediate ACK can cancel retries.
    _pending[id] = Timer.periodic(retryInterval, (_) {
      if (retries++ >= 2) {
        fail('Phần tương tác không phản hồi. Tiến độ được giữ; chạm Thử lại.');
      } else {
        _transmit(raw);
      }
    });
    _transmit(raw);
    return id;
  }

  void _transmit(String raw) async {
    try {
      await transmit(raw);
    } catch (_) {
      fail('Không kết nối được phần tương tác. Chạm Thử lại.');
    }
  }

  void receive(String raw) {
    if (_disposed || _failed || raw.length > 131072) return;
    try {
      final message = jsonDecode(raw);
      if (message is! Map ||
          message['protocolVersion'] != '1.0.0' ||
          message['requestId'] is! String) {
        return;
      }
      if (message['type'] == 'READY' && _initId == null) {
        send('INIT', initialPayload());
        return;
      }
      if (message['sessionId'] != sessionId) return;
      final id = message['requestId'] as String;
      if (message['type'] == 'ACK') {
        final timer = _pending.remove(id);
        if (timer == null) return;
        timer.cancel();
        if (id == _initId && !ready) {
          ready = true;
          _startup.cancel();
          onReady();
        }
        return;
      }
      if (!_seen.add(id)) return;
      if (_seen.length > 512) _seen.remove(_seen.first);
      if (message['type'] == 'RENDER_ERROR') {
        fail('Không hiển thị được phần tương tác. Chạm Thử lại.');
      } else if (message['type'] == 'INTERACTION' && ready) {
        final event = message['payload']?['event'];
        if (event is Map) onInteraction(Map<String, dynamic>.from(event));
      }
    } catch (_) {
      /* Ignore malformed/untrusted bridge messages. */
    }
  }

  void dispose() {
    _disposed = true;
    _startup.cancel();
    for (final timer in _pending.values) {
      timer.cancel();
    }
    _pending.clear();
  }
}
