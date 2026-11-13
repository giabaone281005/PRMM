import {test,expect} from '@playwright/test';
import * as THREE from 'three';
import {engineTopics} from '../../packages/lesson-authoring/uime-bank';
for(const topic of engineTopics)test('U-IME real gestures and publication '+topic.id,async({page,request})=>{
 await page.goto('/admin/studio');await page.getByLabel('Chủ đề Toán 9').selectOption(topic.id);await page.getByRole('button',{name:'Dựng bài Toán 9',exact:true}).click();await page.getByRole('button',{name:'Preview điện thoại',exact:true}).click();
 const dialog=page.getByRole('dialog'),u=topic.tasks[0].uime!,scene=dialog.locator('.uime-scene'),next=dialog.getByRole('button',{name:/^Hoàn thành bài học/});await expect(next).toBeDisabled();
 if(['TOKEN_CLASSIFIER','EVENT_CARD_BUCKET'].includes(u.kind)){for(let i=0;i<u.tokens.length;i++)await scene.locator('.recognition-choices button').nth(i).dragTo(scene.getByRole('button',{name:'Ô '+u.labels[u.answers[i]],exact:true}));}
 else if(u.kind==='FORMULA_SNAP_BUILDER'){for(let i=0;i<u.answers.length;i++)await scene.locator('.recognition-choices button').nth(u.answers[i]).dragTo(scene.getByRole('button',{name:'Ô '+u.labels[i],exact:true}));}
 else if(u.kind==='3D_SOLID_INSPECTOR'){
  const canvas=scene.locator('canvas');await expect(canvas).toBeVisible();expect(await canvas.evaluate((c:any)=>!!(c.getContext('webgl2')||c.getContext('webgl')))).toBe(true);
  const r=(await canvas.boundingBox())!;await page.mouse.move(r.x+r.width*.5,r.y+130);await page.mouse.down();await page.mouse.move(r.x+r.width*.7,r.y+130,{steps:8});await page.mouse.up();await scene.getByRole('slider',{name:'Góc xoay 3D'}).fill('.5');
  const camera=new THREE.PerspectiveCamera(42,r.width/300,.1,100);camera.position.set(4,3,6);camera.lookAt(0,0,0);camera.updateMatrixWorld();const point=new THREE.Vector3(.7,u.solid==='sphere'?0:-1.5,0).applyEuler(new THREE.Euler(0,.5,0)).project(camera);
  await page.mouse.click(r.x+(point.x+1)*r.width/2,r.y+(1-point.y)*300/2);
 }
 else if(u.kind==='NUMBER_LINE_SELECTOR'){const r=(await scene.locator('svg').boundingBox())!;await page.mouse.click(r.x+r.width*222/360,r.y+r.height*125/240);await scene.getByRole('button',{name:'Phải',exact:true}).click();await scene.getByRole('button',{name:'Kín',exact:true}).click();}
 else if(u.kind==='PARABOLA_SLIDER')await scene.getByRole('slider').fill('-2');
 else if(u.kind==='GEOMETRIC_HOTSPOT_FINDER'){await scene.getByRole('slider').fill('3');await scene.getByRole('button',{name:'H',exact:true}).click();}
 else if(u.hotspots.length)await scene.getByRole('button',{name:u.tokens[u.answers[0]],exact:true}).first().click();
 else await scene.getByRole('button',{name:u.tokens[u.answers[0]],exact:true}).click();
 await expect(next).toBeEnabled();await page.screenshot({path:`../docs/qa/uime-${topic.id}.png`});await next.click();await expect(dialog.getByText('Bạn đã tự mình khám phá!',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Đóng ✕'}).click();await page.getByRole('button',{name:'Tạo & xuất bản lên app',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'Đã xuất bản lên app'})).toBeVisible();const data=await(await request.get('/api/catalog')).json();expect(data.some((l:any)=>l.recognition?.[0]?.uime?.kind===u.kind)).toBe(true);
});
