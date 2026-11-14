import './export-core-engines.mjs';
import {copyFileSync,mkdirSync,writeFileSync,readdirSync,readFileSync} from 'node:fs';
mkdirSync('apps/mobile/assets/contracts',{recursive:true});
copyFileSync('contracts/lesson.schema.json','apps/mobile/assets/contracts/lesson.schema.json');
writeFileSync('apps/mobile/assets/runtime/index.html','<!doctype html><html lang="vi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><link rel="stylesheet" href="runtime.css"><style>html,body{margin:0;background:#f1f5e9;font-family:sans-serif}.solid-scene{position:relative}.webgl{height:360px;height:100vh;touch-action:none}.webgl canvas{display:block}.layer-control{position:absolute;bottom:15px;left:16px;right:16px;display:flex;align-items:center;gap:10px;font-size:12px;background:#ffffffdd;padding:12px;border-radius:10px}.layer-control input{flex:1;min-width:0}.layer-control strong{font-size:10px;white-space:nowrap}.error{padding:20px;color:#994838}</style></head><body><div id="root"></div><script src="runtime.js"></script></body></html>');

// Device tests compile these inputs into test entrypoints only, never the app.
const testInputs=Object.fromEntries(readdirSync('contracts/fixtures').filter(f=>f.endsWith('.lesson.json')).sort().map(f=>[f,JSON.parse(readFileSync('contracts/fixtures/'+f,'utf8'))]));
testInputs['math-scenarios.json']=JSON.parse(readFileSync('contracts/math-scenarios.json','utf8'));
testInputs['uime-fixtures.json']=JSON.parse(readFileSync('contracts/uime-fixtures.json','utf8'));
testInputs['cylinder-recognition.json']=JSON.parse(readFileSync('contracts/generated/cylinder-recognition.json','utf8'));
testInputs['parabola-coefficient.json']=JSON.parse(readFileSync('contracts/generated/parabola-coefficient.json','utf8'));
testInputs['algebra.json']=JSON.parse(readFileSync('contracts/generated/algebra.json','utf8'));
testInputs['geometry.json']=JSON.parse(readFileSync('contracts/generated/geometry.json','utf8'));
testInputs['cartesian.json']=JSON.parse(readFileSync('contracts/generated/cartesian.json','utf8'));
writeFileSync('apps/mobile/integration_test/fixtures.dart',"// Test-only data generated from canonical contracts. Never imported by lib/.\nconst integrationFixtureJson = <String, String>{\n"+Object.entries(testInputs).map(([name,value])=>"  '"+name+"': r'''"+JSON.stringify(value)+"''',\n").join('')+"};\n");
