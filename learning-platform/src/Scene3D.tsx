import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {LessonSession} from '../packages/lesson-runtime';
export function Scene3D({session}:{session:LessonSession}){
  const host=useRef<HTMLDivElement>(null),[error,setError]=useState('');
  const prism=session.objects.find(o=>o.kind==='prism');const dimensions=prism?.kind==='prism'?prism.dimensions:[4,3,3];
  useEffect(()=>{
    const el=host.current!;let renderer:THREE.WebGLRenderer;try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch{setError('Thiết bị chưa hỗ trợ WebGL. Hãy mở bài trên thiết bị có WebGL; tiến độ vẫn được giữ.');return;}
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0xf1f5e9,1);el.appendChild(renderer.domElement);
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.1,100);const scale=Math.max(...dimensions)/4;camera.position.set(7*scale,5*scale,8*scale);camera.lookAt(0,0,0);
    scene.add(new THREE.AmbientLight(0xffffff,2));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(4,8,5);scene.add(light);
    const group=new THREE.Group();scene.add(group);const geometry=new THREE.BoxGeometry(.94,.94,.94),materials=[0xa4d76e,0x81bc59,0xc8e996,0x69a94a,0xb5e381,0x8fc760].map(color=>new THREE.MeshStandardMaterial({color,roughness:.7}));
    const [width,depth,height]=dimensions;const cubes:THREE.Mesh[]=[];for(let y=0;y<height;y++)for(let x=0;x<width;x++)for(let z=0;z<depth;z++){const mesh=new THREE.Mesh(geometry,materials);mesh.position.set(x-(width-1)/2,y-(height-1)/2,z-(depth-1)/2);mesh.userData.layer=y+1;group.add(mesh);cubes.push(mesh);}
    const plane=new THREE.GridHelper(Math.max(width,depth)+5,Math.max(width,depth)+5,0xced9c3,0xe2e9db);plane.position.y=-height/2-.02;scene.add(plane);
    const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let down:{x:number;y:number}|null=null,moved=false,frame=0;
    const resize=()=>{const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};resize();const observer=new ResizeObserver(resize);observer.observe(el);
    const onDown=(e:PointerEvent)=>{down={x:e.clientX,y:e.clientY};moved=false;renderer.domElement.setPointerCapture(e.pointerId);};
    const onMove=(e:PointerEvent)=>{if(!down)return;const dx=e.clientX-down.x,dy=e.clientY-down.y;if(Math.hypot(dx,dy)>2)moved=true;if(session.checkpoint.allowedInteractions.includes('orbit_solid')){const r=dx*.012;group.rotation.y+=r;group.rotation.x=Math.max(-.8,Math.min(.8,group.rotation.x+dy*.008));session.interact({type:'orbit_solid',radians:r});}down={x:e.clientX,y:e.clientY};};
    const onUp=(e:PointerEvent)=>{if(down&&!moved){const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(cubes)[0];if(hit?.face){session.interact({type:'select_face',face:hit.face.materialIndex});materials[hit.face.materialIndex].emissive.setHex(0x304d16);}}down=null;};
    renderer.domElement.addEventListener('pointerdown',onDown);renderer.domElement.addEventListener('pointermove',onMove);renderer.domElement.addEventListener('pointerup',onUp);
    const onLost=(e:Event)=>{e.preventDefault();setError('WebGL bị gián đoạn. Hãy tải lại để phục hồi tiến độ.');};renderer.domElement.addEventListener('webglcontextlost',onLost);
    function render(){const cp=session.snapshot.checkpoint,layers=session.snapshot.metrics.filledLayers;cubes.forEach(c=>c.visible=cp<2||c.userData.layer<=layers);renderer.render(scene,camera);frame=requestAnimationFrame(render);}render();
    return()=>{cancelAnimationFrame(frame);observer.disconnect();renderer.domElement.removeEventListener('pointerdown',onDown);renderer.domElement.removeEventListener('pointermove',onMove);renderer.domElement.removeEventListener('pointerup',onUp);renderer.domElement.removeEventListener('webglcontextlost',onLost);geometry.dispose();materials.forEach(m=>m.dispose());plane.geometry.dispose();(plane.material as THREE.Material).dispose();renderer.dispose();el.replaceChildren();};
  },[session]);
  return <div className="solid-scene"><div ref={host} className="webgl" aria-label="Khối hộp 3D: kéo để xoay, chạm để chọn mặt"/>{error&&<div role="alert" className="error">{error}</div>}{session.checkpoint.allowedInteractions.includes('fill_layers')&&<label className="layer-control">Số lớp: {session.snapshot.metrics.filledLayers} / {dimensions[2]}<input aria-label="Số lớp" type="range" min="0" max={dimensions[2]} step="1" value={session.snapshot.metrics.filledLayers} onChange={e=>session.interact({type:'fill_layers',layers:Number(e.target.value)})}/><strong>{session.snapshot.metrics.volume} đơn vị³</strong></label>}</div>;
}
