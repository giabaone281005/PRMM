import {test,expect,type Page} from '@playwright/test';
import fixtures from '../../contracts/generated/algebra.json' with {type:'json'};
import {algebraCards,algebraModel,algebraRootInputs,algebraDomainPool,algebraDomainMask,algebraSlotTargets,type AlgebraConfig} from '../../packages/lesson-runtime/algebra';
async function snapshot(page:Page){const id=crypto.randomUUID();await page.evaluate(requestId=>window.lessonBridge(JSON.stringify({protocolVersion:'1.0.0',sessionId:'eng03',requestId,type:'REQUEST_SNAPSHOT',payload:{}})),id);return page.evaluate(requestId=>(window as any).messages.findLast((m:any)=>m.type==='SNAPSHOT'&&m.requestId===requestId).payload.snapshot,id);}
for(const [index,f] of fixtures.entries())test(`Algebra six steps ${f.manifest.lessonId}`,async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.addInitScript(()=>{(window as any).messages=[];(window as any).LessonChannel={postMessage:(raw:string)=>(window as any).messages.push(JSON.parse(raw))};});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/apps/mobile/assets/runtime/index.html');await expect.poll(()=>page.evaluate(()=>(window as any).messages.some((m:any)=>m.type==='READY'))).toBe(true);await page.evaluate(manifest=>window.lessonBridge(JSON.stringify({protocolVersion:'1.0.0',sessionId:'eng03',requestId:'init',type:'INIT',payload:{manifest}})),f.manifest);await expect(page.locator('.algebra-scene')).toBeVisible();const root=await page.locator('.algebra-scene').elementHandle(),graph=await page.locator('.algebra-graph').elementHandle();
 for(let i=0;i<6;i++){
  const g=f.manifest.recognition[i].uime.algebra as unknown as AlgebraConfig,m=algebraModel(g);expect((await snapshot(page)).metrics.modelError).toBe(1);
  if(i===0){await page.getByRole('spinbutton',{name:'Giá trị thử x',exact:true}).fill('1');await page.getByText('Quan sát phương trình bằng đồ thị',{exact:true}).click();await expect(page.locator('.algebra-graph')).toBeVisible();}
  else{
   if(g.mode==='rational_equation'){
    const mask=algebraDomainMask(g);for(let j=0;j<algebraDomainPool(g).length;j++)if(mask&(1<<j))await page.locator(`[data-domain-index="${j}"]`).check();await page.getByRole('button',{name:'Chốt điều kiện xác định',exact:true}).click();
   }else if(i!==2||g.mode==='viete'){
    const targets=algebraSlotTargets(g),cards=algebraCards(g),slots=page.locator('[data-algebra-slot]');
    for(const [j,target] of targets.entries()){
     const card=page.locator(`[data-card-id="${cards[target].id}"]`),slot=slots.nth(j);
     if(index===0&&i===1&&j===0){await card.dragTo(slot);expect((await snapshot(page)).state.a).toBe(target);}
     else{await card.click();await slot.click();}
    }
   }
   if(i!==1){
    if(g.mode==='quadratic_equation'){await page.getByRole('combobox',{name:'Bậc phương trình',exact:true}).selectOption(String(m.degree));if(m.degree===2)await page.getByRole('spinbutton',{name:'Δ · chỉ nhập khi bậc hai',exact:true}).fill(String(m.delta));}
    if(g.mode==='viete'){await page.getByRole('spinbutton',{name:'Giá trị tổng hai nghiệm',exact:true}).fill(String(m.sum));await page.getByRole('spinbutton',{name:'Giá trị tích hai nghiệm',exact:true}).fill(String(m.product));}
    if(i!==2||['product_equation','rational_equation'].includes(g.mode)){const operations=page.getByRole('combobox',{name:'Phép biến đổi đại số',exact:true});await expect(operations.locator('option[value="4"]')).toBeDisabled();await operations.selectOption(String(g.mode==='product_equation'?1:g.mode==='rational_equation'?0:m.a!==0?2:5));}
    if(i!==2||g.mode==='quadratic_equation')await page.getByRole('combobox',{name:'Số nghiệm thực khác nhau',exact:true}).selectOption(String(m.count));
    if(i>=3){expect(await page.getByRole('spinbutton',{name:'Nghiệm thứ nhất',exact:true}).inputValue()).toBe('');expect(await page.getByRole('spinbutton',{name:'Nghiệm thứ hai',exact:true}).inputValue()).toBe('');for(const [j,value] of algebraRootInputs(g).entries())await page.getByRole('spinbutton',{name:j?'Nghiệm thứ hai':'Nghiệm thứ nhất',exact:true}).fill(String(value));}
    await page.getByRole('button',{name:'Xác nhận đại số',exact:true}).click();
   }
  }
  await expect.poll(async()=>(await snapshot(page)).metrics.modelError).toBe(0);expect(await root!.evaluate(el=>el===document.querySelector('.algebra-scene'))).toBe(true);expect(await graph!.evaluate(el=>el===document.querySelector('.algebra-graph'))).toBe(true);
  if(i===3&&index%3===0)await page.screenshot({path:`../docs/qa/eng03-20261114/${f.manifest.lessonId}.png`,fullPage:true});
  if(i<5)await page.evaluate(checkpointId=>window.lessonBridge(JSON.stringify({protocolVersion:'1.0.0',sessionId:'eng03',requestId:crypto.randomUUID(),type:'SET_CHECKPOINT',payload:{checkpointId}})),f.manifest.checkpoints[i+1].id);
 }
 expect(errors).toEqual([]);expect(await page.evaluate(()=>(window as any).messages.filter((m:any)=>m.type==='RENDER_ERROR'))).toEqual([]);
});
