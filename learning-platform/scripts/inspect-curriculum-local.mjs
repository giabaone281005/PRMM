import {chromium} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1050}});
await page.goto('http://127.0.0.1:5180/admin/engines');
await page.getByRole('heading',{name:'Chương trình Toán 9'}).waitFor();
await page.screenshot({path:'../docs/qa/curriculum-local.png',fullPage:true});
await browser.close();
