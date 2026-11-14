import {defineConfig} from '@playwright/test';
import base from './playwright.config';

const role=process.env.MOHOC_TEST_ROLE;
if(role!=='admin'&&role!=='user')throw new Error('Use test-admin.bat or test-user.bat');
const reportDir=process.env.MOHOC_TEST_REPORT_DIR;
if(!reportDir)throw new Error('Missing MOHOC_TEST_REPORT_DIR');
const port=Number(process.env.PLAYWRIGHT_PORT??(role==='admin'?5181:5182));
if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Invalid PLAYWRIGHT_PORT');
const url=`http://127.0.0.1:${port}`;
const adminFiles=['00-empty','acceptance','algebra-studio','cms-refresh','creation','curriculum-pilot','geometry-studio','math9','uime-editor'];
const userFiles=['00-empty','acceptance','algebra','cartesian','cylinder','diagnostics','geometry','mobile-bridge','uime'];

export default defineConfig({
  ...base,
  outputDir:`${reportDir}/artifacts`,
  reporter:[['list'],['html',{outputFolder:`${reportDir}/html`,open:'never'}],['json',{outputFile:`${reportDir}/results.json`}]],
  use:{...base.use,baseURL:url,channel:undefined,browserName:'chromium',
    headless:process.env.MOHOC_TEST_HEADED!=='1',screenshot:'only-on-failure',video:'retain-on-failure'},
  webServer:{command:`npm run dev -- --port ${port} --strictPort`,url,reuseExistingServer:false,
    env:{MOHOC_TEST_MODE:'1',VITE_ENABLE_LOCAL_DEMO:'true',VITE_SUPABASE_URL:'',VITE_SUPABASE_PUBLISHABLE_KEY:''},timeout:60000},
  projects:[{name:role,testMatch:(role==='admin'?adminFiles:userFiles).map(name=>`**/${name}.spec.ts`),
    grepInvert:role==='admin'?/learner 2D gestures|3D WebGL actually renders/:/local CMS JSON build/,
    use:{viewport:{width:1440,height:1050}}}],
});
