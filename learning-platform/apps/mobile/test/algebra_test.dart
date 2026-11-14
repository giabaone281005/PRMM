import 'dart:convert';
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:mo_hoc/domain.dart';
import 'package:mo_hoc/algebra.dart';
void main(){
 final vectors=jsonDecode(File('../../contracts/core-engines/algebra-vectors.json').readAsStringSync()) as List,fixtures=jsonDecode(File('../../contracts/generated/algebra.json').readAsStringSync()) as List,schema=jsonDecode(File('../../contracts/lesson.schema.json').readAsStringSync()) as Json;
 for(final v in vectors){test('ENG-03 math/guard ${v['name']}',(){
  final g=v['config'] as Map;expect(validateAlgebra(g).isEmpty,v['valid']);if(v['valid']==true){final m=algebraModel(g);for(final key in (v['model'] as Map).keys){final expected=v['model'][key],actual=m[key];if(expected is num){expect(actual,closeTo(expected,1e-8));}else if(expected is List){expect((actual as List).length,expected.length);for(var i=0;i<expected.length;i++){expect(actual[i],closeTo(expected[i],1e-8));}}else{expect(actual,expected);}}expect(m['equation'],v['equation']);expect(algebraDomainMask(g),v['domainMask']);expect(algebraSlotTargets(g),v['slots']);expect([for(var i=0;i<7;i++)algebraOperationAllowed(g,i,true)],v['operations']);for(final probe in v['probes']){for(final side in ['left','right']){final value=evaluateAlgebraExpr(m['equation'][side],probe['x']);expect(value,probe[side]==null?isNull:closeTo(probe[side],1e-8));}}}
 });}
 for(final f in fixtures){test('ENG-03 six steps/restore ${f['manifest']['lessonId']}',(){
  final lesson=Map<String,dynamic>.from(f['manifest']),s=LessonSession(lesson);expect(validateLesson(lesson,schema),isEmpty);for(final events in f['steps']){expect(s.success,isFalse);expect(s.advance(),isFalse);for(final v in events){expect(s.interact(Map<String,dynamic>.from(v['event'])),v['accepted'],reason:jsonEncode(v['event']));expect(s.success,v['success'],reason:jsonEncode(s.snapshot['state']));for(final key in (v['state'] as Map).keys){expect(s.snapshot['state'][key],v['state'][key]);}expect(LessonSession(lesson,saved:s.snapshot).snapshot,s.snapshot);}expect(s.advance(),isTrue);}expect(s.snapshot['completed'],isTrue);
 });}
 test('ENG-03 unsupported AST operations are rejected',(){expect(()=>evaluateAlgebraExpr({'op':'eval'},1),throwsStateError);});
}
