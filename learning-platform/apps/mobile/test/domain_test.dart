import 'dart:convert';
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:mo_hoc/domain.dart';
Json fixture(String name)=>jsonDecode(File('../../contracts/fixtures/$name.lesson.json').readAsStringSync());
void main(){
  final schema=jsonDecode(File('../../contracts/lesson.schema.json').readAsStringSync()) as Json;
  final triangle=fixture('grade7-triangle-angle-sum'),solid=fixture('grade8-solid-volume');
  test('canonical TS/Dart fixtures and shared vectors',(){for(final l in [triangle,solid]){expect(validateLesson(l,schema),isEmpty);}for(final v in jsonDecode(File('../../contracts/evaluation-vectors.json').readAsStringSync())){expect(evaluate(Map<String,dynamic>.from(v['criterion']),Map<String,num>.from(v['metrics'])),v['expected']);}});
  test('reject malformed and untrusted manifests',(){for(final mutate in <void Function(Json)>[(l)=>l['extra']='script',(l)=>l['engine']['requiredCapabilities'].add('eval'),(l)=>l['scene']['objects'][3]['vertexIds'][0]='missing',(l)=>l['checkpoints'][0]['successCriteria']={'op':'approx','path':'metrics.volume','value':1,'tolerance':-1}]){final l=jsonDecode(jsonEncode(triangle)) as Json;mutate(l);expect(validateLesson(l,schema),isNotEmpty);}});
  test('persistent scene, valid gestures, restore and completion',(){final s=LessonSession(triangle),objects=s.objects;expect(s.advance(),isFalse);expect(s.interact({'type':'drag_vertex','id':'A','position':[170,240]}),isFalse);expect(s.interact({'type':'drag_vertex','id':'A','position':[180,75]}),isTrue);expect(s.advance(),isTrue);expect(identical(s.objects,objects),isTrue);expect(s.success,isFalse);s.interact({'type':'drag_vertex','id':'A','position':[190,80]});s.advance();for(var i=0;i<3;i++){s.interact({'type':'drag_angle_token','id':'angle-token-$i','position':[180,320]});}expect(s.metrics['assembledAngleDegrees']!.toDouble(),closeTo(180,1e-8));expect(s.advance(),isTrue);expect(s.snapshot['completed'],isTrue);expect(LessonSession(triangle,saved:s.snapshot).snapshot['completed'],isTrue);});
  test('solid contract matches web transitions',(){final s=LessonSession(solid);s.interact({'type':'orbit_solid','radians':.4});s.advance();s.interact({'type':'select_face','face':1});s.advance();s.interact({'type':'fill_layers','layers':3});s.advance();expect(s.success,isFalse);s.interact({'type':'fill_layers','layers':3});expect(s.metrics['volume'],36);s.advance();expect(s.snapshot['completed'],isTrue);});
}
