import 'extra_models.dart';

import 'dart:convert';
import 'dart:math' as math;

typedef Json = Map<String, dynamic>;
const capabilities = [
  'drag_vertex',
  'measure_angle',
  'show_geometry_annotation',
  'toggle_angle_labels',
  'drag_angle_token',
  'orbit_solid',
  'select_face',
  'fill_layers',
  'measure_volume',
  'adjust_parameter',
  'number_line_drag',
  'fraction_partition',
  'balance_equation',
  'plot_function',
  ...extraModels,
];
const metricPaths = [
  'validVertexDragCount',
  'validVertexDragCountSinceCheckpoint',
  'snappedAngleTokens',
  'assembledAngleDegrees',
  'orbitRadians',
  'selectedFaces',
  'filledLayers',
  'volume',
  'parameterChangeCount',
  'parameterChangeCountSinceCheckpoint',
  'modelError',
  'modelValue',
];
bool evaluate(Json c, Map<String, num> metrics) {
  if (c['op'] == 'all') {
    return (c['conditions'] as List).every(
      (x) => evaluate(Map<String, dynamic>.from(x), metrics),
    );
  }
  if (c['op'] == 'any') {
    return (c['conditions'] as List).any(
      (x) => evaluate(Map<String, dynamic>.from(x), metrics),
    );
  }
  if (c['op'] == 'not') {
    return !evaluate(Map<String, dynamic>.from(c['condition']), metrics);
  }
  final a = metrics[(c['path'] as String).substring(8)], b = c['value'] as num;
  if (a == null || !a.isFinite) return false;
  return switch (c['op']) {
    'eq' => a == b,
    'neq' => a != b,
    'gt' => a > b,
    'gte' => a >= b,
    'lt' => a < b,
    'lte' => a <= b,
    'approx' => (a - b).abs() <= (c['tolerance'] ?? 0),
    'within' => a >= b && a <= (c['max'] ?? b),
    _ => false,
  };
}

/// Validates the subset of Draft 2020-12 used by the canonical schema.
List<String> validateSchema(
  dynamic value,
  Json schema, {
  Json? root,
  String path = r'$',
  int depth = 0,
}) {
  root ??= schema;
  final errors = <String>[];
  if (depth > 32) return ['$path: nesting limit'];
  if (schema.containsKey(r'$ref')) {
    return validateSchema(
      value,
      Map<String, dynamic>.from(
        root[r'$defs'][(schema[r'$ref'] as String).split('/').last],
      ),
      root: root,
      path: path,
      depth: depth + 1,
    );
  }
  if (schema['oneOf'] is List) {
    final count = (schema['oneOf'] as List)
        .where(
          (s) => validateSchema(
            value,
            Map<String, dynamic>.from(s),
            root: root,
            path: path,
            depth: depth + 1,
          ).isEmpty,
        )
        .length;
    if (count != 1) errors.add('$path: oneOf');
    return errors;
  }
  if (schema.containsKey('const') &&
      jsonEncode(value) != jsonEncode(schema['const'])) {
    errors.add('$path: const');
  }
  if (schema['enum'] is List && !(schema['enum'] as List).contains(value)) {
    errors.add('$path: enum');
  }
  final t = schema['type'];
  final matches = switch (t) {
    'object' => value is Map,
    'array' => value is List,
    'string' => value is String,
    'integer' =>
      value is num && value.isFinite && value == value.roundToDouble(),
    'number' => value is num && value.isFinite,
    'boolean' => value is bool,
    null => true,
    _ => false,
  };
  if (!matches) return ['$path: type $t'];
  if (value is Map && t == 'object') {
    final props = Map<String, dynamic>.from(schema['properties'] ?? {});
    for (final key in schema['required'] ?? []) {
      if (!value.containsKey(key)) errors.add('$path: missing $key');
    }
    for (final key in value.keys) {
      if (!props.containsKey(key)) {
        if (schema['additionalProperties'] == false) {
          errors.add('$path: unknown $key');
        }
      } else {
        errors.addAll(
          validateSchema(
            value[key],
            Map<String, dynamic>.from(props[key]),
            root: root,
            path: '$path.$key',
            depth: depth + 1,
          ),
        );
      }
    }
  }
  if (value is List && t == 'array') {
    if (value.length < (schema['minItems'] ?? 0) ||
        value.length > (schema['maxItems'] ?? 1000000)) {
      errors.add('$path: length');
    }
    if (schema['uniqueItems'] == true &&
        value.map(jsonEncode).toSet().length != value.length) {
      errors.add('$path: duplicate');
    }
    for (var i = 0; i < value.length; i++) {
      errors.addAll(
        validateSchema(
          value[i],
          Map<String, dynamic>.from(schema['items']),
          root: root,
          path: '$path[$i]',
          depth: depth + 1,
        ),
      );
    }
  }
  if (value is num) {
    if (schema['minimum'] != null && value < schema['minimum'] ||
        schema['maximum'] != null && value > schema['maximum'] ||
        schema['exclusiveMinimum'] != null &&
            value <= schema['exclusiveMinimum']) {
      errors.add('$path: range');
    }
  }
  if (value is String) {
    if (value.length < (schema['minLength'] ?? 0) ||
        value.length > (schema['maxLength'] ?? 10000000)) {
      errors.add('$path: string length');
    }
    if (schema['pattern'] != null && !RegExp(schema['pattern']).hasMatch(value)) {
      errors.add('$path: pattern');
    }
  }
  return errors;
}

List<String> validateLesson(Json l, Json schema) {
  final errors = validateSchema(l, schema);
  if (errors.isNotEmpty) return errors;
  if (l['scene']['viewport']['width'] != 360 ||
      l['scene']['viewport']['height'] != 360) {
    errors.add('Unsupported viewport');
  }
  final type = l['engine']['type'],
      allowed = type == 'geometry_2d'
          ? capabilities.take(5).toList()
          : type == 'geometry_3d_web'
          ? capabilities.skip(5).take(4).toList()
          : <String>[
              'adjust_parameter',
              if (type == 'number_line_2d') 'number_line_drag',
              if (type == 'fraction_bar_2d') 'fraction_partition',
              if (type == 'algebra_balance_2d') 'balance_equation',
              if (type == 'function_plot_2d') 'plot_function',
              if (extraEngineMap.containsKey(type)) extraEngineMap[type]!,
            ],
      required = List<String>.from(l['engine']['requiredCapabilities']);
  if (required.any((c) => !allowed.contains(c))) {
    errors.add('Unsupported capability');
  }
  if ((type != 'geometry_3d_web') !=
      (l['scene']['coordinateSystem'] == 'cartesian_2d')) {
    errors.add('Coordinate mismatch');
  }
  final objects = <String, Json>{}, cps = <String>{};
  void add(dynamic item) {
    final o = Map<String, dynamic>.from(item);
    if (objects.containsKey(o['id'])) errors.add('Duplicate object');
    objects[o['id']] = o;
  }

  for (final o in l['scene']['objects']) {
    add(o);
  }
  void criterion(Json c) {
    if (c['conditions'] != null) {
      for (final x in c['conditions']) {
        criterion(Map<String, dynamic>.from(x));
      }
    } else if (c['condition'] != null) {
      criterion(Map<String, dynamic>.from(c['condition']));
    } else {
      if (c['op'] == 'approx' && c['tolerance'] == null) {
        errors.add('Missing tolerance');
      }
      if (c['op'] == 'within' && (c['max'] == null || c['max'] < c['value'])) {
        errors.add('Invalid interval');
      }
    }
  }

  for (var i = 0; i < (l['checkpoints'] as List).length; i++) {
    final c = l['checkpoints'][i];
    if (c['order'] != i + 1 || !cps.add(c['id'])) {
      errors.add('Checkpoint identity/order');
    }
    for (final o in c['scenePatch']['addObjects'] ?? []) {
      add(o);
    }
    for (final cap in c['allowedInteractions']) {
      if (!allowed.contains(cap) || !required.contains(cap)) {
        errors.add('Undeclared interaction');
      }
    }
    criterion(Map<String, dynamic>.from(c['successCriteria']));
  }
  for (final o in objects.values) {
    if (o['kind'] == 'polygon') {
      final ids = List<String>.from(o['vertexIds']);
      if (ids.length != 3 ||
          ids.toSet().length != 3 ||
          ids.any((id) => objects[id]?['kind'] != 'point')) {
        errors.add('Invalid triangle');
      } else {
        final p = ids
            .map(
              (id) => (objects[id]!['position'] as List)
                  .map((v) => (v as num).toDouble())
                  .toList(),
            )
            .toList();
        if (area(p) < 500) errors.add('Initial triangle is degenerate');
      }
    }
    if (o['kind'] == 'angle_token' &&
        objects[o['sourceVertexId']]?['kind'] != 'point') {
      errors.add('Invalid angle source');
    }
    if (o['kind'] == 'point') {
      final p = o['position'];
      if (p[0] < 24 || p[0] > 336 || p[1] < 24 || p[1] > 265) {
        errors.add('Point outside bounds');
      }
    }
    if (o['kind'] == 'prism' &&
        (o['dimensions'] as List).any((n) => n != n.round() || n > 10)) {
      errors.add('Invalid prism dimensions');
    }
  }
  if (type == 'geometry_2d' &&
      !(l['scene']['objects'] as List).any((o) => o['kind'] == 'polygon')) {
    errors.add('Missing triangle');
  }
  if (type == 'geometry_3d_web' &&
      (l['scene']['objects'] as List)
              .where((o) => o['kind'] == 'prism')
              .length !=
          1) {
    errors.add('Missing prism');
  }
  if (type != 'geometry_2d' &&
      type != 'geometry_3d_web' &&
      (l['scene']['objects'] as List)
              .where((o) => o['kind'] == 'math_model')
              .length !=
          1) {
    errors.add('Missing math model');
  }
  final requiredCps = List<String>.from(
    l['completion']['requiredCheckpointIds'],
  );
  if (requiredCps.length != cps.length ||
      requiredCps.any((id) => !cps.contains(id))) {
    errors.add('Invalid completion');
  }
  return errors;
}

double area(List<List<double>> p) =>
    ((p[1][0] - p[0][0]) * (p[2][1] - p[0][1]) -
            (p[2][0] - p[0][0]) * (p[1][1] - p[0][1]))
        .abs() /
    2;
List<double> angles(List<List<double>> p) => List.generate(3, (i) {
  final v = p[i],
      a = p[(i + 1) % 3],
      b = p[(i + 2) % 3],
      x = [a[0] - v[0], a[1] - v[1]],
      y = [b[0] - v[0], b[1] - v[1]];
  return math.acos(
        ((x[0] * y[0] + x[1] * y[1]) /
                (math.sqrt(x[0] * x[0] + x[1] * x[1]) *
                    math.sqrt(y[0] * y[0] + y[1] * y[1])))
            .clamp(-1, 1),
      ) *
      180 /
      math.pi;
});

class LessonSession {
  final Json lesson;
  late Json snapshot;
  late List<Json> objects;
  LessonSession(this.lesson, {Json? saved}) {
    objects = (lesson['scene']['objects'] as List)
        .map((o) => Map<String, dynamic>.from(o))
        .toList();
    snapshot = {
      'identity': jsonEncode(lesson),
      'checkpoint': 0,
      'completed': false,
      'points': {
        for (final o in objects.where((o) => o['kind'] == 'point'))
          o['id']: List<num>.from(o['position']),
      },
      'state': Map<String, dynamic>.from(lesson['scene']['initialState']),
      'metrics': <String, num>{for (final p in metricPaths) p: 0},
      'tokens': <String>[],
      'faces': <int>[],
      'revision': 0,
    };
    final model = objects.where((o) => o['kind'] == 'math_model').firstOrNull;
    if (model != null) {
      snapshot['state'] = {
        ...extraDefaults,
        'x': 0,
        'a': 1,
        'b': 0,
        'c': 0,
        'numerator': 1,
        'denominator': 4,
        'targetX': 2,
        'targetRatio': .5,
        'targetA': 1,
        'targetB': 0,
        'targetC': 0,
        ...Map<String, dynamic>.from(model['parameters']),
        ...Map<String, dynamic>.from(lesson['scene']['initialState']),
      };
    }
    final restored =
        saved != null &&
        saved['identity'] == snapshot['identity'] &&
        saved['checkpoint'] is int &&
        saved['checkpoint'] >= 0 &&
        saved['checkpoint'] < (lesson['checkpoints'] as List).length;
    if (restored) {
      snapshot = jsonDecode(jsonEncode(saved));
    }
    for (var i = 0; i <= snapshot['checkpoint']; i++) {
      final patch = Map<String, dynamic>.from(
        lesson['checkpoints'][i]['scenePatch'],
      );
      _patch(restored ? {'addObjects': patch['addObjects'] ?? []} : patch);
    }
    updateModel();
  }
  Json get checkpoint =>
      Map<String, dynamic>.from(lesson['checkpoints'][snapshot['checkpoint']]);
  Map<String, num> get metrics => Map<String, num>.from(snapshot['metrics']);
  bool get success => evaluate(
    Map<String, dynamic>.from(checkpoint['successCriteria']),
    metrics,
  );
  List<List<double>> triangle() {
    final poly = objects.where((o) => o['kind'] == 'polygon').firstOrNull;
    if (poly == null) return [];
    return (poly['vertexIds'] as List)
        .map(
          (id) => (snapshot['points'][id] as List)
              .map((v) => (v as num).toDouble())
              .toList(),
        )
        .toList();
  }

  void _patch(Json p) {
    (snapshot['state'] as Map).addAll(
      Map<String, dynamic>.from(p['setState'] ?? <String, dynamic>{}),
    );
    for (final o in p['addObjects'] ?? []) {
      if (!objects.any((x) => x['id'] == o['id'])) {
        objects.add(Map<String, dynamic>.from(o));
      }
    }
  }

  void updateModel() {
    final model = objects.where((o) => o['kind'] == 'math_model').firstOrNull;
    if (model == null) return;
    final s = snapshot['state'] as Map, m = snapshot['metrics'] as Map;
    if (extraModels.contains(model['model'])) {
      m.addAll(extraMetrics(model['model'], s));
      return;
    }
    switch (model['model']) {
      case 'number_line':
        m['modelValue'] = s['x'];
        m['modelError'] = (s['x'] - s['targetX']).abs();
      case 'fraction_bar':
        m['modelValue'] = s['numerator'] / s['denominator'];
        m['modelError'] = (m['modelValue'] - s['targetRatio']).abs();
      case 'linear_balance':
        m['modelValue'] = s['a'] * s['x'] + s['b'];
        m['modelError'] = (m['modelValue'] - s['c']).abs();
      case 'quadratic_graph':
        m['modelValue'] = s['a'] * s['x'] * s['x'] + s['b'] * s['x'] + s['c'];
        m['modelError'] =
            (s['a'] - s['targetA']).abs() +
            (s['b'] - s['targetB']).abs() +
            (s['c'] - s['targetC']).abs();
    }
  }

  bool interact(Json e) {
    if (snapshot['completed'] == true ||
        !(checkpoint['allowedInteractions'] as List).contains(e['type'])) {
      return false;
    }
    final m = snapshot['metrics'] as Map;
    switch (e['type']) {
      case 'drag_vertex':
        final o = objects.where((o) => o['id'] == e['id']).firstOrNull,
            old = snapshot['points'][e['id']];
        if (o?['kind'] != 'point' ||
            o?['draggable'] != true ||
            old == null ||
            e['position'] is! List ||
            (e['position'] as List).length != 2) {
          return false;
        }
        final p = List<num>.from(e['position']);
        if (p.any((v) => !v.isFinite) ||
            math.sqrt(math.pow(p[0] - old[0], 2) + math.pow(p[1] - old[1], 2)) <
                3 ||
            p[0] < 24 ||
            p[0] > 336 ||
            p[1] < 24 ||
            p[1] > 265) {
          return false;
        }
        snapshot['points'][e['id']] = p;
        if (area(triangle()) < 500) {
          snapshot['points'][e['id']] = old;
          return false;
        }
        m['validVertexDragCount']++;
        m['validVertexDragCountSinceCheckpoint']++;
      case 'drag_angle_token':
        final token = objects.where((o) => o['id'] == e['id']).firstOrNull,
            p = e['position'];
        if (token?['kind'] != 'angle_token' ||
            (snapshot['tokens'] as List).contains(e['id']) ||
            p[0] < 30 ||
            p[0] > 330 ||
            p[1] < 290 ||
            p[1] > 350) {
          return false;
        }
        (snapshot['tokens'] as List).add(e['id']);
        m['snappedAngleTokens'] = (snapshot['tokens'] as List).length;
        final poly = objects.firstWhere((o) => o['kind'] == 'polygon'),
            a = angles(triangle());
        m['assembledAngleDegrees'] = (snapshot['tokens'] as List).fold<double>(
          0,
          (sum, id) {
            final t = objects.firstWhere((o) => o['id'] == id);
            return sum +
                a[(poly['vertexIds'] as List).indexOf(t['sourceVertexId'])];
          },
        );
      case 'orbit_solid':
        final r = e['radians'];
        if (r is! num || !r.isFinite || r.abs() > math.pi) return false;
        m['orbitRadians'] += r.abs();
      case 'select_face':
        final f = e['face'];
        if (f is! int || f < 0 || f > 5) return false;
        if (!(snapshot['faces'] as List).contains(f)) {
          (snapshot['faces'] as List).add(f);
        }
        m['selectedFaces'] = (snapshot['faces'] as List).length;
      case 'fill_layers':
        final p = objects.firstWhere((o) => o['kind'] == 'prism'),
            n = e['layers'];
        if (n is! int || n < 0 || n > p['dimensions'][2]) return false;
        m['filledLayers'] = n;
        m['volume'] = p['dimensions'][0] * p['dimensions'][1] * n;
        snapshot['state']['layers'] = n;
      case 'adjust_parameter':
        final model = objects
            .where((o) => o['kind'] == 'math_model')
            .firstOrNull;
        if (model == null) return false;
        final name = e['name'],
            value = e['value'],
            s = snapshot['state'] as Map,
            names = extraModels.contains(model['model'])
                ? extraNames(model['model'])
                : model['model'] == 'number_line' ||
                      model['model'] == 'linear_balance'
                ? ['x']
                : model['model'] == 'fraction_bar'
                ? ['numerator', 'denominator']
                : ['a', 'b', 'c'];
        if (!names.contains(name) ||
            value is! num ||
            !value.isFinite ||
            s[name] == value) {
          return false;
        }
        if (extraModels.contains(model['model'])) {
          final bounds = extraBounds(model['model']);
          if (value < bounds.$1 ||
              value > bounds.$2 ||
              model['model'] == 'percentage_grid' && value != value.round()) {
            return false;
          }
        } else if (model['model'] == 'fraction_bar') {
          if (value != value.round() ||
              value < 0 ||
              value > 12 ||
              name == 'denominator' && value < 1 ||
              name == 'numerator' && value > s['denominator'] ||
              name == 'denominator' && value < s['numerator']) {
            return false;
          }
        } else if (value.abs() > 10) {
          return false;
        }
        s[name] = value;
        m['parameterChangeCount']++;
        m['parameterChangeCountSinceCheckpoint']++;
        updateModel();
      default:
        return false;
    }
    snapshot['revision']++;
    return true;
  }

  bool advance() {
    if (!success || snapshot['completed'] == true) return false;
    if (snapshot['checkpoint'] == (lesson['checkpoints'] as List).length - 1) {
      snapshot['completed'] = true;
    } else {
      snapshot['checkpoint']++;
      snapshot['metrics']['validVertexDragCountSinceCheckpoint'] = 0;
      snapshot['metrics']['parameterChangeCountSinceCheckpoint'] = 0;
      if (lesson['engine']['type'] == 'geometry_3d_web' &&
          snapshot['checkpoint'] == 3) {
        snapshot['metrics']['filledLayers'] = 0;
        snapshot['metrics']['volume'] = 0;
        snapshot['state']['layers'] = 0;
      }
      _patch(Map<String, dynamic>.from(checkpoint['scenePatch']));
      updateModel();
    }
    snapshot['revision']++;
    return true;
  }
}
