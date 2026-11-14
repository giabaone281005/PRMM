import {readFileSync,writeFileSync} from 'node:fs';
import {geometryCatalog,geometryFieldLabels,geometryDataSchemas,obj} from './geometry-definitions.mjs';
const read=p=>JSON.parse(readFileSync(p,'utf8')),write=(p,v)=>writeFileSync(p,JSON.stringify(v,null,2)+'\n');
write('contracts/core-engines/geometry-catalog.json',geometryCatalog.map(t=>({...t,form:Object.entries(t.schema.properties).map(([key,rule])=>({key,label:geometryFieldLabels[key],symbol:rule.type==='number'||rule.type==='integer'?key:undefined,help:rule.enum?'Chọn '+rule.enum.join(' / '):`Giá trị từ ${rule.minimum} đến ${rule.maximum}. Hình dựng theo dữ kiện và giữ ràng buộc khi kéo.`}))})));
const authoring=read('contracts/authoring/lesson-authoring.schema.json');authoring.oneOf=authoring.oneOf.filter(b=>!b.properties.templateId.const.startsWith('math9-geometry-'));
const base=structuredClone(authoring.oneOf.find(b=>b.properties.templateId.const==='math9-linear-relation'));
for(const t of geometryCatalog){const b=structuredClone(base);b.properties.templateId={const:t.templateId};b.properties.curriculumCode={const:t.curriculumCode};b.properties.mode={const:t.mode};b.properties.parameters=t.schema;b.properties.variants=obj({practice:t.schema,assessment:t.schema});authoring.oneOf.push(b);write(`contracts/authoring/${t.templateId}.example.json`,t.example);}
write('contracts/authoring/lesson-authoring.schema.json',authoring);
const core=read('contracts/core-engines/core-engine-config.schema.json');core.oneOf=core.oneOf.filter(b=>b.properties.engineId.const!=='geometry_2d_canvas');
const common=structuredClone(core.oneOf[0].properties);
for(const [mode,schema] of Object.entries(geometryDataSchemas)){core.oneOf.push(obj({...common,engineId:{const:'geometry_2d_canvas'},mode:{const:mode},curriculumCode:{enum:geometryCatalog.filter(t=>t.mode===mode).map(t=>t.curriculumCode)},model:schema}));}
write('contracts/core-engines/core-engine-config.schema.json',core);
const registry=read('contracts/core-engines/registry.json'),engine=registry.engines.find(e=>e.engineId==='geometry_2d_canvas');engine.supportedModes=Object.keys(geometryDataSchemas);
for(const mode of engine.modes){const t=geometryCatalog.find(t=>t.mode===mode.mode);Object.assign(mode,{status:'implemented_adapter',publishEnabled:true,templateId:t.templateId,templateIds:geometryCatalog.filter(t=>t.mode===mode.mode).map(t=>t.templateId),missing:[],minRuntimeVersion:'1.0.0',adapterContract:'legacy-lesson-identity-v1'});}
write('contracts/core-engines/registry.json',registry);
const coverage=read('contracts/core-engines/coverage.json');for(const row of coverage.rows.filter(r=>r.engineId==='geometry_2d_canvas'))Object.assign(row,{status:'implemented_pending_acceptance',missingModes:[]});write('contracts/core-engines/coverage.json',coverage);
