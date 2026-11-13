// Hosted browser -> native Flutter acceptance, using isolated operator-created users.
import {chromium} from '@playwright/test';
import {createClient} from '@supabase/supabase-js';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const run=JSON.parse(readFileSync('.local/deployment/live-catalog-test.json','utf8'));
const config=JSON.parse(readFileSync('.local/supabase.mobile.json','utf8'));
const admin=createClient(config.SUPABASE_URL,config.SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false}});
const signedIn=await admin.auth.signInWithPassword(run.users[0]);if(signedIn.error)throw signedIn.error;
async function waitForMarker(id){
 const deadline=Date.now()+600000;
 while(Date.now()<deadline){const{data,error}=await admin.from('engine_requests').select('id').eq('id',id);if(error)throw error;if(data.length)return;await new Promise(r=>setTimeout(r,1000));}
 throw Error('Native device did not report '+id);
}
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const results=[];
try{
 await page.goto('http://127.0.0.1:5173/admin/studio');
 await page.getByLabel('Email',{exact:true}).fill(run.users[0].email);
 await page.getByLabel('Mật khẩu',{exact:true}).fill(run.users[0].password);
 await page.getByRole('button',{name:'Đăng nhập →',exact:true}).click();
 await page.getByRole('button',{name:'JSON',exact:true}).waitFor();
 console.log('Admin ready; waiting for native authenticated Realtime subscription');
 await waitForMarker(run.ready);
 const blueprint={...JSON.parse(readFileSync('contracts/problems/integer-minus-three.problem.json','utf8')),id:run.lessonId,title:run.title};
 await page.getByRole('button',{name:'JSON',exact:true}).click();
 await page.getByLabel('Khuôn nội dung JSON').fill(JSON.stringify(blueprint));
 await page.getByRole('button',{name:/Dựng bài & tự chọn engine/}).click();
 await page.getByRole('button',{name:'Lưu bản nháp',exact:true}).click();
 await page.getByRole('status').filter({hasText:'Đã lưu bản nháp'}).waitFor();
 const student=createClient(config.SUPABASE_URL,config.SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false}});
 const login=await student.auth.signInWithPassword(run.users[1]);if(login.error)throw login.error;
 const draftCatalog=await student.rpc('published_catalog');if(draftCatalog.error)throw draftCatalog.error;
 assert(!draftCatalog.data.some(r=>r.manifest.lessonId===run.lessonId));
 results.push({check:'admin draft stays private',status:'PASS'});
 await page.getByRole('button',{name:'Tạo & xuất bản lên app ↗',exact:true}).click();
 await page.getByRole('status').filter({hasText:'Đã xuất bản'}).waitFor();
 const publishedAt=Date.now();console.log('Published from real admin UI; waiting for native card');
 await page.screenshot({path:'../docs/qa/admin-live-published.png',fullPage:true});
 await waitForMarker(run.seen);
 results.push({check:'published from admin UI appears and opens on native mobile without refresh',status:'PASS',observedWithinMs:Date.now()-publishedAt});
 await page.getByRole('button',{name:'Bài học',exact:false}).first().click();
 const row=page.getByRole('row').filter({hasText:run.title});
 await row.locator('summary').click();
 await row.getByRole('button',{name:'Gỡ xuất bản',exact:true}).click();
 await page.getByRole('status').filter({hasText:'Đã gỡ'}).waitFor();
 await waitForMarker(run.removed);
 results.push({check:'unpublish removes native card via Realtime without refresh',status:'PASS'});
 console.log('PASS admin -> Supabase Realtime -> native catalog; publish/open/unpublish');
}catch(error){await page.screenshot({path:'../docs/qa/admin-live-failure.png',fullPage:true});console.error(await page.getByRole('alert').allTextContents());throw error;}finally{
 writeFileSync('../docs/qa/live-catalog-hosted-results.json',JSON.stringify({project:config.SUPABASE_URL,lessonId:run.lessonId,results},null,2));
 await browser.close();await admin.auth.signOut({scope:'local'});
}
