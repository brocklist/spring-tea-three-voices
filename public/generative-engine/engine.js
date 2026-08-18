import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { AfterimagePass } from 'three/addons/postprocessing/AfterimagePass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { gsap } from 'gsap';
import { CinematographyController, createVjConsole } from './cinematography-vj.js';
import { GpgpuSimulation, getCapabilityTier, parsePly } from './gpgpu.js';

const canvas = document.querySelector('#art-canvas');
const status = document.querySelector('#engine-status');
const stageLabel = document.querySelector('#engine-stage');
const clock = new THREE.Clock();
const state = {
  stage: 'loading', progress: 0, playing: true,
  fieldA: 0, fieldB: 21, fieldMix: .35, damping: 1.1, strength: 1,
  bloom: .38, afterimage: .74,
};
let renderer;
let composer;
let bloomPass;
let afterimagePass;
let simulation;
let particles;
let director;
let vj;
let timeline;
let raf;
let lastMetrics = 0;
let lastProgressMessage = 0;
let frames = 0;
let fpsStamp = performance.now();
let leafReady = false;
let disposed = false;
let bridgeHandler;
let contextLostHandler;

function send(type, payload = {}) {
  window.parent?.postMessage({ channel: 'tea-generative-engine', type, ...payload }, window.location.origin);
}

function setStage(nextStage) {
  state.stage = nextStage;
  stageLabel.textContent = stageText(nextStage);
  director?.setStage(nextStage);
  send('STAGE_CHANGE', { stage: nextStage, progress: state.progress });
}

function stageText(stage) {
  return ({ loading: '正在解析点云', leaf: '一叶初生', mountain: '山野成形', ready: '数智茶鸣', exiting: '正在进入茶园' })[stage] ?? stage;
}

function tweenProgress(to, duration, complete) {
  timeline?.kill();
  timeline = gsap.to(state, {
    progress: to,
    duration,
    ease: 'power2.inOut',
    onComplete: complete,
  });
}

function playLeaf() {
  leafReady = false;
  setStage('leaf');
  tweenProgress(.46, 4.0, () => {
    leafReady = true;
    send('LEAF_READY', { progress: state.progress });
  });
}

function advanceMountain() {
  if (state.stage !== 'leaf' || !leafReady) return;
  leafReady = false;
  setStage('mountain');
  tweenProgress(.9, 2.8, () => setStage('ready'));
}

function resetSimulation() {
  timeline?.kill();
  simulation.seed();
  state.progress = 0;
  playLeaf();
}

function setupPostProcessing(scene, camera, tier) {
  composer = new EffectComposer(renderer);
  composer.setPixelRatio(tier.size >= 1024 ? Math.min(devicePixelRatio, 1.2) : Math.min(devicePixelRatio, .9));
  composer.addPass(new RenderPass(scene, camera));
  bloomPass = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), .38, .32, .22);
  bloomPass.threshold = .22;
  bloomPass.radius = .32;
  composer.addPass(bloomPass);
  afterimagePass = new AfterimagePass(.74);
  composer.addPass(afterimagePass);
  composer.addPass(new OutputPass());
}

function resize() {
  if (!renderer || !director) return;
  const width = innerWidth;
  const height = innerHeight;
  const camera = director.camera;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  director.resize(camera.aspect);
  renderer.setSize(width, height, false);
  composer.setSize(width, height);
}

function run() {
  if (disposed) return;
  raf = requestAnimationFrame(run);
  if (!simulation || document.visibilityState === 'hidden') return;
  const delta = Math.min(clock.getDelta(), .033);
  const elapsed = clock.elapsedTime;
  if (state.playing) simulation.step({ time: elapsed, delta, ...state });
  simulation.bindParticles(particles, elapsed);
  director.update(delta);
  bloomPass.strength = state.bloom;
  afterimagePass.uniforms.damp.value = state.afterimage;
  composer.render();
  if (performance.now() - lastProgressMessage > 120) {
    send('PROGRESS', { progress: state.progress, stage: state.stage });
    lastProgressMessage = performance.now();
  }
  frames += 1;
  if (performance.now() - fpsStamp > 1000) {
    const fps = Math.round(frames * 1000 / (performance.now() - fpsStamp));
    vj?.setStats(`${simulation.size}² · ${simulation.count.toLocaleString()} 粒子 · ${fps} FPS`);
    send('METRICS', { fps, count: simulation.count, tier: simulation.size });
    frames = 0; fpsStamp = performance.now();
  }
}

function attachBridge() {
  bridgeHandler = (event) => {
    if (
      event.source !== window.parent
      || event.origin !== window.location.origin
      || event.data?.channel !== 'tea-generative-engine'
    ) return;
    const { type, value } = event.data;
    if (type === 'ADVANCE_MOUNTAIN') advanceMountain();
    if (type === 'PLAY') { state.playing = true; timeline?.play(); }
    if (type === 'PAUSE') { state.playing = false; timeline?.pause(); }
    if (type === 'RESET') resetSimulation();
    if (type === 'SET_PROGRESS') { timeline?.pause(); state.progress = THREE.MathUtils.clamp(Number(value), 0, 1); }
    if (type === 'SET_FIELD') { state.fieldA = Number(event.data.fieldA ?? state.fieldA); state.fieldB = Number(event.data.fieldB ?? state.fieldB); state.fieldMix = Number(event.data.fieldMix ?? state.fieldMix); }
    if (type === 'SET_CAMERA') director?.playSequence(Number(value) || 0);
  };
  window.addEventListener('message', bridgeHandler);
}

async function start() {
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    const tier = getCapabilityTier(renderer);
    if (!tier.supported) throw new Error('当前设备不支持 WebGL2 浮点渲染');
    status.textContent = `正在载入 ${tier.label}`;
    const [leaf, mountain] = await Promise.all([
      parsePly('/assets/generative/tea-leaf.ply'),
      parsePly('/assets/generative/tea-mountain.ply'),
    ]);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#03110c');
    scene.fog = new THREE.FogExp2('#03110c', .038);
    const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, .04, 44);
    simulation = new GpgpuSimulation(renderer, leaf, mountain, tier);
    particles = simulation.createParticleSystem();
    scene.add(particles);
    director = new CinematographyController(camera, canvas, simulation.radius);
    setupPostProcessing(scene, camera, tier);
    vj = createVjConsole({
      onChange(key, value) {
        if (key === 'camera') director.playSequence(value);
        else if (key === 'progress') { timeline?.pause(); state.progress = THREE.MathUtils.clamp(value, 0, 1); }
        else if (key in state) state[key] = value;
      },
      onReset: resetSimulation,
      onPlay() { state.playing = true; timeline?.play(); },
      onPause() { state.playing = false; timeline?.pause(); },
    });
    window.addEventListener('resize', resize);
    window.addEventListener('beforeunload', dispose, { once: true });
    contextLostHandler = (event) => {
      event.preventDefault();
      status.textContent = 'GPU 上下文已断开，正在使用静态降级';
      send('ENGINE_ERROR', { message: 'WebGL context lost' });
      dispose();
    };
    canvas.addEventListener('webglcontextlost', contextLostHandler, { once: true });
    resize();
    status.hidden = true;
    send('ENGINE_READY', { tier: tier.size, count: simulation.count });
    playLeaf();
    run();
  } catch (error) {
    console.error(error);
    status.textContent = '当前设备无法启动生成引擎';
    send('ENGINE_ERROR', { message: error instanceof Error ? error.message : 'Engine startup failure' });
    dispose();
  }
}

function dispose() {
  if (disposed) return;
  disposed = true;
  cancelAnimationFrame(raf);
  timeline?.kill();
  window.removeEventListener('message', bridgeHandler);
  window.removeEventListener('resize', resize);
  if (contextLostHandler) canvas.removeEventListener('webglcontextlost', contextLostHandler);
  director?.dispose();
  vj?.dispose();
  simulation?.dispose();
  particles?.geometry?.dispose();
  particles?.material?.dispose();
  composer?.dispose();
  renderer?.dispose();
}

attachBridge();
start();
