import {test,expect} from '@playwright/test';
import {engineTopics} from '../../packages/lesson-authoring/uime-bank';
for(const topic of engineTopics)test('six checkpoints, rendered model and publication '+topic.id,async({page,request})=>{
 test.setTimeout(90000);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/admin/engines');await page.locator('article').filter({has:page.getByRole('heading',{name:topic.title,exact:true})}).getByRole('button',{name:'Tạo bài từ mẫu',exact:true}).click();
 await page.getByRole('button',{name:'▯ Xem trước',exact:true}).click();
 const dialog=page.getByRole('dialog'),scene=dialog.locator('.uime-scene');await dialog.locator('.scene-wrap').evaluate(el=>el.setAttribute('data-persistent','yes'));
 for(let step=0;step<6;step++){
  const u=topic.tasks[step].uime!,next=dialog.getByRole('button',{name:step===5?/^Hoàn thành bài học/:/^Tiếp tục/});await expect(next).toBeDisabled();await expect(scene).toHaveAttribute('data-engine',u.kind);
  if(['TOKEN_CLASSIFIER','EVENT_CARD_BUCKET'].includes(u.kind)){for(let i=0;i<u.tokens.length;i++){await scene.locator('.recognition-choices button').nth(i).click();await scene.getByRole('button',{name:'Ô '+u.labels[u.answers[i]],exact:true}).click();}}
  else if(u.kind==='FORMULA_SNAP_BUILDER'){for(let i=0;i<u.answers.length;i++){await scene.locator('.recognition-choices button').nth(u.answers[i]).click();await scene.getByRole('button',{name:'Ô '+u.labels[i],exact:true}).click();}}
  else if(u.kind==='3D_SOLID_INSPECTOR'){
   const canvas=scene.locator('canvas');await expect(canvas).toBeVisible();expect(await canvas.evaluate((c:any)=>!!c.getContext('webgl2'))).toBe(true);
   await scene.getByRole('slider',{name:'Góc xoay 3D'}).fill('.5');await scene.getByRole('button',{name:u.tokens[u.answers[0]],exact:true}).click();
   if(step===0)await page.screenshot({path:`../docs/qa/engine-${topic.id}-3d.png`});
  }else if(u.kind==='NUMBER_LINE_SELECTOR'){await scene.getByRole('slider',{name:'Tham số động'}).fill(String(u.answers[0]));await scene.getByRole('button',{name:u.answers[1]===0?'Trái':'Phải',exact:true}).click();await scene.getByRole('button',{name:u.answers[2]===0?'Mở':'Kín',exact:true}).click();}
  else if(u.kind==='PARABOLA_SLIDER')await scene.getByRole('slider').fill(String(u.answers[0]));
  else if(u.kind==='GEOMETRIC_HOTSPOT_FINDER'){await scene.getByRole('slider').fill(String(u.answers[0]));await scene.getByRole('button',{name:u.tokens[u.answers[1]],exact:true}).first().click();}
  else await scene.getByRole('button',{name:u.tokens[u.answers[0]],exact:true}).first().click();
  await expect(next).toBeEnabled();await next.click();await expect(dialog.locator('.scene-wrap')).toHaveAttribute('data-persistent','yes');
 }
 await expect(dialog.getByText('Bạn đã tự mình khám phá!',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Đóng ✕'}).click();await page.getByRole('button',{name:'Xuất bản ↗',exact:true}).click();await expect(page.getByRole('status')).toContainText('Đã xuất bản');
 const data=await(await request.get('/api/catalog')).json();expect(data.some((l:any)=>l.title===topic.title&&l.checkpoints.length===6)).toBe(true);expect(errors).toEqual([]);
});
