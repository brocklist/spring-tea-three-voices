import fs from 'node:fs';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js';
import {mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {Box3,BufferAttribute,Color,Vector3} from 'three';
const f=fs.readFileSync('assets-source/intro/tea-mountain.fbx');const root=new FBXLoader().parse(f.buffer.slice(f.byteOffset,f.byteOffset+f.byteLength),'');root.updateMatrixWorld(true);
let geometry;root.traverse(o=>{if(o.isMesh)geometry=o.geometry.clone().applyMatrix4(o.matrixWorld)});
const b=new Box3().setFromBufferAttribute(geometry.attributes.position),center=b.getCenter(new Vector3()),scale=26/(b.max.x-b.min.x);
geometry.translate(-center.x,-b.min.y,-center.z);geometry.scale(scale,scale,scale);geometry.deleteAttribute('normal');geometry=mergeVertices(geometry,0.0001);geometry.computeVertexNormals();
const pos=geometry.attributes.position,norm=geometry.attributes.normal;const colors=new Uint8Array(pos.count*3);const green=new Color('#447138'),soil=new Color('#8b895a');
// Geometry normals distinguish planting benches and terrace risers. Small spatial
// variation breaks uniform green while keeping the original sculpted tea rows.
for(let i=0;i<pos.count;i++){let ny=Math.abs(norm.getY(i));const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);let t=Math.max(0,Math.min(1,(.88-ny)*2.2));const c=green.clone().lerp(soil,t);c.multiplyScalar(.82+.14*Math.sin(x*1.7+z*.8)+.08*Math.sin(z*4.2+x*3.1));colors[i*3]=Math.round(c.r*255);colors[i*3+1]=Math.round(c.g*255);colors[i*3+2]=Math.round(c.b*255);}
const indices=new Uint32Array(geometry.index.array);const header=new Uint32Array([0x54454133,pos.count,indices.length,0]);const file=Buffer.concat([Buffer.from(header.buffer),Buffer.from(pos.array.buffer),Buffer.from(norm.array.buffer),Buffer.from(colors.buffer),Buffer.alloc((4-colors.byteLength%4)%4),Buffer.from(indices.buffer)]);fs.writeFileSync('public/assets/production/original-tea-mountain.bin',file);
console.log({vertices:pos.count,triangles:indices.length/3,bytes:file.length});
