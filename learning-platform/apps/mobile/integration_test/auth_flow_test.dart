import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:mo_hoc/auth_panel.dart';
import 'package:mo_hoc/repository.dart';
import 'package:mo_hoc/session_store.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  testWidgets(
    'native secure session: registration confirmation, login, restore and logout',
    (tester) async {
      const store = SecureSessionStore('mohoc-integration-test-auth');
      await store.clear();
      final client = MockClient((r) async {
        if (r.url.path.endsWith('/signup')) {
          return http.Response('{"id":"pending"}', 200);
        }
        if (r.url.path.endsWith('/logout')) return http.Response('', 204);
        return http.Response(
          jsonEncode({
            'access_token': 'integration-access',
            'refresh_token': 'integration-refresh',
            'expires_in': 3600,
            'user': {
              'id': 'integration-user',
              'email': 'learner@example.invalid',
            },
          }),
          200,
        );
      });
      final repo = Repository(
        client: client,
        url: 'https://test.invalid',
        key: 'public',
        sessionStore: store,
      );
      try {
        await tester.pumpWidget(
          MaterialApp(
            home: Scaffold(
              body: MobileAuthPanel(auth: repo, onSuccess: () async {}),
            ),
          ),
        );
        await tester.tap(find.byKey(const Key('auth-switch')));
        await tester.pumpAndSettle();
        await tester.enterText(
          find.byKey(const Key('auth-email')),
          'learner@example.invalid',
        );
        await tester.enterText(
          find.byKey(const Key('auth-password')),
          'password123',
        );
        await tester.enterText(
          find.byKey(const Key('auth-confirmation')),
          'password123',
        );
        await tester.ensureVisible(find.byKey(const Key('auth-submit')));
        await tester.pumpAndSettle();
        await tester.tap(find.byKey(const Key('auth-submit')));
        await tester.pumpAndSettle();
        expect(find.byKey(const Key('auth-notice')), findsOneWidget);
        expect(repo.token, isNull);
        expect(await store.read(), isNull);
        await tester.ensureVisible(find.byKey(const Key('auth-password')));
        await tester.pumpAndSettle();
        await tester.enterText(
          find.byKey(const Key('auth-password')),
          'password123',
        );
        await tester.ensureVisible(find.byKey(const Key('auth-submit')));
        await tester.pumpAndSettle();
        await tester.tap(find.byKey(const Key('auth-submit')));
        await tester.pumpAndSettle();
        expect(repo.userId, 'integration-user');
        expect(await store.read(), isNotNull);
        final reopened = Repository(
          client: client,
          url: 'https://test.invalid',
          key: 'public',
          sessionStore: store,
        );
        await reopened.restoreSession();
        expect(reopened.userId, 'integration-user');
        await reopened.signOut();
        expect(reopened.token, isNull);
        expect(await store.read(), isNull);
        await tester.pumpWidget(const SizedBox());
      } finally {
        await store.clear();
      }
    },
  );
}
