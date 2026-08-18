import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { Matrix4, Vector3 } from 'three';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIR = path.join(ROOT, 'assets-source', 'intro');
const OUTPUT_DIR = path.join(ROOT, 'public', 'assets', 'generative');
const POINT_COUNT = 1_048_576;

const models = [
  { id: 'tea-leaf', source: 'tea-leaf.fbx', output: 'tea-leaf.ply', seed: 0x71ea5eed },
  { id: 'tea-mountain', source: 'tea-mountain.fbx', output: 'tea-mountain.ply', seed: 0x6d0a17a1 },
];

function createRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function readTriangles(filePath) {
  const file = fs.readFileSync(filePath);
  const buffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
  const root = new FBXLoader().parse(buffer, `${path.dirname(filePath)}${path.sep}`);
  const triangles = [];
  root.updateMatrixWorld(true);

  root.traverse((object) => {
    if (!object.isMesh || !object.geometry?.getAttribute('position')) return;
    const positions = object.geometry.getAttribute('position');
    const index = object.geometry.index;
    const matrix = new Matrix4().copy(object.matrixWorld);
    const triangleCount = index ? index.count / 3 : positions.count / 3;

    for (let triangleIndex = 0; triangleIndex < triangleCount; triangleIndex += 1) {
      const indices = index
        ? [index.getX(triangleIndex * 3), index.getX(triangleIndex * 3 + 1), index.getX(triangleIndex * 3 + 2)]
        : [triangleIndex * 3, triangleIndex * 3 + 1, triangleIndex * 3 + 2];
      const vertices = indices.map((vertexIndex) => new Vector3(
        positions.getX(vertexIndex), positions.getY(vertexIndex), positions.getZ(vertexIndex),
      ).applyMatrix4(matrix));
      const area = vertices[1].clone().sub(vertices[0]).cross(vertices[2].clone().sub(vertices[0])).length() * 0.5;
      if (area > 1e-8 && Number.isFinite(area)) triangles.push({ vertices, area });
    }
  });

  if (!triangles.length) throw new Error(`No usable triangles found in ${filePath}`);
  return triangles;
}

function sampleSurface(triangles, count, seed) {
  const random = createRandom(seed);
  const cumulative = new Float64Array(triangles.length);
  let totalArea = 0;
  triangles.forEach((triangle, index) => {
    totalArea += triangle.area;
    cumulative[index] = totalArea;
  });

  const points = new Float32Array(count * 3);
  for (let pointIndex = 0; pointIndex < count; pointIndex += 1) {
    const targetArea = random() * totalArea;
    let low = 0;
    let high = cumulative.length - 1;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if (cumulative[middle] < targetArea) low = middle + 1;
      else high = middle;
    }
    const [a, b, c] = triangles[low].vertices;
    const rootR1 = Math.sqrt(random());
    const r2 = random();
    const wa = 1 - rootR1;
    const wb = rootR1 * (1 - r2);
    const wc = rootR1 * r2;
    const offset = pointIndex * 3;
    points[offset] = a.x * wa + b.x * wb + c.x * wc;
    points[offset + 1] = a.y * wa + b.y * wb + c.y * wc;
    points[offset + 2] = a.z * wa + b.z * wb + c.z * wc;
  }
  return points;
}

function expandBits10(value) {
  let bits = value & 0x3ff;
  bits = (bits | (bits << 16)) & 0x030000ff;
  bits = (bits | (bits << 8)) & 0x0300f00f;
  bits = (bits | (bits << 4)) & 0x030c30c3;
  return (bits | (bits << 2)) & 0x09249249;
}

// Sort each sampled surface in normalized Morton space. Sorting both targets in
// the same local-coordinate convention produces stable nearby point pairings.
function mortonSort(points) {
  const count = points.length / 3;
  let minX = Infinity; let minY = Infinity; let minZ = Infinity;
  let maxX = -Infinity; let maxY = -Infinity; let maxZ = -Infinity;
  for (let offset = 0; offset < points.length; offset += 3) {
    minX = Math.min(minX, points[offset]); maxX = Math.max(maxX, points[offset]);
    minY = Math.min(minY, points[offset + 1]); maxY = Math.max(maxY, points[offset + 1]);
    minZ = Math.min(minZ, points[offset + 2]); maxZ = Math.max(maxZ, points[offset + 2]);
  }
  const scaleX = 1023 / Math.max(maxX - minX, 1e-6);
  const scaleY = 1023 / Math.max(maxY - minY, 1e-6);
  const scaleZ = 1023 / Math.max(maxZ - minZ, 1e-6);
  const codes = new Uint32Array(count);
  let order = new Uint32Array(count);
  let scratch = new Uint32Array(count);
  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    const x = Math.min(1023, Math.max(0, Math.floor((points[offset] - minX) * scaleX)));
    const y = Math.min(1023, Math.max(0, Math.floor((points[offset + 1] - minY) * scaleY)));
    const z = Math.min(1023, Math.max(0, Math.floor((points[offset + 2] - minZ) * scaleZ)));
    codes[index] = (expandBits10(x) | (expandBits10(y) << 1) | (expandBits10(z) << 2)) >>> 0;
    order[index] = index;
  }
  const buckets = new Uint32Array(1024);
  for (const shift of [0, 10, 20]) {
    buckets.fill(0);
    for (let index = 0; index < count; index += 1) buckets[(codes[order[index]] >>> shift) & 0x3ff] += 1;
    let total = 0;
    for (let index = 0; index < buckets.length; index += 1) {
      const current = buckets[index]; buckets[index] = total; total += current;
    }
    for (let index = 0; index < count; index += 1) {
      const pointIndex = order[index];
      scratch[buckets[(codes[pointIndex] >>> shift) & 0x3ff]++] = pointIndex;
    }
    [order, scratch] = [scratch, order];
  }
  const sorted = new Float32Array(points.length);
  for (let index = 0; index < count; index += 1) {
    const source = order[index] * 3;
    const destination = index * 3;
    sorted[destination] = points[source];
    sorted[destination + 1] = points[source + 1];
    sorted[destination + 2] = points[source + 2];
  }
  return sorted;
}

function writePly(filePath, points, modelId) {
  const count = points.length / 3;
  const header = Buffer.from([
    'ply',
    'format binary_little_endian 1.0',
    `comment generated from ${modelId}`,
    `element vertex ${count}`,
    'property float x',
    'property float y',
    'property float z',
    'end_header',
    '',
  ].join('\n'), 'ascii');
  const body = Buffer.from(points.buffer, points.byteOffset, points.byteLength);
  fs.writeFileSync(filePath, Buffer.concat([header, body]));
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
for (const model of models) {
  const triangles = readTriangles(path.join(SOURCE_DIR, model.source));
  const points = mortonSort(sampleSurface(triangles, POINT_COUNT, model.seed));
  writePly(path.join(OUTPUT_DIR, model.output), points, model.id);
  console.log(`${model.id}: ${triangles.length} triangles -> ${POINT_COUNT} PLY vertices`);
}
