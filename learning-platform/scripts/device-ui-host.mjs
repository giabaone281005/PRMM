import {createServer} from 'node:http';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {appendFileSync,existsSync,readFileSync,writeFileSync} from 'node:fs';
import {randomUUID,createHash} from 'node:crypto';
import path from 'node:path';
const exec=promisify(execFile);

export async function loadUserCatalog(root,catalogPath){
  const email=process.env.MOHOC_TEST_EMAIL,password=process.env.MOHOC_TEST_PASSWORD;
  if(Boolean(email)!==Boolean(password))throw new Error('Set both MOHOC_TEST_EMAIL and MOHOC_TEST_PASSWORD to refresh the catalog.');
  if(email&&password){
    const config=JSON.parse(readFileSync(path.join(root,'.local/supabase.mobile.json'),'utf8'));
    const url=new URL(config.SUPABASE_URL),key=config.SUPABASE_PUBLISHABLE_KEY;
    if(url.protocol!=='https:'||!url.hostname.endsWith('.supabase.co'))throw new Error('Invalid Supabase project URL in mobile configuration.');
    const auth=await fetch(`${url.origin}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({email,password})});
    if(!auth.ok)throw new Error(`Catalog login failed (${auth.status}); credentials are not logged.`);
    const session=await auth.json();
    try{
      const response=await fetch(`${url.origin}/rest/v1/rpc/published_catalog`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json'},body:'{}'});
      if(!response.ok)throw new Error(`Published catalog read failed (${response.status}).`);
      const rows=await response.json();
      const snapshot={formatVersion:1,source:{kind:'published-catalog-live-readonly',projectId:url.hostname.split('.')[0],capturedAt:new Date().toISOString()},lessons:rows.map(row=>row.manifest??row)};
      writeFileSync(catalogPath,JSON.stringify(snapshot));
      return snapshot;
    }finally{
      // Revoke only this newly created session; do not sign out other devices.
      await fetch(`${url.origin}/auth/v1/logout?scope=local`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${session.access_token}`}}).catch(()=>{});
    }
  }
  const fallback=path.join(root,'tests/fixtures/published-catalog.snapshot.json');
  const source=!existsSync(catalogPath)&&catalogPath===path.join(root,'.local/ui-catalog.snapshot.json')?fallback:catalogPath;
  return JSON.parse(readFileSync(source,'utf8'));
}

export async function createDeviceUiHost({deviceId,reportDir,snapshot}){
  if(!/^[-a-zA-Z0-9._:]+$/.test(deviceId))throw new Error('Unsafe Android device ID.');
  if(!Array.isArray(snapshot.lessons)||snapshot.lessons.length===0)throw new Error('Catalog has no published lessons; refusing to report an empty suite as PASS.');
  const keys=new Set();
  for(const lesson of snapshot.lessons){const key=`${lesson.lessonId}:${lesson.version}`;if(keys.has(key)||!Array.isArray(lesson.checkpoints)||!lesson.checkpoints.length)throw new Error(`Invalid/duplicate catalog lesson ${key}`);keys.add(key);}
  const token=randomUUID(),events=[],actions=[];
  const inventory=snapshot.lessons.map(l=>({id:l.lessonId,version:l.version,title:l.title,checkpoints:l.checkpoints.length,sha256:createHash('sha256').update(JSON.stringify(l)).digest('hex')}));
  writeFileSync(path.join(reportDir,'catalog-inventory.json'),JSON.stringify({source:snapshot.source,lessons:inventory},null,2));
  writeFileSync(path.join(reportDir,'catalog.snapshot.json'),JSON.stringify(snapshot));
  const adb=(...args)=>exec('adb',['-s',deviceId,...args],{windowsHide:true,timeout:15000,maxBuffer:16000000});
  const server=createServer(async(req,res)=>{
    try{
      if(req.url!=='/api/progress'&&req.headers['x-ui-token']!==token){res.writeHead(403);res.end();return;}
      if(req.method==='GET'&&req.url==='/catalog'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify(snapshot));return;}
      let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>30000)throw new Error('Request too large');}
      const body=JSON.parse(raw||'{}');
      if(req.method!=='POST')throw new Error('POST required');
      if(req.url==='/api/progress'){
        if(!inventory.some(l=>l.id===body.lessonId))throw new Error('Unknown test lesson');
      }else if(req.url==='/event'){
        events.push({...body,at:new Date().toISOString()});
        writeFileSync(path.join(reportDir,'lesson-results.json'),JSON.stringify({source:snapshot.source,expected:inventory,events},null,2));
        console.log(`[USER CATALOG] ${body.status} ${body.lessonId??''} checkpoint ${body.checkpoint??''} ${body.message??''}`);
      }else if(req.url==='/capture'){
        if(!/^[a-zA-Z0-9_-]{1,150}$/.test(body.name))throw new Error('Invalid screenshot name');
        const result=await exec('adb',['-s',deviceId,'exec-out','screencap','-p'],{encoding:'buffer',windowsHide:true,timeout:30000,maxBuffer:16000000});
        writeFileSync(path.join(reportDir,`${body.name}.png`),result.stdout);
      }else if(req.url==='/touch'){
        const numbers=['x','y',...(body.kind==='swipe'?['x2','y2']:[])];
        if(numbers.some(k=>!Number.isFinite(body[k])||body[k]<0||body[k]>20000))throw new Error('Invalid coordinates');
        const x=String(Math.round(body.x)),y=String(Math.round(body.y));
        if(body.kind==='tap')await adb('shell','input','tap',x,y);
        else if(body.kind==='swipe')await adb('shell','input','swipe',x,y,String(Math.round(body.x2)),String(Math.round(body.y2)),'450');
        else if(body.kind==='text'){
          if(!/^-?\d+(\.\d+)?$/.test(body.text)||body.text.length>30)throw new Error('Only numeric test input is supported');
          await adb('shell','input','tap',x,y);
          const count=Number(body.clearLength??0);
          if(!Number.isInteger(count)||count<0||count>30)throw new Error('Invalid clear length');
          if(count){await adb('shell','input','keyevent','123');await adb('shell','input','keyevent',...Array(count).fill('67'));}
          await adb('shell','input','text',body.text);
          const keyboard=await adb('shell','dumpsys','input_method');
          if(/mInputShown=true|isInputViewShown\(\)=true|mIsInputViewShown=true|mImeWindowVis=0x3/.test(keyboard.stdout))await adb('shell','input','keyevent','4');
        }else throw new Error('Unsupported touch action');
        actions.push(body);
        appendFileSync(path.join(reportDir,'android-input.jsonl'),JSON.stringify({...body,at:new Date().toISOString()})+'\n');
      }else throw new Error('Unknown UI test endpoint');
      res.writeHead(200,{'Content-Type':'application/json'});res.end('{"ok":true}');
    }catch(error){res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({error:error.message}));}
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const port=server.address().port;
  try{await adb('reverse',`tcp:${port}`,`tcp:${port}`);}catch(error){await new Promise(resolve=>server.close(resolve));throw error;}
  return {port,token,inventory,events,actions,async close(){await adb('reverse','--remove',`tcp:${port}`).catch(()=>{});await new Promise(resolve=>server.close(resolve));}};
}
