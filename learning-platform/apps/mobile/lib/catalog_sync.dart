import 'dart:async';

import 'package:realtime_client/realtime_client.dart';

import 'repository.dart';

/// Realtime carries only a revision. Manifests are still fetched through the
/// authenticated published_catalog RPC, never from an authoring table/channel.
Stream<void> catalogChanges(
  Repository auth, {
  Duration pollInterval = const Duration(seconds: 30),
  void Function()? onSubscribed,
}) {
  late StreamController<void> controller;
  RealtimeClient? realtime;
  Timer? poll;
  bool stopped = false, checking = false;
  int? revision;
  final owner = auth.userId;
  void changed(int next, {bool force = false}) {
    if (stopped || auth.userId != owner || auth.token == null) return;
    if (force || revision == null || next != revision) {
      revision = next;
      controller.add(null);
    }
  }

  Future<void> check({bool force = false}) async {
    if (stopped || checking || auth.token == null || auth.userId != owner) {
      return;
    }
    checking = true;
    try {
      final rows = await auth.get(
        'rest/v1/catalog_state?id=eq.true&select=revision',
      );
      if ((rows as List).isNotEmpty) {
        changed((rows.first['revision'] as num).toInt(), force: force);
      }
    } catch (_) {
      /* Keep the last catalog and retry after reconnection/resume. */
    } finally {
      checking = false;
    }
  }

  void authChanged() {
    if (!stopped && auth.userId == owner && auth.token != null) {
      unawaited(
        realtime?.setAuth(auth.token).catchError((Object _) {}) ??
            Future.value(),
      );
    }
  }

  controller = StreamController<void>(
    onListen: () {
      if (!auth.remote || auth.token == null) return;
      final uri = Uri.parse(auth.url);
      realtime = RealtimeClient(
        uri
            .replace(
              scheme: uri.scheme == 'https' ? 'wss' : 'ws',
              path: '/realtime/v1',
              query: null,
            )
            .toString(),
        params: {'apikey': auth.key},
        customAccessToken: () async {
          await auth.ensureSession();
          return auth.token;
        },
      );
      auth.addListener(authChanged);
      unawaited(
        (() async {
          try {
            await realtime!.setAuth(auth.token);
            if (stopped) return;
            realtime!
                .channel('published-catalog')
                .onPostgresChanges(
                  event: PostgresChangeEvent.update,
                  schema: 'public',
                  table: 'catalog_state',
                  callback: (payload) {
                    final next = payload.newRecord['revision'];
                    if (next is num) changed(next.toInt());
                  },
                )
                .subscribe((status, error) {
                  if (status == RealtimeSubscribeStatus.subscribed) {
                    onSubscribed?.call();
                    unawaited(check(force: true));
                  }
                });
          } catch (_) {
            /* The revision poll remains available if WebSocket fails. */
          }
        })(),
      );
      unawaited(check());
      poll = Timer.periodic(pollInterval, (_) => unawaited(check()));
    },
    onCancel: () async {
      stopped = true;
      poll?.cancel();
      auth.removeListener(authChanged);
      await realtime?.removeAllChannels();
      await realtime?.disconnect();
    },
  );
  return controller.stream;
}
