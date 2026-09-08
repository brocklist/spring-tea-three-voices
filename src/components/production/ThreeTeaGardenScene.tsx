import { Grid, Html, Line, OrbitControls, useTexture } from "@react-three/drei";
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
  BufferGeometry,
  Float32BufferAttribute,
  Color,
  DoubleSide,
  PerspectiveCamera,
  PlaneGeometry,
  SRGBColorSpace,
  Vector3,
} from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { CameraPose, TeaGardenZone } from "../../types/domain";
import { assetUrl } from "../../lib/assetUrl";

const mapAsset = assetUrl("/assets/production/chunjian-tea-terrain-v3.png");
const terrainSize = { width: 20, depth: 11.25 };
const townshipBoundary: Array<[number, number]> = [
  [-8.75, -3.4],
  [-6.95, -4.55],
  [-3.25, -4.92],
  [0.65, -4.82],
  [4.65, -4.32],
  [8.35, -2.3],
  [8.8, 0.9],
  [7.05, 3.9],
  [3.25, 4.88],
  [-0.85, 4.72],
  [-5.65, 4.2],
  [-8.45, 1.72],
  [-8.82, -1.35],
  [-8.75, -3.4],
];
const overviewCameraPose: CameraPose = {
  position: [14, 15, 18],
  target: [0, 0.8, 0],
  fov: 43,
};
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

// Schematic elevation in scene units, aligned with the visible hills in the top-down artwork.
// This mesh is real relief geometry; the image supplies only the surface color.
function getTerrainHeight(x: number, z: number) {
  const hill = (
    cx: number,
    cz: number,
    height: number,
    spreadX: number,
    spreadZ: number,
  ) => height * Math.exp(-((x - cx) ** 2 / spreadX + (z - cz) ** 2 / spreadZ));
  const elevation =
    0.32 +
    hill(-6.5, -3.5, 3.1, 10, 5) +
    hill(1.6, -3.7, 3.6, 12, 5) +
    hill(7.2, -2.9, 2.9, 8, 6) +
    hill(-6, 1.9, 2.4, 9, 5) +
    hill(5.8, 1.4, 3.2, 8, 4) +
    hill(-2.7, 4.6, 1.7, 6, 3);
  // Terraced relief remains smooth enough for a continuous, stable textured surface.
  return elevation + Math.sin(elevation * 22) * 0.045;
}

function getTownshipBoundaryPoints(
  offset = 0.12,
): Array<[number, number, number]> {
  return townshipBoundary.map(([x, z]) => [
    x,
    getTerrainHeight(x, z) + offset,
    z,
  ]);
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
          Math.max(12, 50 + (zone.position[0] / terrainSize.width) * 90),
        );
        const top = Math.min(
          86,
          Math.max(14, 50 + (zone.position[2] / terrainSize.depth) * 80),
        );

        return (
          <div
            key={zone.id}
            className="scene-zone-card-anchor--fallback"
            style={{ left: `${left}%`, top: `${top}%` }}
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

function Terrain({ onReady }: { onReady: () => void }) {
  const texture = useTexture(mapAsset);
  const { gl } = useThree();
  const geometry = useMemo(() => {
    const nextGeometry = new PlaneGeometry(
      terrainSize.width,
      terrainSize.depth,
      180,
      104,
    );
    nextGeometry.rotateX(-Math.PI / 2);
    const positions = nextGeometry.attributes.position;

    for (let index = 0; index < positions.count; index += 1) {
      positions.setY(
        index,
        getTerrainHeight(positions.getX(index), positions.getZ(index)),
      );
    }

    positions.needsUpdate = true;
    nextGeometry.computeVertexNormals();
    return nextGeometry;
  }, []);

  const sides = useMemo(() => {
    const vertices: number[] = [];
    const steps = 120;
    const edge = (x1: number, z1: number, x2: number, z2: number) => {
      for (let i = 0; i < steps; i++) {
        const t = i / steps,
          u = (i + 1) / steps;
        const ax = x1 + (x2 - x1) * t,
          az = z1 + (z2 - z1) * t,
          bx = x1 + (x2 - x1) * u,
          bz = z1 + (z2 - z1) * u;
        const ay = getTerrainHeight(ax, az),
          by = getTerrainHeight(bx, bz);
        vertices.push(
          ax,
          ay,
          az,
          ax,
          -0.6,
          az,
          bx,
          by,
          bz,
          bx,
          by,
          bz,
          ax,
          -0.6,
          az,
          bx,
          -0.6,
          bz,
        );
      }
    };
    const w = terrainSize.width / 2,
      d = terrainSize.depth / 2;
    edge(-w, -d, w, -d);
    edge(w, -d, w, d);
    edge(w, d, -w, d);
    edge(-w, d, -w, -d);
    const mesh = new BufferGeometry();
    mesh.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    mesh.computeVertexNormals();
    return mesh;
  }, []);
  useEffect(() => () => sides.dispose(), [sides]);

  useLayoutEffect(() => {
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    texture.needsUpdate = true;
    onReady();
  }, [gl, onReady, texture]);

  useEffect(
    () => () => {
      geometry.dispose();
      texture.dispose();
      useTexture.clear(mapAsset);
    },
    [geometry, texture],
  );

  return (
    <group>
      <mesh geometry={sides}>
        <meshStandardMaterial color="#56633c" roughness={1} side={DoubleSide} />
      </mesh>
      <mesh position={[0, -0.72, 0]}>
        <boxGeometry args={[20.15, 0.24, 11.4]} />
        <meshStandardMaterial color="#1d352b" roughness={0.85} />
      </mesh>
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
        <meshBasicMaterial
          color="#3d806a"
          wireframe
          transparent
          opacity={0.025}
          depthWrite={false}
        />
      </mesh>
      <Grid
        args={[terrainSize.width, terrainSize.depth]}
        position={[0, -0.87, 0]}
        cellSize={0.84}
        cellThickness={0.1}
        cellColor="#28614f"
        sectionSize={4.2}
        sectionThickness={0.18}
        sectionColor="#5f9e87"
        fadeDistance={21}
        fadeStrength={1}
        infiniteGrid={false}
      />
    </group>
  );
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
      maxDistance={38}
      minPolarAngle={0.25}
      maxPolarAngle={1.3}
      rotateSpeed={0.48}
      zoomSpeed={0.68}
    />
  );
}

function TownshipBoundary() {
  const outerPoints = useMemo(() => getTownshipBoundaryPoints(0.11), []);
  const labelPosition = useMemo<[number, number, number]>(() => {
    const x = -7.7;
    const z = -3.1;
    return [x, getTerrainHeight(x, z) + 0.32, z];
  }, []);

  return (
    <group>
      <Line
        points={outerPoints}
        color="#91e8c7"
        lineWidth={1.1}
        transparent
        opacity={0.62}
      />
      <Html position={labelPosition} distanceFactor={12} zIndexRange={[2, 0]}>
        <div className="scene-boundary-label" aria-label="春建乡数字孪生范围">
          <span>数字孪生范围</span>
          <strong>春建乡</strong>
        </div>
      </Html>
    </group>
  );
}

function ZonePin({
  zone,
  selected,
  onSelect,
}: {
  zone: TeaGardenZone;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`terrain-pin ${selected ? "is-selected" : ""}`}
      aria-pressed={selected}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      <span>
        <i />
        {zone.name}
      </span>
      {selected && (
        <span className="terrain-pin-detail">
          <span>
            {zone.temperature} · 湿度 {zone.humidity}
          </span>
          <span>
            {zone.status} · {zone.area}
          </span>
          <small>演示片区数据</small>
        </span>
      )}
    </button>
  );
}
function ZoneMarker({
  zone,
  selected,
  onSelect,
}: {
  zone: TeaGardenZone;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <group
      position={[
        zone.position[0],
        getTerrainHeight(zone.position[0], zone.position[2]) + 0.16,
        zone.position[2],
      ]}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.15, selected ? 0.28 : 0.21, 32]} />
        <meshBasicMaterial
          color={selected ? "#d4f483" : "#d4f5e3"}
          side={DoubleSide}
        />
      </mesh>
      <Html position={[0, 0.45, 0]} center zIndexRange={[8, 0]}>
        <ZonePin zone={zone} selected={selected} onSelect={onSelect} />
      </Html>
    </group>
  );
}

function TeaGardenWorld({
  zones,
  selectedZoneId,
  focusedZoneId,
  resetToken,
  onZoneSelect,
  onSceneReady,
}: ThreeTeaGardenSceneProps) {
  const focusedZone = zones.find((zone) => zone.id === focusedZoneId);
  const focusPose = useMemo<CameraPose>(() => {
    if (!focusedZone) return overviewCameraPose;
    const [x, , z] = focusedZone.position;
    const y = getTerrainHeight(x, z);
    return { position: [x + 5.5, y + 7, z + 8], target: [x, y, z], fov: 43 };
  }, [focusedZone]);
  const readySent = useRef(false);
  const handleReady = useCallback(() => {
    if (readySent.current) return;
    readySent.current = true;
    onSceneReady?.();
  }, [onSceneReady]);

  return (
    <>
      <color attach="background" args={[new Color("#06140f")]} />

      <ambientLight intensity={0.95} color="#c9dfd0" />
      <directionalLight
        position={[-8, 12, 7]}
        intensity={2.1}
        color="#e6edd7"
      />
      <pointLight
        position={[4, 3, -2]}
        intensity={0.32}
        color="#62ddb0"
        distance={11}
      />
      <Suspense fallback={null}>
        <Terrain onReady={handleReady} />
      </Suspense>

      <TownshipBoundary />
      {zones.map((zone) => (
        <ZoneMarker
          key={zone.id}
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
        camera={{
          position: overviewCameraPose.position,
          fov: overviewCameraPose.fov,
          near: 0.1,
          far: 100,
        }}
        dpr={
          typeof window !== "undefined" && window.innerWidth < 768 ? 0.8 : 1.1
        }
        frameloop={isVisible ? "demand" : "never"}
        gl={{
          antialias: false,
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
