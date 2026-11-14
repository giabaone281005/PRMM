import {mkdirSync,copyFileSync,readFileSync,writeFileSync} from 'node:fs';
const source='contracts/core-engines',target='apps/mobile/assets/contracts/core-engines';
mkdirSync(target,{recursive:true});
for(const name of ['registry.json','coverage.json','core-engine-config.schema.json','validation-vectors.json','cartesian-vectors.json','geometry-vectors.json','geometry-catalog.json','algebra-vectors.json','algebra-catalog.json'])copyFileSync(`${source}/${name}`,`${target}/${name}`);
const registry=JSON.parse(readFileSync(`${source}/registry.json`,'utf8')),coverage=JSON.parse(readFileSync(`${source}/coverage.json`,'utf8'));
const rows=coverage.rows.map(c=>`| ${c.curriculumCode} | ${c.engineId} | ${c.requiredModes.join(', ')} | ${c.status} | ${c.missingModes.join(', ')} |`);
writeFileSync(`${source}/COVERAGE.md`,'# Generated ENG-00 coverage\n\nGenerated from registry.json / coverage.json. Implemented adapter does not mean all engine modes accepted.\n\n| Code | Owner | Required modes | Status | Missing |\n|---|---|---|---|---|\n'+rows.join('\n')+'\n');
// Export schema data for the existing SQL schema validator. Deliberately not an applied migration.
mkdirSync('supabase/generated',{recursive:true});
const schema=JSON.parse(readFileSync(`${source}/core-engine-config.schema.json`,'utf8'));
writeFileSync('supabase/generated/core-engine-contract.sql',`-- ENG-00 draft: review in a future versioned migration; no runtime-v2 publication enabled.\ncreate or replace function lesson_private.core_config_schema() returns jsonb language sql immutable set search_path='' as $body$ select $core$${JSON.stringify(schema)}$core$::jsonb $body$;\nrevoke all on function lesson_private.core_config_schema() from public;\n`);
console.log(`Exported ${registry.engines.length} canonical registry entries and ${coverage.rows.length} coverage rows; no database writes.`);
