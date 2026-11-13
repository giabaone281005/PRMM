import {test,expect} from '@playwright/test';
import {engineTopics} from '../../packages/lesson-authoring/uime-bank';
test('SVG upload stays inert and six checkpoint editor preserves scene',async({page})=>{
 await page.goto('/admin/engines');const topic=engineTopics.find(t=>t.id==='engine-coefficient')!;await page.locator('article').filter({has:page.getByRole('heading',{name:topic.title,exact:true})}).getByRole('button',{name:'Tạo bài từ mẫu'}).click();
 await page.getByLabel('Nạp hình SVG').setInputFiles({name:'drawing.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 240"><script>alert(1)</script><rect x="10" y="10" width="300" height="200" fill="white" onclick="alert(1)"/><image href="https://example.invalid/tracker"/></svg>')});
 expect(await page.getByLabel('Cấu hình engine JSON').inputValue()).not.toMatch(/script|onclick|tracker/);
 await page.getByRole('button',{name:'▯ Xem trước',exact:true}).click();const dialog=page.getByRole('dialog');await dialog.locator('.scene-wrap').evaluate(el=>el.setAttribute('data-persistent','yes'));
 for(let i=0;i<6;i++){const u=topic.tasks[i].uime!;await dialog.locator('.uime-scene').getByRole('button',{name:u.tokens[u.answers[0]],exact:true}).first().click();await dialog.getByRole('button',{name:i===5?/^Hoàn thành bài học/:/^Tiếp tục/}).click();await expect(dialog.locator('.scene-wrap')).toHaveAttribute('data-persistent','yes');}
 await expect(dialog.getByText('Bạn đã tự mình khám phá!',{exact:true})).toBeVisible();
});
