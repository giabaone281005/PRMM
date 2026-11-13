import {it,expect} from 'vitest';
import {createServer} from 'vite';
import {localApi} from '../packages/local-api';
import {fixtures} from '../packages/lesson-authoring';

it('empty local workspace never creates or restores sample lessons implicitly',async()=>{
  const previous=process.env.MOHOC_TEST_MODE;
  process.env.MOHOC_TEST_MODE='1';
  const server=await createServer({configFile:false,plugins:[localApi()],server:{host:'127.0.0.1',port:0}});
  try{
    await server.listen();
    const address=server.httpServer!.address();
    if(!address||typeof address==='string')throw Error('Expected TCP server');
    const url=`http://127.0.0.1:${address.port}/api/`;
    const read=async(path:string)=>(await fetch(url+path)).json();
    const post=async(path:string,body:unknown)=>{
      const response=await fetch(url+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      expect(response.ok).toBe(true);
    };
    expect(await read('catalog')).toEqual([]);
    expect(await read('admin/lessons')).toEqual([]);
    const manifest={...structuredClone(fixtures[0]),lessonId:'user-created-triangle'};
    await post('admin/draft',{manifest});
    expect(await read('catalog')).toEqual([]);
    await post('admin/publish',{manifest});
    expect((await read('catalog')).map((l:any)=>l.lessonId)).toEqual([manifest.lessonId]);
    await post('admin/unpublish',{id:manifest.lessonId});
    expect(await read('catalog')).toEqual([]);
    expect((await read('admin/lessons')).map((r:any)=>r.id)).toEqual([manifest.lessonId]);
    expect(await read('catalog')).toEqual([]);
  }finally{
    await server.close();
    if(previous===undefined)delete process.env.MOHOC_TEST_MODE;else process.env.MOHOC_TEST_MODE=previous;
  }
});
