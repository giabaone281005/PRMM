import 'extra_models.dart';
import 'extra_math_scene.dart';

import 'dart:math' as math;

import 'package:flutter/material.dart';

import 'domain.dart';
import 'scenes.dart';

class NativeMathScene extends StatelessWidget {
  final LessonSession session;
  final ValueChanged<Json> onInteraction;
  const NativeMathScene({
    super.key,
    required this.session,
    required this.onInteraction,
  });
  @override
  Widget build(BuildContext context) {
    if (session.objects.any(
      (o) => o['kind'] == 'math_model' && extraModels.contains(o['model']),
    )) {
      return ExtraNativeScene(session: session, onInteraction: onInteraction);
    }
    final model = session.objects.firstWhere((o) => o['kind'] == 'math_model'),
        type = model['model'],
        s = session.snapshot['state'] as Map,
        controls = type == 'quadratic_graph'
            ? ['a', 'b', 'c']
            : type == 'fraction_bar'
            ? ['numerator', 'denominator']
            : ['x'];
    void adjust(String name, num value) => onInteraction({
      'type': 'adjust_parameter',
      'name': name,
      'value': value,
    });
    return ColoredBox(
      color: const Color(0xfff1f5e9),
      child: Column(
        children: [
          LayoutBuilder(
            builder: (context, c) {
              void drag(Offset position) {
                final x = position.dx / c.maxWidth * 360;
                if (type == 'number_line' || type == 'linear_balance') {
                  adjust('x', ((x - 180) / 14).clamp(-10, 10));
                }
                if (type == 'fraction_bar') {
                  adjust(
                    'numerator',
                    ((x - 35) / 290 * (s['denominator'] as num)).round().clamp(
                      0,
                      (s['denominator'] as num).toInt(),
                    ),
                  );
                }
              }

              return Semantics(
                label: 'Mô hình $type. Kéo trên hình hoặc thay đổi tham số.',
                child: GestureDetector(
                  key: const Key('math-canvas'),
                  behavior: HitTestBehavior.opaque,
                  onPanStart: (d) => drag(d.localPosition),
                  onPanUpdate: (d) => drag(d.localPosition),
                  child: CustomPaint(
                    size: Size(c.maxWidth, c.maxWidth * 300 / 360),
                    painter: MathPainter(session),
                  ),
                ),
              );
            },
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 0, 14, 16),
            child: Column(
              children: controls.map((name) {
                final fraction = type == 'fraction_bar',
                    min = fraction
                        ? (name == 'denominator'
                              ? math.max(1, s['numerator'] as num).toDouble()
                              : 0.0)
                        : -10.0,
                    max = fraction
                        ? (name == 'denominator'
                              ? 12.0
                              : (s['denominator'] as num).toDouble())
                        : 10.0;
                return Row(
                  children: [
                    SizedBox(
                      width: 92,
                      child: Text(
                        '${name == 'numerator'
                            ? 'Tử số'
                            : name == 'denominator'
                            ? 'Mẫu số'
                            : name}: ${(s[name] as num).toStringAsFixed(fraction ? 0 : 1)}',
                        style: const TextStyle(
                          fontSize: 14,
                          color: Color(0xff6f825b),
                        ),
                      ),
                    ),
                    Expanded(
                      child: Slider(
                        key: Key('parameter-$name'),
                        min: min,
                        max: max > min ? max : min + 1,
                        divisions: fraction
                            ? (max - min).toInt().clamp(1, 12)
                            : 200,
                        value: (s[name] as num).toDouble().clamp(
                          min,
                          max > min ? max : min + 1,
                        ),
                        onChanged: (v) => adjust(
                          name,
                          fraction
                              ? v.round()
                              : double.parse(v.toStringAsFixed(1)),
                        ),
                      ),
                    ),
                    SizedBox(
                      width: 70,
                      child: TextFormField(
                        key: Key('number-$name'),
                        initialValue: '${s[name]}',
                        keyboardType: const TextInputType.numberWithOptions(
                          decimal: true,
                          signed: true,
                        ),
                        style: const TextStyle(fontSize: 16),
                        decoration: const InputDecoration(
                          isDense: true,
                          contentPadding: EdgeInsets.all(8),
                          border: OutlineInputBorder(),
                        ),
                        onFieldSubmitted: (raw) {
                          final value = num.tryParse(raw);
                          if (value != null) adjust(name, value);
                        },
                      ),
                    ),
                  ],
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}

class MathPainter extends CustomPainter {
  final LessonSession session;
  MathPainter(this.session);
  @override
  void paint(Canvas c, Size size) {
    c.save();
    c.scale(size.width / 360);
    final model = session.objects.firstWhere((o) => o['kind'] == 'math_model'),
        s = session.snapshot['state'] as Map,
        m = session.metrics,
        p = Paint()..strokeWidth = 2;
    const green = Color(0xffa0d16e), purple = Color(0xffbba1e8);
    void text(
      String value,
      double x,
      double y,
      double font, {
      Color color = ink,
    }) => drawText(c, value, Offset(x, y), font, color);
    switch (model['model']) {
      case 'number_line':
        text(
          'Mục tiêu: ${s['targetX']}',
          125,
          48,
          14,
          color: const Color(0xff7b8c68),
        );
        c.drawLine(
          const Offset(35, 170),
          const Offset(325, 170),
          p..color = const Color(0xff6d8259),
        );
        for (var n = -10; n <= 10; n++) {
          final x = 180 + n * 14.0;
          c.drawLine(Offset(x, 164), Offset(x, 176), p);
          if (n.isEven) {
            text('$n', x - 6, 185, 9, color: const Color(0xff8a997b));
          }
        }
        c.drawCircle(
          Offset(180 + (s['targetX'] as num) * 14, 170),
          15,
          p
            ..style = PaintingStyle.stroke
            ..color = const Color(0xffc0cbb3),
        );
        c.drawCircle(
          Offset(180 + (s['x'] as num) * 14, 170),
          11,
          p
            ..style = PaintingStyle.fill
            ..color = green,
        );
        text(
          (s['x'] as num).toStringAsFixed(1),
          165 + (s['x'] as num) * 14,
          130,
          18,
        );
      case 'fraction_bar':
        text('${s['numerator']} / ${s['denominator']}', 145, 50, 27);
        final denominator = (s['denominator'] as num).toInt(),
            numerator = (s['numerator'] as num).toInt();
        for (var i = 0; i < denominator; i++) {
          final r = Rect.fromLTWH(
            35 + i * 290 / denominator,
            115,
            290 / denominator,
            65,
          );
          c.drawRect(
            r,
            p
              ..style = PaintingStyle.fill
              ..color = i < numerator ? purple : Colors.white,
          );
          c.drawRect(
            r,
            p
              ..style = PaintingStyle.stroke
              ..color = const Color(0xff79668b),
          );
        }
        text(
          'Phần đã tô: ${m['modelValue']!.toStringAsFixed(3)}',
          112,
          214,
          14,
          color: const Color(0xff81926e),
        );
        text(
          'Kéo ngang để thay đổi phần được tô',
          82,
          250,
          11,
          color: const Color(0xff8d9b7e),
        );
      case 'linear_balance':
        text('${s['a']}x + ${s['b']} = ${s['c']}', 110, 28, 20);
        c.save();
        c.translate(180, 170);
        c.rotate((m['modelValue']! - s['c']).toDouble().clamp(-6, 6) * .035);
        c.translate(-180, -170);
        c.drawLine(
          const Offset(65, 150),
          const Offset(295, 150),
          p
            ..style = PaintingStyle.stroke
            ..strokeWidth = 5
            ..color = const Color(0xff6c8357),
        );
        for (var i = 0; i < 2; i++) {
          final x = i == 0 ? 85.0 : 275.0;
          final path = Path()
            ..moveTo(x - 35, 150)
            ..lineTo(x - 35, 205)
            ..lineTo(x + 35, 205)
            ..lineTo(x + 35, 150);
          c.drawPath(
            path,
            p
              ..strokeWidth = 2
              ..style = PaintingStyle.stroke,
          );
          c.drawRRect(
            RRect.fromRectAndRadius(
              Rect.fromLTWH(x - 27, 174, 54, 29),
              const Radius.circular(5),
            ),
            p
              ..style = PaintingStyle.fill
              ..color = i == 0 ? green : purple,
          );
          text(
            i == 0 ? m['modelValue']!.toStringAsFixed(1) : '${s['c']}',
            x - 12,
            181,
            12,
          );
        }
        c.restore();
        final base = Path()
          ..moveTo(180, 170)
          ..lineTo(155, 235)
          ..lineTo(205, 235)
          ..close();
        c.drawPath(base, p..color = const Color(0xffb4c69d));
        text(
          'x = ${(s['x'] as num).toStringAsFixed(1)} · Chênh lệch: ${m['modelError']!.toStringAsFixed(2)}',
          85,
          265,
          12,
          color: const Color(0xff7e916b),
        );
      case 'quadratic_graph':
        c.save();
        c.clipRect(const Rect.fromLTWH(25, 30, 310, 245));
        for (var n = -10; n <= 10; n++) {
          c.drawLine(
            Offset(180 + n * 14.0, 30),
            Offset(180 + n * 14.0, 275),
            p
              ..strokeWidth = .5
              ..color = const Color(0xffd9e3cd),
          );
          c.drawLine(
            Offset(25, 180 + n * 14.0),
            Offset(335, 180 + n * 14.0),
            p,
          );
        }
        c.drawLine(
          const Offset(25, 180),
          const Offset(335, 180),
          p
            ..strokeWidth = 1
            ..color = const Color(0xff8d9f7a),
        );
        c.drawLine(const Offset(180, 30), const Offset(180, 275), p);
        void curve(num a, num b, num d, Color color, double width) {
          final path = Path();
          for (var i = 0; i <= 200; i++) {
            final x = -10 + i * .1, y = a * x * x + b * x + d;
            if (i == 0) {
              path.moveTo(180 + x * 14, 180 - y * 14);
            } else {
              path.lineTo(180 + x * 14, 180 - y * 14);
            }
          }
          c.drawPath(
            path,
            p
              ..style = PaintingStyle.stroke
              ..strokeWidth = width
              ..color = color,
          );
        }
        curve(
          s['targetA'],
          s['targetB'],
          s['targetC'],
          const Color(0xffb6c1a9),
          3,
        );
        curve(s['a'], s['b'], s['c'], const Color(0xff8270bd), 2.5);
        c.restore();
        text(
          'y = ${s['a']}x² + ${s['b']}x + ${s['c']}',
          95,
          7,
          12,
          color: const Color(0xff7b8d67),
        );
    }
    c.restore();
  }

  @override
  bool shouldRepaint(MathPainter old) => true;
}
