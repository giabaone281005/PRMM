import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mo_hoc/activity.dart';

void main() {
  test(
    'study time requires interaction, caps idle time and excludes background',
    () {
      var now = DateTime(2026, 11, 12, 10);
      final activity = StudyActivity();
      final tracker = StudyTracker(now: () => now, onTime: activity.addTime);
      now = now.add(const Duration(minutes: 5));
      tracker.flush();
      expect(activity.totalSeconds, 0);
      tracker.touch();
      now = now.add(const Duration(milliseconds: 500));
      tracker.touch();
      now = now.add(const Duration(milliseconds: 500));
      tracker.touch();
      now = now.add(const Duration(seconds: 9));
      tracker.flush();
      expect(activity.totalSeconds, 10);
      now = now.add(const Duration(minutes: 2));
      tracker.flush();
      expect(activity.totalSeconds, 31);
      tracker.pause();
      now = now.add(const Duration(minutes: 5));
      tracker.touch();
      tracker.flush();
      expect(activity.totalSeconds, 31);
      tracker.resume();
      tracker.touch();
      now = now.add(const Duration(seconds: 12));
      tracker.pause();
      expect(activity.totalSeconds, 43);
    },
  );
  test('midnight attribution and streak reflect actual days, not opening the catalog', () {
    final activity = StudyActivity();
    activity.addTime(
      DateTime(2026, 11, 11, 23, 59, 50),
      DateTime(2026, 11, 12, 0, 0, 15),
    );
    expect(activity.days['2026-11-11']!['seconds'], 10);
    expect(activity.days['2026-11-12']!['seconds'], 15);
    expect(activity.streak(DateTime(2026, 11, 12)), 2);
    expect(activity.streak(DateTime(2026, 11, 13)), 2);
    expect(activity.streak(DateTime(2026, 11, 14)), 0);
  });
  test(
    'checkpoint/completion milestones are idempotent and persisted per account',
    () async {
      SharedPreferences.setMockInitialValues({});
      final at = DateTime(2026, 11, 12, 12);
      await Future.wait(
        List.generate(
          3,
          (_) => ActivityStore.change(
            'alice',
            (a) => a.milestone(
              id: 'lesson:1:cp-1',
              type: 'checkpoint',
              title: 'Phân số',
              lessonId: 'lesson',
              at: at,
            ),
          ),
        ),
      );
      await ActivityStore.change('alice', (a) {
        a.milestone(
          id: 'lesson:1:complete',
          type: 'complete',
          title: 'Phân số',
          lessonId: 'lesson',
          at: at,
        );
        a.addTime(at, at.add(const Duration(seconds: 70)));
      });
      final alice = await ActivityStore.load('alice'),
          bob = await ActivityStore.load('bob');
      expect(alice.totalCheckpoints, 1);
      expect(alice.events.length, 2);
      expect(alice.days[dayKey(at)]!['completed'], 1);
      expect(alice.totalSeconds, 70);
      expect(bob.events, isEmpty);
      expect(bob.totalSeconds, 0);
    },
  );
}
