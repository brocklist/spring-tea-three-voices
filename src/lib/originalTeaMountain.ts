import { useLoader } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { BufferAttribute, BufferGeometry, FileLoader, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three';
import { assetUrl } from './assetUrl';

/** Indexed source geometry, no image displacement or invented elevations. */
export function useOriginalTeaMountain() {
  const buffer = useLoader(FileLoader, assetUrl('/assets/production/original-tea-mountain.bin'), loader => loader.setResponseType('arraybuffer')) as ArrayBuffer;
  const model = useMemo(() => {
    const header = new Uint32Array(buffer, 0, 4);
    if (header[0] !== 0x54454133) throw new Error('Invalid tea mountain model');
    const count = header[1], indexCount = header[2];
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(buffer, 16, count * 3), 3));
    geometry.setAttribute('normal', new BufferAttribute(new Float32Array(buffer, 16 + count * 12, count * 3), 3));
    geometry.setAttribute('color', new BufferAttribute(new Uint8Array(buffer, 16 + count * 24, count * 3), 3, true));
    const indexOffset = Math.ceil((16 + count * 27) / 4) * 4;
    geometry.setIndex(new BufferAttribute(new Uint32Array(buffer, indexOffset, indexCount), 1));
    geometry.computeBoundingSphere();
    const material = new MeshBasicMaterial();
    const surface = new Mesh(geometry, material);
    const ray = new Raycaster();
    return { geometry, material, heightAt(x:number,z:number) {
      ray.set(new Vector3(x, 30, z), new Vector3(0, -1, 0));
      const hit = ray.intersectObject(surface, false)[0];
      if (!hit) throw new Error(`Tea zone outside source model: ${x}, ${z}`);
      return hit.point.y;
    }};
  }, [buffer]);
  useEffect(() => () => { model.geometry.dispose(); model.material.dispose(); }, [model]);
  return model;
}
