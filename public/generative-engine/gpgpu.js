import * as THREE from 'three';
import { FULLSCREEN_VERTEX, PARTICLE_FRAGMENT, PARTICLE_VERTEX, SEED_FRAGMENT, SIMULATION_FRAGMENT } from './vector-fields.js';

const PLY_TYPES = {
  char: { bytes: 1, read: (view, offset) => view.getInt8(offset) },
  int8: { bytes: 1, read: (view, offset) => view.getInt8(offset) },
  uchar: { bytes: 1, read: (view, offset) => view.getUint8(offset) },
  uint8: { bytes: 1, read: (view, offset) => view.getUint8(offset) },
  short: { bytes: 2, read: (view, offset) => view.getInt16(offset, true) },
  int16: { bytes: 2, read: (view, offset) => view.getInt16(offset, true) },
  ushort: { bytes: 2, read: (view, offset) => view.getUint16(offset, true) },
  uint16: { bytes: 2, read: (view, offset) => view.getUint16(offset, true) },
  int: { bytes: 4, read: (view, offset) => view.getInt32(offset, true) },
  int32: { bytes: 4, read: (view, offset) => view.getInt32(offset, true) },
  uint: { bytes: 4, read: (view, offset) => view.getUint32(offset, true) },
  uint32: { bytes: 4, read: (view, offset) => view.getUint32(offset, true) },
  float: { bytes: 4, read: (view, offset) => view.getFloat32(offset, true) },
  float32: { bytes: 4, read: (view, offset) => view.getFloat32(offset, true) },
  double: { bytes: 8, read: (view, offset) => view.getFloat64(offset, true) },
  float64: { bytes: 8, read: (view, offset) => view.getFloat64(offset, true) },
};

export function getCapabilityTier(renderer) {
  const gl = renderer.getContext();
  const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  const maxDrawBuffers = gl.getParameter(gl.MAX_DRAW_BUFFERS);
  const maxColorAttachments = gl.getParameter(gl.MAX_COLOR_ATTACHMENTS);
  const floatRenderable = Boolean(gl.getExtension('EXT_color_buffer_float'));
  if (!renderer.capabilities.isWebGL2 || !floatRenderable || maxTextureSize < 256 || maxDrawBuffers < 2 || maxColorAttachments < 2) {
    return { supported: false, size: 0, label: '静态降级' };
  }
  const memory = navigator.deviceMemory ?? 4;
  const mobile = matchMedia('(max-width: 767px)').matches || /Android|iPhone|iPad/i.test(navigator.userAgent);
  const size = !mobile && memory >= 8 && maxTextureSize >= 1024 ? 1024 : mobile || memory <= 4 ? 256 : 512;
  return { supported: true, size, label: `${size}² · ${(size * size).toLocaleString()} 粒子` };
}

export async function parsePly(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`PLY resource unavailable: ${url}`);
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const headerCandidate = new TextDecoder().decode(bytes.slice(0, Math.min(bytes.length, 64 * 1024)));
  const headerMarker = headerCandidate.match(/end_header\r?\n/);
  const headerEnd = headerMarker ? headerMarker.index + headerMarker[0].length : -1;
  if (headerEnd < 0) throw new Error('PLY header is incomplete');
  const header = headerCandidate.slice(0, headerEnd);
  const format = header.match(/format\s+(\S+)/)?.[1];
  const vertexCount = Number(header.match(/element vertex\s+(\d+)/)?.[1]);
  if (!Number.isFinite(vertexCount) || vertexCount < 1) throw new Error('PLY vertex count is invalid');
  const properties = [];
  let inVertexElement = false;
  for (const row of header.split(/\r?\n/)) {
    const element = row.match(/^element\s+(\S+)/);
    if (element) { inVertexElement = element[1] === 'vertex'; continue; }
    const property = inVertexElement && row.match(/^property\s+(\S+)\s+(\S+)$/);
    if (property && PLY_TYPES[property[1]]) properties.push({ type: property[1], name: property[2] });
  }
  let stride = 0;
  const propertiesWithOffsets = properties.map((property) => {
    const next = { ...property, offset: stride, ...PLY_TYPES[property.type] };
    stride += next.bytes;
    return next;
  });
  const xProperty = propertiesWithOffsets.find((property) => property.name === 'x');
  const yProperty = propertiesWithOffsets.find((property) => property.name === 'y');
  const zProperty = propertiesWithOffsets.find((property) => property.name === 'z');
  if (!xProperty || !yProperty || !zProperty) throw new Error('PLY must provide x, y and z positions');

  const positions = new Float32Array(vertexCount * 3);
  if (format === 'binary_little_endian') {
    if (!stride || headerEnd + vertexCount * stride > buffer.byteLength) throw new Error('PLY vertex data is incomplete');
    const view = new DataView(buffer, headerEnd);
    for (let vertex = 0; vertex < vertexCount; vertex += 1) {
      const start = vertex * stride;
      const offset = vertex * 3;
      positions[offset] = xProperty.read(view, start + xProperty.offset);
      positions[offset + 1] = yProperty.read(view, start + yProperty.offset);
      positions[offset + 2] = zProperty.read(view, start + zProperty.offset);
    }
  } else if (format === 'ascii') {
    const rows = new TextDecoder().decode(bytes.slice(headerEnd)).trim().split(/\r?\n/);
    if (rows.length < vertexCount) throw new Error('PLY vertex data is incomplete');
    for (let vertex = 0; vertex < vertexCount; vertex += 1) {
      const row = rows[vertex].trim().split(/\s+/).map(Number);
      const offset = vertex * 3;
      positions[offset] = row[propertiesWithOffsets.indexOf(xProperty)];
      positions[offset + 1] = row[propertiesWithOffsets.indexOf(yProperty)];
      positions[offset + 2] = row[propertiesWithOffsets.indexOf(zProperty)];
    }
  } else {
    throw new Error(`Unsupported PLY format: ${format}`);
  }
  return normalizePositions(positions);
}

function normalizePositions(positions) {
  let minX = Infinity; let minY = Infinity; let minZ = Infinity;
  let maxX = -Infinity; let maxY = -Infinity; let maxZ = -Infinity;
  for (let index = 0; index < positions.length; index += 3) {
    minX = Math.min(minX, positions[index]); maxX = Math.max(maxX, positions[index]);
    minY = Math.min(minY, positions[index + 1]); maxY = Math.max(maxY, positions[index + 1]);
    minZ = Math.min(minZ, positions[index + 2]); maxZ = Math.max(maxZ, positions[index + 2]);
  }
  const centerX = (minX + maxX) * .5;
  const centerY = (minY + maxY) * .5;
  const centerZ = (minZ + maxZ) * .5;
  const extentX = maxX - minX;
  const extentY = maxY - minY;
  const extentZ = maxZ - minZ;
  const scale = 5.9 / Math.max(extentX, extentY, extentZ, .0001);
  const normalized = new Float32Array(positions.length);
  for (let index = 0; index < positions.length; index += 3) {
    normalized[index] = (positions[index] - centerX) * scale;
    normalized[index + 1] = (positions[index + 1] - centerY) * scale;
    normalized[index + 2] = (positions[index + 2] - centerZ) * scale;
  }
  return { positions: normalized, radius: Math.hypot(extentX, extentY, extentZ) * scale * .5 };
}

function makeFloatTexture(data, size) {
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

function sampleTarget(source, count, seed) {
  const sampled = new Float32Array(count * 4);
  const sourceCount = source.length / 3;
  for (let index = 0; index < count; index += 1) {
    const sourceIndex = Math.floor((index / count) * sourceCount) * 3;
    const offset = index * 4;
    sampled[offset] = source[sourceIndex];
    sampled[offset + 1] = source[sourceIndex + 1];
    sampled[offset + 2] = source[sourceIndex + 2];
    sampled[offset + 3] = 1;
  }
  return sampled;
}

function seededScatter(count) {
  const values = new Float32Array(count * 4);
  for (let index = 0; index < count; index += 1) {
    const a = fract(Math.sin(index * 12.9898) * 43758.5453);
    const b = fract(Math.sin(index * 78.233) * 23421.631);
    const c = fract(Math.sin(index * 41.913) * 31642.617);
    const radius = 2.4 + a * 4.2;
    const theta = b * Math.PI * 2;
    const phi = Math.acos(c * 2 - 1);
    const offset = index * 4;
    values[offset] = Math.sin(phi) * Math.cos(theta) * radius;
    values[offset + 1] = Math.cos(phi) * radius;
    values[offset + 2] = Math.sin(phi) * Math.sin(theta) * radius;
    values[offset + 3] = 1;
  }
  return values;
}

function fract(value) { return value - Math.floor(value); }

function createMrt(size) {
  const target = new THREE.WebGLRenderTarget(size, size, {
    count: 2,
    type: THREE.FloatType,
    format: THREE.RGBAFormat,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    depthBuffer: false,
    stencilBuffer: false,
  });
  target.textures.forEach((texture) => {
    texture.generateMipmaps = false;
    texture.internalFormat = 'RGBA32F';
  });
  return target;
}

export class GpgpuSimulation {
  constructor(renderer, leaf, mountain, tier) {
    this.renderer = renderer;
    this.size = tier.size;
    this.count = this.size * this.size;
    this.radius = Math.max(leaf.radius, mountain.radius);
    this.read = createMrt(this.size);
    this.write = createMrt(this.size);
    this.leafTarget = makeFloatTexture(sampleTarget(leaf.positions, this.count), this.size);
    this.mountainTarget = makeFloatTexture(sampleTarget(mountain.positions, this.count), this.size);
    this.seedTexture = makeFloatTexture(seededScatter(this.count), this.size);
    this.computeScene = new THREE.Scene();
    this.computeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.computeQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: FULLSCREEN_VERTEX,
      fragmentShader: SIMULATION_FRAGMENT,
      uniforms: {
        uPosition: { value: this.read.textures[0] },
        uVelocity: { value: this.read.textures[1] },
        uLeafTarget: { value: this.leafTarget },
        uMountainTarget: { value: this.mountainTarget },
        uTime: { value: 0 }, uDelta: { value: 0.016 }, uProgress: { value: 0 },
        uFieldA: { value: 0 }, uFieldB: { value: 21 }, uFieldMix: { value: .35 },
        uDamping: { value: 1.1 }, uStrength: { value: 1.0 },
      },
    }));
    this.seedQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: FULLSCREEN_VERTEX,
      fragmentShader: SEED_FRAGMENT,
      uniforms: { uSeedPosition: { value: this.seedTexture } },
    }));
    this.computeScene.add(this.computeQuad);
    this.seed();
  }

  seed() {
    this.computeScene.remove(this.computeQuad);
    this.computeScene.add(this.seedQuad);
    this.renderer.setRenderTarget(this.read);
    this.renderer.render(this.computeScene, this.computeCamera);
    this.renderer.setRenderTarget(this.write);
    this.renderer.render(this.computeScene, this.computeCamera);
    this.renderer.setRenderTarget(null);
    this.computeScene.remove(this.seedQuad);
    this.computeScene.add(this.computeQuad);
  }

  step(options) {
    const uniforms = this.computeQuad.material.uniforms;
    uniforms.uPosition.value = this.read.textures[0];
    uniforms.uVelocity.value = this.read.textures[1];
    uniforms.uTime.value = options.time;
    uniforms.uDelta.value = options.delta;
    uniforms.uProgress.value = options.progress;
    uniforms.uFieldA.value = options.fieldA;
    uniforms.uFieldB.value = options.fieldB;
    uniforms.uFieldMix.value = options.fieldMix;
    uniforms.uDamping.value = options.damping;
    uniforms.uStrength.value = options.strength;
    this.renderer.setRenderTarget(this.write);
    this.renderer.render(this.computeScene, this.computeCamera);
    this.renderer.setRenderTarget(null);
    [this.read, this.write] = [this.write, this.read];
  }

  createParticleSystem() {
    const geometry = new THREE.BufferGeometry();
    const indices = new Float32Array(this.count);
    for (let index = 0; index < this.count; index += 1) indices[index] = index;
    // Three derives the draw count from `position`; it remains static while the
    // vertex shader fetches every animated position directly from the FBO.
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.count * 3), 3));
    geometry.setAttribute('aIndex', new THREE.BufferAttribute(indices, 1));
    geometry.setDrawRange(0, this.count);
    const material = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: PARTICLE_VERTEX,
      fragmentShader: PARTICLE_FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        uPosition: { value: this.read.textures[0] }, uVelocity: { value: this.read.textures[1] },
        uTextureSize: { value: this.size },
        uPointScale: { value: this.size >= 1024 ? .34 : this.size >= 512 ? .58 : .92 },
        uTime: { value: 0 },
      },
    });
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    return points;
  }

  bindParticles(points, time) {
    points.material.uniforms.uPosition.value = this.read.textures[0];
    points.material.uniforms.uVelocity.value = this.read.textures[1];
    points.material.uniforms.uTime.value = time;
  }

  dispose() {
    this.read.dispose(); this.write.dispose();
    this.leafTarget.dispose(); this.mountainTarget.dispose(); this.seedTexture.dispose();
    this.computeQuad.geometry.dispose(); this.computeQuad.material.dispose();
    this.seedQuad.geometry.dispose(); this.seedQuad.material.dispose();
  }
}
