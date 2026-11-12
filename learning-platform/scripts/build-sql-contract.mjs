import {readFileSync,writeFileSync} from 'node:fs';
const schema=readFileSync('contracts/lesson.schema.json','utf8');
writeFileSync('supabase/migrations/20261112140806_contract_validation.sql',`begin;\ncreate function lesson_private.contract_schema() returns jsonb language sql immutable set search_path='' as $body$ select $schema$${schema}$schema$::jsonb $body$;\n`+readFileSync('supabase/contract-validator.sql','utf8')+'\ncommit;\n');
