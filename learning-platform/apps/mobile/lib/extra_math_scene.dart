import 'package:flutter/material.dart';

import 'domain.dart';
import 'extra_models.dart';

class ExtraNativeScene extends StatelessWidget {
  final LessonSession session;
  final ValueChanged<Json> onInteraction;
  const ExtraNativeScene({
    super.key,
    required this.session,
    required this.onInteraction,
  });
  @override
  Widget build(BuildContext context) {
    final model =
            session.objects.firstWhere(
                  (o) => o['kind'] == 'math_model',
                )['model']
                as String,
        s = session.snapshot['state'] as Map,
        b = extraBounds(model);
    void change(String n, num v) =>
        onInteraction({'type': 'adjust_parameter', 'name': n, 'value': v});
    const labels = {
      'x': 'Vị trí / số lần',
      'y': 'Vị trí dọc',
      'width': 'Cạnh ngang',
      'height': 'Cạnh dọc',
      'a': 'Độ dốc',
      'b': 'Độ cao ban đầu',
    };
    return Column(
      children: [
        LayoutBuilder(
          builder: (context, c) {
            void drag(Offset p) {
              final x = p.dx / c.maxWidth * 360, y = p.dy / c.maxWidth * 360;
              if (model == 'percentage_grid') {
                change(
                  'x',
                  (((y - 30) / 23).floor() * 10 + ((x - 60) / 23).floor() + 1)
                      .clamp(0, 100),
                );
              } else if (model == 'coordinate_plane') {
                change('x', ((x - 180) / 13).clamp(-10, 10));
                change('y', ((180 - y) / 13).clamp(-10, 10));
              } else if (model == 'rectangle_area' || model == 'pythagorean') {
                change('width', ((x - 40) / 24).clamp(1, 10));
                change('height', ((280 - y) / 24).clamp(1, 10));
              } else if (model == 'linear_graph') {
                change('b', ((180 - y) / 13).clamp(-10, 10));
              } else {
                change('x', ((x - 30) / 30).clamp(0, 10));
              }
            }

            return GestureDetector(
              key: const Key('math-canvas'),
              behavior: HitTestBehavior.opaque,
              onPanStart: (d) => drag(d.localPosition),
              onPanUpdate: (d) => drag(d.localPosition),
              onTapDown: (d) => drag(d.localPosition),
              child: CustomPaint(
                size: Size(c.maxWidth, c.maxWidth),
                painter: ExtraPainter(model, s),
              ),
            );
          },
        ),
        ...extraNames(model).map(
          (n) => Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        '${model == 'percentage_grid' ? 'Phần trăm' : labels[n]}: ${(s[n] as num).toStringAsFixed(1)}',
                        style: const TextStyle(fontSize: 17),
                      ),
                    ),
                    SizedBox(
                      width: 75,
                      child: TextFormField(
                        key: Key('number-$n'),
                        initialValue: '${s[n]}',
                        textInputAction: TextInputAction.done,
                        keyboardType: const TextInputType.numberWithOptions(
                          signed: true,
                          decimal: true,
                        ),
                        onChanged: (v) {
                          final x = num.tryParse(v);
                          if (x != null) change(n, x);
                        },
                        onFieldSubmitted: (v) {
                          final x = num.tryParse(v);
                          if (x != null) change(n, x);
                        },
                      ),
                    ),
                  ],
                ),
                Slider(
                  key: Key('parameter-$n'),
                  value: (s[n] as num).toDouble().clamp(
                    b.$1.toDouble(),
                    b.$2.toDouble(),
                  ),
                  min: b.$1.toDouble(),
                  max: b.$2.toDouble(),
                  divisions:
                      model == 'percentage_grid' || model == 'ratio_table'
                      ? 100
                      : model == 'rectangle_area' || model == 'pythagorean'
                      ? 90
                      : 200,
                  onChanged: (v) => change(n, v),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class ExtraPainter extends CustomPainter {
  final String model;
  final Map s;
  ExtraPainter(this.model, this.s);
  @override
  void paint(Canvas canvas, Size size) {
    canvas.scale(size.width / 360);
    canvas.drawRect(
      const Rect.fromLTWH(0, 0, 360, 360),
      Paint()..color = const Color(0xfff1f5e9),
    );
    final ink = Paint()
          ..color = const Color(0xff347851)
          ..strokeWidth = 3,
        ghost = Paint()
          ..color = const Color(0xffb1bfaa)
          ..strokeWidth = 2
          ..style = PaintingStyle.stroke;
    void text(String t, double x, double y) {
      final p = TextPainter(
        text: TextSpan(
          text: t,
          style: const TextStyle(fontSize: 18, color: Color(0xff234834)),
        ),
        textDirection: TextDirection.ltr,
      )..layout(maxWidth: 330);
      p.paint(canvas, Offset(x, y));
    }

    double n(String k) => (s[k] as num).toDouble();
    if (model == 'percentage_grid') {
      for (var i = 0; i < 100; i++) {
        canvas.drawRRect(
          RRect.fromRectAndRadius(
            Rect.fromLTWH(60 + i % 10 * 23, 30 + i ~/ 10 * 23, 20, 20),
            const Radius.circular(3),
          ),
          Paint()
            ..color = i < n('x')
                ? const Color(0xff4d9c65)
                : const Color(0xffd9e2d1),
        );
      }
      text(
        '${n('x').round()}% → ${(n('b') * n('x') / 100).toStringAsFixed(1)}',
        65,
        285,
      );
    } else if (model == 'ratio_table') {
      final maximum = n('a') > n('b') ? n('a') : n('b');
      for (var i = 0; i < 2; i++) {
        final k = i == 0 ? 'a' : 'b';
        canvas.drawRect(
          Rect.fromLTWH(30, 90 + i * 90, n(k) * n('x') / maximum * 28, 42),
          ink,
        );
        text(
          '${n(k)} × ${n('x').toStringAsFixed(1)} = ${(n(k) * n('x')).toStringAsFixed(1)}',
          30,
          140 + i * 90,
        );
      }
    } else if (model == 'rectangle_area' || model == 'pythagorean') {
      final w = n('width') * 24, h = n('height') * 24;
      final target = Rect.fromLTWH(
        40,
        280 - n('targetHeight') * 24,
        n('targetWidth') * 24,
        n('targetHeight') * 24,
      );
      canvas.drawRect(target, ghost);
      if (model == 'rectangle_area') {
        canvas.drawRect(
          Rect.fromLTWH(40, 280 - h, w, h),
          Paint()..color = const Color(0xff9dce8c),
        );
        for (var i = 0; i <= 10; i++) {
          canvas.drawLine(
            Offset(40 + i * 24, 280 - h),
            Offset(40 + i * 24, 280),
            ghost,
          );
          canvas.drawLine(
            Offset(40, 280 - i * 24),
            Offset(40 + w, 280 - i * 24),
            ghost,
          );
        }
        text(
          'S = ${n('width').toStringAsFixed(1)} × ${n('height').toStringAsFixed(1)}',
          35,
          305,
        );
      } else {
        canvas.drawPath(
          Path()
            ..moveTo(40, 280)
            ..lineTo(40 + w, 280)
            ..lineTo(40, 280 - h)
            ..close(),
          ink..style = PaintingStyle.stroke,
        );
        text('c² = a² + b²', 40, 305);
        text(
          'c = ${extraMetrics(model, s)['modelValue']!.toStringAsFixed(2)}',
          80,
          70,
        );
      }
      canvas.drawCircle(
        Offset(40 + w, 280 - h),
        8,
        Paint()..color = Colors.deepOrange,
      );
    } else {
      for (var i = -10; i <= 10; i++) {
        canvas.drawLine(
          Offset(50, 180 + i * 13),
          Offset(310, 180 + i * 13),
          ghost,
        );
        canvas.drawLine(
          Offset(180 + i * 13, 50),
          Offset(180 + i * 13, 310),
          ghost,
        );
      }
      canvas.drawLine(const Offset(50, 180), const Offset(310, 180), ink);
      canvas.drawLine(const Offset(180, 50), const Offset(180, 310), ink);
      if (model == 'coordinate_plane') {
        canvas.drawCircle(
          Offset(180 + n('targetX') * 13, 180 - n('targetY') * 13),
          10,
          ghost,
        );
        canvas.drawCircle(Offset(180 + n('x') * 13, 180 - n('y') * 13), 8, ink);
        text(
          'M (${n('x').toStringAsFixed(1)}; ${n('y').toStringAsFixed(1)})',
          65,
          325,
        );
      } else {
        canvas.save();
        canvas.clipRect(const Rect.fromLTRB(50, 50, 310, 310));
        canvas.drawLine(
          Offset(50, 180 - (-10 * n('targetA') + n('targetB')) * 13),
          Offset(310, 180 - (10 * n('targetA') + n('targetB')) * 13),
          ghost,
        );
        canvas.drawLine(
          Offset(50, 180 - (-10 * n('a') + n('b')) * 13),
          Offset(310, 180 - (10 * n('a') + n('b')) * 13),
          ink,
        );
        canvas.restore();
        text(
          'y = ${n('a').toStringAsFixed(1)}x + ${n('b').toStringAsFixed(1)}',
          65,
          325,
        );
      }
    }
  }

  @override
  bool shouldRepaint(covariant ExtraPainter old) => true;
}
