import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const schema=readFileSync('contracts/lesson.schema.json','utf8');
// Applied migration history is immutable. Review this output in a NEW migration.
mkdirSync('supabase/generated',{recursive:true});
writeFileSync('supabase/generated/contract-validation.sql',`begin;\ncreate or replace function lesson_private.contract_schema() returns jsonb language sql immutable set search_path='' as $body$ select $schema$${schema}$schema$::jsonb $body$;\n`+readFileSync('supabase/contract-validator.sql','utf8').replaceAll('create function ','create or replace function ')+'\ncommit;\n');
