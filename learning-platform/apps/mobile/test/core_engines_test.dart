import 'dart:convert';
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:mo_hoc/core_engines.dart';
import 'package:mo_hoc/domain.dart';
void main(){
 Json read(String name)=>jsonDecode(File('../../contracts/core-engines/$name').readAsStringSync()) as Json;
 final core=CoreEngines(read('registry.json'),read('core-engine-config.schema.json'));
 final vectors=jsonDecode(File('../../contracts/core-engines/validation-vectors.json').readAsStringSync()) as List;
 for(final v in vectors) {
   test('ENG-00 ${v['name']}',()=>expect(core.validate(v['config']).isEmpty,v['valid']));
 }
 test('all planned modes are denied on mobile',(){for(final e in core.registry['engines'])for(final m in e['modes']){if(m['publishEnabled']==true) {
   expect(core.resolve(e['engineId'],m['mode'])['templateId'],m['templateId']);
 } else {
   expect(()=>core.resolve(e['engineId'],m['mode']),throwsStateError);
 }}});
}
