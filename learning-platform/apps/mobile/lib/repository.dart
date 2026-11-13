import 'dart:convert';

import 'package:flutter/foundation.dart';

import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;

import 'domain.dart';
import 'session_store.dart';

const apiUrl = String.fromEnvironment('SUPABASE_URL'),
    publicKey = String.fromEnvironment('SUPABASE_PUBLISHABLE_KEY');
const localApiUrl = String.fromEnvironment(
  'LOCAL_API_URL',
  defaultValue: 'http://10.0.2.2:5173/api',
);

class AuthFailure implements Exception {
  final String message;
  final int status;
  final String? code;
  const AuthFailure(this.message, {this.status = 0, this.code});
  @override
  String toString() => message;
}

class Repository extends ChangeNotifier {
  String? token, userId, email, _refreshToken;
  DateTime? _expiresAt;
  Future<void>? _refreshing;
  Future<void> _storeQueue = Future.value();
  int _authEpoch = 0;
  final http.Client client;
  final String url, key;
  final SessionStore? sessionStore;
  Repository({
    http.Client? client,
    this.url = apiUrl,
    this.key = publicKey,
    this.sessionStore,
  }) : client = client ?? http.Client();
  bool get remote => url.isNotEmpty && key.isNotEmpty;
  Map<String, String> get headers => {
    'apikey': key,
    if (token != null) 'Authorization': 'Bearer $token',
    'Content-Type': 'application/json',
  };
  Future<void> _store(Future<void> Function() action) {
    final next = _storeQueue.then((_) => action());
    _storeQueue = next.then<void>((_) {}, onError: (Object _, StackTrace _) {});
    return next;
  }

  Future<void> _setSession(Json value, int epoch) async {
    if (epoch != _authEpoch) return;
    if (value['access_token'] is! String ||
        value['refresh_token'] is! String ||
        value['user']?['id'] is! String) {
      throw const AuthFailure('Phiên đăng nhập không hợp lệ.');
    }
    token = value['access_token'];
    _refreshToken = value['refresh_token'];
    userId = value['user']['id'];
    email = value['user']['email'];
    _expiresAt = DateTime.now().add(
      Duration(seconds: (value['expires_in'] as num? ?? 3600).toInt()),
    );
    final saved = jsonEncode({
      'access_token': token,
      'refresh_token': _refreshToken,
      'expires_at': _expiresAt!.toIso8601String(),
      'user': value['user'],
    });
    try {
      await _store(() async {
        if (epoch == _authEpoch) await sessionStore?.write(saved);
      });
    } catch (_) {
      await _clearSession();
      throw const AuthFailure(
        'Không lưu được phiên đăng nhập an toàn. Vui lòng thử lại.',
      );
    }
    if (epoch == _authEpoch) notifyListeners();
  }

  Future<void> _clearSession() async {
    _authEpoch++;
    token = null;
    _refreshToken = null;
    _expiresAt = null;
    userId = null;
    email = null;
    try {
      await _store(() async {
        await sessionStore?.clear();
      });
    } finally {
      notifyListeners();
    }
  }

  Future<void> restoreSession() async {
    if (!remote || sessionStore == null) return;
    try {
      final raw = await sessionStore!.read();
      if (raw == null) return;
      final saved = jsonDecode(raw) as Json;
      if (saved['access_token'] is! String ||
          saved['refresh_token'] is! String ||
          saved['user']?['id'] is! String) {
        throw const FormatException();
      }
      _expiresAt = DateTime.parse(saved['expires_at']);
      token = saved['access_token'];
      _refreshToken = saved['refresh_token'];
      userId = saved['user']['id'];
      email = saved['user']['email'];
      if (DateTime.now().isAfter(
        _expiresAt!.subtract(const Duration(seconds: 60)),
      )) {
        await _refresh();
      }
    } on FormatException {
      await _clearSession();
    } on AuthFailure catch (e) {
      if (e.status == 400 || e.status == 401 || e.status == 403) {
        await _clearSession();
      }
    } catch (_) {
      /* Transient failures do not discard an existing secure session. */
    }
  }

  Future<void> _refresh() => _refreshing ??= (() async {
    final epoch = _authEpoch, refreshToken = _refreshToken;
    try {
      if (refreshToken == null) {
        throw const AuthFailure('Vui lòng đăng nhập lại.', status: 401);
      }
      final value = await request('auth/v1/token?grant_type=refresh_token', {
        'refresh_token': refreshToken,
      });
      await _setSession(Map<String, dynamic>.from(value), epoch);
    } on AuthFailure catch (e) {
      if (epoch == _authEpoch &&
          (e.status == 400 || e.status == 401 || e.status == 403)) {
        await _clearSession();
      }
      rethrow;
    } finally {
      _refreshing = null;
    }
  })();
  AuthFailure _failure(http.Response response) {
    String? code;
    try {
      final data = jsonDecode(response.body);
      code = data['error_code'] ?? data['code'];
    } catch (_) {}
    final message = switch (code) {
      'invalid_credentials' => 'Email hoặc mật khẩu không đúng.',
      'email_not_confirmed' =>
        'Email chưa được xác minh. Hãy mở liên kết trong email rồi đăng nhập.',
      'user_already_exists' => 'Email đã được đăng ký. Vui lòng đăng nhập.',
      'email_address_invalid' => 'Địa chỉ email không hợp lệ.',
      'weak_password' => 'Mật khẩu chưa đủ mạnh. Hãy dùng ít nhất 8 ký tự.',
      'signup_disabled' => 'Đăng ký đang tạm dừng. Vui lòng thử lại sau.',
      'over_email_send_rate_limit' || 'over_request_rate_limit' =>
        'Bạn thao tác quá nhanh. Vui lòng đợi một lúc rồi thử lại.',
      'refresh_token_not_found' ||
      'refresh_token_already_used' ||
      'session_not_found' =>
        'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      _ =>
        response.statusCode == 429
            ? 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.'
            : 'Không thực hiện được yêu cầu (${response.statusCode}). Vui lòng thử lại.',
    };
    return AuthFailure(message, status: response.statusCode, code: code);
  }

  Future<dynamic> request(
    String path,
    Json body, {
    String method = 'POST',
  }) async {
    final isPublicAuth =
        path.startsWith('auth/v1/token') ||
        path.startsWith('auth/v1/signup') ||
        path.startsWith('auth/v1/resend');
    final epoch = _authEpoch;
    if (!isPublicAuth &&
        token != null &&
        _expiresAt != null &&
        DateTime.now().isAfter(
          _expiresAt!.subtract(const Duration(seconds: 60)),
        )) {
      await _refresh();
    }
    Future<http.Response> send() async {
      if (!isPublicAuth && epoch != _authEpoch) {
        throw const AuthFailure(
          'Phiên đăng nhập đã thay đổi. Vui lòng thử lại.',
          status: 401,
        );
      }
      final req = http.Request(method, Uri.parse('$url/$path'))
        ..headers.addAll(
          isPublicAuth
              ? {'apikey': key, 'Content-Type': 'application/json'}
              : headers,
        );
      if (method != 'GET') req.body = jsonEncode(body);
      return http.Response.fromStream(
        await client.send(req).timeout(const Duration(seconds: 20)),
      ).timeout(const Duration(seconds: 20));
    }

    var response = await send();
    if (response.statusCode == 401 && !isPublicAuth && _refreshToken != null) {
      await _refresh();
      response = await send();
    }
    if (response.statusCode >= 400) throw _failure(response);
    return response.body.isEmpty ? null : jsonDecode(response.body);
  }

  Future<void> ensureSession() async {
    if (token == null) {
      throw const AuthFailure('Vui lòng đăng nhập lại.', status: 401);
    }
    if (_expiresAt != null &&
        DateTime.now().isAfter(
          _expiresAt!.subtract(const Duration(seconds: 60)),
        )) {
      await _refresh();
    }
  }

  Future<dynamic> get(String path) => request(path, {}, method: 'GET');
  Future<void> signIn(String email, String password) async {
    final epoch = ++_authEpoch;
    final value = await request('auth/v1/token?grant_type=password', {
      'email': email.trim(),
      'password': password,
    });
    await _setSession(Map<String, dynamic>.from(value), epoch);
  }

  /// Returns true only when the server actually issued a session.
  Future<bool> signUp(String email, String password) async {
    final epoch = ++_authEpoch;
    final value = Map<String, dynamic>.from(
      await request('auth/v1/signup', {
        'email': email.trim(),
        'password': password,
      }),
    );
    if (value['access_token'] != null) {
      await _setSession(value, epoch);
      return token != null;
    }
    return false;
  }

  Future<void> resendConfirmation(String email) async {
    await request('auth/v1/resend', {'type': 'signup', 'email': email.trim()});
  }

  Future<void> signOut() async {
    final oldToken = token;
    await _clearSession();
    if (oldToken == null) return;
    final response = await client
        .post(
          Uri.parse('$url/auth/v1/logout?scope=local'),
          headers: {
            'apikey': key,
            'Authorization': 'Bearer $oldToken',
            'Content-Type': 'application/json',
          },
        )
        .timeout(const Duration(seconds: 20));
    if (response.statusCode >= 400 &&
        response.statusCode != 401 &&
        response.statusCode != 403) {
      throw _failure(response);
    }
  }

  Future<Json> profile() async {
    final rows = await get(
      'rest/v1/profiles?id=eq.$userId&select=display_name,timezone,locale',
    );
    if ((rows as List).isEmpty) throw StateError('Không tìm thấy hồ sơ.');
    return Map<String, dynamic>.from(rows.first);
  }

  Future<void> rename(String name) async {
    await request('rest/v1/profiles?id=eq.$userId', {
      'display_name': name,
    }, method: 'PATCH');
  }

  Future<List<Json>> catalog() async {
    final schema = jsonDecode(
      await rootBundle.loadString('assets/contracts/lesson.schema.json'),
    ) as Json;
    final List<Json> lessons;
    if (remote) {
      if (token == null) {
        throw Exception('Vui lòng đăng nhập để tải bài học đã xuất bản.');
      }
      final data = await request('rest/v1/rpc/published_catalog', {});
      lessons = (data as List)
          .map((r) => Map<String, dynamic>.from(r['manifest']))
          .toList();
    } else {
      throw StateError(
        'Chưa cấu hình SUPABASE_URL và SUPABASE_PUBLISHABLE_KEY.',
      );
    }
    for (final l in lessons) {
      final errors = validateLesson(l, schema);
      if (errors.isNotEmpty) {
        throw Exception('Bài học không tương thích: ${errors.first}');
      }
      if (l['status'] != 'published') {
        throw Exception('Từ chối bản nháp trong trình học.');
      }
    }
    return lessons;
  }
}

final repository = Repository(
  sessionStore: SecureSessionStore(
    'mohoc-auth-${Uri.tryParse(apiUrl)?.host ?? 'unconfigured'}',
  ),
);
String progressKey(Json l) =>
    'mohoc-${repository.userId ?? 'local'}-${l['lessonId']}-${l['version']}';
