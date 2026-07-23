import { Grid, Html, Line, OrbitControls, useTexture } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Color, DoubleSide, PerspectiveCamera, PlaneGeometry, SRGBColorSpace, Vector3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { CameraPose, TeaGardenZone } from '../../types/domain';

const mapAsset = '/assets/production/chunjian-digital-twin-map-v1.png';
const terrainSize = { width: 16, depth: 9 };
const townshipBoundary: Array<[number, number]> = [
  [-6.65, -2.75], [-4.85, -3.55], [-1.55, -3.8], [1.55, -3.62], [4.65, -2.85], [6.65, -1.1],
  [6.35, 1.35], [4.95, 2.95], [2.05, 3.72], [-1.3, 3.58], [-4.5, 2.85], [-6.35, 1.2], [-6.8, -1.35], [-6.65, -2.75],
];
const overviewCameraPose: CameraPose = {
  position: [6.55, 5.85, 7.15],
  target: [0, 0.1, 0],
  fov: 38,
};

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

function getTownshipBoundaryPoints(offset = 0.12): Array<[number, number, number]> {
  return townshipBoundary.map(([x, z]) => [x, getTerrainHeight(x, z) + offset, z]);
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
      <div className="twin-map-fallback__boundary" aria-hidden="true">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline points="8,19 20,11 40,8 59,10 77,18 89,34 87,61 78,79 60,88 39,86 19,78 7,59 5,35 8,19" />
        </svg>
        <span>春建乡数字孪生范围</span>
      </div>
      {zones.map((zone) => {
        const left = Math.min(88, Math.max(12, 50 + (zone.position[0] / terrainSize.width) * 90));
        const top = Math.min(86, Math.max(14, 50 + (zone.position[2] / terrainSize.depth) * 80));

        return (
          <div key={zone.id} className="scene-zone-card-anchor--fallback" style={{ left: `${left}%`, top: `${top}%` }}>
            {selectedZoneId === zone.id
              ? <ZoneCard zone={zone} onSelect={() => onZoneSelect(zone.id)} />
              : <ZoneMarkerLabel zone={zone} onSelect={() => onZoneSelect(zone.id)} />}
          </div>
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
  const { gl } = useThree();
  const geometry = useMemo(() => {
    const nextGeometry = new PlaneGeometry(terrainSize.width, terrainSize.depth, 72, 40);
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
    texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    texture.needsUpdate = true;
    onReady();
  }, [gl, onReady, texture]);

  useEffect(() => () => {
    geometry.dispose();
    texture.dispose();
    useTexture.clear(mapAsset);
  }, [geometry, texture]);

  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          map={texture}
          emissiveMap={texture}
          color="#d4e7d9"
          emissive="#b8ddca"
          emissiveIntensity={0.11}
          roughness={0.92}
          metalness={0.02}
          side={DoubleSide}
        />
      </mesh>
      <mesh geometry={geometry} position={[0, 0.012, 0]}>
        <meshBasicMaterial color="#3d806a" wireframe transparent opacity={0.025} depthWrite={false} />
      </mesh>
      <Grid
        args={[terrainSize.width, terrainSize.depth]}
        position={[0, 0.075, 0]}
        cellSize={0.72}
        cellThickness={0.1}
        cellColor="#28614f"
        sectionSize={3.6}
        sectionThickness={0.18}
        sectionColor="#5f9e87"
        fadeDistance={17}
        fadeStrength={1}
        infiniteGrid={false}
      />
    </group>
  );
}

function CameraController({ pose, resetToken }: { pose: CameraPose; resetToken: number }) {
  const { camera, invalidate } = useThree();
  const controls = useRef<OrbitControlsImpl>(null);
  const focus = useRef(new Vector3(...overviewCameraPose.target));
  const targetFocus = useRef(new Vector3(...overviewCameraPose.target));
  const targetPosition = useRef(new Vector3(...overviewCameraPose.position));
  const targetFov = useRef(overviewCameraPose.fov);
  const isFlying = useRef(true);
  const reducedMotion = useRef(false);
  const [controlsEnabled, setControlsEnabled] = useState(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    targetPosition.current.set(...pose.position);
    targetFocus.current.set(...pose.target);
    targetFov.current = pose.fov;
    isFlying.current = true;
    setControlsEnabled(false);
    if (controls.current) {
      controls.current.enabled = false;
    }
    invalidate();
  }, [invalidate, pose, resetToken]);

  useFrame((_, delta) => {
    const perspectiveCamera = camera as PerspectiveCamera;
    const orbit = controls.current;

    if (isFlying.current) {
      const motionRate = reducedMotion.current ? 28 : 2.7;
      const focusRate = reducedMotion.current ? 28 : 3.1;
      const interpolation = 1 - Math.exp(-delta * motionRate);
      const focusInterpolation = 1 - Math.exp(-delta * focusRate);

      camera.position.lerp(targetPosition.current, interpolation);
      focus.current.lerp(targetFocus.current, focusInterpolation);
      perspectiveCamera.fov += (targetFov.current - perspectiveCamera.fov) * interpolation;
      perspectiveCamera.updateProjectionMatrix();
      camera.lookAt(focus.current);

      if (orbit) {
        orbit.target.copy(focus.current);
        orbit.update();
      }

      const settled = camera.position.distanceTo(targetPosition.current) < 0.025
        && focus.current.distanceTo(targetFocus.current) < 0.025
        && Math.abs(perspectiveCamera.fov - targetFov.current) < 0.08;

      if (settled) {
        camera.position.copy(targetPosition.current);
        focus.current.copy(targetFocus.current);
        perspectiveCamera.fov = targetFov.current;
        perspectiveCamera.updateProjectionMatrix();
        if (orbit) {
          orbit.target.copy(focus.current);
          orbit.enabled = true;
          setControlsEnabled(true);
          orbit.update();
        }
        isFlying.current = false;
      } else {
        invalidate();
      }
      return;
    }

    orbit?.update();
  });

  return (
    <OrbitControls
      ref={controls}
      enabled={controlsEnabled}
      enablePan={false}
      enableDamping={false}
      minDistance={4.6}
      maxDistance={13}
      minPolarAngle={0.56}
      maxPolarAngle={1.2}
      minAzimuthAngle={-1.2}
      maxAzimuthAngle={1.2}
      rotateSpeed={0.48}
      zoomSpeed={0.68}
    />
  );
}

function TownshipBoundary() {
  const outerPoints = useMemo(() => getTownshipBoundaryPoints(0.11), []);
  const labelPosition = useMemo<[number, number, number]>(() => {
    const x = -5.7;
    const z = -2.35;
    return [x, getTerrainHeight(x, z) + 0.32, z];
  }, []);

  return (
    <group>
      <Line points={outerPoints} color="#91e8c7" lineWidth={1.1} transparent opacity={0.62} />
      <Html position={labelPosition} distanceFactor={12} zIndexRange={[2, 0]}>
        <div className="scene-boundary-label" aria-label="春建乡数字孪生范围">
          <span>数字孪生范围</span>
          <strong>春建乡</strong>
        </div>
      </Html>
    </group>
  );
}

function ZoneCard({ zone, onSelect }: { zone: TeaGardenZone; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      className={`scene-zone-card scene-zone-card--${zone.markerTone} is-selected`}
      aria-pressed="true"
      aria-label={`${zone.name}，温度${zone.temperature}，空气湿度${zone.humidity}，土壤湿度${zone.soilMoisture}，状态${zone.status}`}
    >
      <span className="scene-zone-card__heading">
        <span className="scene-zone-card__name"><i aria-hidden="true" />{zone.name}</span>
        <span className="scene-zone-card__mode">当前选中</span>
      </span>
      <span className="scene-zone-card__metrics">
        <span><small>温度</small><strong>{zone.temperature}</strong></span>
        <span><small>空气湿度</small><strong>{zone.humidity}</strong></span>
        <span><small>土壤湿度</small><strong>{zone.soilMoisture}</strong></span>
        <span><small>状态</small><strong>{zone.status}</strong></span>
      </span>
    </button>
  );
}

function ZoneMarkerLabel({ zone, onSelect }: { zone: TeaGardenZone; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      className={`scene-zone-marker scene-zone-marker--${zone.markerTone}`}
      aria-pressed="false"
      aria-label={`选择${zone.name}，当前状态${zone.status}`}
    >
      <span className="scene-zone-marker__pulse" />
      <span className="scene-zone-marker__label">{zone.name}</span>
    </button>
  );
}

function ZoneMarker({ zone, selected, onSelect }: { zone: TeaGardenZone; selected: boolean; onSelect: () => void }) {
  const position: [number, number, number] = [zone.position[0], getTerrainHeight(zone.position[0], zone.position[2]) + 0.18, zone.position[2]];
  const color = zone.markerTone === 'gold' ? '#c9a75f' : zone.markerTone === 'cyan' ? '#91e8c7' : '#62ddb0';
  const cardPosition: [number, number, number] = [zone.cardOffset[0], selected ? 0.58 : 0.38, zone.cardOffset[1]];
  const markerPosition: [number, number, number] = [zone.position[0] <= -2.8 ? 0.58 : 0, 0.28, 0];
  const selectedCardPosition: [number, number, number] = [
    cardPosition[0] + (zone.position[0] >= 2.8 ? -0.6 : zone.position[0] <= -2.8 ? 0.42 : 0),
    cardPosition[1],
    cardPosition[2],
  ];

  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={selected ? [0.28, 0.36, 40] : [0.22, 0.28, 40]} />
        <meshBasicMaterial color={color} transparent opacity={0.72} side={DoubleSide} />
      </mesh>
      <Html position={selected ? selectedCardPosition : markerPosition} center={!selected} distanceFactor={selected ? 8.3 : 11.6} zIndexRange={[8, 0]}>
        {selected ? <ZoneCard zone={zone} onSelect={onSelect} /> : <ZoneMarkerLabel zone={zone} onSelect={onSelect} />}
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
      <ambientLight intensity={0.82} color="#c9dfd0" />
      <directionalLight position={[-5, 9, 4]} intensity={1.46} color="#e6edd7" />
      <pointLight position={[4, 3, -2]} intensity={0.32} color="#62ddb0" distance={11} />
      <Suspense fallback={null}>
        <Terrain onReady={handleReady} />
      </Suspense>
      <TownshipBoundary />
      {zones.map((zone) => <ZoneMarker key={zone.id} zone={zone} selected={zone.id === selectedZoneId} onSelect={() => onZoneSelect(zone.id)} />)}
      <CameraController pose={focusedZone?.cameraPose ?? overviewCameraPose} resetToken={resetToken} />
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
        camera={{ position: overviewCameraPose.position, fov: overviewCameraPose.fov, near: 0.1, far: 40 }}
        dpr={typeof window !== 'undefined' && window.innerWidth < 768 ? 0.8 : 1.1}
        frameloop={isVisible ? 'demand' : 'never'}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        fallback={fallback}
      >
        <TeaGardenWorld zones={zones} selectedZoneId={selectedZoneId} focusedZoneId={focusedZoneId} resetToken={resetToken} onZoneSelect={onZoneSelect} />
      </Canvas>
    </SceneErrorBoundary>
  );
}
