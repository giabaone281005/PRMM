import {defineConfig} from '@playwright/test';
import roles from './playwright.roles.config';

export default defineConfig({
  ...roles,
  timeout:180000,
  use:{...roles.use,launchOptions:{slowMo:300}},
  projects:[{name:'admin-ui',testMatch:['**/admin-ui.spec.ts','**/admin-all-topics.spec.ts'],use:{viewport:{width:1440,height:1000}}}],
});
