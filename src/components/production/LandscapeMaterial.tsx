import { useEffect, useMemo } from 'react';
import { MeshStandardMaterial } from 'three';

// Fine physical surface variation rather than a pre-rendered aerial image.
export function LandscapeMaterial({color,vertexColors=false,organic=false}:{color?:string;vertexColors?:boolean;organic?:boolean}) {
  const material=useMemo(()=>{
    const result=new MeshStandardMaterial({color:color??'#ffffff',vertexColors,roughness:.94});
    result.onBeforeCompile=shader=>{
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 landscapePoint;');
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nlandscapePoint = position;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
        varying vec3 landscapePoint;
        float landHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
        float landNoise(vec3 p){vec3 i=floor(p);vec3 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(mix(landHash(i),landHash(i+vec3(1,0,0)),f.x),mix(landHash(i+vec3(0,1,0)),landHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(landHash(i+vec3(0,0,1)),landHash(i+vec3(1,0,1)),f.x),mix(landHash(i+vec3(0,1,1)),landHash(i+vec3(1,1,1)),f.x),f.y),f.z);}
      `);
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        float detail = landNoise(landscapePoint * ${organic?'19.0':'34.0'});
        float grain = landNoise(landscapePoint * ${organic?'65.0':'145.0'});
        float broad = landNoise(landscapePoint * 3.5);
        diffuseColor.rgb *= 0.72 + detail * 0.30 + grain * 0.20 + broad * 0.15;
      `);
    };
    result.customProgramCacheKey=()=>organic?'tea-foliage-v1':'tea-ground-v1';
    return result;
  },[color,vertexColors,organic]);
  useEffect(()=>()=>material.dispose(),[material]);
  return <primitive object={material} attach="material"/>;
}
