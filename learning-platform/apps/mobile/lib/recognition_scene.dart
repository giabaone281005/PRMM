import 'package:flutter/material.dart';

import 'domain.dart';

class RecognitionScene extends StatelessWidget {
  final LessonSession session;
  final ValueChanged<Json> onInteraction;
  const RecognitionScene({
    super.key,
    required this.session,
    required this.onInteraction,
  });
  @override
  Widget build(BuildContext context) {
    final task =
        session.lesson['recognition'][session.snapshot['checkpoint']] as Map;
    final choices = List<String>.from(task['choices']);
    final selected = (session.snapshot['state']['x'] as num).toInt();
    void choose(int n) =>
        onInteraction({'type': 'adjust_parameter', 'name': 'x', 'value': n});
    Widget card(int i) => OutlinedButton(
      onPressed: () => choose(i + 1),
      style: OutlinedButton.styleFrom(
        backgroundColor: selected == i + 1
            ? const Color(0xffd7eac7)
            : Colors.white,
        minimumSize: const Size(80, 48),
      ),
      child: Text(choices[i]),
    );
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          if (task['diagram'] != 'none')
            GestureDetector(
              onTapUp: (d) {
                if (task['mode'] != 'tap') return;
                final spots = switch (task['diagram']) {
                  'triangle' => {
                    'AB': const Offset(60, 95),
                    'AC': const Offset(170, 160),
                    'BC': const Offset(170, 95),
                  },
                  'cone' => {
                    'h': const Offset(160, 90),
                    'r': const Offset(210, 160),
                    'l': const Offset(220, 90),
                  },
                  'circle' => {
                    'O': const Offset(160, 90),
                    'H': const Offset(160, 155),
                    'A': const Offset(95, 90),
                  },
                  'chart' => {
                    'Điểm 8': const Offset(65, 100),
                    'Điểm 9': const Offset(150, 130),
                    'Điểm 10': const Offset(235, 130),
                  },
                  _ => <String, Offset>{},
                };
                for (final spot in spots.entries) {
                  if ((d.localPosition - spot.value).distance < 35) {
                    final index = choices.indexOf(spot.key);
                    if (index >= 0) choose(index + 1);
                    break;
                  }
                }
              },
              child: CustomPaint(
                size: const Size(320, 200),
                painter: RecognitionPainter(task['diagram']),
              ),
            ),
          if (task['mode'] == 'drag')
            DragTarget<int>(
              onAcceptWithDetails: (d) => choose(d.data),
              builder: (context, candidates, rejected) => Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: candidates.isNotEmpty
                      ? const Color(0xffd7eac7)
                      : const Color(0xffeef4e8),
                  border: Border.all(color: Colors.green),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  selected > 0 && selected <= choices.length
                      ? choices[selected - 1]
                      : 'Thả mảnh ghép vào đây',
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          if (task['mode'] == 'formula')
            const Padding(
              padding: EdgeInsets.all(16),
              child: Text(
                'Điền mảnh ghép vào công thức: ▢',
                style: TextStyle(fontSize: 18),
              ),
            ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: List.generate(
              choices.length,
              (i) => task['mode'] == 'drag'
                  ? LongPressDraggable<int>(
                      data: i + 1,
                      feedback: Material(
                        elevation: 4,
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Text(choices[i]),
                        ),
                      ),
                      child: card(i),
                    )
                  : card(i),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            selected == 0
                ? 'Chạm để chọn; nhấn giữ thẻ để kéo.'
                : session.success
                ? task['explanation']
                : 'Chưa khớp. Hãy thử mảnh ghép khác.',
            semanticsLabel: selected == 0
                ? 'Chưa chọn'
                : session.success
                ? 'Chính xác'
                : 'Chưa đúng',
          ),
        ],
      ),
    );
  }
}

class RecognitionPainter extends CustomPainter {
  final String diagram;
  RecognitionPainter(this.diagram);
  @override
  void paint(Canvas canvas, Size size) {
    canvas.scale(size.width / 320, size.height / 200);
    final p = Paint()
      ..color = const Color(0xff625889)
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;
    void text(String s, double x, double y) {
      final t = TextPainter(
        text: TextSpan(
          text: s,
          style: const TextStyle(color: Colors.black, fontSize: 16),
        ),
        textDirection: TextDirection.ltr,
      )..layout();
      t.paint(canvas, Offset(x, y));
    }

    switch (diagram) {
      case 'triangle':
        canvas.drawPath(
          Path()
            ..moveTo(60, 35)
            ..lineTo(60, 160)
            ..lineTo(280, 160)
            ..close(),
          p,
        );
        canvas.drawPath(
          Path()
            ..moveTo(60, 145)
            ..lineTo(75, 145)
            ..lineTo(75, 160),
          p,
        );
        text('A', 40, 165);
        text('B', 40, 15);
        text('C', 280, 165);
      case 'circle':
        canvas.drawCircle(const Offset(160, 90), 65, p);
        canvas.drawLine(const Offset(30, 155), const Offset(290, 155), p);
        canvas.drawLine(const Offset(160, 90), const Offset(160, 155), p);
        text('O', 165, 70);
        text('H', 165, 160);
        text('A', 90, 80);
      case 'cone':
        canvas.drawPath(
          Path()
            ..moveTo(160, 20)
            ..lineTo(60, 160)
            ..moveTo(160, 20)
            ..lineTo(260, 160)
            ..moveTo(160, 20)
            ..lineTo(160, 160)
            ..lineTo(260, 160),
          p,
        );
        canvas.drawOval(const Rect.fromLTWH(60, 140, 200, 40), p);
        text('h', 170, 90);
        text('l', 225, 90);
        text('r', 210, 140);
      case 'chart':
        for (var i = 0; i < 3; i++) {
          final n = i == 0 ? 20 : 10;
          canvas.drawRect(
            Rect.fromLTWH(40 + i * 85, 160 - n * 5.0, 50, n * 5.0),
            p..style = PaintingStyle.fill,
          );
          text('$n', 50 + i * 85, 140 - n * 5.0);
          text('Điểm ${8 + i}', 35 + i * 85, 170);
        }
    }
  }

  @override
  bool shouldRepaint(RecognitionPainter oldDelegate) =>
      oldDelegate.diagram != diagram;
}
