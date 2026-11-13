import {test,expect} from '@playwright/test';
import {math9Topics,buildRecognition} from '../../packages/lesson-authoring/math9';
test('Toán 9: all topics build, interact, publish and survive reload',async({page,request})=>{
 test.setTimeout(90000);
 await page.goto('/admin/studio');
 for(const topic of math9Topics){
  await page.getByLabel('Chủ đề Toán 9',{exact:true}).selectOption(topic.id);
  await page.getByRole('button',{name:'Dựng bài Toán 9',exact:true}).click();
  await page.getByRole('button',{name:'Preview điện thoại',exact:true}).click();
  const dialog=page.getByRole('dialog'),lesson=buildRecognition(topic,'test-'+topic.id);
  for(const t of lesson.recognition!){
   const action=dialog.getByRole('button',{name:/^(Tiếp tục|Hoàn thành bài học)/});await expect(action).toBeDisabled();
   await dialog.getByRole('button',{name:t.choices[t.correct===1?1:0],exact:true}).click();await expect(action).toBeDisabled();
   await dialog.getByRole('button',{name:t.choices[t.correct-1],exact:true}).click();await expect(action).toBeEnabled();await action.click();
  }
  await expect(dialog.getByRole('heading',{name:'Bạn đã tự mình khám phá!'})).toBeVisible();
  await page.getByRole('button',{name:'Đóng ✕'}).click();
  await page.getByRole('button',{name:'Tạo & xuất bản lên app',exact:true}).click();
  await expect(page.getByRole('status').filter({hasText:'Đã xuất bản lên app'})).toBeVisible();
 }
 const data=await(await request.get('/api/catalog')).json();expect(data.filter((l:any)=>l.recognition).length).toBeGreaterThanOrEqual(10);
 await page.screenshot({path:'../docs/qa/math9-studio.png',fullPage:true});
});
