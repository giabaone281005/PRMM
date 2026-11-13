import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:mo_hoc/auth_panel.dart';
import 'package:mo_hoc/repository.dart';

Future<void> mount(
  WidgetTester tester,
  Repository repo, {
  Future<void> Function()? onSuccess,
}) async {
  await tester.pumpWidget(
    MaterialApp(
      home: Scaffold(
        body: MobileAuthPanel(auth: repo, onSuccess: onSuccess ?? () async {}),
      ),
    ),
  );
}

Future<void> submit(WidgetTester tester) async {
  final button = find.byKey(const Key('auth-submit'));
  await tester.ensureVisible(button);
  await tester.tap(button);
  await tester.pumpAndSettle();
}

void main() {
  testWidgets(
    'register validates input, waits for verification and supports resend cooldown',
    (tester) async {
      final paths = <String>[];
      final repo = Repository(
        url: 'https://test.invalid',
        key: 'public',
        client: MockClient((r) async {
          paths.add(r.url.path);
          return http.Response('{"id":"pending"}', 200);
        }),
      );
      await mount(tester, repo);
      await tester.tap(find.byKey(const Key('auth-switch')));
      await tester.pumpAndSettle();
      await tester.enterText(find.byKey(const Key('auth-email')), 'invalid');
      await tester.enterText(
        find.byKey(const Key('auth-password')),
        'password123',
      );
      await tester.enterText(
        find.byKey(const Key('auth-confirmation')),
        'different',
      );
      await submit(tester);
      expect(paths, isEmpty);
      expect(find.text('Nhập địa chỉ email hợp lệ.'), findsOneWidget);
      expect(find.text('Mật khẩu nhập lại chưa khớp.'), findsOneWidget);
      await tester.enterText(
        find.byKey(const Key('auth-email')),
        'learner@example.invalid',
      );
      await tester.enterText(
        find.byKey(const Key('auth-confirmation')),
        'password123',
      );
      await submit(tester);
      expect(paths, ['/auth/v1/signup']);
      expect(repo.token, isNull);
      expect(find.byKey(const Key('auth-notice')), findsOneWidget);
      expect(
        tester
            .widget<TextFormField>(find.byKey(const Key('auth-password')))
            .controller!
            .text,
        isEmpty,
      );
      expect(
        tester
            .widget<TextButton>(find.byKey(const Key('auth-resend')))
            .onPressed,
        isNull,
      );
      await tester.pump(const Duration(seconds: 61));
      await tester.ensureVisible(find.byKey(const Key('auth-resend')));
      await tester.tap(find.byKey(const Key('auth-resend')));
      await tester.pumpAndSettle();
      expect(paths, ['/auth/v1/signup', '/auth/v1/resend']);
      await tester.pumpWidget(const SizedBox());
    },
  );
  testWidgets(
    'login displays server auth error then succeeds without registering',
    (tester) async {
      var attempts = 0, successes = 0;
      final repo = Repository(
        url: 'https://test.invalid',
        key: 'public',
        client: MockClient((r) async {
          expect(r.url.queryParameters['grant_type'], 'password');
          if (attempts++ == 0) {
            return http.Response('{"error_code":"invalid_credentials"}', 400);
          }
          return http.Response(
            jsonEncode({
              'access_token': 'access',
              'refresh_token': 'refresh',
              'expires_in': 3600,
              'user': {'id': 'learner', 'email': 'learner@example.invalid'},
            }),
            200,
          );
        }),
      );
      await mount(
        tester,
        repo,
        onSuccess: () async {
          successes++;
        },
      );
      await tester.enterText(
        find.byKey(const Key('auth-email')),
        'learner@example.invalid',
      );
      await tester.enterText(
        find.byKey(const Key('auth-password')),
        'password123',
      );
      await submit(tester);
      expect(find.text('Email hoặc mật khẩu không đúng.'), findsOneWidget);
      expect(successes, 0);
      await submit(tester);
      expect(successes, 1);
      expect(repo.userId, 'learner');
      expect(attempts, 2);
    },
  );
  testWidgets('small screen and large text keep registration form scrollable', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(320, 640);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    final repo = Repository(url: 'https://test.invalid', key: 'public');
    await tester.pumpWidget(
      MaterialApp(
        builder: (context, child) => MediaQuery(
          data: MediaQuery.of(context)
              .copyWith(textScaler: const TextScaler.linear(1.35)),
          child: child!,
        ),
        home: Scaffold(
          body: MobileAuthPanel(auth: repo, onSuccess: () async {}),
        ),
      ),
    );
    await tester.ensureVisible(find.byKey(const Key('auth-switch')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('auth-switch')));
    await tester.pumpAndSettle();
    expect(find.byKey(const Key('auth-confirmation')), findsOneWidget);
    await tester.ensureVisible(find.byKey(const Key('auth-submit')));
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
  });
}
