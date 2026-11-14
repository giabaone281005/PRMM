import * as THREE from 'three';
import {cylinderGeometry,type CylinderConfig} from '../packages/lesson-runtime/cylinder';
export const cylinderCamera=()=>{const c=new THREE.PerspectiveCamera(38,1,.1,30);c.position.set(0,1.1,5);c.lookAt(0,0,0);c.updateMatrixWorld();return c;};
export function cylinderVisual(config:CylinderConfig,scale=1) {
  const {radius:r,height:h}=cylinderGeometry(config,scale),group=new THREE.Group(),parts:THREE.Mesh[]=[];
  function add(g:THREE.BufferGeometry,index:number,pos:[number,number,number]=[0,0,0]) {
    const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:index<2?0x6854a0:index===4?0xadd399:0x84b98e,side:THREE.DoubleSide,transparent:true,opacity:index<2?1:.65}));
    m.position.set(...pos);m.userData.part=index;group.add(m);parts.push(m);return m;
  }
  add(new THREE.CylinderGeometry(r,r,h,48,1,true),4);
  add(new THREE.CircleGeometry(r,48),2,[0,h/2,0]).rotation.x=-Math.PI/2;
  add(new THREE.CircleGeometry(r,48),3,[0,-h/2,0]).rotation.x=Math.PI/2;
  function segment(from:THREE.Vector3,to:THREE.Vector3,index:number) {
    const delta=to.clone().sub(from),m=add(new THREE.CylinderGeometry(.025,.025,delta.length(),12),index);
    m.position.copy(from.clone().add(to).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
  }
  segment(new THREE.Vector3(0,h/2+.018,0),new THREE.Vector3(r,h/2+.018,0),0);
  segment(new THREE.Vector3(-r,-h/2,0),new THREE.Vector3(-r,h/2,0),1);
  const anchors=[new THREE.Vector3(r/2,h/2+.12,0),new THREE.Vector3(-r-.16,0,0),new THREE.Vector3(0,h/2+.05,-r*.55),new THREE.Vector3(0,-h/2-.1,0),new THREE.Vector3(r,0,0)];
  return {group,parts,anchors};
}
export function disposeCylinder(group:THREE.Group) {group.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();(o.material as THREE.Material).dispose();}if(o instanceof THREE.Sprite){o.material.map?.dispose();o.material.dispose();}});}
export function pickCylinder(parts:THREE.Mesh[],ray:THREE.Raycaster) {
  const hits=ray.intersectObjects(parts),rod=hits.find(h=>h.object.userData.part<2);
  return (rod??hits[0])?.object.userData.part as number|undefined;
}
