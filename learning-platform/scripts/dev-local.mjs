import {spawn} from 'node:child_process';
const child=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5180','--strictPort'],{stdio:'inherit',env:{...process.env,VITE_ENABLE_LOCAL_DEMO:'true',VITE_SUPABASE_URL:'',VITE_SUPABASE_PUBLISHABLE_KEY:''}});
child.on('exit',code=>process.exit(code??1));
