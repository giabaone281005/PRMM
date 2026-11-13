import {test,expect} from '@playwright/test';

test('fresh workspace stays empty and ignores legacy browser sample catalog',async({page,request})=>{
  expect(await (await request.get('/api/catalog')).json()).toEqual([]);
  await page.addInitScript(()=>localStorage.setItem('mohoc-cms-v1',JSON.stringify([{id:'legacy-sample',draft:{title:'Bài mẫu cũ'},versions:[],publishedVersion:1}])));
  await page.goto('/');
  await expect(page.locator('.empty')).toContainText('Chưa có bài đã xuất bản');
  await expect(page.locator('.course-card')).toHaveCount(0);
  await expect(page.locator('.featured')).toHaveCount(0);
  await page.screenshot({path:'../docs/qa/empty-catalog.png',fullPage:true});
  await page.goto('/admin/lessons');
  await expect(page.locator('tr[data-grade]')).toHaveCount(0);
  await page.reload();
  expect(await (await request.get('/api/admin/lessons')).json()).toEqual([]);
});
