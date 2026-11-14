// Local Android test helper. Inputs are ADB taps/swipes, never DOM-dispatched answers.
import {createServer} from 'node:http';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {appendFileSync,writeFileSync,mkdirSync} from 'node:fs';
const exec=promisify(execFile),evidence='../docs/qa/cp04-20261113';mkdirSync(evidence,{recursive:true});
async function adb(...args){appendFileSync(evidence+'/android-input.jsonl',JSON.stringify({at:new Date().toISOString(),args})+'\n');return exec('adb',['-s','emulator-5554',...args],{maxBuffer:12000000});}
const server=createServer(async(req,res)=>{
 try{
  let raw='';for await(const chunk of req)raw+=chunk;if(raw.length>20000)throw Error('Request too large');
  const body=JSON.parse(raw),{action,rect,dpr}=body;
  if(req.method!=='POST')throw Error('POST required');
  if(action==='shot'){
   if(!/^[a-z0-9-]+$/.test(body.name))throw Error('Invalid name');
   const r=await exec('adb',['-s','emulator-5554','exec-out','screencap','-p'],{encoding:'buffer',maxBuffer:12000000});writeFileSync(`${evidence}/${body.name}.png`,r.stdout);
  }else{
   if(!rect||![rect.x,rect.y,rect.w,rect.h,dpr].every(Number.isFinite)||rect.w<=0||rect.h<=0)throw Error('Invalid rect');
   const x=Math.round((rect.x+rect.w/2)*dpr),y=Math.round((rect.y+rect.h/2)*dpr);
   if(action==='orbit')await adb('shell','input','swipe',String(x-90),String(y),String(x+90),String(y),'450');
   else if(action==='tap')await adb('shell','input','tap',String(x),String(y));
   else if(action==='scale')await adb('shell','input','tap',String(Math.round((rect.x+rect.w*.85)*dpr)),String(y));
   else throw Error('Unknown action');
  }
  res.writeHead(200,{'Content-Type':'application/json'});res.end('{"ok":true}');
 }catch(error){res.writeHead(400);res.end(JSON.stringify({error:error.message}));}
});
server.listen(5199,'127.0.0.1',()=>console.log('CP-04 local ADB test helper listening on 5199. No database/account access.'));
