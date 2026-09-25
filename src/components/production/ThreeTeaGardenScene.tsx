import { TeaSurfaceFoliage } from './TeaSurfaceFoliage';
import { LandscapeMaterial } from './LandscapeMaterial';
import { useOriginalTeaMountain } from '../../lib/originalTeaMountain';
import { teaLandscape } from '../../data/teaLandscape';
import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Color,
  DoubleSide,
  PerspectiveCamera,
  Vector3,
} from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { CameraPose, TeaGardenZone } from "../../types/domain";
import { assetUrl } from "../../lib/assetUrl";

const mapAsset = assetUrl(teaLandscape.fallbackImage);
const terrainSize = { width: teaLandscape.width, depth: teaLandscape.depth };
const overviewCameraPose: CameraPose = { position:[11,21,29], target:[0,1.8,0], fov:42 };
const zonePoint = (zone:TeaGardenZone) => teaLandscape.zonePositions[zone.id] ?? [zone.position[0],zone.position[2]];
interface ThreeTeaGardenSceneProps {
  zones: TeaGardenZone[];
  selectedZoneId: string;
  focusedZoneId?: string;
  resetToken: number;
  onZoneSelect: (zoneId: string) => void;
  onSceneReady?: () => void;
}

interface SceneFallbackProps {
  zones: TeaGardenZone[];
  selectedZoneId: string;
  onZoneSelect: (zoneId: string) => void;
}

function supportsWebGL() {
  if (typeof document === "undefined") {
    return false;
  }

  const canvas = document.createElement("canvas");
  return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
}

function MapFallback({
  zones,
  selectedZoneId,
  onZoneSelect,
}: SceneFallbackProps) {
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
        const left = Math.min(
          88,
          Math.max(12, 50 + (zonePoint(zone)[0] / terrainSize.width) * 90),
        );
        const top = Math.min(
          86,
          Math.max(14, 50 + (zonePoint(zone)[1] / terrainSize.depth) * 80),
        );

        return (
          <div
            key={zone.id}
            className="scene-zone-card-anchor--fallback"
            style={{ left: zone.id === selectedZoneId ? `clamp(var(--map-card-half, 7rem), ${left}%, calc(100% - var(--map-card-half, 7rem)))` : `${left}%`, top: `${top}%`, zIndex: zone.id === selectedZoneId ? 15 : 8 }}
          >
            <ZonePin
              zone={zone}
              selected={zone.id === selectedZoneId}
              onSelect={() => onZoneSelect(zone.id)}
            />
          </div>
        );
      })}
    </div>
  );
}

class SceneErrorBoundary extends Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function CameraController({
  pose,
  resetToken,
}: {
  pose: CameraPose;
  resetToken: number;
}) {
  const { camera, invalidate } = useThree();
  const controls = useRef<OrbitControlsImpl>(null);
  const focus = useRef(new Vector3(...overviewCameraPose.target));
  const targetFocus = useRef(new Vector3(...overviewCameraPose.target));
  const targetPosition = useRef(new Vector3(...overviewCameraPose.position));
  const targetFov = useRef(overviewCameraPose.fov);
  const isFlying = useRef(true);
  const reducedMotion = useRef(false);
  const [controlsEnabled, setControlsEnabled] = useState(true);

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useEffect(() => {
    targetPosition.current.set(...pose.position);
    targetFocus.current.set(...pose.target);
    targetFov.current = pose.fov;
    isFlying.current = true;
    setControlsEnabled(true);
    if (controls.current) {
      controls.current.enabled = true;
    }
    invalidate();
  }, [invalidate, pose, resetToken]);

  useFrame((_, delta) => {
    const perspectiveCamera = camera as PerspectiveCamera;
    const orbit = controls.current;

    if (isFlying.current) {
      const motionRate = reducedMotion.current ? 1000 : 9;
      const focusRate = reducedMotion.current ? 1000 : 9;
      const interpolation = 1 - Math.exp(-delta * motionRate);
      const focusInterpolation = 1 - Math.exp(-delta * focusRate);

      camera.position.lerp(targetPosition.current, interpolation);
      focus.current.lerp(targetFocus.current, focusInterpolation);
      perspectiveCamera.fov +=
        (targetFov.current - perspectiveCamera.fov) * interpolation;
      perspectiveCamera.updateProjectionMatrix();
      camera.lookAt(focus.current);

      if (orbit) {
        orbit.target.copy(focus.current);
        orbit.update();
      }

      const settled =
        camera.position.distanceTo(targetPosition.current) < 0.025 &&
        focus.current.distanceTo(targetFocus.current) < 0.025 &&
        Math.abs(perspectiveCamera.fov - targetFov.current) < 0.08;

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
      onStart={() => {
        isFlying.current = false;
      }}
      enablePan={false}
      enableDamping={false}
      minDistance={5.8}
      maxDistance={180}
      minPolarAngle={0.3}
      maxPolarAngle={1.15}
      rotateSpeed={0.48}
      zoomSpeed={0.68}
    />
  );
}

// Same marker and four-field information card as f21c899; keep one button mounted for keyboard focus.
function ZonePin({zone,selected,onSelect}:{zone:TeaGardenZone;selected:boolean;onSelect:()=>void}) {
 return <button type="button" onClick={event=>{event.stopPropagation();onSelect();}} className={selected?`scene-zone-card scene-zone-card--${zone.markerTone} is-selected`:`scene-zone-marker scene-zone-marker--${zone.markerTone}`} aria-pressed={selected} aria-label={selected?`${zone.name}，温度${zone.temperature}，空气湿度${zone.humidity}，土壤湿度${zone.soilMoisture}，状态${zone.status}`:`选择${zone.name}，当前状态${zone.status}`}>
 {selected?<><span className="scene-zone-card__heading"><span className="scene-zone-card__name"><i aria-hidden="true"/>{zone.name}</span><span className="scene-zone-card__mode">当前选中</span></span><span className="scene-zone-card__metrics"><span><small>温度</small><strong>{zone.temperature}</strong></span><span><small>空气湿度</small><strong>{zone.humidity}</strong></span><span><small>土壤湿度</small><strong>{zone.soilMoisture}</strong></span><span><small>状态</small><strong>{zone.status}</strong></span></span></>:<><span className="scene-zone-marker__pulse"/><span className="scene-zone-marker__label">{zone.name}</span></>}
 </button>;
}
function ZoneMarker({zone,selected,onSelect,height}:{zone:TeaGardenZone;selected:boolean;onSelect:()=>void;height:number}) {
 const [x,z]=zonePoint(zone);
 const color=zone.markerTone==='gold'?'#c9a75f':zone.markerTone==='cyan'?'#91e8c7':'#62ddb0';
 return <group position={[x,height+.12,z]}>
 <mesh rotation={[-Math.PI/2,0,0]}><ringGeometry args={selected?[.23,.3,40]:[.15,.2,32]}/><meshBasicMaterial color={color} transparent opacity={.85} side={DoubleSide}/></mesh>
 <Html position={[0,selected?1.0:.65,0]} center zIndexRange={selected?[14,13]:[8,0]}><ZonePin zone={zone} selected={selected} onSelect={onSelect}/></Html>
 </group>;
}

function TeaGardenWorld({
  zones,
  selectedZoneId,
  focusedZoneId,
  resetToken,
  onZoneSelect,
  onSceneReady,
}: ThreeTeaGardenSceneProps) {
  const {size}=useThree();
  const model=useOriginalTeaMountain();
  const heights=useMemo(()=>Object.fromEntries(zones.map(zone=>{const [x,z]=zonePoint(zone);return [zone.id,model.heightAt(x,z)];})),[model,zones]);
  const focusedZone = zones.find((zone) => zone.id === focusedZoneId);
  const focusPose = useMemo<CameraPose>(() => {
    if (!focusedZone) {
      const aspect=size.width/size.height;
      const distance=Math.min(160, Math.max(48,48/aspect));
      const direction=new Vector3(.27,.58,.77).normalize().multiplyScalar(distance);
      return {position:[direction.x,direction.y+1.8,direction.z],target:[0,1.8,0],fov:42};
    }
    const [x,z] = zonePoint(focusedZone);
    const y = heights[focusedZone.id];
    return { position: [x + 5.5, y + 7, z + 8], target: [x, y, z], fov: 43 };
  }, [focusedZone,size.width,size.height,heights]);
  const readySent = useRef(false);
  const handleReady = useCallback(() => {
    if (readySent.current) return;
    readySent.current = true;
    onSceneReady?.();
  }, [onSceneReady]);

  useLayoutEffect(()=>handleReady(),[handleReady]);
  return (
    <>
      <color attach="background" args={[new Color("#06140f")]} />

      <hemisphereLight intensity={1.2} color="#ecf3e2" groundColor="#5b6249" />
      <directionalLight
        position={[-12, 22, 10]}
        intensity={2.5}
        color="#fff0cf"
        castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-20} shadow-camera-right={20} shadow-camera-top={20} shadow-camera-bottom={-20} shadow-camera-far={65} shadow-normalBias={0.045} shadow-bias={-0.0002}
      />
      <pointLight
        position={[4, 3, -2]}
        intensity={0.32}
        color="#62ddb0"
        distance={11}
      />
      <Suspense fallback={null}>
        <mesh geometry={model.geometry} castShadow receiveShadow><LandscapeMaterial vertexColors /></mesh>
        <TeaSurfaceFoliage geometry={model.geometry} />
      </Suspense>


      {zones.map((zone) => (
        <ZoneMarker
          key={zone.id}
          height={heights[zone.id]}
          zone={zone}
          selected={zone.id === selectedZoneId}
          onSelect={() => onZoneSelect(zone.id)}
        />
      ))}
      <CameraController pose={focusPose} resetToken={resetToken} />
    </>
  );
}

export function ThreeTeaGardenScene({
  zones,
  selectedZoneId,
  focusedZoneId,
  resetToken,
  onZoneSelect,
  onSceneReady,
}: ThreeTeaGardenSceneProps) {
  const [isVisible, setIsVisible] = useState(
    () =>
      typeof document === "undefined" || document.visibilityState !== "hidden",
  );
  const webglAvailable = useMemo(supportsWebGL, []);

  useEffect(() => {
    const syncVisibility = () =>
      setIsVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", syncVisibility);
    return () =>
      document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  useEffect(() => {
    if (!webglAvailable) onSceneReady?.();
  }, [onSceneReady, webglAvailable]);

  const fallback = (
    <MapFallback
      zones={zones}
      selectedZoneId={selectedZoneId}
      onZoneSelect={onZoneSelect}
    />
  );

  if (!webglAvailable) {
    return fallback;
  }

  return (
    <SceneErrorBoundary fallback={fallback}>
      <Canvas
        className="twin-canvas"
        shadows
        camera={{
          position: overviewCameraPose.position,
          fov: overviewCameraPose.fov,
          near: 0.1,
          far: 240,
        }}
        dpr={
          typeof window !== "undefined" && window.innerWidth < 768 ? 1 : 1.35
        }
        frameloop={isVisible ? "demand" : "never"}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        fallback={fallback}
      >
        <TeaGardenWorld
          zones={zones}
          selectedZoneId={selectedZoneId}
          focusedZoneId={focusedZoneId}
          resetToken={resetToken}
          onZoneSelect={onZoneSelect}
          onSceneReady={onSceneReady}
        />
      </Canvas>
    </SceneErrorBoundary>
  );
}
