import { Grid, Html, useTexture } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Color, DoubleSide, Group, PlaneGeometry, SRGBColorSpace, Vector3 } from 'three';
import type { TeaGardenZone } from '../../types/domain';

const mapAsset = '/assets/production/chunjian-digital-twin-map-v1.png';
const terrainSize = { width: 16, depth: 9 };

interface ThreeTeaGardenSceneProps {
  zones: TeaGardenZone[];
  selectedZoneId: string;
  focusedZoneId?: string;
  resetToken: number;
  onZoneSelect: (zoneId: string) => void;
}

interface SceneFallbackProps {
  zones: TeaGardenZone[];
  selectedZoneId: string;
  onZoneSelect: (zoneId: string) => void;
}

function getTerrainHeight(x: number, z: number) {
  const broadSlope = 0.22 * Math.sin((x + 1.4) * 0.72) * Math.cos((z - 0.35) * 0.65);
  const northernRidge = 0.32 * Math.exp(-((x + 2.2) ** 2 + (z + 1.4) ** 2) / 7);
  const easternRidge = 0.42 * Math.exp(-((x - 3.3) ** 2 + (z - 0.4) ** 2) / 5);
  const teaTerrace = 0.09 * Math.sin(x * 3.4 + z * 1.4);
  return broadSlope + northernRidge + easternRidge + teaTerrace;
}

function supportsWebGL() {
  if (typeof document === 'undefined') {
    return false;
  }

  const canvas = document.createElement('canvas');
  return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
}

function MapFallback({ zones, selectedZoneId, onZoneSelect }: SceneFallbackProps) {
  return (
    <div className="twin-map-fallback">
      <img src={mapAsset} alt="春建乡茶园数字孪生地图" />
      <div className="twin-map-fallback__veil" />
      {zones.map((zone) => {
        const left = Math.min(88, Math.max(12, 50 + (zone.position[0] / terrainSize.width) * 90));
        const top = Math.min(86, Math.max(14, 50 + (zone.position[2] / terrainSize.depth) * 80));

        return (
        <button
          key={zone.id}
          type="button"
          onClick={() => onZoneSelect(zone.id)}
          className={`scene-zone-marker scene-zone-marker--fallback scene-zone-marker--${zone.markerTone} ${selectedZoneId === zone.id ? 'is-selected' : ''}`}
          style={{ left: `${left}%`, top: `${top}%` }}
          aria-label={`查看${zone.name}片区详情`}
        >
          <span className="scene-zone-marker__pulse" />
          <span className="scene-zone-marker__label">{zone.name}</span>
        </button>
        );
      })}
    </div>
  );
}

class SceneErrorBoundary extends Component<{ fallback: React.ReactNode; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function Terrain({ onReady }: { onReady: () => void }) {
  const texture = useTexture(mapAsset);
  const geometry = useMemo(() => {
    const nextGeometry = new PlaneGeometry(terrainSize.width, terrainSize.depth, 104, 64);
    nextGeometry.rotateX(-Math.PI / 2);
    const positions = nextGeometry.attributes.position;

    for (let index = 0; index < positions.count; index += 1) {
      positions.setY(index, getTerrainHeight(positions.getX(index), positions.getZ(index)));
    }

    positions.needsUpdate = true;
    nextGeometry.computeVertexNormals();
    return nextGeometry;
  }, []);

  useLayoutEffect(() => {
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    onReady();
  }, [onReady, texture]);

  useEffect(() => () => {
    geometry.dispose();
    texture.dispose();
    useTexture.clear(mapAsset);
  }, [geometry, texture]);

  return (
    <group>
      <mesh geometry={geometry} receiveShadow castShadow>
        <meshStandardMaterial map={texture} roughness={0.96} metalness={0.03} side={DoubleSide} />
      </mesh>
      <mesh geometry={geometry} position={[0, 0.012, 0]}>
        <meshBasicMaterial color="#4df5cc" wireframe transparent opacity={0.1} depthWrite={false} />
      </mesh>
      <Grid
        args={[terrainSize.width, terrainSize.depth]}
        position={[0, 0.075, 0]}
        cellSize={0.72}
        cellThickness={0.35}
        cellColor="#48e5bd"
        sectionSize={3.6}
        sectionThickness={0.65}
        sectionColor="#79f4d2"
        fadeDistance={17}
        fadeStrength={1}
        infiniteGrid={false}
      />
    </group>
  );
}

function CameraRig({ focusOffset, resetToken }: { focusOffset: [number, number, number]; resetToken: number }) {
  const { camera, pointer } = useThree();
  const focus = useRef(new Vector3(0, 0, 0));
  const target = useRef(new Vector3(0, 0, 0));
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.matchMedia('(pointer: coarse)').matches;
  }, []);

  useEffect(() => {
    target.current.set(focusOffset[0], focusOffset[1], focusOffset[2]);
  }, [focusOffset, resetToken]);

  useFrame((_, delta) => {
    const parallaxX = reducedMotion.current ? 0 : pointer.x * 0.32;
    const parallaxY = reducedMotion.current ? 0 : pointer.y * 0.14;
    const desiredPosition = new Vector3(7.55 + parallaxX, 7.25 + parallaxY, 8.2 - parallaxX * 0.28);
    camera.position.lerp(desiredPosition, 1 - Math.exp(-delta * 2.4));
    focus.current.lerp(target.current, 1 - Math.exp(-delta * 3.4));
    camera.lookAt(focus.current);
  });

  return null;
}

function ScanLines() {
  const group = useRef<Group>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useFrame((_, delta) => {
    if (group.current && !reducedMotion.current) {
      group.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group ref={group} position={[0, 0.08, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.15, 2.19, 96]} />
        <meshBasicMaterial color="#38e8c3" transparent opacity={0.24} side={DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0.58, 0]}>
        <ringGeometry args={[4.15, 4.17, 96, 1, 0, Math.PI * 0.46]} />
        <meshBasicMaterial color="#7af7dc" transparent opacity={0.18} side={DoubleSide} />
      </mesh>
    </group>
  );
}

function ZoneMarker({ zone, selected, onSelect }: { zone: TeaGardenZone; selected: boolean; onSelect: () => void }) {
  const position: [number, number, number] = [zone.position[0], getTerrainHeight(zone.position[0], zone.position[2]) + 0.18, zone.position[2]];
  const color = zone.markerTone === 'gold' ? '#f5c764' : zone.markerTone === 'cyan' ? '#57e7eb' : '#71f5bd';

  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.28, 40]} />
        <meshBasicMaterial color={color} transparent opacity={0.88} side={DoubleSide} />
      </mesh>
      <pointLight color={color} intensity={selected ? 1.4 : 0.8} distance={3.2} />
      <Html position={[0, 0.22, 0]} center distanceFactor={10.5} zIndexRange={[3, 0]}>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
          }}
          className={`scene-zone-marker scene-zone-marker--${zone.markerTone} ${selected ? 'is-selected' : ''}`}
          aria-pressed={selected}
          aria-label={`查看${zone.name}片区详情`}
        >
          <span className="scene-zone-marker__pulse" />
          <span className="scene-zone-marker__label">{zone.name}</span>
        </button>
      </Html>
    </group>
  );
}

function TeaGardenWorld({ zones, selectedZoneId, focusedZoneId, resetToken, onZoneSelect }: ThreeTeaGardenSceneProps) {
  const focusedZone = zones.find((zone) => zone.id === focusedZoneId);
  const handleReady = useMemo(() => () => undefined, []);

  return (
    <>
      <color attach="background" args={[new Color('#06140f')]} />
      <fog attach="fog" args={['#06140f', 10, 23]} />
      <ambientLight intensity={0.94} color="#b3ead4" />
      <directionalLight position={[-5, 9, 4]} intensity={2.15} color="#d9f5cc" castShadow />
      <pointLight position={[4, 3, -2]} intensity={1.1} color="#36e5c1" distance={11} />
      <Suspense fallback={null}>
        <Terrain onReady={handleReady} />
      </Suspense>
      <ScanLines />
      {zones.map((zone) => <ZoneMarker key={zone.id} zone={zone} selected={zone.id === selectedZoneId} onSelect={() => onZoneSelect(zone.id)} />)}
      <CameraRig focusOffset={focusedZone?.focusOffset ?? [0, 0, 0]} resetToken={resetToken} />
    </>
  );
}

export function ThreeTeaGardenScene({ zones, selectedZoneId, focusedZoneId, resetToken, onZoneSelect }: ThreeTeaGardenSceneProps) {
  const [isVisible, setIsVisible] = useState(() => typeof document === 'undefined' || document.visibilityState !== 'hidden');
  const webglAvailable = useMemo(supportsWebGL, []);

  useEffect(() => {
    const syncVisibility = () => setIsVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', syncVisibility);
    return () => document.removeEventListener('visibilitychange', syncVisibility);
  }, []);

  const fallback = <MapFallback zones={zones} selectedZoneId={selectedZoneId} onZoneSelect={onZoneSelect} />;

  if (!webglAvailable) {
    return fallback;
  }

  return (
    <SceneErrorBoundary fallback={fallback}>
      <Canvas
        className="twin-canvas"
        camera={{ position: [7.55, 7.25, 8.2], fov: 42, near: 0.1, far: 40 }}
        dpr={typeof window !== 'undefined' && window.innerWidth < 768 ? [1, 1] : [1, 1.45]}
        frameloop={isVisible ? 'always' : 'never'}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        fallback={fallback}
      >
        <TeaGardenWorld zones={zones} selectedZoneId={selectedZoneId} focusedZoneId={focusedZoneId} resetToken={resetToken} onZoneSelect={onZoneSelect} />
      </Canvas>
    </SceneErrorBoundary>
  );
}
