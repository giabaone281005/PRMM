import {test,expect,type Page} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {graphClass,graphTargets,graphProject} from '../../packages/lesson-runtime/cartesian';
const fixtures=JSON.parse(readFileSync('contracts/generated/cartesian.json','utf8')) as any[];
async function snapshot(page:Page){const id=crypto.randomUUID();await page.evaluate(requestId=>window.lessonBridge(JSON.stringify({protocolVersion:'1.0.0',sessionId:'eng01',requestId,type:'REQUEST_SNAPSHOT',payload:{}})),id);return page.evaluate(requestId=>(window as any).messages.findLast((m:any)=>m.type==='SNAPSHOT'&&m.requestId===requestId).payload.snapshot,id);}
for(const [index,f] of fixtures.entries())test(`Cartesian browser full six steps ${index+1}`,async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.addInitScript(()=>{(window as any).messages=[];(window as any).LessonChannel={postMessage:(raw:string)=>(window as any).messages.push(JSON.parse(raw))};});
 await page.goto('/apps/mobile/assets/runtime/index.html');await expect.poll(()=>page.evaluate(()=>(window as any).messages.some((m:any)=>m.type==='READY'))).toBe(true);
 await page.evaluate(manifest=>window.lessonBridge(JSON.stringify({protocolVersion:'1.0.0',sessionId:'eng01',requestId:'init',type:'INIT',payload:{manifest}})),f.manifest);
 await expect(page.locator('.cartesian-scene')).toBeVisible();const root=await page.locator('.cartesian-canvas').elementHandle();
 for(let i=0;i<6;i++){
  const g=f.manifest.recognition[i].uime.graph;expect((await snapshot(page)).metrics.modelError).toBe(1);
  if(g.task==='explore'){await page.getByRole('spinbutton',{name:'Hoành độ ghim',exact:true}).fill('1');}
  else if(g.task==='identify'&&g.mode!=='linear_relation'){await page.getByRole('button',{name:'Chạm G · nét liền',exact:true}).click();expect((await snapshot(page)).metrics.modelError).toBe(1);await page.getByRole('button',{name:'Chạm H · nét đứt',exact:true}).click();}
  else{
   if(g.mode!=='linear_relation')await page.getByRole('combobox',{name:'Số nghiệm hoặc giao điểm',exact:true}).selectOption(String(graphClass(g)));
   if(g.task!=='discover'||g.mode==='linear_relation')for(const [j,p] of graphTargets(g).entries()){
    if(g.mode==='line_parabola_intersection')await page.getByRole('button',{name:j?'Kéo ghim P₂':'Kéo ghim P₁',exact:true}).click();
    // Exercise actual SVG drag using the same mathematical projection as the graph.
    const state=(await snapshot(page)).state,from=graphProject(g,g.mode,{x:state[j?'width':'x'],y:state[j?'height':'y']}),to=graphProject(g,g.mode,p),box=await page.locator('.cartesian-canvas').boundingBox();
    await page.mouse.move(box!.x+from[0]/360*box!.width,box!.y+from[1]/340*box!.height);await page.mouse.down();await page.mouse.move(box!.x+to[0]/360*box!.width,box!.y+to[1]/340*box!.height,{steps:8});await page.mouse.up();
    // Exact numeric control is also available for free-grid/noninteger targets.
    await page.getByRole('spinbutton',{name:'Hoành độ ghim',exact:true}).fill(String(p.x));await page.getByRole('spinbutton',{name:'Tung độ ghim',exact:true}).fill(String(p.y));
   }
   await page.getByRole('button',{name:'Xác nhận ghim / kết luận',exact:true}).click();
  }
  await expect.poll(async()=>(await snapshot(page)).metrics.modelError).toBe(0);
  if(i===5||i===3)await page.screenshot({path:`../docs/qa/eng01-20261114/graph-${index+1}-cp${i+1}.png`,fullPage:true});
  if(i<5){const id=f.manifest.checkpoints[i+1].id;await page.evaluate(checkpointId=>window.lessonBridge(JSON.stringify({protocolVersion:'1.0.0',sessionId:'eng01',requestId:crypto.randomUUID(),type:'SET_CHECKPOINT',payload:{checkpointId}})),id);await expect.poll(async()=>(await snapshot(page)).checkpoint).toBe(i+1);}
  expect(await root!.evaluate(el=>el===document.querySelector('.cartesian-canvas'))).toBe(true);
 }
 expect(await page.evaluate(()=>(window as any).messages.filter((m:any)=>m.type==='RENDER_ERROR'))).toEqual([]);
});
