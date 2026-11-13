import 'dart:async';

import 'package:flutter/material.dart';

import 'repository.dart';

class MobileAuthPanel extends StatefulWidget {
  final Repository auth;
  final Future<void> Function() onSuccess;
  const MobileAuthPanel({
    super.key,
    required this.auth,
    required this.onSuccess,
  });
  @override
  State<MobileAuthPanel> createState() => _MobileAuthPanelState();
}

class _MobileAuthPanelState extends State<MobileAuthPanel> {
  final form = GlobalKey<FormState>();
  final email = TextEditingController(),
      password = TextEditingController(),
      confirmation = TextEditingController();
  bool registering = false,
      busy = false,
      obscure = true,
      verificationPending = false;
  String error = '', notice = '', verificationEmail = '';
  int cooldown = 0;
  Timer? timer;
  @override
  void dispose() {
    timer?.cancel();
    email.dispose();
    password.dispose();
    confirmation.dispose();
    super.dispose();
  }

  void startCooldown() {
    timer?.cancel();
    cooldown = 60;
    timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) {
        t.cancel();
        return;
      }
      setState(() => cooldown--);
      if (cooldown <= 0) t.cancel();
    });
  }

  void switchMode() {
    setState(() {
      registering = !registering;
      password.clear();
      confirmation.clear();
      error = '';
      notice = '';
    });
    form.currentState?.reset();
  }

  Future<void> submit() async {
    if (busy || !form.currentState!.validate()) return;
    FocusScope.of(context).unfocus();
    setState(() {
      busy = true;
      error = '';
      notice = '';
    });
    try {
      if (registering) {
        final signedIn = await widget.auth.signUp(
          email.text.trim(),
          password.text,
        );
        if (!mounted) return;
        if (signedIn) {
          await widget.onSuccess();
        } else {
          setState(() {
            verificationPending = true;
            verificationEmail = email.text.trim();
            registering = false;
            password.clear();
            confirmation.clear();
            notice =
                'Kiểm tra email $verificationEmail và mở liên kết xác minh. Sau đó quay lại ứng dụng để đăng nhập.';
            startCooldown();
          });
        }
      } else {
        await widget.auth.signIn(email.text.trim(), password.text);
        if (mounted) await widget.onSuccess();
      }
    } on AuthFailure catch (e) {
      if (mounted) setState(() => error = e.message);
    } catch (_) {
      if (mounted) {
        setState(
          () => error = 'Không thể kết nối máy chủ. Kiểm tra mạng và thử lại.',
        );
      }
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  Future<void> resend() async {
    setState(() {
      busy = true;
      error = '';
    });
    try {
      await widget.auth.resendConfirmation(verificationEmail);
      if (mounted) {
        setState(() {
          notice =
              'Hãy kiểm tra hộp thư và mục thư rác của $verificationEmail.';
          startCooldown();
        });
      }
    } on AuthFailure catch (e) {
      if (mounted) setState(() => error = e.message);
    } catch (_) {
      if (mounted) {
        setState(
          () => error = 'Chưa gửi được yêu cầu. Kiểm tra mạng và thử lại.',
        );
      }
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => AutofillGroup(
    child: Form(
      key: form,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(24, 32, 24, 24),
        children: [
          const Icon(
            Icons.auto_awesome_rounded,
            size: 44,
            color: Color(0xff709648),
          ),
          const SizedBox(height: 20),
          Text(
            registering ? 'Tạo tài khoản' : 'Chào mừng trở lại',
            style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 10),
          Text(
            registering
                ? 'Cùng khám phá và lưu lại từng bước tiến của bạn.'
                : 'Đăng nhập để tiếp tục học trên mọi thiết bị.',
          ),
          const SizedBox(height: 24),
          if (notice.isNotEmpty) ...[
            Container(
              key: const Key('auth-notice'),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xffeaf2df),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Text(notice),
            ),
            const SizedBox(height: 20),
          ],
          TextFormField(
            key: const Key('auth-email'),
            controller: email,
            enabled: !busy,
            keyboardType: TextInputType.emailAddress,
            autofillHints: const [AutofillHints.email],
            autocorrect: false,
            textInputAction: TextInputAction.next,
            decoration: const InputDecoration(
              labelText: 'Email',
              prefixIcon: Icon(Icons.email_outlined),
              border: OutlineInputBorder(),
            ),
            validator: (value) =>
                RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
                    .hasMatch(value?.trim() ?? '')
                ? null
                : 'Nhập địa chỉ email hợp lệ.',
          ),
          const SizedBox(height: 18),
          TextFormField(
            key: const Key('auth-password'),
            controller: password,
            enabled: !busy,
            obscureText: obscure,
            autocorrect: false,
            enableSuggestions: false,
            autofillHints: [
              registering ? AutofillHints.newPassword : AutofillHints.password,
            ],
            textInputAction: registering
                ? TextInputAction.next
                : TextInputAction.done,
            onFieldSubmitted: (_) {
              if (!registering) submit();
            },
            decoration: InputDecoration(
              labelText: 'Mật khẩu',
              prefixIcon: const Icon(Icons.lock_outline),
              border: const OutlineInputBorder(),
              suffixIcon: IconButton(
                tooltip: obscure ? 'Hiện mật khẩu' : 'Ẩn mật khẩu',
                onPressed: () => setState(() => obscure = !obscure),
                icon: Icon(
                  obscure
                      ? Icons.visibility_outlined
                      : Icons.visibility_off_outlined,
                ),
              ),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) return 'Nhập mật khẩu.';
              if (registering && value.length < 8) {
                return 'Mật khẩu cần ít nhất 8 ký tự.';
              }
              return null;
            },
          ),
          if (registering) ...[
            const SizedBox(height: 18),
            TextFormField(
              key: const Key('auth-confirmation'),
              controller: confirmation,
              enabled: !busy,
              obscureText: obscure,
              autocorrect: false,
              enableSuggestions: false,
              textInputAction: TextInputAction.done,
              onFieldSubmitted: (_) => submit(),
              decoration: const InputDecoration(
                labelText: 'Nhập lại mật khẩu',
                prefixIcon: Icon(Icons.lock_outline),
                border: OutlineInputBorder(),
              ),
              validator: (value) => value != password.text
                  ? 'Mật khẩu nhập lại chưa khớp.'
                  : null,
            ),
          ],
          if (error.isNotEmpty) ...[
            const SizedBox(height: 16),
            Semantics(
              liveRegion: true,
              child: Text(
                error,
                key: const Key('auth-error'),
                style: TextStyle(color: Theme.of(context).colorScheme.error),
              ),
            ),
          ],
          const SizedBox(height: 24),
          FilledButton(
            key: const Key('auth-submit'),
            onPressed: busy ? null : submit,
            child: busy
                ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : Text(registering ? 'Đăng ký' : 'Đăng nhập'),
          ),
          const SizedBox(height: 12),
          TextButton(
            key: const Key('auth-switch'),
            onPressed: busy ? null : switchMode,
            child: Text(
              registering
                  ? 'Đã có tài khoản? Đăng nhập'
                  : 'Chưa có tài khoản? Đăng ký',
            ),
          ),
          if (verificationPending && !registering)
            TextButton(
              key: const Key('auth-resend'),
              onPressed: busy || cooldown > 0 ? null : resend,
              child: Text(
                cooldown > 0
                    ? 'Gửi lại email sau ${cooldown}s'
                    : 'Gửi lại email xác minh',
              ),
            ),
        ],
      ),
    ),
  );
}
