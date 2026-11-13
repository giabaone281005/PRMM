import 'dart:convert';
import 'dart:math';

import 'package:shared_preferences/shared_preferences.dart';

import 'domain.dart';
import 'repository.dart';

String newActivityId() {
  final random = Random.secure(),
      bytes = List.generate(16, (_) => random.nextInt(256));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  final hex = bytes.map((b) => b.toRadixString(16).padLeft(2, '0')).join();
  return '${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20)}';
}

/// Each measured interval has a durable ID; retries reuse the exact same payload.
/// Server aggregation unions intervals across devices and applies profile timezone.
class ActivitySync {
  static Future<void> _pending = Future.value();
  static String key(String user) => 'mohoc-study-outbox-v1-$user';
  static Future<void> record(
    String user,
    Json lesson,
    DateTime from,
    DateTime to,
  ) {
    if (!repository.remote || repository.userId != user || !to.isAfter(from)) {
      return Future.value();
    }
    final next = _pending.then((_) async {
      final prefs = await SharedPreferences.getInstance();
      final device = prefs.getString('mohoc-device-id') ?? newActivityId();
      await prefs.setString('mohoc-device-id', device);
      final rows = jsonDecode(prefs.getString(key(user)) ?? '[]') as List;
      rows.add({
        'p_id': newActivityId(),
        'p_lesson_id': lesson['lessonId'],
        'p_version': lesson['version'],
        'p_device_id': device,
        'p_revision': 1,
        'p_segments': [
          {
            'start': from.toUtc().toIso8601String(),
            'end': to.toUtc().toIso8601String(),
          },
        ],
      });
      await prefs.setString(key(user), jsonEncode(rows));
      await _drain(user);
    });
    // Keep the queue usable after storage/network errors; caller may report error.
    _pending = next.then<void>((_) {}, onError: (Object _, StackTrace _) {});
    return next;
  }

  static Future<void> flush(String user) {
    final next = _pending.then((_) => _drain(user));
    _pending = next.then<void>((_) {}, onError: (Object _, StackTrace _) {});
    return next;
  }

  static Future<void> _drain(String user) async {
    if (!repository.remote ||
        repository.token == null ||
        repository.userId != user) {
      return;
    }
    final prefs = await SharedPreferences.getInstance();
    final rows = jsonDecode(prefs.getString(key(user)) ?? '[]') as List;
    while (rows.isNotEmpty &&
        repository.userId == user &&
        repository.token != null) {
      try {
        await repository.request(
          'rest/v1/rpc/record_study_session',
          Map<String, dynamic>.from(rows.first),
        );
      } catch (_) {
        return;
      } // Retry when the app resumes or the catalog refreshes.
      rows.removeAt(0);
      await prefs.setString(key(user), jsonEncode(rows));
    }
  }
}
