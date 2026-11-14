import {test,expect} from '@playwright/test';
import catalog from '../fixtures/published-catalog.snapshot.json' with {type:'json'};

test('Geometry preserves typed decimal input through re-renders and commits it on confirmation',async({page})=>{
  const manifest=catalog.lessons.find(l=>(l.recognition[0].uime as any).geometry)!;
  await page.addInitScript(()=>{
    (window as any).messages=[];
    (window as any).LessonChannel={postMessage:(raw:string)=>(window as any).messages.push(JSON.parse(raw))};
  });
  await page.goto('/apps/mobile/assets/runtime/index.html');
  await expect.poll(()=>page.evaluate(()=>(window as any).messages.some((m:any)=>m.type==='READY'))).toBe(true);
  await page.evaluate(lesson=>window.lessonBridge(JSON.stringify({protocolVersion:'1.0.0',sessionId:'decimal-input',requestId:'init',type:'INIT',payload:{manifest:lesson}})),manifest);
  await expect(page.locator('.geometry-canvas')).toBeVisible();
  const canvas=await page.locator('.geometry-canvas').elementHandle();
  await page.getByRole('slider',{name:'Góc xoay hình',exact:true}).focus();
  await page.getByRole('slider',{name:'Góc xoay hình',exact:true}).press('End');
  await page.evaluate(id=>window.lessonBridge(JSON.stringify({protocolVersion:'1.0.0',sessionId:'decimal-input',requestId:'identify',type:'SET_CHECKPOINT',payload:{checkpointId:id}})),manifest.checkpoints[1].id);
  await expect(page.locator('.geometry-scene')).toHaveAttribute('data-task','identify');
  await page.getByRole('button',{name:'Cạnh AC',exact:true}).click();
  await page.evaluate(id=>window.lessonBridge(JSON.stringify({protocolVersion:'1.0.0',sessionId:'decimal-input',requestId:'discover',type:'SET_CHECKPOINT',payload:{checkpointId:id}})),manifest.checkpoints[2].id);
  await expect(page.locator('.geometry-scene')).toHaveAttribute('data-task','discover');
  const answer=page.getByRole('spinbutton',{name:'Kết quả hình học',exact:true});
  await answer.pressSequentially('0.8',{delay:150});
  await expect(answer).toHaveValue('0.8');
  await page.getByRole('button',{name:'Xác nhận hình học',exact:true}).click();
  await page.evaluate(()=>window.lessonBridge(JSON.stringify({protocolVersion:'1.0.0',sessionId:'decimal-input',requestId:'snapshot',type:'REQUEST_SNAPSHOT',payload:{}})));
  const snapshot=await page.evaluate(()=>(window as any).messages.findLast((m:any)=>m.type==='SNAPSHOT').payload.snapshot);
  expect(snapshot.state.numerator).toBeCloseTo(.8,7);
  expect(snapshot.metrics.modelError).toBe(0);
  expect(await canvas!.evaluate(el=>el===document.querySelector('.geometry-canvas'))).toBe(true);
});
