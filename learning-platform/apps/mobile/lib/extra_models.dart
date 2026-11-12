import 'dart:math' as math;

const extraModels = [
  'percentage_grid',
  'ratio_table',
  'coordinate_plane',
  'rectangle_area',
  'pythagorean',
  'linear_graph',
];
const extraEngineMap = {
  'percentage_2d': 'percentage_grid',
  'ratio_2d': 'ratio_table',
  'coordinate_2d': 'coordinate_plane',
  'area_2d': 'rectangle_area',
  'pythagorean_2d': 'pythagorean',
  'linear_plot_2d': 'linear_graph',
};
const extraDefaults = {
  'y': 0,
  'width': 1,
  'height': 1,
  'targetY': 0,
  'targetWidth': 3,
  'targetHeight': 4,
};
List<String> extraNames(String model) => switch (model) {
  'percentage_grid' || 'ratio_table' => ['x'],
  'coordinate_plane' => ['x', 'y'],
  'rectangle_area' || 'pythagorean' => ['width', 'height'],
  _ => ['a', 'b'],
};
(num, num) extraBounds(String model) => switch (model) {
  'percentage_grid' => (0, 100),
  'ratio_table' => (0, 10),
  'rectangle_area' || 'pythagorean' => (1, 10),
  _ => (-10, 10),
};
Map<String, num> extraMetrics(String model, Map s) => switch (model) {
  'percentage_grid' => {
    'modelValue': s['b'] * s['x'] / 100,
    'modelError': (s['x'] - s['targetX']).abs(),
  },
  'ratio_table' => {
    'modelValue': s['b'] * s['x'],
    'modelError': (s['x'] - s['targetX']).abs(),
  },
  'coordinate_plane' => {
    'modelValue': math.sqrt(s['x'] * s['x'] + s['y'] * s['y']),
    'modelError': math.sqrt(
      math.pow(s['x'] - s['targetX'], 2) + math.pow(s['y'] - s['targetY'], 2),
    ),
  },
  'rectangle_area' || 'pythagorean' => {
    'modelValue': model == 'rectangle_area'
        ? s['width'] * s['height']
        : math.sqrt(s['width'] * s['width'] + s['height'] * s['height']),
    'modelError':
        (s['width'] - s['targetWidth']).abs() +
        (s['height'] - s['targetHeight']).abs(),
  },
  _ => {
    'modelValue': s['a'] * s['x'] + s['b'],
    'modelError': (s['a'] - s['targetA']).abs() + (s['b'] - s['targetB']).abs(),
  },
};
