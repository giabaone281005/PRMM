import 'dart:math' as math;

const uimeKeys = ['x', 'y', 'a', 'b', 'c', 'width', 'height', 'numerator'];
bool uimeAccept(Map u, String name, num value) {
  final i = uimeKeys.indexOf(name);
  if (i < 0 || !value.isFinite) return false;
  if (u['kind'] == '3D_SOLID_INSPECTOR' && ['a', 'b'].contains(name)) {
    return value.abs() <= math.pi * 2;
  }
  if (i >= (u['answers'] as List).length) return false;
  if (u['kind'] == 'NUMBER_LINE_SELECTOR' && i > 0) {
    return value == 0 || value == 1;
  }
  if ([
        'PARABOLA_SLIDER',
        'NUMBER_LINE_SELECTOR',
        'GEOMETRIC_HOTSPOT_FINDER',
      ].contains(u['kind']) &&
      i == 0) {
    final n = (value - u['min']) / u['step'];
    return value >= u['min'] &&
        value <= u['max'] &&
        (n - n.round()).abs() < 1e-6;
  }
  final max =
      (['TOKEN_CLASSIFIER', 'EVENT_CARD_BUCKET'].contains(u['kind'])
              ? u['labels']
              : u['tokens'])
          as List;
  return value == value.round() && value >= 0 && value < max.length;
}

num uimeError(Map u, Map state) {
  num error = 0;
  for (var i = 0; i < (u['answers'] as List).length; i++) {
    error += ((state[uimeKeys[i]] as num) - (u['answers'][i] as num)).abs();
  }
  if (u['kind'] == '3D_SOLID_INSPECTOR' &&
      (state['a'] as num).abs() + (state['b'] as num).abs() < .3) {
    error++;
  }
  return error;
}

List<String> validateUime(Map u) {
  final e = <String>[];
  final answers = u['answers'] as List;
  if (answers.isEmpty ||
      answers.length > 8 ||
      u['min'] >= u['max'] ||
      u['step'] <= 0) {
    e.add('Invalid U-IME dimensions/bounds');
  }
  if (['TOKEN_CLASSIFIER', 'EVENT_CARD_BUCKET'].contains(u['kind']) &&
      (u['tokens'] as List).length != answers.length) {
    e.add('Every card needs a target bucket');
  }
  for (var i = 0; i < answers.length && i < 8; i++) {
    if (!uimeAccept(u, uimeKeys[i], answers[i])) {
      e.add('Unreachable U-IME answer');
    }
  }
  if (u['kind'] == 'FORMULA_SNAP_BUILDER' &&
      (u['labels'] as List).length != answers.length) {
    e.add('Every formula slot needs a label');
  }
  if (u['kind'] == 'NUMBER_LINE_SELECTOR' &&
      (answers.length != 3 || u['min'] < -10 || u['max'] > 10)) {
    e.add(
      'Number line requires endpoint, direction and closure within -10..10',
    );
  }
  if (u['kind'] == 'GEOMETRIC_HOTSPOT_FINDER' && answers.length != 2) {
    e.add('Circle requires distance and selected part');
  }
  for (final h in u['hotspots']) {
    if (h['x'] + h['width'] > 360 || h['y'] + h['height'] > 240) {
      e.add('Hotspot outside viewport');
    }
  }
  return e;
}
