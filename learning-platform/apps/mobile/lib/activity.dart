import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import 'domain.dart';

String dayKey(DateTime time) =>
    '${time.year}-${time.month.toString().padLeft(2, '0')}-${time.day.toString().padLeft(2, '0')}';

class StudyActivity {
  final Map<String, Json> days;
  final List<Json> events;
  final Set<String> milestones;
  StudyActivity({
    Map<String, Json>? days,
    List<Json>? events,
    Set<String>? milestones,
  }) : days = days ?? {},
       events = events ?? [],
       milestones = milestones ?? {};
  factory StudyActivity.fromJson(Json value) => StudyActivity(
    days: (value['days'] as Map? ?? {}).map(
      (k, v) => MapEntry(k.toString(), Map<String, dynamic>.from(v)),
    ),
    events: (value['events'] as List? ?? [])
        .map((e) => Map<String, dynamic>.from(e))
        .toList(),
    milestones: Set<String>.from(value['milestones'] ?? []),
  );
  Json toJson() => {
    'days': days,
    'events': events,
    'milestones': milestones.toList(),
  };
  Json day(DateTime at) => days.putIfAbsent(
    dayKey(at),
    () => {'seconds': 0, 'checkpoints': 0, 'completed': 0},
  );
  bool active(DateTime date) {
    final d = days[dayKey(date)];
    return d != null &&
        ((d['seconds'] as num) > 0 ||
            (d['checkpoints'] as num) > 0 ||
            (d['completed'] as num) > 0);
  }

  int get totalSeconds =>
      days.values.fold(0, (sum, d) => sum + (d['seconds'] as num).toInt());
  int get totalCheckpoints =>
      days.values.fold(0, (sum, d) => sum + (d['checkpoints'] as num).toInt());
  int streak(DateTime now) {
    var date = DateTime(now.year, now.month, now.day), count = 0;
    if (!active(date)) date = date.subtract(const Duration(days: 1));
    while (active(date)) {
      count++;
      date = date.subtract(const Duration(days: 1));
    }
    return count;
  }

  void addTime(DateTime from, DateTime to) {
    while (from.isBefore(to)) {
      final midnight = DateTime(from.year, from.month, from.day + 1),
          end = to.isBefore(midnight) ? to : midnight;
      final seconds = end.difference(from).inMilliseconds / 1000;
      if (seconds > 0) day(from)['seconds'] += seconds;
      from = end;
    }
  }

  bool milestone({
    required String id,
    required String type,
    required String title,
    required String lessonId,
    required DateTime at,
  }) {
    if (!milestones.add(id)) return false;
    day(at)[type == 'complete' ? 'completed' : 'checkpoints']++;
    events.insert(0, {
      'type': type,
      'title': title,
      'lessonId': lessonId,
      'at': at.toIso8601String(),
    });
    if (events.length > 100) events.removeRange(100, events.length);
    return true;
  }
}

class ActivityStore {
  static Future<void>? _pending;
  static String key(String user) => 'mohoc-activity-v1-$user';
  static Future<StudyActivity> load(String user) async {
    if (_pending != null) await _pending;
    final prefs = await SharedPreferences.getInstance();
    try {
      return StudyActivity.fromJson(
        jsonDecode(prefs.getString(key(user)) ?? '{}'),
      );
    } catch (_) {
      return StudyActivity();
    }
  }

  static Future<void> change(String user, void Function(StudyActivity) update) {
    final next = (_pending ?? Future<void>.value()).then((_) async {
      final prefs = await SharedPreferences.getInstance();
      StudyActivity activity;
      try {
        activity = StudyActivity.fromJson(
          jsonDecode(prefs.getString(key(user)) ?? '{}'),
        );
      } catch (_) {
        activity = StudyActivity();
      }
      update(activity);
      await prefs.setString(key(user), jsonEncode(activity.toJson()));
    });
    _pending = next;
    next.then<void>(
      (_) {
        if (identical(_pending, next)) _pending = null;
      },
      onError: (Object error, StackTrace stack) {
        if (identical(_pending, next)) _pending = null;
      },
    );
    return next;
  }
}

/// Only time close to a real gesture counts; background and idle time are excluded.
class StudyTracker {
  final DateTime Function() now;
  final void Function(DateTime from, DateTime to) onTime;
  DateTime? _accounted, _activeUntil;
  final List<(DateTime, DateTime)> _segments = [];
  bool _foreground = true;
  StudyTracker({required this.onTime, DateTime Function()? now})
    : now = now ?? DateTime.now;
  void touch() {
    if (!_foreground) return;
    _account();
    final at = now();
    _accounted = at;
    _activeUntil = at.add(const Duration(seconds: 30));
  }

  void _account() {
    if (!_foreground || _accounted == null || _activeUntil == null) return;
    final at = now(), end = at.isBefore(_activeUntil!) ? at : _activeUntil!;
    if (end.isAfter(_accounted!)) {
      if (_segments.isNotEmpty && _segments.last.$2 == _accounted) {
        final previous = _segments.removeLast();
        _segments.add((previous.$1, end));
      } else {
        _segments.add((_accounted!, end));
      }
      _accounted = end;
    }
  }

  void flush() {
    _account();
    for (final segment in _segments) {
      onTime(segment.$1, segment.$2);
    }
    _segments.clear();
  }

  void pause() {
    flush();
    _foreground = false;
    _accounted = null;
    _activeUntil = null;
  }

  void resume() {
    _foreground = true;
  }
}
