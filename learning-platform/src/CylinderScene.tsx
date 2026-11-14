import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import type {LessonSession} from '../packages/lesson-runtime';
import type {CylinderConfig} from '../packages/lesson-runtime/cylinder';
import {cylinderVisual,cylinderCamera,disposeCylinder,pickCylinder} from './cylinder-visual';

export function CylinderScene({session}:{session:LessonSession}) {
  const host=useRef<HTMLDivElement>(null),[fallback,setFallback]=useState(false);
  const c=session.lesson.recognition![session.snapshot.checkpoint].uime!.cylinder!,s=session.snapshot.state;
  const adjust=(name:string,value:number)=>session.interact({type:'adjust_parameter',name,value});
  const current=useRef({c,s});current.current={c,s};
  useEffect(()=>{
    const el=host.current!;let renderer:THREE.WebGLRenderer;
    try{renderer=new THREE.WebGLRenderer({antialias:true});}catch{setFallback(true);return;}
    renderer.setClearColor(0xeef4e8);renderer.setPixelRatio(Math.min(devicePixelRatio,2));el.appendChild(renderer.domElement);
    const scene=new THREE.Scene(),camera=cylinderCamera();scene.add(new THREE.AmbientLight(0xffffff,2));
    const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(3,5,4);scene.add(light);
    let rig:ReturnType<typeof cylinderVisual>|undefined,signature='',frame=0,down:{x:number;y:number;startX:number;startY:number}|undefined;
    const ray=new THREE.Raycaster();
    function resize(){const width=Math.max(el.clientWidth,1);renderer.setSize(width,width);camera.aspect=1;camera.updateProjectionMatrix();}
    resize();const observer=new ResizeObserver(resize);observer.observe(el);
    function start(e:PointerEvent){down={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY};renderer.domElement.setPointerCapture(e.pointerId);}
    function move(e:PointerEvent){if(!down)return;adjust('a',Math.max(-6,Math.min(6,Number(current.current.s.a)+(e.clientX-down.x)*.015)));adjust('b',Math.max(-1.3,Math.min(1.3,Number(current.current.s.b)+(e.clientY-down.y)*.01)));down.x=e.clientX;down.y=e.clientY;}
    function end(e:PointerEvent){if(down&&Math.hypot(e.clientX-down.startX,e.clientY-down.startY)<8&&rig){const r=renderer.domElement.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2),camera);const part=pickCylinder(rig.parts,ray);if(part!==undefined)adjust('x',part);}down=undefined;}
    function lost(e:Event){e.preventDefault();setFallback(true);}
    renderer.domElement.addEventListener('pointerdown',start);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',end);renderer.domElement.addEventListener('pointercancel',()=>{down=undefined;});renderer.domElement.addEventListener('webglcontextlost',lost);
    function draw(){const {c,s}=current.current,next=JSON.stringify([c.radius,c.height,s.width]);
      if(next!==signature){if(rig){scene.remove(rig.group);disposeCylinder(rig.group);}rig=cylinderVisual(c,Number(s.width));scene.add(rig.group);signature=next;
        rig.anchors.forEach((p,i)=>{const cv=document.createElement('canvas');cv.width=64;cv.height=64;const ctx=cv.getContext('2d')!;ctx.fillStyle='#fff';ctx.fillRect(0,0,64,64);ctx.fillStyle='#243225';ctx.font='bold 48px sans-serif';ctx.textAlign='center';ctx.fillText('ABCDE'[i],32,50);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),depthTest:false}));sprite.renderOrder=10;sprite.position.copy(p);sprite.scale.set(.24,.24,1);rig!.group.add(sprite);});}
      rig!.group.rotation.set(Number(s.b),Number(s.a),0);const focus=el.closest('[data-authoring-focus]')?.getAttribute('data-authoring-focus'),focused=focus==='radius'?0:focus==='height'?1:-1;rig!.parts.forEach(p=>(p.material as THREE.MeshStandardMaterial).emissive.set(p.userData.part===Number(s.x)||p.userData.part===focused?0x665000:0));renderer.render(scene,camera);frame=requestAnimationFrame(draw);
    }draw();
    return()=>{cancelAnimationFrame(frame);observer.disconnect();if(rig)disposeCylinder(rig.group);renderer.dispose();el.replaceChildren();};
  },[session]);
  const scale=Number(s.width),radius=Math.round(c.radius*scale*1e6)/1e6;
  return <div className="cylinder-scene" data-radius={radius} data-height={c.height} data-renderer={fallback?'fallback':'webgl'}>
    <p className="cylinder-measures">r = {radius} {c.unit} · h = {c.height} {c.unit}</p>
    <div ref={host} className="cylinder-canvas" style={{display:fallback?'none':undefined}} aria-label="Mô hình hình trụ tương tác"/>
    {fallback&&<><p role="status">Đang dùng sơ đồ 3D thay thế. Vuốt hoặc dùng thanh xoay và chọn bộ phận.</p><CylinderFallback c={c} session={session}/></>}
    <p>Chạm trực tiếp trên hình hoặc chọn ký hiệu tương ứng. Đang chọn: {'ABCDE'[Number(s.x)]??'—'}</p>
    <div className="cylinder-parts">{'ABCDE'.split('').map((letter,i)=><button key={letter} aria-label={'Bộ phận '+letter} aria-pressed={Number(s.x)===i} onClick={()=>adjust('x',i)}>{letter}</button>)}</div>
    <label>Xoay ngang<input aria-label="Xoay ngang" type="range" min="-6" max="6" step=".05" value={Number(s.a)} onInput={e=>adjust('a',+e.currentTarget.value)}/></label>
    <label>Nghiêng mô hình<input aria-label="Nghiêng mô hình" type="range" min="-1.3" max="1.3" step=".05" value={Number(s.b)} onInput={e=>adjust('b',+e.currentTarget.value)}/></label>
    {c.task==='equal-bases'&&<label>Thay đổi bán kính cả hai đáy<input aria-label="Thay đổi bán kính" type="range" min=".5" max="1.5" step=".1" value={scale} onInput={e=>adjust('width',+e.currentTarget.value)}/></label>}
  </div>;
}

function CylinderFallback({c,session}:{c:CylinderConfig;session:LessonSession}) {
  const s=session.snapshot.state,rig=cylinderVisual(c,Number(s.width)),camera=cylinderCamera();
  rig.group.rotation.set(Number(s.b),Number(s.a),0);rig.group.updateMatrixWorld(true);
  const triangles:{d:string;z:number;part:number}[]=[];
  for(const mesh of rig.parts){const g=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone(),points=g.getAttribute('position');
    for(let i=0;i<points.count;i+=3){const p=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(points,i+j).applyMatrix4(mesh.matrixWorld).project(camera));triangles.push({d:p.map((v,j)=>`${j?'L':'M'}${180+v.x*180},${180-v.y*180}`).join('')+'Z',z:p.reduce((a,v)=>a+v.z,0)/3,part:mesh.userData.part});}g.dispose();}
  triangles.sort((a,b)=>(a.part<2?1:0)-(b.part<2?1:0)||b.z-a.z);
  const labels=rig.anchors.map(p=>p.clone().applyMatrix4(rig.group.matrixWorld).project(camera));disposeCylinder(rig.group);
  const down=useRef<{x:number;y:number}|undefined>(undefined);
  return <svg viewBox="0 0 360 360" role="img" aria-label="Sơ đồ hình trụ tương tác" style={{touchAction:'none',width:'100%'}} onPointerDown={e=>{down.current={x:e.clientX,y:e.clientY};}} onPointerMove={e=>{const d=down.current;if(!d||!e.buttons)return;session.interact({type:'adjust_parameter',name:'a',value:Math.max(-6,Math.min(6,Number(s.a)+(e.clientX-d.x)*.015))});session.interact({type:'adjust_parameter',name:'b',value:Math.max(-1.3,Math.min(1.3,Number(s.b)+(e.clientY-d.y)*.01))});down.current={x:e.clientX,y:e.clientY};}} onPointerUp={()=>{down.current=undefined;}}>
    {triangles.map((t,i)=><path key={i} data-part={t.part} d={t.d} fill={Number(s.x)===t.part?'#dca339':t.part<2?'#6854a0':t.part===4?'#b4d99c':'#84b98e'} onClick={()=>session.interact({type:'adjust_parameter',name:'x',value:t.part})}/>)}
    {labels.map((p,i)=><text key={i} x={180+p.x*180} y={180-p.y*180} textAnchor="middle" fontSize="17" fontWeight="bold" fill="#243225" stroke="#fff" strokeWidth="3" paintOrder="stroke" pointerEvents="none">{'ABCDE'[i]}</text>)}
  </svg>;
}
