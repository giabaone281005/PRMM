import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const fixtures=JSON.parse(readFileSync('contracts/generated/engine-six-checkpoints.json','utf8')) as any[];

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>{
  (window as any).bridgeMessages=[];
  (window as any).LessonChannel={postMessage:(raw:string)=>(window as any).bridgeMessages.push(JSON.parse(raw))};
 });
 await page.goto('/apps/mobile/assets/runtime/index.html');
 await expect.poll(()=>page.evaluate(()=>(window as any).bridgeMessages.some((m:any)=>m.type==='READY'))).toBe(true);
});

test('invalid INIT reports its session so Flutter can show retry instead of a blank view',async({page})=>{
 await page.evaluate(()=>window.lessonBridge(JSON.stringify({protocolVersion:'1.0.0',sessionId:'invalid-init',requestId:'init-1',type:'INIT',payload:{manifest:{}}})));
 await expect.poll(()=>page.evaluate(()=>(window as any).bridgeMessages.filter((m:any)=>m.type==='RENDER_ERROR')))
  .toEqual([expect.objectContaining({sessionId:'invalid-init',requestId:'init-1',payload:{message:'Invalid manifest'}})]);
});

test('runtime errors reach the active session and a fresh WebView can initialize again',async({page})=>{
 const lesson=fixtures.find(l=>l.recognition[0].uime.kind==='EVENT_CARD_BUCKET')!;
 const init=()=>page.evaluate(manifest=>window.lessonBridge(JSON.stringify({protocolVersion:'1.0.0',sessionId:'loaded',requestId:'init-2',type:'INIT',payload:{manifest}})),lesson);
 await init();await expect(page.locator('.uime-scene')).toBeVisible();
 await page.evaluate(()=>window.dispatchEvent(new ErrorEvent('error',{message:'simulated script failure'})));
 await expect.poll(()=>page.evaluate(()=>(window as any).bridgeMessages.some((m:any)=>m.type==='RENDER_ERROR'&&m.sessionId==='loaded'))).toBe(true);
 await page.reload();await init();await expect(page.locator('.uime-scene')).toBeVisible();
});
