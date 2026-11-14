import {spawn} from 'node:child_process';
import {createWriteStream,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
process.chdir(root);
const [role,...flags]=process.argv.slice(2);
const allowed=new Set(['--headed','--headless','--full','--flutter','--no-pause','--list']);
if(!['admin','user'].includes(role)||flags.some(f=>!allowed.has(f))||(role==='admin'&&flags.includes('--flutter'))){
  console.error('Usage: test-admin.bat [--headless] [--full] [--list] [--no-pause]\n       node scripts/run-role-tests.mjs user [--headed] [--flutter] [--list]');
  process.exit(2);
}
if(Number(process.versions.node.split('.')[0])<24){
  console.error('[ERROR] Node.js 24 or newer is required.');
  process.exit(1);
}
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
const reportDir=path.resolve(root,'../docs/qa/automated',role,`${stamp}-${process.pid}`);
mkdirSync(reportDir,{recursive:true});
const log=createWriteStream(path.join(reportDir,'run.log'));
const adminUi=role==='admin'&&!flags.includes('--full');
const config=adminUi?'playwright.admin-ui.config.ts':'playwright.roles.config.ts';
const env={...process.env,MOHOC_TEST_ROLE:role,MOHOC_TEST_REPORT_DIR:reportDir,
  MOHOC_TEST_HEADED:!flags.includes('--headless')&&(role==='admin'||flags.includes('--headed'))?'1':'0',MOHOC_TEST_MODE:'1',
  VITE_ENABLE_LOCAL_DEMO:'true',VITE_SUPABASE_URL:'',VITE_SUPABASE_PUBLISHABLE_KEY:''};
const steps=[];
function say(message){console.log(message);log.write(`${message}\n`);}
function run(label,command,args,cwd=root){
  say(`\n>>> ${label}`);
  return new Promise(resolve=>{
    const child=spawn(command,args,{cwd,env,stdio:['ignore','pipe','pipe']});
    child.stdout.on('data',chunk=>{process.stdout.write(chunk);log.write(chunk);});
    child.stderr.on('data',chunk=>{process.stderr.write(chunk);log.write(chunk);});
    child.on('error',error=>say(`[ERROR] ${error.message}`));
    child.on('close',code=>{const status=code===0?'PASS':'FAIL';steps.push({label,status,exitCode:code??1});say(`[${status}] ${label}`);resolve(code===0);});
  });
}
// cmd files need cmd.exe on Windows. Arguments here are fixed, never shell input.
const windows=process.platform==='win32';
const npm=args=>run(`npm ${args.join(' ')}`,windows?'cmd.exe':'npm',windows?['/d','/s','/c',`npm.cmd ${args.join(' ')}`]:args);
const playwright=args=>run(`Playwright ${args.join(' ')}`,process.execPath,['node_modules/@playwright/test/cli.js',...args]);
async function main(){
  say(`MO HOC - ${role.toUpperCase()} automated tests\nReports: ${reportDir}`);
  say('Local in-memory test data. Hosted login, RLS and real device gestures are outside this suite.');
  if(!existsSync('node_modules/.package-lock.json')||!existsSync('node_modules/@playwright/test/cli.js')||!existsSync('node_modules/vitest/vitest.mjs')){
    if(!await npm(['ci']))return;
  }
  if(adminUi&&!await run('Discover all admin topics',process.execPath,['node_modules/tsx/dist/cli.mjs','scripts/ui-test-inventory.ts']))return;
  if(flags.includes('--list')){await playwright(['test',`--config=${config}`,'--list']);return;}
  if(!await playwright(['install','chromium']))return;
  if(!adminUi){
    await npm(['run','typecheck']);
    // The shared contracts, SQL/local API and evaluators affect both roles.
    await npm(['test']);
  }
  await playwright(['test',`--config=${config}`]);
  if(flags.includes('--flutter')){
    const flutter=windows?'cmd.exe':'flutter';
    const flutterArgs=args=>windows?['/d','/s','/c',`flutter.bat ${args.join(' ')}`]:args;
    const cwd=path.join(root,'apps/mobile');
    if(await run('Flutter pub get',flutter,flutterArgs(['pub','get']),cwd)){
      await run('Flutter unit/widget tests',flutter,flutterArgs(['test']),cwd);
    }
  }else if(role==='user'){
    say('[NOT RUN] Flutter unit/widget tests. Use test-user.bat --flutter to include them.');
  }
}
try{await main();}catch(error){say(`[ERROR] ${error.stack??error}`);steps.push({label:'Runner',status:'FAIL',exitCode:1});}
const failed=steps.some(step=>step.status==='FAIL');
writeFileSync(path.join(reportDir,'summary.json'),JSON.stringify({role,mode:flags.includes('--list')?'list':adminUi?'admin-ui':'test',status:failed?'FAIL':'PASS',steps,
  limitations:['Local test backend; no hosted authentication/RLS acceptance','No physical device integration or native gesture acceptance'],reportDir},null,2));
say(`\n${failed?'FAIL':'PASS'} - ${role.toUpperCase()}\nLog: ${path.join(reportDir,'run.log')}\nBrowser report (after tests): ${path.join(reportDir,'html/index.html')}`);
await new Promise(resolve=>log.end(resolve));
process.exitCode=failed?1:0;
