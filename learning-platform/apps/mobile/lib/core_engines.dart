import 'algebra.dart';
import 'geometry.dart';
import 'cartesian.dart';
import 'domain.dart' show Json,validateSchema;

/// Registry is provided by bundled contracts, never by lesson content.
class CoreEngines {
 final Json registry,schema;
 CoreEngines(this.registry,this.schema);
 Map resolve(String engineId,String mode,{String engineVersion='1.0.0'}) {
  final engines=(registry['engines'] as List).where((e)=>e['engineId']==engineId);
  if(engines.isEmpty)throw StateError('Unknown canonical engine');
  final engine=engines.single;
  if(engine['engineVersion']!=engineVersion)throw StateError('Unsupported engine version');
  final modes=(engine['modes'] as List).where((m)=>m['mode']==mode);
  if(modes.isEmpty||modes.single['publishEnabled']!=true||modes.single['status']!='implemented_adapter')throw StateError('Mode has no implemented mobile adapter');
  if(engineId=='area_fraction_grid'&&mode=='cylinder_recognition')return {'renderer':'SolidView/WebView/CylinderScene','templateId':'math9-cylinder-recognition','snapshotVersion':'legacy-lesson-identity-v1'};
  if(engineId=='cartesian_graph_engine'&&mode=='parabola_coefficient')return {'renderer':'SolidView/WebView/ParabolaScene','templateId':'math9-parabola-coefficient','snapshotVersion':'legacy-lesson-identity-v1'};
  if(engineId=='cartesian_graph_engine'&&['linear_relation','linear_system','line_parabola_intersection'].contains(mode))return {'renderer':'SolidView/WebView/CartesianScene','templateId':{'linear_relation':'math9-linear-relation','linear_system':'math9-linear-system','line_parabola_intersection':'math9-line-parabola'}[mode],'snapshotVersion':'legacy-lesson-identity-v1'};
  if(engineId=='geometry_2d_canvas'&&geometryModes.contains(mode)){return {'renderer':'SolidView/WebView/GeometryScene','templateId':modes.single['templateId'],'snapshotVersion':'legacy-lesson-identity-v1'};}
  if(engineId=='balance_scale_engine'&&algebraModes.contains(mode)){return {'renderer':'SolidView/WebView/AlgebraScene','templateId':modes.single['templateId'],'snapshotVersion':'legacy-lesson-identity-v1'};}
  throw StateError('No registered mobile adapter');
 }
 List<String> validate(dynamic config) {
  final errors=validateSchema(config,schema);
  if(errors.isNotEmpty)return errors;
  try{resolve(config['engineId'],config['mode'],engineVersion:config['engineVersion']);}catch(_){return ['Mode unavailable'];}
  if(config['engineId']=='balance_scale_engine'){return validateAlgebraData(config['model'],config['mode']);}
  if(config['engineId']=='geometry_2d_canvas'){return validateGeometryData(config['model'],config['mode']);}
  if(config['engineId']=='area_fraction_grid'){
   final ratio=config['model']['height']/config['model']['radius'];
   if(ratio<.1||ratio>10)return ['Invalid cylinder aspect ratio'];
  }
  if(config['engineId']=='cartesian_graph_engine'&&config['mode']!='parabola_coefficient')return validateGraphData(config['model'],config['mode']);
  return [];
 }
}
