import {build} from 'esbuild';
for(const name of ['progress','generate','authoring'])await build({entryPoints:[`supabase/functions/${name}/main.ts`],bundle:true,format:'esm',platform:'neutral',target:'es2022',outfile:`supabase/functions/${name}/index.ts`,minify:false});
