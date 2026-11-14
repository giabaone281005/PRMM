import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:mo_hoc/core_engines.dart';
import 'package:mo_hoc/domain.dart';

void main(){
 IntegrationTestWidgetsFlutterBinding.ensureInitialized();
 testWidgets('ENG-00 bundled registry and schema on physical Android',(tester)async{
  Future<Json> object(String name)async=>jsonDecode(await rootBundle.loadString('assets/contracts/core-engines/$name')) as Json;
  final registry=await object('registry.json'),schema=await object('core-engine-config.schema.json'),coverage=await object('coverage.json');
  final core=CoreEngines(registry,schema);
  expect((registry['engines'] as List).length,6);expect((coverage['rows'] as List).length,24);
  final vectors=jsonDecode(await rootBundle.loadString('assets/contracts/core-engines/validation-vectors.json')) as List;
  for(final v in vectors) {
    expect(core.validate(v['config']).isEmpty,v['valid'],reason:v['name']);
  }
  for(final e in registry['engines'])for(final mode in e['modes']){
   if(mode['publishEnabled']==true) {
     expect(core.resolve(e['engineId'],mode['mode'])['templateId'],mode['templateId']);
   } else {
     expect(()=>core.resolve(e['engineId'],mode['mode']),throwsStateError);
   }
  }
 });
}
