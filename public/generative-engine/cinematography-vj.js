import * as THREE from 'three';
import { gsap } from 'gsap';
import { FIELD_NAMES } from './vector-fields.js';

const LOOP_SPECS = [
  ['环绕·慢速', { azimuth: Math.PI * 2, polar: 0.12, distance: 0.18, duration: 18 }],
  ['环绕·标准', { azimuth: Math.PI * 2, polar: -0.18, distance: -0.1, duration: 11 }],
  ['环绕·强调', { azimuth: Math.PI * 4, polar: 0.22, distance: 0.28, duration: 8 }],
  ['俯冲·慢速', { azimuth: Math.PI * .7, polar: -0.5, distance: -0.24, duration: 14 }],
  ['俯冲·标准', { azimuth: Math.PI * 1.3, polar: -0.68, distance: -0.38, duration: 10 }],
  ['俯冲·强调', { azimuth: Math.PI * 2.1, polar: -0.8, distance: -0.5, duration: 7 }],
  ['抬升·慢速', { azimuth: -Math.PI * .75, polar: 0.52, distance: 0.2, duration: 15 }],
  ['抬升·标准', { azimuth: -Math.PI * 1.3, polar: 0.72, distance: .3, duration: 10 }],
  ['抬升·强调', { azimuth: -Math.PI * 2.2, polar: .85, distance: .42, duration: 7 }],
  ['侧掠·慢速', { azimuth: Math.PI * .9, polar: 0.08, distance: -.22, duration: 14 }],
  ['侧掠·标准', { azimuth: Math.PI * 1.7, polar: -.12, distance: -.3, duration: 10 }],
  ['侧掠·强调', { azimuth: Math.PI * 2.5, polar: .22, distance: -.42, duration: 7 }],
  ['螺旋·慢速', { azimuth: Math.PI * 2.1, polar: .38, distance: -.08, duration: 16 }],
  ['螺旋·标准', { azimuth: Math.PI * 3.1, polar: .58, distance: -.18, duration: 11 }],
  ['螺旋·强调', { azimuth: Math.PI * 4.4, polar: .78, distance: -.28, duration: 8 }],
];

export function fitFrustumDistance(radius, fovDegrees, aspect, margin = 1.28) {
  const vertical = THREE.MathUtils.degToRad(fovDegrees * .5);
  const horizontal = Math.atan(Math.tan(vertical) * aspect);
  return radius * margin / Math.sin(Math.min(vertical, horizontal));
}

export class CinematographyController {
  constructor(camera, canvas, radius) {
    this.camera = camera;
    this.canvas = canvas;
    this.radius = radius;
    this.focus = new THREE.Vector3();
    this.targetFocus = new THREE.Vector3();
    this.baseDistance = fitFrustumDistance(radius, camera.fov, innerWidth / innerHeight);
    this.state = { azimuth: Math.PI * .5, polar: .38, distance: this.baseDistance };
    this.target = { ...this.state };
    this.sequence = { azimuth: 0, polar: 0, distance: 0 };
    this.sequenceTimeline = null;
    this.pointer = null;
    this.raycaster = new THREE.Raycaster();
    this.pointerNdc = new THREE.Vector2();
    this.focusPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.bindPointer();
  }

  bindPointer() {
    const onDown = (event) => {
      this.pointer = { x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY, id: event.pointerId };
      this.canvas.setPointerCapture?.(event.pointerId);
    };
    const onMove = (event) => {
      if (!this.pointer || event.pointerId !== this.pointer.id) return;
      const dx = event.clientX - this.pointer.x;
      const dy = event.clientY - this.pointer.y;
      this.pointer.x = event.clientX; this.pointer.y = event.clientY;
      this.target.azimuth -= dx * .008;
      this.target.polar = THREE.MathUtils.clamp(this.target.polar + dy * .008, .17, Math.PI - .17);
      this.sequenceTimeline?.pause();
    };
    const onUp = (event) => {
      if (!this.pointer || event.pointerId !== this.pointer.id) return;
      const moved = Math.hypot(event.clientX - this.pointer.startX, event.clientY - this.pointer.startY);
      if (moved < 7) this.setFocusFromPointer(event);
      this.pointer = null;
    };
    const onWheel = (event) => {
      event.preventDefault();
      this.target.distance = THREE.MathUtils.clamp(this.target.distance + event.deltaY * .008, this.baseDistance * .5, this.baseDistance * 2.6);
      this.sequenceTimeline?.pause();
    };
    this.canvas.addEventListener('pointerdown', onDown);
    this.canvas.addEventListener('pointermove', onMove);
    this.canvas.addEventListener('pointerup', onUp);
    this.canvas.addEventListener('pointercancel', onUp);
    this.canvas.addEventListener('wheel', onWheel, { passive: false });
    this.removePointerListeners = () => {
      this.canvas.removeEventListener('pointerdown', onDown);
      this.canvas.removeEventListener('pointermove', onMove);
      this.canvas.removeEventListener('pointerup', onUp);
      this.canvas.removeEventListener('pointercancel', onUp);
      this.canvas.removeEventListener('wheel', onWheel);
    };
  }

  setFocusFromPointer(event) {
    const bounds = this.canvas.getBoundingClientRect();
    this.pointerNdc.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    const hit = new THREE.Vector3();
    if (this.raycaster.ray.intersectPlane(this.focusPlane, hit)) {
      hit.clamp(new THREE.Vector3(-2.5, -1.4, -2.5), new THREE.Vector3(2.5, 1.4, 2.5));
      this.targetFocus.copy(hit);
    }
  }

  playSequence(index) {
    const spec = LOOP_SPECS[index % LOOP_SPECS.length][1];
    this.sequenceTimeline?.kill();
    this.sequence = { azimuth: 0, polar: 0, distance: 0 };
    this.sequenceTimeline = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } })
      .to(this.sequence, { ...spec }, 0)
      .to(this.sequence, { azimuth: spec.azimuth * -.45, polar: spec.polar * -.28, distance: spec.distance * -.4, duration: spec.duration * .58 }, `>${spec.duration * -.1}`);
    return LOOP_SPECS[index % LOOP_SPECS.length][0];
  }

  setStage(stage) {
    this.sequenceTimeline?.kill();
    this.sequence = { azimuth: 0, polar: 0, distance: 0 };
    const poses = {
      // The supplied tea leaf lies along the X/Z plane, so its opening pose
      // begins above the surface while still allowing a full 3D orbit by drag.
      leaf: { azimuth: Math.PI * .5, polar: .38, distance: this.baseDistance },
      mountain: { azimuth: Math.PI * .62, polar: .98, distance: this.baseDistance * 1.14 },
      ready: { azimuth: Math.PI * .58, polar: 1.06, distance: this.baseDistance * 1.18 },
    };
    if (poses[stage]) Object.assign(this.target, poses[stage]);
  }

  update(delta) {
    const damping = 1 - Math.exp(-delta * 6.4);
    this.focus.lerp(this.targetFocus, damping);
    this.state.azimuth = THREE.MathUtils.lerp(this.state.azimuth, this.target.azimuth + this.sequence.azimuth, damping);
    this.state.polar = THREE.MathUtils.lerp(this.state.polar, THREE.MathUtils.clamp(this.target.polar + this.sequence.polar, .17, Math.PI - .17), damping);
    this.state.distance = THREE.MathUtils.lerp(this.state.distance, THREE.MathUtils.clamp(this.target.distance + this.sequence.distance, this.baseDistance * .5, this.baseDistance * 2.6), damping);
    const sinPolar = Math.sin(this.state.polar);
    const relative = new THREE.Vector3(
      Math.cos(this.state.azimuth) * sinPolar,
      Math.cos(this.state.polar),
      Math.sin(this.state.azimuth) * sinPolar,
    ).multiplyScalar(this.state.distance);
    this.camera.position.copy(this.focus).add(relative);
    this.camera.lookAt(this.focus);
  }

  resize(aspect) {
    this.baseDistance = fitFrustumDistance(this.radius, this.camera.fov, aspect);
    this.target.distance = THREE.MathUtils.clamp(this.target.distance, this.baseDistance * .5, this.baseDistance * 2.6);
  }

  dispose() {
    this.sequenceTimeline?.kill();
    this.removePointerListeners?.();
  }
}

export function createVjConsole({ onChange, onReset, onPlay, onPause }) {
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;z-index:10;right:16px;top:16px;display:none';
  document.body.append(host);
  const root = host.attachShadow({ mode: 'open' });
  const fields = FIELD_NAMES.map((name, index) => `<option value="${index}">${String(index + 1).padStart(2, '0')} ${name}</option>`).join('');
  root.innerHTML = `<style>
    :host{font-family:ui-sans-serif,system-ui;color:#e9ece3}.panel{width:238px;padding:13px;border:1px solid rgba(145,232,199,.34);border-radius:12px;background:rgba(3,17,12,.9);box-shadow:0 18px 42px #0008;backdrop-filter:blur(18px)}h2{margin:0 0 10px;font-size:13px;letter-spacing:.08em}label{display:grid;gap:5px;margin:8px 0;color:#b5cbbd;font-size:10px}select,input,button{box-sizing:border-box;width:100%;font:inherit}select,input{accent-color:#79d5ad;background:#0a281c;color:#e9ece3;border:1px solid #32634f;border-radius:6px;padding:6px}button{border:1px solid #c9a75f;border-radius:6px;padding:7px;background:#3a2a12;color:#f2eee4;font-weight:700;cursor:pointer}.stats{margin-top:9px;color:#91e8c7;font-size:10px}</style>
    <section class="panel"><h2>VJ · 生成引擎</h2><label>主矢量场<select data-key="fieldA">${fields}</select></label><label>混合矢量场<select data-key="fieldB">${fields}</select></label><label>场混合<input data-key="fieldMix" type="range" min="0" max="1" step=".01" value=".35"></label><label>叙事进程<input data-key="progress" type="range" min="0" max="1" step=".01" value="0"></label><label>力场强度<input data-key="strength" type="range" min=".1" max="3" step=".05" value="1"></label><label>阻尼<input data-key="damping" type="range" min=".1" max="3" step=".05" value="1.1"></label><label>运镜<select data-key="camera">${LOOP_SPECS.map(([name], index) => `<option value="${index}">${name}</option>`).join('')}</select></label><label>泛光<input data-key="bloom" type="range" min="0" max="2.5" step=".05" value=".38"></label><label>残影<input data-key="afterimage" type="range" min="0" max=".96" step=".01" value=".74"></label><button data-play>继续模拟</button><button data-pause>暂停模拟</button><button data-reset>重置渲染管线</button><div class="stats" data-stats>等待 GPU</div></section>`;
  const inputHandler = (event) => {
    const element = event.target;
    if (!(element instanceof HTMLInputElement || element instanceof HTMLSelectElement)) return;
    onChange(element.dataset.key, Number(element.value));
  };
  root.addEventListener('input', inputHandler);
  root.querySelector('[data-reset]').addEventListener('click', onReset);
  root.querySelector('[data-play]').addEventListener('click', onPlay);
  root.querySelector('[data-pause]').addEventListener('click', onPause);
  const toggle = () => { host.style.display = host.style.display === 'none' ? 'block' : 'none'; };
  const onKey = (event) => { if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'v') toggle(); };
  document.addEventListener('keydown', onKey);
  if (new URLSearchParams(location.search).has('vj')) toggle();
  return {
    setStats(text) { root.querySelector('[data-stats]').textContent = text; },
    dispose() { document.removeEventListener('keydown', onKey); host.remove(); },
  };
}
