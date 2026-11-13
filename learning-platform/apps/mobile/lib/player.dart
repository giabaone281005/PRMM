import 'dart:convert';
import 'dart:async';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'math_scene.dart';
import 'domain.dart';
import 'scenes.dart';
import 'repository.dart';
import 'activity.dart';
import 'activity_sync.dart';

class LessonPage extends StatefulWidget {
  final Json lesson;
  const LessonPage({super.key, required this.lesson});
  @override
  State<LessonPage> createState() => _LessonState();
}

class _LessonState extends State<LessonPage> with WidgetsBindingObserver {
  LessonSession? session;
  SharedPreferences? prefs;
  bool hint = false;
  String syncError = '';
  final List<Json> journal = [];
  final GlobalKey<SolidViewState> solidKey = GlobalKey();
  late final StudyTracker tracker;
  Timer? activityTimer;
  late final String activityUser;
  @override
  void initState() {
    super.initState();
    activityUser = repository.userId ?? 'local';
    tracker = StudyTracker(
      onTime: (from, to) {
        ActivityStore.change(activityUser, (a) => a.addTime(from, to));
        ActivitySync.record(
          activityUser,
          widget.lesson,
          from,
          to,
        ).catchError((Object _) {});
      },
    );
    activityTimer = Timer.periodic(
      const Duration(seconds: 15),
      (_) => tracker.flush(),
    );
    WidgetsBinding.instance.addObserver(this);
    restore();
  }

  Future<void> restore() async {
    prefs = await SharedPreferences.getInstance();
    final raw = prefs!.getString(progressKey(widget.lesson));
    Json? saved;
    if (raw != null) {
      try {
        saved = jsonDecode(raw);
      } catch (_) {
        saved = null;
      }
    }
    if (repository.remote && repository.token != null) {
      try {
        final rows = await repository.get(
          'rest/v1/lesson_progress?user_id=eq.${repository.userId}&lesson_id=eq.${widget.lesson['lessonId']}&version=eq.${widget.lesson['version']}&select=snapshot',
        ) as List;
        if (rows.isNotEmpty &&
            (rows[0]['snapshot']['revision'] as int) >
                (saved?['revision'] ?? -1)) {
          saved = Map<String, dynamic>.from(rows[0]['snapshot']);
        }
      } catch (_) {
        syncError =
            'Chưa tải được tiến độ máy chủ. Đang dùng bản lưu thiết bị.';
      }
    }
    journal.addAll(
      (saved?['journal'] as List? ?? []).map(
        (e) => Map<String, dynamic>.from(e),
      ),
    );
    if (mounted) {
      setState(() => session = LessonSession(widget.lesson, saved: saved));
    }
  }

  void persist() {
    final s = session;
    if (s == null) return;
    prefs?.setString(
      progressKey(widget.lesson),
      jsonEncode({...s.snapshot, 'journal': journal}),
    );
  }

  void interact(Json event) {
    if (session!.interact(event)) {
      tracker.touch();
      journal.add({'kind': 'interaction', 'event': event});
      persist();
      setState(() {});
    }
  }

  Future<void> sync() async {
    try {
      if (repository.remote) {
        if (repository.token == null) return;
        await repository.request('functions/v1/progress', {
          'lessonId': widget.lesson['lessonId'],
          'version': widget.lesson['version'],
          'events': journal,
          'revision': session!.snapshot['revision'],
        });
      } else {
        final r = await repository.client
            .post(
              Uri.parse('$localApiUrl/progress'),
              headers: {'Content-Type': 'application/json'},
              body: jsonEncode({
                'user': 'local',
                'lessonId': widget.lesson['lessonId'],
                'version': widget.lesson['version'],
                'events': journal,
              }),
            )
            .timeout(const Duration(seconds: 5));
        if (r.statusCode >= 400) throw Exception('Local sync failed');
      }
      if (mounted) setState(() => syncError = '');
    } catch (_) {
      if (mounted) {
        setState(
          () => syncError =
              'Chưa đồng bộ. Đã lưu trên thiết bị; chạm để thử lại.',
        );
      }
    }
  }

  void next() {
    if (session!.snapshot['completed'] == true) {
      Navigator.pop(context);
      return;
    }
    final checkpoint = session!.checkpoint['id'];
    if (session!.advance()) {
      tracker.touch();
      tracker.flush();
      final at = DateTime.now(),
          lessonId = widget.lesson['lessonId'] as String,
          version = widget.lesson['version'];
      final completed = session!.snapshot['completed'] == true;
      ActivityStore.change(activityUser, (a) {
        a.milestone(
          id: '$lessonId:$version:$checkpoint',
          type: 'checkpoint',
          title: widget.lesson['title'],
          lessonId: lessonId,
          at: at,
        );
        if (completed) {
          a.milestone(
            id: '$lessonId:$version:complete',
            type: 'complete',
            title: widget.lesson['title'],
            lessonId: lessonId,
            at: at,
          );
        }
      });
      journal.add({'kind': 'advance'});
      solidKey.currentState?.checkpoint(session!.checkpoint['id']);
      persist();
      setState(() => hint = false);
      sync();
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    persist();
    solidKey.currentState?.lifecycle(state == AppLifecycleState.resumed);
    if (state == AppLifecycleState.resumed) {
      tracker.resume();
      ActivitySync.flush(activityUser);
      sync();
    } else {
      tracker.pause();
    }
  }

  @override
  void dispose() {
    activityTimer?.cancel();
    tracker.pause();
    persist();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final s = session;
    if (s == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    final done = s.snapshot['completed'] == true,
        cps = widget.lesson['checkpoints'] as List;
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          tooltip: 'Thoát bài học',
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          widget.lesson['title'],
          style: const TextStyle(fontSize: 16),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 20),
            child: Center(
              child: Text(
                '${s.snapshot['checkpoint'] + 1} / ${cps.length}',
                style: const TextStyle(fontSize: 15, color: Color(0xff8f9c7e)),
              ),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(5),
                  child: LinearProgressIndicator(
                    minHeight: 5,
                    value:
                        (s.snapshot['checkpoint'] + (done ? 1 : 0)) /
                        cps.length,
                    backgroundColor: const Color(0xffe5ebda),
                    color: const Color(0xff9dcc64),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(25, 28, 25, 15),
                child: Column(
                  children: [
                    Text(
                      'LỚP ${widget.lesson['grade']}',
                      style: const TextStyle(
                        fontSize: 13,
                        letterSpacing: 1.5,
                        color: Color(0xff8e9b7d),
                      ),
                    ),
                    const SizedBox(height: 14),
                    Text(
                      done
                          ? 'Bạn đã tự mình khám phá!'
                          : s.checkpoint['instruction'],
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w600,
                        height: 1.45,
                        letterSpacing: -.6,
                      ),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(18),
                  child: widget.lesson['engine']['type'] == 'geometry_2d'
                      ? NativeScene(session: s, onInteraction: interact)
                      : widget.lesson['engine']['type'] != 'geometry_3d_web' &&
                            !((widget.lesson['recognition'] as List?)?.any(
                                  (t) => t['uime'] != null,
                                ) ??
                                false)
                      ? NativeMathScene(session: s, onInteraction: interact)
                      : SizedBox(
                          height: widget.lesson['recognition'] is List
                              ? 640
                              : 360,
                          child: SolidView(
                            key: solidKey,
                            session: s,
                            onInteraction: interact,
                          ),
                        ),
                ),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  TextButton(
                    onPressed: () => setState(() => hint = !hint),
                    child: const Text(
                      '☼ Gợi ý',
                      style: TextStyle(fontSize: 15),
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      journal.clear();
                      setState(() => session = LessonSession(widget.lesson));
                      solidKey.currentState?.reset();
                      persist();
                    },
                    child: const Text(
                      '↺ Bắt đầu lại',
                      style: TextStyle(fontSize: 15),
                    ),
                  ),
                ],
              ),
              if (hint)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 25),
                  child: Text(
                    s.checkpoint['hints'][0],
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 16,
                      height: 1.7,
                      color: Color(0xff8a835d),
                    ),
                  ),
                ),
              Padding(
                padding: const EdgeInsets.all(14),
                child: Semantics(
                  liveRegion: true,
                  child: Text(
                    done
                        ? '✓ Đã hoàn thành bài học'
                        : s.success
                        ? '✓ ${s.checkpoint['feedback']['success']}'
                        : 'Thử thao tác trên hình để tiếp tục.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 16,
                      color: s.success
                          ? const Color(0xff71974b)
                          : const Color(0xff95a188),
                    ),
                  ),
                ),
              ),
              if (syncError.isNotEmpty)
                TextButton(
                  onPressed: sync,
                  child: Text(
                    syncError,
                    style: const TextStyle(fontSize: 14, color: Colors.orange),
                  ),
                ),
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 5, 24, 25),
                child: SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    key: const Key('continue'),
                    onPressed: s.success || done ? next : null,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          done ? 'Trở về khám phá' : 'Tiếp tục',
                          style: const TextStyle(color: Colors.white),
                        ),
                        const Icon(
                          Icons.arrow_forward,
                          size: 19,
                          color: Colors.white,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
