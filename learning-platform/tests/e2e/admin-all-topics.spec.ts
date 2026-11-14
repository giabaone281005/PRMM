import {test,expect,type Page,type TestInfo} from '@playwright/test';
import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
type Topic={id:string;title:string;pilot?:boolean};
const inventory=JSON.parse(readFileSync(existsSync('.local/ui-test-inventory.json')?'.local/ui-test-inventory.json':new URL('../fixtures/admin-topic-inventory.json',import.meta.url),'utf8')) as {templates:{id:string;code:string}[];math9:Topic[];engines:Topic[];curriculum:Topic[]};
const templates=inventory.templates.map(t=>({templateId:t.id,curriculumCode:t.code})),legacy=[...inventory.math9,...inventory.engines];
const curriculum=inventory.curriculum,pilot=curriculum.filter(topic=>topic.pilot);
const reportDir=process.env.MOHOC_TEST_REPORT_DIR;
if(reportDir)writeFileSync(path.join(reportDir,'topic-inventory.json'),JSON.stringify({
  templates:templates.map(t=>({id:t.templateId,curriculumCode:t.curriculumCode})),
  legacy:legacy.map(t=>({id:t.id,title:t.title})),
  curriculum:curriculum.map(t=>({id:t.id,title:t.title,
    templateIds:templates.filter(a=>a.curriculumCode===t.id).map(a=>a.templateId),pilotAvailable:!!t.pilot})),
  note:'Curriculum cards without a working create button are checked as unavailable; this is not acceptance of all planned curriculum engine modes.',
},null,2));

async function verifyLibrary(page:Page,title:string,info:TestInfo){
  await page.getByRole('button',{name:'← Danh sách bài học',exact:true}).click();
  const row=page.getByRole('row').filter({has:page.getByRole('button',{name:title,exact:true})});
  await expect(row).toContainText('Đã xuất bản');
  await page.reload();
  await expect(row).toContainText('Đã xuất bản');
  await page.screenshot({path:info.outputPath('published-library.png'),fullPage:true});
}

test('Inventory: every creation dropdown and all 24 curriculum cards are accounted for',async({page})=>{
  await page.goto('/admin/lessons/new');
  await expect(page.getByLabel('Dạng bài authoring',{exact:true}).locator('option')).toHaveCount(templates.length);
  await page.getByText('Nâng cao · luồng legacy và dạng chưa có form template',{exact:true}).click();
  const options=await page.locator('.blueprint-studio').getByLabel('Chủ đề Toán 9',{exact:true}).locator('option').evaluateAll(nodes=>nodes.map(n=>(n as HTMLOptionElement).value).filter(Boolean));
  expect(options.sort()).toEqual(legacy.map(t=>t.id).sort());
  await page.goto('/admin/engines');
  for(const topic of curriculum){
    const card=page.locator('article').filter({has:page.getByText(topic.id,{exact:true})});
    await expect(card).toHaveCount(1);
    const create=card.getByRole('button',{name:'Dùng mẫu trong Studio',exact:true});
    if(topic.pilot)await expect(create).toBeEnabled();else await expect(create).toBeDisabled();
  }
});

for(const template of templates)test(`Authoring: create, save, publish, reload ${template.curriculumCode} ${template.templateId}`,async({page},info)=>{
  const title=`UI ${template.templateId} ${Date.now()}`;
  console.log(`[ADMIN TOPIC] ${template.templateId}`);
  await page.goto('/admin/lessons');
  await page.getByRole('button',{name:/Thêm bài mới/}).click();
  const studio=page.locator('.authoring-studio');
  await studio.getByLabel('Dạng bài authoring',{exact:true}).selectOption(template.templateId);
  await studio.getByLabel('Tên đề authoring',{exact:true}).fill(title);
  await expect(studio.locator('.authoring-preview .algebra-scene,.authoring-preview svg:visible,.authoring-preview canvas:visible').first()).toBeVisible();
  await studio.getByRole('button',{name:'Lưu bản nháp',exact:true}).click();
  await expect(studio.locator('.notice[role=status]')).toContainText('Đã lưu bản nháp');
  await page.reload();
  await expect(studio.getByLabel('Tên đề authoring',{exact:true})).toHaveValue(title);
  await expect(studio.getByLabel('Dạng bài authoring',{exact:true})).toHaveValue(template.templateId);
  await studio.getByRole('button',{name:'Xuất bản phiên bản mới',exact:true}).click();
  await expect(studio.locator('.notice[role=status]')).toContainText('Đã xuất bản phiên bản 1');
  await verifyLibrary(page,title,info);
});

for(const topic of legacy)test(`Legacy topic: create, save, publish, reload ${topic.id} — ${topic.title}`,async({page},info)=>{
  const title=`UI ${topic.id} ${Date.now()}`;
  console.log(`[ADMIN TOPIC] ${topic.id}`);
  await page.goto('/admin/lessons/new');
  await page.getByText('Nâng cao · luồng legacy và dạng chưa có form template',{exact:true}).click();
  const blueprint=page.locator('.blueprint-studio');
  await blueprint.getByLabel('Chủ đề Toán 9',{exact:true}).selectOption(topic.id);
  const form=blueprint.locator('.math9-input');
  await form.getByLabel('Tên bài',{exact:true}).fill(title);
  await form.getByRole('button',{name:'Dựng bài Toán 9',exact:true}).click();
  await expect(form.locator('[role=status]')).toContainText('Đã dựng bài');
  await form.getByRole('button',{name:'Lưu nháp Toán 9',exact:true}).click();
  await expect(form.locator('[role=status]')).toContainText('Đã lưu nháp');
  await form.getByRole('button',{name:'Tạo & xuất bản lên app',exact:true}).click();
  await expect(form.locator('[role=status]')).toContainText('Đã xuất bản');
  await verifyLibrary(page,title,info);
});

for(const topic of pilot)test(`Curriculum pilot: create, publish, reload ${topic.id}`,async({page},info)=>{
  const title=`UI ${topic.id} ${Date.now()}`;
  await page.goto('/admin/engines');
  await page.locator('article').filter({has:page.getByText(topic.id,{exact:true})}).getByRole('button',{name:'Dùng mẫu trong Studio',exact:true}).click();
  await page.getByLabel('Tên bài học',{exact:true}).fill(title);
  await page.getByRole('button',{name:'Lưu bản nháp',exact:true}).click();
  await expect(page.locator('.notice[role=status]')).toContainText('Đã lưu');
  await page.getByRole('button',{name:'Xuất bản ↗',exact:true}).click();
  await expect(page.locator('.notice[role=status]')).toContainText('Đã xuất bản');
  await verifyLibrary(page,title,info);
});
