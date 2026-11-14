import {test,expect,type Page} from '@playwright/test';
import * as THREE from 'three';
import {readFileSync} from 'node:fs';
const fixtures=JSON.parse(readFileSync('contracts/generated/cylinder-recognition.json','utf8')) as any[];
import {cylinderCamera,cylinderVisual,disposeCylinder} from '../../src/cylinder-visual';
const evidence='../docs/qa/cp04-20261113';
async function snapshot(page:Page){
 const id='snapshot-'+Date.now();await page.evaluate(requestId=>window.lessonBridge(JSON.stringify({protocolVersion:'1.0.0',sessionId:'cp04',requestId,type:'REQUEST_SNAPSHOT',payload:{}})),id);
 return page.evaluate(requestId=>(window as any).messages.findLast((m:any)=>m.type==='SNAPSHOT'&&m.requestId===requestId).payload.snapshot,id);
}
async function advance(page:Page,id:string){await page.evaluate(checkpointId=>window.lessonBridge(JSON.stringify({protocolVersion:'1.0.0',sessionId:'cp04',requestId:crypto.randomUUID(),type:'SET_CHECKPOINT',payload:{checkpointId}})),id);}
for(const fallback of [false,true])for(const [index,f] of fixtures.entries())test(`${fallback?'fallback':'WebGL'} cylinder ${index+1} six steps`,async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.addInitScript(force=>{
   (window as any).messages=[];(window as any).LessonChannel={postMessage:(s:string)=>(window as any).messages.push(JSON.parse(s))};
   if(force){const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,kind:any,...args:any[]){return kind==='webgl'||kind==='webgl2'||kind==='experimental-webgl'?null:(get as any).call(this,kind,...args); } as any;}
 },fallback);
 await page.goto('/apps/mobile/assets/runtime/index.html');
 await expect.poll(()=>page.evaluate(()=>(window as any).messages.some((m:any)=>m.type==='READY'))).toBe(true);
 await page.evaluate(manifest=>window.lessonBridge(JSON.stringify({protocolVersion:'1.0.0',sessionId:'cp04',requestId:'init',type:'INIT',payload:{manifest}})),f.manifest);
 const scene=page.locator('.cylinder-scene');await expect(scene).toHaveAttribute('data-renderer',fallback?'fallback':'webgl');
 const canvas=await page.locator('.cylinder-canvas canvas').count()?await page.locator('.cylinder-canvas canvas').elementHandle():null;
 for(let i=0;i<6;i++) {
   expect((await snapshot(page)).metrics.modelError).not.toBe(0);
   if(i===0){const slider=page.getByRole('slider',{name:'Xoay ngang',exact:true});await slider.focus();await slider.press('End');}
   else if(i===2){await page.getByRole('slider',{name:'Thay đổi bán kính',exact:true}).focus();await page.getByRole('slider',{name:'Thay đổi bán kính',exact:true}).press('End');await page.getByRole('button',{name:'Bộ phận C',exact:true}).click();await page.getByRole('button',{name:'Bộ phận D',exact:true}).click();}
   else {
     await page.getByRole('button',{name:'Bộ phận '+(i===3?'A':'B'),exact:true}).click();expect((await snapshot(page)).metrics.modelError).not.toBe(0);
     const target=i===3?1:i===5?4:0;
     if(!fallback&&target<2){
       const s=await snapshot(page),rig=cylinderVisual(f.manifest.recognition[i].uime.cylinder as any,Number(s.state.width)),camera=cylinderCamera();rig.group.rotation.set(s.state.b,s.state.a,0);rig.group.updateMatrixWorld(true);
       const p=rig.parts.find(m=>m.userData.part===target)!.getWorldPosition(new THREE.Vector3()).project(camera),r=await page.locator('.cylinder-canvas canvas').boundingBox();
       await page.mouse.click(r!.x+(p.x+1)*r!.width/2,r!.y+(1-p.y)*r!.height/2);disposeCylinder(rig.group);
     }else if(fallback&&target===4){const path=page.locator('svg path[data-part="4"]').last();await path.dispatchEvent('click');}
     else await page.getByRole('button',{name:'Bộ phận '+'ABCDE'[target],exact:true}).click();
   }
   await expect.poll(async()=>(await snapshot(page)).metrics.modelError).toBe(0);
   if(i===4){await expect(scene).toHaveAttribute('data-radius',String(f.input.variants.practice.radius));await expect(page.locator('.cylinder-measures')).toContainText(f.input.parameters.unit);}
   if(i===5)await expect(page.locator('.uime-scene')).toContainText('Mặt bên là mặt cong');
   if(index===0||i===4)await page.screenshot({path:`${evidence}/${fallback?'fallback':'webgl'}-${index+1}-cp${i+1}.png`,fullPage:true});
   if(i<5){const ids=['explore','identify','discover','guided','practice','assessment'];await advance(page,ids[i+1]);await expect.poll(async()=>(await snapshot(page)).checkpoint).toBe(i+1);}
   if(canvas)expect(await canvas.evaluate(el=>el===document.querySelector('.cylinder-canvas canvas'))).toBe(true);
 }
 expect(await page.evaluate(()=>(window as any).messages.filter((m:any)=>m.type==='RENDER_ERROR'))).toEqual([]);
});
