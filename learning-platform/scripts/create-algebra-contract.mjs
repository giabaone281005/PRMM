import {readFileSync,writeFileSync} from 'node:fs';
import {algebraCatalog,algebraDataSchemas,obj} from './algebra-definitions.mjs';
const read=p=>JSON.parse(readFileSync(p,'utf8')),write=(p,v)=>writeFileSync(p,JSON.stringify(v,null,2)+'\n');
write('contracts/core-engines/algebra-catalog.json',algebraCatalog);
const authoring=read('contracts/authoring/lesson-authoring.schema.json');authoring.oneOf=authoring.oneOf.filter(b=>!b.properties.templateId.const.startsWith('math9-algebra-'));
const base=structuredClone(authoring.oneOf.find(b=>b.properties.templateId.const==='math9-linear-relation'));
for(const t of algebraCatalog){const b=structuredClone(base);b.properties.templateId={const:t.templateId};b.properties.curriculumCode={const:t.curriculumCode};b.properties.mode={const:t.mode};b.properties.parameters=t.schema;b.properties.variants=obj({practice:t.schema,assessment:t.schema});authoring.oneOf.push(b);write(`contracts/authoring/${t.templateId}.example.json`,t.example);}
write('contracts/authoring/lesson-authoring.schema.json',authoring);
const core=read('contracts/core-engines/core-engine-config.schema.json');core.oneOf=core.oneOf.filter(b=>b.properties.engineId.const!=='balance_scale_engine');const common=structuredClone(core.oneOf[0].properties);
for(const t of algebraCatalog)core.oneOf.push(obj({...common,engineId:{const:'balance_scale_engine'},mode:{const:t.mode},curriculumCode:{const:t.curriculumCode},model:t.schema}));write('contracts/core-engines/core-engine-config.schema.json',core);
const registry=read('contracts/core-engines/registry.json'),engine=registry.engines.find(e=>e.engineId==='balance_scale_engine');engine.supportedModes=Object.keys(algebraDataSchemas);
for(const mode of engine.modes){const t=algebraCatalog.find(t=>t.mode===mode.mode);Object.assign(mode,{status:'implemented_adapter',publishEnabled:true,templateId:t.templateId,missing:[],minRuntimeVersion:'1.0.0',adapterContract:'legacy-lesson-identity-v1'});}write('contracts/core-engines/registry.json',registry);
const coverage=read('contracts/core-engines/coverage.json');for(const row of coverage.rows.filter(r=>r.engineId==='balance_scale_engine'))Object.assign(row,{status:'implemented_pending_acceptance',missingModes:[]});write('contracts/core-engines/coverage.json',coverage);
