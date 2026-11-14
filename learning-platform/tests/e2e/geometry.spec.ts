import {test,expect,type Page} from '@playwright/test';
import fixtures from '../../contracts/generated/geometry.json' with {type:'json'};
import {geometryModel,geometrySelectable,geometryTargetIndex,geometryProject,type GeometryConfig} from '../../packages/lesson-runtime/geometry';
async function snapshot(page:Page){const id=crypto.randomUUID();await page.evaluate(requestId=>window.lessonBridge(JSON.stringify({protocolVersion:'1.0.0',sessionId:'eng02',requestId,type:'REQUEST_SNAPSHOT',payload:{}})),id);return page.evaluate(requestId=>(window as any).messages.findLast((m:any)=>m.type==='SNAPSHOT'&&m.requestId===requestId).payload.snapshot,id);}
async function range(page:Page,label:string,value:number){await page.getByRole('slider',{name:label,exact:true}).evaluate((el,value)=>{const input=el as HTMLInputElement;Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input,String(value));input.dispatchEvent(new Event('input',{bubbles:true}));},value);}
for(const [index,f] of fixtures.entries())test(`Geometry six steps ${f.manifest.lessonId}`,async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.addInitScript(()=>{(window as any).messages=[];(window as any).LessonChannel={postMessage:(raw:string)=>(window as any).messages.push(JSON.parse(raw))};});
 await page.goto('/apps/mobile/assets/runtime/index.html');await expect.poll(()=>page.evaluate(()=>(window as any).messages.some((m:any)=>m.type==='READY'))).toBe(true);
 await page.evaluate(manifest=>window.lessonBridge(JSON.stringify({protocolVersion:'1.0.0',sessionId:'eng02',requestId:'init',type:'INIT',payload:{manifest}})),f.manifest);await expect(page.locator('.geometry-scene')).toBeVisible();const root=await page.locator('.geometry-canvas').elementHandle();
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(let i=0;i<6;i++){
  const g=f.manifest.recognition[i].uime.geometry as unknown as GeometryConfig,m=geometryModel(g);expect((await snapshot(page)).metrics.modelError).toBe(1);
  if(i===0){
   await page.locator('.geometry-canvas').scrollIntoViewIfNeeded();
   const state=(await snapshot(page)).state,model=geometryModel(g,state),handle=geometryProject(model,model.handle),box=(await page.locator('.geometry-canvas').boundingBox())!,angle=Math.atan2(model.handle.y,model.handle.x)+.35,r=Math.hypot(model.handle.x,model.handle.y),target=geometryProject(model,{x:r*Math.cos(angle),y:r*Math.sin(angle)});
   await page.mouse.move(box.x+handle[0]/360*box.width,box.y+handle[1]/360*box.height);await page.mouse.down();await page.mouse.move(box.x+target[0]/360*box.width,box.y+target[1]/360*box.height,{steps:8});await page.mouse.up();await expect.poll(async()=>(await snapshot(page)).metrics.modelError).toBe(0);
  }else{
   if(i!==2){
    await range(page,'Góc xoay hình',45);await range(page,'Thu phóng hình',.75);
    const o=geometrySelectable(g)[geometryTargetIndex(g)];if(o.layer){const layer=m.layers.find(l=>l.bit===o.layer)!;await page.getByRole('checkbox',{name:layer.label,exact:true}).check();}
    // Screen hit follows mathematical geometry after rotation and zoom.
    const state=(await snapshot(page)).state,model=geometryModel(g,state),target=[...model.objects,...model.layers.flatMap(l=>l.objects)].find(o=>o.id===m.targetId)!,C=target.points[0];
    let hit=C;
    if(target.kind==='segment'){const t=g.mode==='line_circle'?.12:.35;hit={x:C.x*(1-t)+target.points[1].x*t,y:C.y*(1-t)+target.points[1].y*t};}
    if(target.kind==='circle'){const a=1.1;hit={x:C.x+target.radius!*Math.cos(a),y:C.y+target.radius!*Math.sin(a)};}
    if(target.kind==='arc'||target.kind==='sector'){const a=(Number(state.x)+(target.id==='annulus'?220:Number(g.data.sweep)/2))*Math.PI/180,r=target.kind==='arc'?target.radius!:target.id==='annulus'?(target.radius!+Number(g.data.innerRadius))/2:target.radius!*.7;hit={x:C.x+r*Math.cos(a),y:C.y+r*Math.sin(a)};}
    if(target.kind==='polygon')hit={x:target.points.reduce((n,p)=>n+p.x,0)/target.points.length*.55+C.x*.45,y:target.points.reduce((n,p)=>n+p.y,0)/target.points.length*.55+C.y*.45};
    await page.locator('.geometry-canvas').scrollIntoViewIfNeeded();
    const pixel=geometryProject(model,hit,Number(state.y)),box=(await page.locator('.geometry-canvas').boundingBox())!;await page.mouse.click(box.x+pixel[0]/360*box.width,box.y+pixel[1]/360*box.height);
    expect((await snapshot(page)).state.b).toBe(geometryTargetIndex(g));
   }
   if(i!==1){await page.getByRole('spinbutton',{name:'Kết quả hình học',exact:true}).fill(String(m.value));await page.getByRole('button',{name:'Xác nhận hình học',exact:true}).click();}
  }
  await expect.poll(async()=>(await snapshot(page)).metrics.modelError).toBe(0);expect(await root!.evaluate(el=>el===document.querySelector('.geometry-canvas'))).toBe(true);
  if(i===3&&index%3===0)await page.screenshot({path:`../docs/qa/eng02-20261114/${f.manifest.lessonId}.png`,fullPage:true});
  if(i<5)await page.evaluate(checkpointId=>window.lessonBridge(JSON.stringify({protocolVersion:'1.0.0',sessionId:'eng02',requestId:crypto.randomUUID(),type:'SET_CHECKPOINT',payload:{checkpointId}})),f.manifest.checkpoints[i+1].id);
 }
 expect(errors).toEqual([]);expect(await page.evaluate(()=>(window as any).messages.filter((m:any)=>m.type==='RENDER_ERROR'))).toEqual([]);
});
