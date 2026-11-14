import {test,expect} from '@playwright/test';

test('Admin creates, reopens, edits, publishes and unpublishes a lesson through the visible UI',async({page},testInfo)=>{
  const title=`UI Admin ${Date.now()}`,editedTitle=`${title} - đã sửa`;
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  const studio=page.locator('.authoring-studio');
  const titleField=()=>studio.getByRole('textbox',{name:'Tên đề authoring',exact:true});
  const parameter=()=>studio.getByRole('spinbutton',{name:'Dữ kiện khám phá · bước 1–4 · Hằng số · nhân tử tử số thứ nhất',exact:true});
  const row=(name:string)=>page.getByRole('row').filter({has:page.getByRole('button',{name,exact:true})});
  async function capture(name:string){await page.screenshot({path:testInfo.outputPath(`${name}.png`),fullPage:true});}

  await test.step('Tạo bài mới và lưu nháp qua biểu mẫu',async()=>{
    console.log('[ADMIN UI] 1/6 Create and save a new lesson');
    await page.goto('/admin/lessons');
    await page.getByRole('button',{name:/Thêm bài mới/}).click();
    await studio.getByRole('combobox',{name:'Dạng bài authoring',exact:true}).selectOption('math9-algebra-product-equation');
    await titleField().fill(title);
    await parameter().fill('-4');
    await expect(studio.locator('.authoring-preview .algebra-scene')).toBeVisible();
    await studio.getByRole('button',{name:'Lưu bản nháp',exact:true}).click();
    await expect(studio.locator('.notice[role=status]')).toContainText('Đã lưu bản nháp');
    await capture('01-create-draft');
    await page.getByRole('button',{name:'← Danh sách bài học',exact:true}).click();
    await expect(row(title)).toContainText('Bản nháp');
  });
  await test.step('Mở bài đã lưu, sửa nội dung và kiểm tra sau reload',async()=>{
    console.log('[ADMIN UI] 2/6 Reopen and edit the saved lesson');
    await row(title).getByRole('button',{name:'Sửa bài',exact:true}).click();
    await expect(titleField()).toHaveValue(title);
    await expect(parameter()).toHaveValue('-4');
    await titleField().fill(editedTitle);
    await parameter().fill('-6');
    await studio.getByRole('button',{name:'Lưu bản nháp',exact:true}).click();
    await expect(studio.locator('.notice[role=status]')).toContainText('Đã lưu bản nháp');
    await page.reload();
    await expect(titleField()).toHaveValue(editedTitle);
    await expect(parameter()).toHaveValue('-6');
    await capture('02-edit-persisted');
  });
  await test.step('Xuất bản và kiểm tra thư viện',async()=>{
    console.log('[ADMIN UI] 3/6 Publish the lesson');
    await studio.getByRole('button',{name:'Xuất bản phiên bản mới',exact:true}).click();
    await expect(studio.locator('.notice[role=status]')).toContainText('Đã xuất bản phiên bản 1');
    await page.getByRole('button',{name:'← Danh sách bài học',exact:true}).click();
    await expect(row(editedTitle)).toContainText('Đã xuất bản');
    await expect(row(title)).toHaveCount(0);
    await capture('03-published-library');
  });
  await test.step('Kiểm tra bài đã xuất hiện ở trang học',async()=>{
    console.log('[ADMIN UI] 4/6 Verify learner catalog');
    await page.getByRole('button',{name:'↗ Trang học',exact:true}).click();
    await expect(page.getByRole('heading',{name:editedTitle,exact:true}).first()).toBeVisible();
    await capture('04-learner-catalog');
  });
  await test.step('Gỡ xuất bản qua menu bài học và kiểm tra sau reload',async()=>{
    console.log('[ADMIN UI] 5/6 Unpublish from the lesson menu');
    await page.goto('/admin/lessons');
    await row(editedTitle).getByLabel(`Thao tác khác cho ${editedTitle}`,{exact:true}).click();
    await row(editedTitle).getByRole('button',{name:'Gỡ xuất bản',exact:true}).click();
    await expect(page.getByRole('status')).toContainText('Đã gỡ xuất bản');
    await expect(row(editedTitle)).toContainText('Bản nháp');
    await page.reload();
    await expect(row(editedTitle)).toContainText('Bản nháp');
    await row(editedTitle).getByRole('button',{name:'Lịch sử',exact:true}).click();
    await expect(page.locator('.version-panel')).toContainText('Phiên bản 1');
    await capture('05-unpublished-history');
  });
  await test.step('Kiểm tra catalog đã ẩn bài và bản nháp vẫn sửa được',async()=>{
    console.log('[ADMIN UI] 6/6 Verify catalog removal and retained draft');
    await page.getByRole('button',{name:'↗ Trang học',exact:true}).click();
    await expect(page.getByRole('heading',{name:editedTitle,exact:true})).toHaveCount(0);
    await capture('06-learner-catalog-empty');
    await page.goto('/admin/lessons');
    await row(editedTitle).getByRole('button',{name:'Sửa bài',exact:true}).click();
    await expect(titleField()).toHaveValue(editedTitle);
    await expect(parameter()).toHaveValue('-6');
    expect(errors).toEqual([]);
  });
});
