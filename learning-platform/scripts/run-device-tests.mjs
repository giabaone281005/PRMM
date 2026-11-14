import {spawn,spawnSync} from 'node:child_process';
import {createWriteStream,existsSync,mkdirSync,readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createInterface} from 'node:readline/promises';
import {loadUserCatalog,createDeviceUiHost} from './device-ui-host.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const mobile=path.join(root,'apps/mobile');
const args=process.argv.slice(2);
let deviceId,emulatorId,lessonId,list=false,smoke=false,catalogPath=path.join(root,'.local/ui-catalog.snapshot.json');
for(let i=0;i<args.length;i++){
  const arg=args[i];
  if(arg==='--catalog'){
    const value=args[++i];if(!value)throw new Error('Missing catalog file path');catalogPath=path.resolve(root,value);
  }else if(arg==='--smoke')smoke=true;
  else if(arg==='--device'||arg==='--emulator'||arg==='--lesson'){
    const value=args[++i];
    if(!value||!/^[-a-zA-Z0-9._:]+$/.test(value))throw new Error(`Invalid ${arg} ID`);
    if(arg==='--device')deviceId=value;else if(arg==='--lesson')lessonId=value;else emulatorId=value;
  }else if(arg==='--list')list=true;
  else if(arg!=='--no-pause'){
    console.error('Usage: test-user.bat [--device ID | --emulator AVD_ID] [--catalog FILE] [--lesson ID] [--smoke] [--list] [--no-pause]');process.exit(2);
  }
}
if(deviceId&&emulatorId){console.error('Choose --device OR --emulator.');process.exit(2);}
const reportDir=path.resolve(root,'../docs/qa/automated/user-device',`${new Date().toISOString().replace(/[:.]/g,'-')}-${process.pid}`);
mkdirSync(reportDir,{recursive:true});
const log=createWriteStream(path.join(reportDir,'run.log'));
const env={...process.env,MOHOC_DEVICE_REPORT_DIR:reportDir};
const steps=[];
let uiHost,catalogSource;
function say(message){console.log(message);log.write(`${message}\n`);}
function flutter(label,parameters,{quiet=false,record=true,timeoutMs=120000}={}){
  say(`\n>>> ${label}`);
  return new Promise(resolve=>{
    // Parameters are fixed switches and validated device IDs, never arbitrary shell text.
    const child=spawn(process.platform==='win32'?'cmd.exe':'flutter',process.platform==='win32'?['/d','/s','/c',`flutter.bat ${parameters.join(' ')}`]:parameters,{cwd:mobile,env,stdio:['ignore','pipe','pipe']});
    let stdout='',timedOut=false;
    const timer=setTimeout(()=>{
      timedOut=true;say(`[ERROR] ${label} timed out after ${timeoutMs/1000}s`);
      if(child.pid&&process.platform==='win32')spawn('taskkill.exe',['/pid',String(child.pid),'/t','/f'],{stdio:'ignore',windowsHide:true});
      else child.kill('SIGTERM');
    },timeoutMs);
    child.stdout.on('data',chunk=>{stdout+=chunk;log.write(chunk);if(!quiet)process.stdout.write(chunk);});
    child.stderr.on('data',chunk=>{log.write(chunk);if(!quiet)process.stderr.write(chunk);});
    child.on('error',error=>say(`[ERROR] ${error.message}. Check Flutter SDK in PATH.`));
    child.on('close',code=>{clearTimeout(timer);const ok=code===0&&!timedOut;if(record)steps.push({label,status:ok?'PASS':'FAIL',exitCode:timedOut?124:code??1});resolve({ok,stdout});});
  });
}
async function machine(command){
  const result=await flutter(`Flutter ${command.join(' ')}`,[...command,'--machine'],{quiet:true,record:false,timeoutMs:45000});
  if(!result.ok)throw new Error('Cannot query Flutter. Install Flutter SDK and run flutter doctor.');
  const start=result.stdout.indexOf('['),end=result.stdout.lastIndexOf(']');
  if(start<0||end<start)throw new Error('Flutter did not return a device list. See run.log.');
  return JSON.parse(result.stdout.slice(start,end+1));
}
const androidDevices=async()=>(await machine(['devices'])).filter(d=>d.isSupported&&d.targetPlatform?.startsWith('android'));
async function androidEmulators(){
  const result=await flutter('Flutter emulators',['emulators'],{quiet:true,record:false});
  if(!result.ok)throw new Error('Cannot list Android emulators. Check flutter doctor.');
  return result.stdout.split(/\r?\n/).map(line=>line.split('•').map(part=>part.trim()))
    .filter(parts=>parts.length>=4&&parts.at(-1)==='android'&&/^[-a-zA-Z0-9._:]+$/.test(parts[0]))
    .map(parts=>({id:parts[0],name:parts[1]}));
}
function verifyTestApk(){
  const properties=readFileSync(path.join(mobile,'android/local.properties'),'utf8');
  const sdk=properties.match(/^sdk\.dir=(.+)$/m)?.[1].trim().replace(/\\:/g,':').replace(/\\\\/g,'\\')
    ??env.ANDROID_HOME??env.ANDROID_SDK_ROOT;
  if(!sdk)throw new Error('Cannot find Android SDK to verify the test APK package.');
  const toolsDir=path.join(sdk,'build-tools');
  const versions=readdirSync(toolsDir).sort((a,b)=>b.localeCompare(a,undefined,{numeric:true}));
  const aapt=versions.map(v=>path.join(toolsDir,v,process.platform==='win32'?'aapt.exe':'aapt')).find(existsSync);
  if(!aapt)throw new Error('Android build-tools aapt is required to verify the APK before installing.');
  const result=spawnSync(aapt,['dump','badging',path.join(mobile,'build/app/outputs/flutter-apk/app-debug.apk')],{encoding:'utf8',windowsHide:true});
  const packageId=result.stdout?.match(/^package: name='([^']+)'/m)?.[1];
  if(result.status!==0||packageId!=='vn.mohoc.mo_hoc.uitest')throw new Error(`Refusing installation: APK package is ${packageId??'unknown'}, not the isolated UI test package.`);
  steps.push({label:'Verify isolated APK package before installation',status:'PASS',packageId});
  say(`[PASS] APK package verified: ${packageId}`);
}
async function choose(items,label){
  items.forEach((item,index)=>say(`  ${index+1}. ${item.name} (${item.id})`));
  if(items.length===1)return items[0];
  if(!process.stdin.isTTY)throw new Error(`Multiple ${label}. Specify --device ID or --emulator AVD_ID.`);
  const input=createInterface({input:process.stdin,output:process.stdout});
  try{const n=Number(await input.question(`Select ${label} [1-${items.length}]: `));if(!Number.isInteger(n)||n<1||n>items.length)throw new Error('Invalid selection');return items[n-1];}finally{input.close();}
}
async function main(){
  say(`MO HOC - ANDROID UI AUTOMATION\nReports: ${reportDir}\nReal app taps, drags, navigation and checkpoint progression. Test package: vn.mohoc.mo_hoc.uitest`);
  let devices=await androidDevices();
  if(list){
    say('Connected Android devices:');devices.forEach(d=>say(`${d.id} : ${d.name}`));
    say('Available emulators:');for(const e of await androidEmulators())say(`${e.id} : ${e.name}`);
    if(existsSync(catalogPath)){const snapshot=JSON.parse(readFileSync(catalogPath,'utf8'));say(`Catalog: ${snapshot.lessons?.length??0} published lessons; ${snapshot.source?.capturedAt??'unknown timestamp'}`);}
    say('Default: ALL published catalog lessons. --smoke selects the earlier five-fixture UI check.');return;
  }
  if(emulatorId||(!devices.length&&!deviceId)){
    const emulators=await androidEmulators();
    const available=emulatorId?emulators.filter(e=>e.id===emulatorId):emulators;
    if(!available.length)throw new Error('No Android device/AVD. Connect a phone with USB debugging or create an Android Studio AVD. Run test-user.bat --list.');
    const emulator=await choose(available,'emulator');
    const previous=new Set(devices.map(d=>d.id));
    if(!(await flutter('Launch Android emulator',['emulators','--launch',emulator.id,'--cold'])).ok)return;
    const deadline=Date.now()+180000;
    do{
      await new Promise(resolve=>setTimeout(resolve,3000));devices=await androidDevices();
      const fresh=devices.filter(d=>d.emulator&&!previous.has(d.id));
      if(fresh.length===1){deviceId=fresh[0].id;break;}
    }while(Date.now()<deadline);
    if(!deviceId)throw new Error('Emulator did not become ready within 3 minutes. Start it manually and retry --device emulator-5554.');
  }
  const candidates=deviceId?devices.filter(d=>d.id===deviceId):devices;
  if(!candidates.length)throw new Error(`Android device ${deviceId??''} is not available or not authorized. Check USB debugging and unlock the phone.`);
  const device=await choose(candidates,'Android device');deviceId=device.id;
  say(`Selected: ${device.name} (${deviceId}). Keep the screen unlocked and allow USB installation if Android asks.`);
  if(!smoke){
    let snapshot=await loadUserCatalog(root,catalogPath);
    if(lessonId)snapshot={...snapshot,lessons:snapshot.lessons.filter(l=>l.lessonId===lessonId)};
    catalogSource=snapshot.source;
    say(`Catalog source: ${catalogSource?.kind}; captured ${catalogSource?.capturedAt}; ${snapshot.lessons.length} lessons.`);
    uiHost=await createDeviceUiHost({deviceId,reportDir,snapshot});
    const index=Buffer.from(JSON.stringify(uiHost.inventory.map(l=>({id:l.id,version:l.version,checkpoints:l.checkpoints})))).toString('base64');
    writeFileSync(path.join(mobile,'integration_test/user_catalog_index.g.dart'),`// Generated test-only catalog index.\nconst uiCatalogIndexBase64 = '${index}';\n`);
  }
  if(!(await flutter('Flutter pub get',['pub','get'])).ok)return;
  const defines=[`--dart-define=LOCAL_API_URL=http://127.0.0.1:${uiHost?.port??18765}/api`,
    '--dart-define=SUPABASE_URL=','--dart-define=SUPABASE_PUBLISHABLE_KEY=',
    `--dart-define=UI_SMOKE=${smoke}`,
    ...(uiHost?[`--dart-define=UI_CONTROL_URL=http://127.0.0.1:${uiHost.port}`,`--dart-define=UI_CONTROL_TOKEN=${uiHost.token}`]:[])];
  if(!(await flutter('Build isolated Android UI test APK',[
    'build','apk','--debug','--target=integration_test/user_ui_test.dart',...defines,
  ],{timeoutMs:600000})).ok)return;
  verifyTestApk();
  await flutter('Android user interface gestures',[
    'drive','--driver=test_driver/user_ui_driver.dart','--target=integration_test/user_ui_test.dart',
    '--use-application-binary=build/app/outputs/flutter-apk/app-debug.apk','-d',deviceId,...defines,
  ],{timeoutMs:2400000});
}
try{await main();}catch(error){say(`[ERROR] ${error.message}`);steps.push({label:'Device runner',status:'FAIL',exitCode:1});}
finally{if(uiHost)await uiHost.close();}
if(uiHost){
  const passed=uiHost.events.filter(e=>e.status==='PASS').map(e=>e.lessonId);
  if(uiHost.inventory.some(l=>!passed.includes(l.id)||new Set(uiHost.events.filter(e=>e.status==='CHECKPOINT'&&e.lessonId===l.id).map(e=>e.checkpoint)).size!==l.checkpoints))steps.push({label:'Every catalog lesson and checkpoint has a PASS result',status:'FAIL',exitCode:1});
}
const failed=steps.some(step=>step.status==='FAIL');
writeFileSync(path.join(reportDir,'summary.json'),JSON.stringify({mode:list?'list':smoke?'android-ui-smoke':lessonId?'android-ui-catalog-subset':'android-ui-all-catalog',status:failed?'FAIL':'PASS',deviceId,testPackage:'vn.mohoc.mo_hoc.uitest',steps,
  source:catalogSource,lessonFilter:lessonId,expectedLessons:uiHost?.inventory.length,passedLessons:uiHost?.events.filter(e=>e.status==='PASS').length,
  expectedCheckpoints:uiHost?.inventory.reduce((sum,l)=>sum+l.checkpoints,0),passedCheckpoints:uiHost?.events.filter(e=>e.status==='CHECKPOINT').length,nativeInputCount:uiHost?.actions.length,
  limitations:['Catalog manifests exercised in isolated test app; production progress is not written','Cached snapshot used unless MOHOC_TEST_EMAIL and MOHOC_TEST_PASSWORD refresh it'],reportDir},null,2));
say(`\n${failed?'FAIL':'PASS'} - ANDROID USER UI\nLog: ${path.join(reportDir,'run.log')}\nScreenshots: ${reportDir}`);
await new Promise(resolve=>log.end(resolve));process.exitCode=failed?1:0;
