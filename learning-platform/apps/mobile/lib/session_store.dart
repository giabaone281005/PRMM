import 'package:flutter_secure_storage/flutter_secure_storage.dart';

abstract class SessionStore {
  Future<String?> read();
  Future<void> write(String value);
  Future<void> clear();
}

class SecureSessionStore implements SessionStore {
  final String key;
  final FlutterSecureStorage storage;
  const SecureSessionStore(
    this.key, {
    this.storage = const FlutterSecureStorage(),
  });
  @override
  Future<String?> read() => storage.read(key: key);
  @override
  Future<void> write(String value) => storage.write(key: key, value: value);
  @override
  Future<void> clear() => storage.delete(key: key);
}
