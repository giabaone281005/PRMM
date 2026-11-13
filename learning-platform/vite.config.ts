import {defineConfig} from 'vite';
import {localApi} from './packages/local-api';
export default defineConfig({plugins:process.env.VITE_ENABLE_LOCAL_DEMO==='true'?[localApi()]:[],server:{allowedHosts:['localhost','127.0.0.1','10.0.2.2']},optimizeDeps:{entries:['index.html']},test:{include:['tests/**/*.test.ts'],testTimeout:20000}} as any);
