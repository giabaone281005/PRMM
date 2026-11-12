import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;

import 'domain.dart';

const apiUrl = String.fromEnvironment('SUPABASE_URL'),
    publicKey = String.fromEnvironment('SUPABASE_PUBLISHABLE_KEY');
const localApiUrl = String.fromEnvironment(
  'LOCAL_API_URL',
  defaultValue: 'http://10.0.2.2:5173/api',
);

class Repository {
  String? token, userId, email;
  final http.Client client = http.Client();
  bool get remote => apiUrl.isNotEmpty && publicKey.isNotEmpty;
  Map<String, String> get headers => {
    'apikey': publicKey,
    'Authorization': 'Bearer ${token ?? publicKey}',
    'Content-Type': 'application/json',
  };
  Future<dynamic> request(String path, Json body) async {
    final response = await client
        .post(
          Uri.parse('$apiUrl/$path'),
          headers: headers,
          body: jsonEncode(body),
        )
        .timeout(const Duration(seconds: 20));
    if (response.statusCode >= 400) {
      throw Exception(
        'Máy chủ trả lỗi ${response.statusCode}. Kiểm tra phiên đăng nhập và quyền truy cập.',
      );
    }
    return response.body.isEmpty ? null : jsonDecode(response.body);
  }

  Future<void> signIn(String email, String password) async {
    final r = await request('auth/v1/token?grant_type=password', {
      'email': email,
      'password': password,
    });
    token = r['access_token'];
    userId = r['user']['id'];
    this.email = r['user']['email'];
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
      List<Json>? local;
      try {
        final r = await client
            .get(Uri.parse('$localApiUrl/catalog'))
            .timeout(const Duration(seconds: 3));
        if (r.statusCode == 200) {
          local = (jsonDecode(r.body) as List)
              .map((l) => Map<String, dynamic>.from(l))
              .toList();
        }
      } catch (_) {
        /* Bundled fixtures are an explicit offline demo fallback. */
      }
      if (local != null) {
        lessons = local;
      } else {
        lessons = [];
        for (final id in [
          'grade7-triangle-angle-sum',
          'grade8-solid-volume',
          'integer-minus-three',
          'fraction-three-fourths',
          'balance-linear-equation',
          'quadratic-transformations',
          'percent-of-a-whole',
          'ratio-double-line',
          'coordinate-find-point',
          'rectangle-area-lab',
          'right-triangle-squares',
          'linear-graph-lab',
        ]) {
          final l = jsonDecode(
            await rootBundle.loadString(
              'assets/contracts/fixtures/$id.lesson.json',
            ),
          ) as Json;
          l['status'] = 'published';
          lessons.add(l);
        }
      }
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

final repository = Repository();
String progressKey(Json l) =>
    'mohoc-${repository.userId ?? 'local'}-${l['lessonId']}-${l['version']}';
