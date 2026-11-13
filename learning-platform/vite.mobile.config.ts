import {defineConfig} from 'vite';
export default defineConfig({build:{outDir:'apps/mobile/assets/runtime',emptyOutDir:false,lib:{entry:'src/mobile-runtime.tsx',name:'MoHocRuntime',formats:['iife'],fileName:()=> 'runtime.js',cssFileName:'runtime'},minify:true},define:{'process.env.NODE_ENV':JSON.stringify('production')}});
