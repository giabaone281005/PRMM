import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:mo_hoc/repository.dart';
import 'package:mo_hoc/session_store.dart';

class MemorySessionStore implements SessionStore {
  String? value;
  @override
  Future<String?> read() async => value;
  @override
  Future<void> write(String text) async {
    value = text;
  }

  @override
  Future<void> clear() async {
    value = null;
  }
}

void main() {
  test('signup requiring email confirmation never authenticates or stores a session', () async {
    final store = MemorySessionStore();
    final paths = <String>[];
    final repo = Repository(
      url: 'https://test.invalid',
      key: 'public-key',
      sessionStore: store,
      client: MockClient((r) async {
        paths.add(r.url.path);
        expect(r.headers.containsKey('Authorization'), isFalse);
        if (r.url.path.endsWith('signup')) {
          expect(jsonDecode(r.body)['email'], 'learner@example.invalid');
          return http.Response('{"id":"pending-user"}', 200);
        }
        expect(jsonDecode(r.body)['type'], 'signup');
        return http.Response('{}', 200);
      }),
    );
    expect(
      await repo.signUp(' learner@example.invalid ', 'long-password'),
      isFalse,
    );
    expect(repo.token, isNull);
    expect(repo.userId, isNull);
    expect(store.value, isNull);
    await repo.resendConfirmation('learner@example.invalid');
    expect(paths, ['/auth/v1/signup', '/auth/v1/resend']);
  });
  test('login persists session without password, restart restores, logout removes secure session', () async {
    final store = MemorySessionStore();
    final client = MockClient((r) async {
      if (r.url.path.endsWith('logout')) {
        expect(r.url.queryParameters['scope'], 'local');
        return http.Response('', 204);
      }
      return http.Response(
        jsonEncode({
          'access_token': 'access',
          'refresh_token': 'refresh',
          'expires_in': 3600,
          'user': {'id': 'one', 'email': 'one@example.invalid'},
        }),
        200,
      );
    });
    final first = Repository(
      url: 'https://test.invalid',
      key: 'key',
      sessionStore: store,
      client: client,
    );
    await first.signIn('one@example.invalid', 'private-password');
    expect(store.value, contains('refresh'));
    expect(store.value, isNot(contains('private-password')));
    final restarted = Repository(
      url: 'https://test.invalid',
      key: 'key',
      sessionStore: store,
      client: client,
    );
    await restarted.restoreSession();
    expect(restarted.userId, 'one');
    expect(restarted.token, 'access');
    await restarted.signOut();
    expect(restarted.userId, isNull);
    expect(store.value, isNull);
  });
  test('revoked refresh clears persisted identity; transient failures keep the session', () async {
    for (final status in [400, 503]) {
      final store = MemorySessionStore()
        ..value = jsonEncode({
          'access_token': 'expired',
          'refresh_token': 'refresh',
          'expires_at': '2020-01-01T00:00:00Z',
          'user': {'id': 'one', 'email': 'one@example.invalid'},
        });
      final repo = Repository(
        url: 'https://test.invalid',
        key: 'key',
        sessionStore: store,
        client: MockClient(
          (_) async =>
              http.Response('{"error_code":"refresh_token_not_found"}', status),
        ),
      );
      await repo.restoreSession();
      if (status == 400) {
        expect(repo.token, isNull);
        expect(store.value, isNull);
      } else {
        expect(repo.token, 'expired');
        expect(store.value, isNotNull);
      }
    }
  });
  test('known Auth errors have Vietnamese messages without exposing server response', () async {
    final repo = Repository(
      url: 'https://test.invalid',
      key: 'key',
      client: MockClient(
        (_) async => http.Response(
          '{"error_code":"email_not_confirmed","message":"internal detail"}',
          400,
        ),
      ),
    );
    await expectLater(
      repo.signIn('one@example.invalid', 'password'),
      throwsA(
        isA<AuthFailure>().having(
          (e) => e.message,
          'message',
          contains('chưa được xác minh'),
        ),
      ),
    );
  });
  test('concurrent authenticated requests share token refresh and use the new access token', () async {
    var refreshes = 0;
    final client = MockClient((request) async {
      if (request.url.path == '/auth/v1/token') {
        final refresh =
            request.url.queryParameters['grant_type'] == 'refresh_token';
        if (refresh) {
          refreshes++;
          await Future<void>.delayed(const Duration(milliseconds: 10));
        }
        return http.Response(
          jsonEncode({
            'access_token': refresh ? 'new-token' : 'old-token',
            'refresh_token': 'refresh-token',
            'expires_in': refresh ? 3600 : 0,
            'user': {'id': 'user-a', 'email': 'user@example.invalid'},
          }),
          200,
        );
      }
      expect(request.headers['Authorization'], 'Bearer new-token');
      expect(request.headers['apikey'], 'public-key');
      return http.Response('{}', 200);
    });
    final repo = Repository(
      client: client,
      url: 'https://test.invalid',
      key: 'public-key',
    );
    await repo.signIn('user@example.invalid', 'not-a-real-password');
    await Future.wait([
      repo.request('rest/v1/rpc/my_study_activity', {}),
      repo.get('rest/v1/profiles'),
    ]);
    expect(refreshes, 1);
    await repo.signOut();
    expect(repo.token, isNull);
    expect(repo.userId, isNull);
  });
  test(
    'failed logout still clears account identity and session tokens',
    () async {
      final repo = Repository(
        url: 'https://test.invalid',
        key: 'public-key',
        client: MockClient((_) async => http.Response('{}', 503)),
      );
      repo.token = 'expired';
      repo.userId = 'previous-account';
      await expectLater(repo.signOut(), throwsException);
      expect(repo.token, isNull);
      expect(repo.userId, isNull);
    },
  );
}
