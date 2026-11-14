import {describe,it,expect} from 'vitest';
import vectors from '../contracts/core-engines/validation-vectors.json';
import curriculum from '../contracts/math9-curriculum.json';
import {coreEngineRegistry,coreEngineCoverage,validateCoreConfig,resolveCoreAdapter} from '../packages/lesson-contract/core-engines';
import {compileProblem} from '../packages/lesson-authoring/authoring-service';
import cylinder from '../contracts/authoring/math9-cylinder-recognition.example.json';
import parabola from '../contracts/authoring/math9-parabola-coefficient.example.json';
describe('ENG-00 canonical engine contract',()=>{
 it('maps all 24 codes to the original six canonical owners',()=>{
  expect(coreEngineRegistry.engines).toHaveLength(6);expect(coreEngineCoverage.rows).toHaveLength(24);
  expect(new Set(coreEngineCoverage.rows.map(r=>r.curriculumCode)).size).toBe(24);
  for(const row of curriculum){const coverage=coreEngineCoverage.rows.find(c=>c.curriculumCode===row.id)!;expect(coverage.engineId).toBe(row.engine);expect(coverage.requiredModes.length).toBeGreaterThan(0);}
 });
 for(const v of vectors)it(v.name,()=>expect(validateCoreConfig(v.config).length===0).toBe(v.valid));
 it('blocks every planned mode and resolves both implemented legacy adapters',()=>{
  for(const e of coreEngineRegistry.engines)for(const m of e.modes){if(m.publishEnabled)expect(resolveCoreAdapter(e.engineId,m.mode).templateId).toBe(m.templateId);else expect(()=>resolveCoreAdapter(e.engineId,m.mode)).toThrow();}
  expect(()=>resolveCoreAdapter('unknown','anything')).toThrow();expect(()=>resolveCoreAdapter('cartesian_graph_engine','parabola_coefficient','9.0.0')).toThrow();
 });
 it('keeps compiled lessons on the v1 compatibility path without new fields',()=>{
  for(const input of [cylinder,parabola]){const {manifest}=compileProblem(input,{lessonId:'eng00-compat',version:1});expect(manifest.schemaVersion).toBe('1.0.0');expect(manifest.engine.type).toBe('math_explorer_2d');expect(manifest).not.toHaveProperty('coreConfig');}
 });
});
