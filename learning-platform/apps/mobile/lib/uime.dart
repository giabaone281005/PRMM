import 'algebra.dart';
import 'geometry.dart';
import 'cartesian.dart';
import 'parabola.dart';
import 'dart:math' as math;

const uimeKeys = ['x', 'y', 'a', 'b', 'c', 'width', 'height', 'numerator'];
bool uimeAccept(Map u, String name, num value) {
  if(u['algebra'] is Map)return algebraAccept(u['algebra'],name,value);
  if(u['geometry'] is Map)return geometryAccept(u['geometry'],name,value);
  if(u['graph'] is Map)return graphAccept(u['graph'],name,value);
  if(u['parabola'] is Map)return parabolaAccept(u['parabola'],name,value);
  final i = uimeKeys.indexOf(name);
  if (i < 0 || !value.isFinite) return false;
  if (u['cylinder'] is Map) {
    if (name == 'a') return value.abs() <= math.pi * 2;
    if (name == 'b') return value.abs() <= 1.3;
    if (name == 'width') return u['cylinder']['task'] == 'equal-bases' && value >= .5 && value <= 1.5;
    return name == 'x' && value == value.round() && value >= 0 && value < 5;
  }
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
  if(u['algebra'] is Map)return algebraError(u['algebra'],state);
  if(u['geometry'] is Map)return geometryError(u['geometry'],state);
  if(u['graph'] is Map)return graphError(u['graph'],state);
  if(u['parabola'] is Map)return parabolaError(u['parabola'],state);
  if (u['cylinder'] is Map) {
    final task = u['cylinder']['task'];
    if (task == 'orbit') return (state['c'] as num) >= .3 ? 0 : 1;
    if (task == 'equal-bases') return state['y'] == 3 && ((state['width'] as num) - 1).abs() > .09 ? 0 : 1;
    return state['x'] == {'radius': 0, 'height': 1, 'side': 4}[task] ? 0 : 1;
  }
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
  if(u['algebra'] is Map){e.addAll(validateAlgebra(u['algebra']));if(u['kind']!='FORMULA_SNAP_BUILDER'||u['geometry']!=null||u['graph']!=null||u['parabola']!=null||u['cylinder']!=null){e.add('Algebra adapter binding invalid');}}
  if(u['geometry'] is Map){e.addAll(validateGeometry(u['geometry']));if(u['kind']!='TRIANGLE_HOTSPOT_TAP'||u['graph']!=null||u['parabola']!=null||u['cylinder']!=null){e.add('Geometry adapter binding invalid');}}
  if(u['graph'] is Map){e.addAll(validateGraph(u['graph']));if(u['kind']!='PARABOLA_SLIDER'||u['parabola']!=null||u['cylinder']!=null)e.add('Graph adapter binding invalid');}
  if(u['parabola'] is Map){
    e.addAll(validateParabola(u['parabola']));
    if(u['kind']!='PARABOLA_SLIDER'||u['cylinder']!=null||u['min']!=-5||u['max']!=5||u['step']!=1||answers.length!=1||answers[0]!=u['parabola']['a'])e.add('Invalid parabola model binding');
  }
  if (u['cylinder'] is Map) {
    final c = u['cylinder'] as Map;
    if (u['kind'] != '3D_SOLID_INSPECTOR' || u['solid'] != 'cylinder' ||
        ![c['radius'], c['height']].every((n) => n is num && n.isFinite && n >= .1 && n <= 100) ||
        c['height'] / c['radius'] < .1 || c['height'] / c['radius'] > 10 ||
        !['cm', 'm'].contains(c['unit']) ||
        !['orbit', 'radius', 'equal-bases', 'height', 'side'].contains(c['task']) ||
        (u['tokens'] as List).length != 5) {
      e.add('Invalid cylinder model');
    }
  }
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
  for (var i = 0; u['algebra']==null && u['geometry']==null && u['parabola']==null && u['graph']==null && i < answers.length && i < 8; i++) {
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
