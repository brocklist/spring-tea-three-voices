import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  MathUtils,
  ShaderMaterial,
  Vector2,
  Vector3,
} from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export type IntroStage = 'loading' | 'leaf' | 'mountain' | 'ready' | 'exiting' | 'complete';

interface ParticleManifest {
  version: number;
  count: number;
  mobileCount: number;
  fallbackUrl: string;
  targets: {
    leaf: { url: string };
    mountain: { url: string };
  };
}

interface IntroParticleSceneProps {
  elapsed: number;
  exiting: boolean;
  reducedMotion: boolean;
  onReady: () => void;
  onFailure: () => void;
}

const vertexShader = `
  uniform float uElapsed;
  uniform float uLeafProgress;
  uniform float uMountainProgress;
  uniform float uExitProgress;
  uniform float uPixelRatio;
  uniform vec2 uPointer;
  attribute vec3 aLeaf;
  attribute vec3 aMountain;
  attribute float aSeed;
  varying float vDepth;
  varying float vGold;

  float ease(float t) {
    t = clamp(t, 0.0, 1.0);
    return 1.0 - pow(1.0 - t, 3.0);
  }

  void main() {
    float seed = aSeed;
    vec3 scattered = vec3(
      sin(seed * 91.7) * 8.4,
      cos(seed * 57.3) * 5.1,
      sin(seed * 31.1 + 1.7) * 5.2
    );
    float leafMix = ease(uLeafProgress);
    float mountainMix = smoothstep(0.0, 1.0, uMountainProgress);
    vec3 position = mix(scattered, aLeaf, leafMix);
    position = mix(position, aMountain, mountainMix);

    float breathe = sin(uElapsed * 0.72 + seed * 24.0) * 0.018 * (1.0 - mountainMix);
    position += normalize(position + vec3(0.001)) * breathe;
    float exitEase = ease(uExitProgress);
    vec3 exitDirection = normalize(vec3(position.x * 0.15, position.y * 0.12 + 0.08, 1.0));
    position += exitDirection * exitEase * (4.0 + seed * 4.5);
    position.xy *= 1.0 + exitEase * 0.55;

    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    float viewDepth = clamp((-viewPosition.z - 5.8) / 7.5, 0.0, 1.0);
    gl_PointSize = (2.25 + 2.0 * sin(seed * 17.0) * sin(seed * 17.0)) * uPixelRatio;
    gl_PointSize *= clamp(8.3 / -viewPosition.z, 0.5, 1.75);
    gl_PointSize *= mix(1.12, 0.82, viewDepth);
    vDepth = 1.0 - viewDepth;
    vGold = step(0.92, fract(seed * 37.91)) * smoothstep(0.28, 0.8, leafMix);
  }
`;

const fragmentShader = `
  varying float vDepth;
  varying float vGold;

  void main() {
    vec2 centered = gl_PointCoord - 0.5;
    float distanceToCenter = length(centered);
    if (distanceToCenter > 0.5) discard;
    float alpha = smoothstep(0.5, 0.08, distanceToCenter);
    vec3 mint = mix(vec3(0.24, 0.66, 0.48), vec3(0.57, 0.91, 0.78), vDepth);
    vec3 gold = vec3(0.86, 0.67, 0.32);
    vec3 color = mix(mint, gold, vGold);
    gl_FragColor = vec4(color, alpha * 0.88);
  }
`;

function supportsWebGL() {
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas');
  return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
}

function hash(index: number) {
  const value = Math.sin(index * 12.9898 + 78.233) * 43_758.5453;
  return value - Math.floor(value);
}

async function fetchParticleData(url: string, count: number, signal: AbortSignal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Unable to load ${url}`);
  const values = new Float32Array(await response.arrayBuffer());
  if (values.length < count * 3) throw new Error(`Particle data is incomplete: ${url}`);
  return values.slice(0, count * 3);
}

function ParticleField({
  leaf,
  mountain,
  elapsed,
  exiting,
  reducedMotion,
}: {
  leaf: Float32Array;
  mountain: Float32Array;
  elapsed: number;
  exiting: boolean;
  reducedMotion: boolean;
}) {
  const { gl } = useThree();
  const material = useMemo(() => new ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uElapsed: { value: 0 },
      uLeafProgress: { value: 0 },
      uMountainProgress: { value: 0 },
      uExitProgress: { value: 0 },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 1.25) },
      uPointer: { value: new Vector2() },
    },
  }), [gl]);
  const geometry = useMemo(() => {
    const nextGeometry = new BufferGeometry();
    const count = leaf.length / 3;
    const seeds = new Float32Array(count);
    for (let index = 0; index < count; index += 1) seeds[index] = hash(index);
    nextGeometry.setAttribute('position', new BufferAttribute(leaf, 3));
    nextGeometry.setAttribute('aLeaf', new BufferAttribute(leaf, 3));
    nextGeometry.setAttribute('aMountain', new BufferAttribute(mountain, 3));
    nextGeometry.setAttribute('aSeed', new BufferAttribute(seeds, 1));
    return nextGeometry;
  }, [leaf, mountain]);
  const exitProgress = useRef(0);

  useFrame((state, delta) => {
    const leafProgress = reducedMotion ? 1 : MathUtils.smoothstep(elapsed, 0.8, 4.0);
    const mountainProgress = reducedMotion ? 1 : MathUtils.smoothstep(elapsed, 5.2, 8.0);
    exitProgress.current = MathUtils.damp(exitProgress.current, exiting ? 1 : 0, exiting ? 8.5 : 5, delta);
    material.uniforms.uElapsed.value = state.clock.elapsedTime;
    material.uniforms.uLeafProgress.value = leafProgress;
    material.uniforms.uMountainProgress.value = mountainProgress;
    material.uniforms.uExitProgress.value = exitProgress.current;
    material.uniforms.uPointer.value.x = MathUtils.damp(material.uniforms.uPointer.value.x, 0, 3.2, delta);
    material.uniforms.uPointer.value.y = MathUtils.damp(material.uniforms.uPointer.value.y, 0, 3.2, delta);
  });

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  return <points geometry={geometry} material={material} rotation={[-0.04, -0.12, 0.02]} />;
}

const defaultCamera = new Vector3(0.78, 0.62, 9.8);
const defaultTarget = new Vector3(0, 0.05, 0);

function IntroOrbitControls({ exiting, reducedMotion }: Pick<IntroParticleSceneProps, 'exiting' | 'reducedMotion'>) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  useFrame((_, delta) => {
    if (!exiting) return;
    camera.position.lerp(defaultCamera, 1 - Math.exp(-4.8 * delta));
    controls.current?.target.lerp(defaultTarget, 1 - Math.exp(-4.8 * delta));
    controls.current?.update();
  });

  return (
    <OrbitControls
      ref={controls}
      target={defaultTarget}
      enabled={!exiting && !reducedMotion}
      enablePan={false}
      enableZoom={false}
      enableDamping
      dampingFactor={0.075}
      rotateSpeed={0.5}
      minPolarAngle={0.32}
      maxPolarAngle={2.82}
    />
  );
}

function World({ elapsed, exiting, reducedMotion, onReady, onFailure }: IntroParticleSceneProps) {
  const [points, setPoints] = useState<{ leaf: Float32Array; mountain: Float32Array }>();

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const manifestResponse = await fetch('/assets/intro/particle-manifest.json', { signal: controller.signal });
        if (!manifestResponse.ok) throw new Error('Particle manifest is unavailable');
        const manifest = await manifestResponse.json() as ParticleManifest;
        const compact = window.innerWidth < 768 || navigator.connection?.saveData === true;
        const count = compact ? manifest.mobileCount : manifest.count;
        const [leaf, mountain] = await Promise.all([
          fetchParticleData(manifest.targets.leaf.url, count, controller.signal),
          fetchParticleData(manifest.targets.mountain.url, count, controller.signal),
        ]);
        setPoints({ leaf, mountain });
        onReady();
      } catch (error) {
        if ((error as Error).name !== 'AbortError') onFailure();
      }
    }
    load();
    return () => controller.abort();
  }, [onFailure, onReady]);

  return (
    <>
      <color attach="background" args={[new Color('#03110c')]} />
      {points ? <ParticleField {...points} elapsed={elapsed} exiting={exiting} reducedMotion={reducedMotion} /> : null}
      <IntroOrbitControls exiting={exiting} reducedMotion={reducedMotion} />
    </>
  );
}

class IntroSceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

declare global {
  interface NetworkInformation {
    saveData?: boolean;
  }
  interface Navigator {
    connection?: NetworkInformation;
  }
}

export function IntroParticleScene(props: IntroParticleSceneProps) {
  const webglAvailable = useMemo(supportsWebGL, []);

  useEffect(() => {
    if (!webglAvailable) props.onFailure();
  }, [props.onFailure, webglAvailable]);

  if (!webglAvailable) return null;

  return (
    <IntroSceneBoundary onFailure={props.onFailure}>
      <Canvas
        className="intro-particle-canvas"
        camera={{ position: [0.78, 0.62, 9.8], fov: 43, near: 0.1, far: 35 }}
        dpr={typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 1.25}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        style={{ touchAction: 'none' }}
      >
        <World {...props} />
      </Canvas>
    </IntroSceneBoundary>
  );
}
