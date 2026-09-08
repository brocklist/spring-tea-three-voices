import { useLayoutEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { BufferGeometry, Color, Float32BufferAttribute, InstancedMesh, Object3D, Vector3 } from 'three';

/** Fine leaf clusters sampled directly from the original planting surfaces. */
export function TeaSurfaceFoliage({ geometry }: { geometry: BufferGeometry }) {
  const mesh = useRef<InstancedMesh>(null);
  const invalidate = useThree(state => state.invalidate);
  const samples = useMemo(() => {
    const pos = geometry.attributes.position, normal = geometry.attributes.normal, indices = geometry.index!;
    let seed = 1987;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    const cumulative: number[] = []; let total = 0;
    const a = new Vector3(), b = new Vector3(), c = new Vector3();
    for (let i=0;i<indices.count;i+=3) {
      a.fromBufferAttribute(pos,indices.getX(i)); b.fromBufferAttribute(pos,indices.getX(i+1)); c.fromBufferAttribute(pos,indices.getX(i+2));
      total += b.sub(a).cross(c.sub(a)).length()*.5; cumulative.push(total);
    }
    const result: Array<{x:number;y:number;z:number;rotation:number;scale:number;tone:number}> = [];
    for (let i=0;i<65000;i++) {
      const target = random()*total; let low=0,high=cumulative.length-1;
      while(low<high){const mid=(low+high)>>>1;if(cumulative[mid]<target)low=mid+1;else high=mid;}
      const ia=indices.getX(low*3),ib=indices.getX(low*3+1),ic=indices.getX(low*3+2);
      const root=Math.sqrt(random()), wa=1-root, wb=root*(1-random()), wc=1-wa-wb;
      const ny=normal.getY(ia)*wa+normal.getY(ib)*wb+normal.getY(ic)*wc;
      if(ny<.87)continue;
      result.push({x:pos.getX(ia)*wa+pos.getX(ib)*wb+pos.getX(ic)*wc,y:pos.getY(ia)*wa+pos.getY(ib)*wb+pos.getY(ic)*wc,z:pos.getZ(ia)*wa+pos.getZ(ib)*wb+pos.getZ(ic)*wc,rotation:random()*Math.PI*2,scale:.026+random()*.028,tone:random()});
    }
    return result;
  },[geometry]);
  const leafGeometry=useMemo(()=>{
    const g=new BufferGeometry();
    // Four folded leaves form a tiny shoot, avoiding spherical bead-shaped bushes.
    const vertices:number[]=[];
    for(let i=0;i<4;i++){const angle=i*Math.PI*.5;const x=Math.cos(angle),z=Math.sin(angle);vertices.push(0,0,0,x*.65,.35,z*.65,-z*.32,.2,x*.32,x*.65,.35,z*.65,x,.12,z,-z*.32,.2,x*.32);}
    g.setAttribute('position',new Float32BufferAttribute(vertices,3));g.computeVertexNormals();return g;
  },[]);
  useLayoutEffect(()=>{
    if(!mesh.current)return;
    const object=new Object3D(),dark=new Color('#315c27'),light=new Color('#69944a');
    samples.forEach((p,i)=>{object.position.set(p.x,p.y+.009,p.z);object.rotation.set(0,p.rotation,0);object.scale.setScalar(p.scale);object.updateMatrix();mesh.current!.setMatrixAt(i,object.matrix);mesh.current!.setColorAt(i,dark.clone().lerp(light,p.tone));});
    mesh.current.instanceMatrix.needsUpdate=true;if(mesh.current.instanceColor)mesh.current.instanceColor.needsUpdate=true;mesh.current.computeBoundingSphere();invalidate();
    return ()=>leafGeometry.dispose();
  },[samples,invalidate,leafGeometry]);
  return <instancedMesh ref={mesh} args={[leafGeometry,undefined,samples.length]} receiveShadow><meshStandardMaterial roughness={.92} side={2}/></instancedMesh>;
}
