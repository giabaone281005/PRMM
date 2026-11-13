import 'dart:convert';
import 'dart:async';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'activity.dart';
import 'activity_sync.dart';
import 'auth_panel.dart';
import 'catalog_sync.dart';
import 'domain.dart';
import 'scenes.dart';
import 'repository.dart';
import 'player.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await repository.restoreSession();
  runApp(const MoHocApp());
}

class MoHocApp extends StatelessWidget {
  final Future<List<Json>> Function()? catalogLoader;
  final Stream<void>? catalogEvents;
  const MoHocApp({super.key, this.catalogLoader, this.catalogEvents});
  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'Mở Học',
    debugShowCheckedModeBanner: false,
    theme: ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(seedColor: ink, surface: paper),
      scaffoldBackgroundColor: paper,
      textTheme: const TextTheme(
        bodyLarge: TextStyle(fontSize: 18, height: 1.5),
        bodyMedium: TextStyle(fontSize: 16, height: 1.45),
        bodySmall: TextStyle(fontSize: 14),
        titleLarge: TextStyle(fontSize: 24, fontWeight: FontWeight.w700),
        titleMedium: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
        labelLarge: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: paper,
        surfaceTintColor: paper,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: Colors.white,
        indicatorColor: const Color(0xffe0edcf),
        labelTextStyle: WidgetStateProperty.all(
          const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: ink,
          foregroundColor: Colors.white,
          minimumSize: const Size(48, 54),
          textStyle: const TextStyle(fontSize: 17, fontWeight: FontWeight.w600),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
        ),
      ),
    ),
    home: HomePage(catalogLoader: catalogLoader, catalogEvents: catalogEvents),
  );
}

const muted = Color(0xff78856d), border = Color(0xffe2e7da);

class LessonVisual {
  final IconData icon;
  final String label;
  final Color color;
  const LessonVisual(this.icon, this.label, this.color);
}

LessonVisual lessonVisual(Json lesson) => switch (lesson['engine']['type']) {
  'number_line_2d' => const LessonVisual(
    Icons.swap_horiz_rounded,
    'Trục số',
    Color(0xffe5efce),
  ),
  'fraction_bar_2d' => const LessonVisual(
    Icons.pie_chart_rounded,
    'Phân số',
    Color(0xffeee5fa),
  ),
  'algebra_balance_2d' => const LessonVisual(
    Icons.balance_rounded,
    'Phương trình',
    Color(0xfff7ecd1),
  ),
  'percentage_2d' => const LessonVisual(
    Icons.percent_rounded,
    'Phần trăm',
    Color(0xffeef5e7),
  ),
  'ratio_2d' => const LessonVisual(
    Icons.compare_arrows_rounded,
    'Tỉ lệ',
    Color(0xffeef5e7),
  ),
  'coordinate_2d' => const LessonVisual(
    Icons.my_location_rounded,
    'Tọa độ',
    Color(0xffeef5e7),
  ),
  'area_2d' => const LessonVisual(
    Icons.grid_4x4_rounded,
    'Diện tích',
    Color(0xffeef5e7),
  ),
  'pythagorean_2d' => const LessonVisual(
    Icons.square_foot_rounded,
    'Pythagore',
    Color(0xffeef5e7),
  ),
  'linear_plot_2d' => const LessonVisual(
    Icons.trending_up_rounded,
    'Đường thẳng',
    Color(0xffeef5e7),
  ),
  'function_plot_2d' => const LessonVisual(
    Icons.show_chart_rounded,
    'Đồ thị',
    Color(0xffdeedf6),
  ),
  'geometry_3d_web' => const LessonVisual(
    Icons.view_in_ar_rounded,
    'Hình khối',
    Color(0xffe0efd8),
  ),
  _ => const LessonVisual(
    Icons.change_history_rounded,
    'Tam giác',
    Color(0xfff4e7d8),
  ),
};

class LearnerSummary {
  final List<Json> lessons;
  final Map<String, Json> progress;
  final StudyActivity activity;
  final String name;
  LearnerSummary(this.lessons, this.progress, this.activity, this.name);
  int get completed => lessons
      .where((l) => progress[l['lessonId']]?['completed'] == true)
      .length;
  int get checkpoints => lessons.fold(0, (sum, l) {
    final p = progress[l['lessonId']];
    return sum +
        (p == null
            ? 0
            : (p['checkpoint'] as int) + (p['completed'] == true ? 1 : 0));
  });
  int get totalCheckpoints =>
      lessons.fold(0, (sum, l) => sum + (l['checkpoints'] as List).length);
  double fraction(Json l) {
    final p = progress[l['lessonId']];
    if (p == null) return 0;
    return ((p['checkpoint'] as int) + (p['completed'] == true ? 1 : 0)) /
        (l['checkpoints'] as List).length;
  }
}

class HomePage extends StatefulWidget {
  final Future<List<Json>> Function()? catalogLoader;
  final Stream<void>? catalogEvents;
  const HomePage({super.key, this.catalogLoader, this.catalogEvents});
  @override
  State<HomePage> createState() => _HomeState();
}

class _HomeState extends State<HomePage> with WidgetsBindingObserver {
  late Future<LearnerSummary> summary;
  int tab = 0, grade = 0;
  String? picked;
  String? _lastUser;
  StreamSubscription<void>? _catalogSubscription;
  bool _catalogLoading = false, _catalogDirty = false;
  int _loadSerial = 0;
  void watchCatalog() {
    final previous = _catalogSubscription;
    _catalogSubscription = null;
    unawaited(previous?.cancel());
    if (widget.catalogEvents != null) {
      _catalogSubscription = widget.catalogEvents!.listen(
        (_) => unawaited(refreshCatalog()),
      );
    } else if (repository.remote && repository.token != null) {
      _catalogSubscription = catalogChanges(repository)
          .listen((_) => unawaited(refreshCatalog()));
    }
  }

  Future<void> refreshCatalog() async {
    _catalogDirty = true;
    if (_catalogLoading) return;
    _catalogLoading = true;
    try {
      do {
        _catalogDirty = false;
        final user = repository.userId, serial = ++_loadSerial;
        try {
          final data = await load();
          if (mounted && serial == _loadSerial && user == repository.userId) {
            setState(() {summary = Future.value(data);});
          }
        } catch (_) {
          /* Preserve the last successful catalog on transient failures. */
        }
      } while (_catalogDirty && mounted);
    } finally {
      _catalogLoading = false;
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      watchCatalog();
      if (widget.catalogLoader != null || repository.token != null) {
        unawaited(refreshCatalog());
      }
    } else {
      final previous = _catalogSubscription;
      _catalogSubscription = null;
      unawaited(previous?.cancel());
    }
  }

  @override
  void initState() {
    super.initState();
    _lastUser = repository.userId;
    repository.addListener(authChanged);
    WidgetsBinding.instance.addObserver(this);
    summary = repository.remote && repository.token == null
        ? Future.value(LearnerSummary([], {}, StudyActivity(), 'Bạn học'))
        : load();
    watchCatalog();
  }

  void authChanged() {
    if (!mounted || _lastUser == repository.userId) return;
    _lastUser = repository.userId;
    _loadSerial++;
    watchCatalog();
    setState(() {
      tab = 0;
      picked = null;
      summary = repository.token == null
          ? Future.value(LearnerSummary([], {}, StudyActivity(), 'Bạn học'))
          : load();
    });
  }

  @override
  void dispose() {
    repository.removeListener(authChanged);
    WidgetsBinding.instance.removeObserver(this);
    unawaited(_catalogSubscription?.cancel());
    _loadSerial++;
    super.dispose();
  }

  Future<LearnerSummary> load() async {
    final lessons =
            await (widget.catalogLoader?.call() ?? repository.catalog()),
        prefs = await SharedPreferences.getInstance(),
        progress = <String, Json>{};
    for (final l in lessons) {
      try {
        final raw = prefs.getString(progressKey(l));
        if (raw != null) {
          final p = jsonDecode(raw) as Json;
          if (p['identity'] == jsonEncode(l)) progress[l['lessonId']] = p;
        }
      } catch (_) {
        /* Ignore incompatible cached snapshots. */
      }
    }
    final user = repository.userId ?? 'local';
    var activity = await ActivityStore.load(user);
    var name = prefs.getString('mohoc-profile-name-$user') ?? 'Bạn học';
    if (repository.remote && repository.token != null) {
      await ActivitySync.flush(user);
      final profile = await repository.profile();
      name = profile['display_name'];
      await prefs.setString('mohoc-profile-name-$user', name);
      activity = StudyActivity.fromJson(
        Map<String, dynamic>.from(
          await repository.request('rest/v1/rpc/my_study_activity', {}),
        ),
      );
      final rows = await repository.get(
        'rest/v1/lesson_progress?user_id=eq.$user&select=lesson_id,version,snapshot',
      ) as List;
      for (final row in rows) {
        final lesson = lessons
            .where(
              (l) =>
                  l['lessonId'] == row['lesson_id'] &&
                  l['version'] == row['version'],
            )
            .firstOrNull;
        if (lesson == null) continue;
        final server = Map<String, dynamic>.from(row['snapshot']);
        if ((server['revision'] as int) >=
            (progress[row['lesson_id']]?['revision'] ?? -1)) {
          progress[row['lesson_id']] = server;
          await prefs.setString(progressKey(lesson), jsonEncode(server));
        }
      }
    }
    return LearnerSummary(lessons, progress, activity, name);
  }

  Future<void> reload() async {
    _loadSerial++;
    final future = load();
    if (mounted) {
      setState(() {
        summary = future;
      });
    }
    await future;
  }

  Future<void> open(Json l) async {
    setState(() => picked = l['lessonId']);
    await Navigator.of(context)
        .push(MaterialPageRoute<void>(builder: (_) => LessonPage(lesson: l)));
    if (mounted) await reload();
  }

  Future<void> rename(String old) async {
    final controller = TextEditingController(text: old);
    final value = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Tên hiển thị'),
        content: TextField(
          controller: controller,
          maxLength: 40,
          autofocus: true,
          textCapitalization: TextCapitalization.words,
          decoration: const InputDecoration(hintText: 'Tên của bạn'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: () {
              final name = controller.text.trim();
              if (name.isNotEmpty) Navigator.pop(context, name);
            },
            child: const Text('Lưu'),
          ),
        ],
      ),
    );
    if (value != null) {
      if (repository.remote && repository.token != null) {
        try {
          await repository.rename(value);
        } catch (_) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Chưa lưu được tên. Vui lòng thử lại.'),
              ),
            );
          }
          return;
        }
      }
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(
        'mohoc-profile-name-${repository.userId ?? 'local'}',
        value,
      );
      await reload();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (repository.remote && repository.token == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('✳ mở học.')),
        body: SafeArea(
          child: MobileAuthPanel(auth: repository, onSuccess: () async {}),
        ),
      );
    }
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          '✳ mở học.',
          style: TextStyle(
            fontWeight: FontWeight.w800,
            letterSpacing: -1,
            fontSize: 27,
          ),
        ),
        actions: [
          IconButton(
            tooltip: 'Hồ sơ',
            onPressed: () => setState(() => tab = 2),
            icon: const CircleAvatar(
              radius: 19,
              backgroundColor: Color(0xffe5edda),
              child: Icon(Icons.person_outline_rounded, color: ink, size: 23),
            ),
          ),
          const SizedBox(width: 12),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: tab,
        onDestinationSelected: (i) => setState(() => tab = i),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home_rounded),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.grid_view_outlined),
            selectedIcon: Icon(Icons.grid_view_rounded),
            label: 'Bài học',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline_rounded),
            selectedIcon: Icon(Icons.person_rounded),
            label: 'Hồ sơ',
          ),
        ],
      ),
      body: SafeArea(
        child: FutureBuilder<LearnerSummary>(
          future: summary,
          builder: (context, s) {
            if (s.connectionState != ConnectionState.done && !s.hasData) {
              return const Center(child: CircularProgressIndicator());
            }
            if (s.hasError) {
              return Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.cloud_off_rounded,
                        size: 42,
                        color: muted,
                      ),
                      const SizedBox(height: 12),
                      Text('${s.error}', textAlign: TextAlign.center),
                      TextButton(
                        onPressed: reload,
                        child: const Text('Thử lại'),
                      ),
                    ],
                  ),
                ),
              );
            }
            final data = s.data!;
            return RefreshIndicator(
              onRefresh: reload,
              child: ListView(
                key: ValueKey('tab-$tab'),
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(22, 16, 22, 30),
                children: tab == 0
                    ? home(data)
                    : tab == 1
                    ? catalog(data)
                    : profile(data),
              ),
            );
          },
        ),
      ),
    );
  }

  List<Widget> home(LearnerSummary data) {
    final streak = data.activity.streak(DateTime.now());
    final continuing = data.lessons
        .where(
          (l) =>
              data.progress.containsKey(l['lessonId']) &&
              data.progress[l['lessonId']]?['completed'] != true,
        )
        .firstOrNull;
    final next =
        continuing ??
        data.lessons
            .where((l) => data.progress[l['lessonId']]?['completed'] != true)
            .firstOrNull ??
        data.lessons.firstOrNull;
    return [
      Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              'Chào ${data.name == "Bạn học" ? "bạn" : data.name} 👋',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 27,
                fontWeight: FontWeight.w700,
                letterSpacing: -.7,
              ),
            ),
          ),
          _StreakBadge(streak),
        ],
      ),
      const SizedBox(height: 22),
      if (next != null) ...[
        Text(
          continuing == null ? 'Khám phá hôm nay' : 'Tiếp tục học',
          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 12),
        _ContinueTile(
          lesson: next,
          fraction: data.fraction(next),
          onTap: () => open(next),
        ),
        const SizedBox(height: 24),
      ],
      Row(
        children: [
          Expanded(
            child: _Stat(
              icon: Icons.check_circle_outline_rounded,
              value: '${data.completed}',
              label: 'Đã học',
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _Stat(
              icon: Icons.timer_outlined,
              value: durationLabel(data.activity.totalSeconds),
              label: 'Thời gian',
            ),
          ),
        ],
      ),
      const SizedBox(height: 25),
      Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Expanded(
            child: Text(
              'Chọn một khám phá',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
            ),
          ),
          IconButton(
            tooltip: 'Tất cả bài học',
            onPressed: () => setState(() => tab = 1),
            icon: const Icon(Icons.arrow_forward_rounded),
          ),
        ],
      ),
      const SizedBox(height: 8),
      lessonGrid(data.lessons.take(6).toList(), data),
    ];
  }

  List<Widget> catalog(LearnerSummary data) {
    final filtered = data.lessons
        .where((l) => grade == 0 || l['grade'] == grade)
        .toList();
    return [
      const Text(
        'Bài học',
        style: TextStyle(
          fontSize: 28,
          fontWeight: FontWeight.w700,
          letterSpacing: -.8,
        ),
      ),
      const SizedBox(height: 18),
      SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [0, 6, 7, 8, 9]
              .map(
                (g) => Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(
                      g == 0 ? 'Tất cả' : 'Lớp $g',
                      style: const TextStyle(fontSize: 16),
                    ),
                    selected: grade == g,
                    onSelected: (_) => setState(() => grade = g),
                  ),
                ),
              )
              .toList(),
        ),
      ),
      const SizedBox(height: 24),
      if (filtered.isEmpty)
        const Padding(
          padding: EdgeInsets.all(25),
          child: Text('Chưa có bài học.', textAlign: TextAlign.center),
        )
      else
        lessonGrid(filtered, data),
    ];
  }

  Widget lessonGrid(List<Json> lessons, LearnerSummary data) => LayoutBuilder(
    builder: (context, c) {
      final columns = c.maxWidth >= 550
          ? 4
          : c.maxWidth < 300
          ? 2
          : 3;
      return GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: lessons.length,
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: columns,
          mainAxisSpacing: 15,
          crossAxisSpacing: 12,
          mainAxisExtent:
              152 +
              (MediaQuery.textScalerOf(context).scale(14) - 14).clamp(0, 30) *
                  4,
        ),
        itemBuilder: (context, i) {
          final l = lessons[i];
          return LessonIconTile(
            lesson: l,
            fraction: data.fraction(l),
            selected: picked == l['lessonId'],
            onTap: () => open(l),
          );
        },
      );
    },
  );
  List<Widget> profile(LearnerSummary data) {
    final now = DateTime.now(),
        streak = data.activity.streak(now),
        percent = data.totalCheckpoints == 0
            ? 0
            : (data.checkpoints / data.totalCheckpoints * 100).round();
    return [
      Row(
        children: [
          const CircleAvatar(
            radius: 31,
            backgroundColor: Color(0xffe1edce),
            child: Icon(Icons.person_rounded, color: ink, size: 36),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  data.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  repository.email ?? 'Tài khoản trên thiết bị',
                  style: const TextStyle(fontSize: 14, color: muted),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          IconButton(
            tooltip: 'Đổi tên hiển thị',
            onPressed: () => rename(data.name),
            icon: const Icon(Icons.edit_outlined, size: 22),
          ),
        ],
      ),
      const SizedBox(height: 26),
      Row(
        children: [
          Expanded(
            child: _Stat(
              icon: Icons.check_circle_outline_rounded,
              value: '${data.completed}',
              label: 'Hoàn thành',
            ),
          ),
          const SizedBox(width: 9),
          Expanded(
            child: _Stat(
              icon: Icons.local_fire_department_outlined,
              value: '$streak',
              label: 'Chuỗi ngày',
            ),
          ),
          const SizedBox(width: 9),
          Expanded(
            child: _Stat(
              icon: Icons.timer_outlined,
              value: durationLabel(data.activity.totalSeconds),
              label: 'Đã học',
            ),
          ),
        ],
      ),
      const SizedBox(height: 25),
      Container(
        padding: const EdgeInsets.all(19),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: border),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Expanded(
                  child: Text(
                    'Tiến độ',
                    style: TextStyle(fontSize: 19, fontWeight: FontWeight.w700),
                  ),
                ),
                Text(
                  '$percent%',
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                value: data.totalCheckpoints == 0
                    ? 0
                    : data.checkpoints / data.totalCheckpoints,
                minHeight: 9,
                color: const Color(0xff8cbc55),
                backgroundColor: const Color(0xffeaf0e1),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              '${data.checkpoints} / ${data.totalCheckpoints} bước',
              style: const TextStyle(fontSize: 15, color: muted),
            ),
          ],
        ),
      ),
      const SizedBox(height: 25),
      const Text(
        'Nhịp học của bạn',
        style: TextStyle(fontSize: 21, fontWeight: FontWeight.w700),
      ),
      const SizedBox(height: 14),
      ActivityHeatmap(activity: data.activity, now: now),
      const SizedBox(height: 25),
      const Text(
        'Gần đây',
        style: TextStyle(fontSize: 21, fontWeight: FontWeight.w700),
      ),
      const SizedBox(height: 8),
      if (data.activity.events.isEmpty)
        const Padding(
          padding: EdgeInsets.symmetric(vertical: 16),
          child: Text(
            'Học một bài để bắt đầu.',
            style: TextStyle(color: muted, fontSize: 16),
          ),
        )
      else
        ...data.activity.events.take(8).map((e) => _TimelineItem(event: e)),
      if (repository.token != null) ...[
        const SizedBox(height: 22),
        OutlinedButton.icon(
          onPressed: () async {
            try {
              await repository.signOut();
            } catch (_) {
              /* Identity is cleared even if the network is unavailable. */
            }
            if (!mounted) return;
            setState(() {
              summary = Future.value(
                LearnerSummary([], {}, StudyActivity(), 'Bạn học'),
              );
            });
          },
          icon: const Icon(Icons.logout_rounded),
          label: const Text('Đăng xuất'),
        ),
      ],
    ];
  }
}

String durationLabel(int seconds) => seconds < 60
    ? '${seconds}s'
    : seconds < 3600
    ? '${seconds ~/ 60}p'
    : '${(seconds / 3600).toStringAsFixed(1)}h';

class LessonIconTile extends StatelessWidget {
  final Json lesson;
  final double fraction;
  final bool selected;
  final VoidCallback onTap;
  const LessonIconTile({
    super.key,
    required this.lesson,
    required this.fraction,
    required this.onTap,
    this.selected = false,
  });
  @override
  Widget build(BuildContext context) {
    final visual = lessonVisual(lesson), done = fraction >= 1;
    return Semantics(
      label:
          '${lesson['title']}, lớp ${lesson['grade']}${done ? ', đã hoàn thành' : ''}',
      button: true,
      child: Tooltip(
        message: lesson['title'],
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            key: ValueKey('lesson-${lesson['lessonId']}'),
            onTap: onTap,
            borderRadius: BorderRadius.circular(20),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SizedBox(
                  width: 82,
                  height: 82,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      SizedBox(
                        width: 80,
                        height: 80,
                        child: CircularProgressIndicator(
                          value: fraction,
                          strokeWidth: 3,
                          color: const Color(0xff80b346),
                          backgroundColor: const Color(0xffe7ecdf),
                        ),
                      ),
                      Container(
                        width: 68,
                        height: 68,
                        decoration: BoxDecoration(
                          color: visual.color,
                          shape: BoxShape.circle,
                          border: selected
                              ? Border.all(
                                  color: const Color(0xff7fa84f),
                                  width: 1.5,
                                )
                              : null,
                        ),
                        child: Icon(visual.icon, size: 33, color: ink),
                      ),
                      if (done)
                        const Positioned(
                          right: 0,
                          bottom: 1,
                          child: CircleAvatar(
                            radius: 12,
                            backgroundColor: Color(0xff7fa84f),
                            child: Icon(
                              Icons.check_rounded,
                              color: Colors.white,
                              size: 17,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 9),
                Text(
                  lesson['title'] as String,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  'Lớp ${lesson['grade']}',
                  style: const TextStyle(fontSize: 12, color: muted),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ContinueTile extends StatelessWidget {
  final Json lesson;
  final double fraction;
  final VoidCallback onTap;
  const _ContinueTile({
    required this.lesson,
    required this.fraction,
    required this.onTap,
  });
  @override
  Widget build(BuildContext context) {
    final v = lessonVisual(lesson);
    return Material(
      color: const Color(0xffedf3e2),
      borderRadius: BorderRadius.circular(21),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(21),
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Row(
            children: [
              Container(
                width: 59,
                height: 59,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: .8),
                  borderRadius: BorderRadius.circular(17),
                ),
                child: Icon(v.icon, size: 31, color: ink),
              ),
              const SizedBox(width: 15),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      lesson['title'] as String,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 7),
                    Text(
                      'Lớp ${lesson['grade']}',
                      style: const TextStyle(fontSize: 15, color: muted),
                    ),
                    if (fraction > 0) ...[
                      const SizedBox(height: 8),
                      LinearProgressIndicator(
                        value: fraction,
                        minHeight: 4,
                        color: const Color(0xff87b44f),
                        backgroundColor: Colors.white,
                      ),
                    ],
                  ],
                ),
              ),
              const Icon(Icons.arrow_forward_rounded, size: 25),
            ],
          ),
        ),
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  final IconData icon;
  final String value, label;
  const _Stat({required this.icon, required this.value, required this.label});
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 9),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(18),
      border: Border.all(color: border),
    ),
    child: Column(
      children: [
        Icon(icon, color: const Color(0xff7f9b5d), size: 23),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(fontSize: 23, fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(fontSize: 13, color: muted),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    ),
  );
}

class _StreakBadge extends StatelessWidget {
  final int value;
  const _StreakBadge(this.value);
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
    decoration: BoxDecoration(
      color: const Color(0xfff6eddc),
      borderRadius: BorderRadius.circular(22),
    ),
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Icon(
          Icons.local_fire_department_rounded,
          color: Color(0xffc28b3f),
          size: 22,
        ),
        const SizedBox(width: 4),
        Text(
          '$value',
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
        ),
      ],
    ),
  );
}

class ActivityHeatmap extends StatelessWidget {
  final StudyActivity activity;
  final DateTime now;
  const ActivityHeatmap({super.key, required this.activity, required this.now});
  @override
  Widget build(BuildContext context) {
    final today = DateTime(now.year, now.month, now.day),
        start = today.subtract(Duration(days: today.weekday % 7 + 19 * 7));
    const palette = [
      Color(0xffedf1e8),
      Color(0xffd6e9b8),
      Color(0xffa8cc78),
      Color(0xff79a648),
      Color(0xff4c782e),
    ];
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 16, 14, 13),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: border),
        borderRadius: BorderRadius.circular(20),
      ),
      child: LayoutBuilder(
        builder: (context, c) {
          final cell = ((c.maxWidth - 28) / 20 - 3).clamp(9.0, 14.0);
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                reverse: true,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Column(
                      children: List.generate(
                        7,
                        (i) => SizedBox(
                          height: cell + 3,
                          width: 25,
                          child: Text(
                            i == 1
                                ? 'T2'
                                : i == 3
                                ? 'T4'
                                : i == 5
                                ? 'T6'
                                : '',
                            style: const TextStyle(fontSize: 10, color: muted),
                          ),
                        ),
                      ),
                    ),
                    ...List.generate(
                      20,
                      (week) => Column(
                        children: [
                          SizedBox(
                            height: 19,
                            width: cell + 3,
                            child: Text(
                              week == 0 ||
                                      start
                                              .add(Duration(days: week * 7))
                                              .month !=
                                          start
                                              .add(
                                                Duration(days: (week - 1) * 7),
                                              )
                                              .month
                                  ? '${start.add(Duration(days: week * 7)).month}'
                                  : '',
                              style: const TextStyle(
                                fontSize: 10,
                                color: muted,
                              ),
                            ),
                          ),
                          ...List.generate(7, (day) {
                            final date = start.add(
                                  Duration(days: week * 7 + day),
                                ),
                                d = activity.days[dayKey(date)],
                                score = d == null
                                    ? 0
                                    : (d['checkpoints'] as num) * 2 +
                                          (d['completed'] as num) * 3 +
                                          (d['seconds'] as num) / 60;
                            final level = score == 0
                                ? 0
                                : score < 2
                                ? 1
                                : score < 5
                                ? 2
                                : score < 10
                                ? 3
                                : 4;
                            final future = date.isAfter(today);
                            return Tooltip(
                              message:
                                  '${date.day}/${date.month}: ${d?['checkpoints'] ?? 0} bước · ${durationLabel((d?['seconds'] as num? ?? 0).toInt())}',
                              child: Semantics(
                                label:
                                    '${dayKey(date)}: ${activity.active(date) ? 'có học' : 'chưa học'}',
                                child: Container(
                                  key: ValueKey('activity-${dayKey(date)}'),
                                  width: cell,
                                  height: cell,
                                  margin: const EdgeInsets.only(
                                    right: 3,
                                    bottom: 3,
                                  ),
                                  decoration: BoxDecoration(
                                    color: future
                                        ? Colors.transparent
                                        : palette[level],
                                    borderRadius: BorderRadius.circular(3),
                                    border: date == today
                                        ? Border.all(
                                            color: const Color(0xff8ba66b),
                                          )
                                        : null,
                                  ),
                                ),
                              ),
                            );
                          }),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 11),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  const Text(
                    'Ít',
                    style: TextStyle(fontSize: 12, color: muted),
                  ),
                  const SizedBox(width: 7),
                  ...palette.map(
                    (color) => Container(
                      width: 11,
                      height: 11,
                      margin: const EdgeInsets.only(right: 3),
                      decoration: BoxDecoration(
                        color: color,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Text(
                    'Nhiều',
                    style: TextStyle(fontSize: 12, color: muted),
                  ),
                ],
              ),
            ],
          );
        },
      ),
    );
  }
}

class _TimelineItem extends StatelessWidget {
  final Json event;
  const _TimelineItem({required this.event});
  @override
  Widget build(BuildContext context) {
    final at = DateTime.tryParse(event['at'] ?? '')?.toLocal(),
        complete = event['type'] == 'complete';
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 11),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(9),
            decoration: const BoxDecoration(
              color: Color(0xffeaf2df),
              shape: BoxShape.circle,
            ),
            child: Icon(
              complete ? Icons.verified_rounded : Icons.check_rounded,
              size: 20,
              color: Color(0xff709648),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  complete ? 'Hoàn thành bài học' : 'Vượt qua một bước',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  event['title'] ?? '',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 14, color: muted),
                ),
              ],
            ),
          ),
          if (at != null)
            Padding(
              padding: const EdgeInsets.only(left: 7, top: 3),
              child: Text(
                '${at.day}/${at.month}',
                style: const TextStyle(fontSize: 13, color: muted),
              ),
            ),
        ],
      ),
    );
  }
}
