import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { Matrix4, Vector3 } from 'three';

const PARTICLE_COUNT = 16_384;
const MOBILE_PARTICLE_COUNT = 6_144;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIR = path.join(ROOT, 'assets-source', 'intro');
const OUTPUT_DIR = path.join(ROOT, 'public', 'assets', 'intro');

const targets = [
  {
    id: 'leaf',
    source: path.join(SOURCE_DIR, 'tea-leaf.fbx'),
    output: 'tea-leaf-points.bin',
    seed: 0x71ea5eed,
    normalization: {
      screenAxes: ['x', 'z', 'y'],
      targetWidth: 7.5,
      depthScale: 0.72,
      verticalOffset: 0.2,
    },
    transform(point, bounds) {
      const center = bounds.min.clone().add(bounds.max).multiplyScalar(0.5);
      const scale = 7.5 / Math.max(bounds.max.x - bounds.min.x, 1);
      return [
        (point.x - center.x) * scale,
        (point.z - center.z) * scale + 0.2,
        (point.y - center.y) * scale * 0.72,
      ];
    },
  },
  {
    id: 'mountain',
    source: path.join(SOURCE_DIR, 'tea-mountain.fbx'),
    output: 'tea-mountain-points.bin',
    seed: 0x6d0a17a1,
    normalization: {
      screenAxes: ['x', 'y', 'z'],
      targetWidth: 7.8,
      depthScale: 0.55,
      verticalOffset: -1.34,
    },
    transform(point, bounds) {
      const center = bounds.min.clone().add(bounds.max).multiplyScalar(0.5);
      const scale = 7.8 / Math.max(bounds.max.x - bounds.min.x, 1);
      return [
        (point.x - center.x) * scale,
        (point.y - bounds.min.y) * scale - 1.34,
        (point.z - center.z) * scale * 0.55,
      ];
    },
  },
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
  const arrayBuffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
  const root = new FBXLoader().parse(arrayBuffer, `${path.dirname(filePath)}${path.sep}`);
  const triangles = [];
  const bounds = {
    min: new Vector3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY),
    max: new Vector3(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY),
  };

  root.updateMatrixWorld(true);
  root.traverse((object) => {
    if (!object.isMesh || !object.geometry?.getAttribute('position')) {
      return;
    }

    const geometry = object.geometry;
    const position = geometry.getAttribute('position');
    const index = geometry.index;
    const matrix = new Matrix4().copy(object.matrixWorld);
    const triangleCount = index ? index.count / 3 : position.count / 3;

    for (let triangleIndex = 0; triangleIndex < triangleCount; triangleIndex += 1) {
      const indices = index
        ? [index.getX(triangleIndex * 3), index.getX(triangleIndex * 3 + 1), index.getX(triangleIndex * 3 + 2)]
        : [triangleIndex * 3, triangleIndex * 3 + 1, triangleIndex * 3 + 2];
      const vertices = indices.map((vertexIndex) => new Vector3(
        position.getX(vertexIndex),
        position.getY(vertexIndex),
        position.getZ(vertexIndex),
      ).applyMatrix4(matrix));
      const area = vertices[1].clone().sub(vertices[0]).cross(vertices[2].clone().sub(vertices[0])).length() * 0.5;

      if (!Number.isFinite(area) || area <= 1e-8) {
        continue;
      }

      for (const vertex of vertices) {
        bounds.min.min(vertex);
        bounds.max.max(vertex);
      }
      triangles.push({ vertices, area });
    }
  });

  if (triangles.length === 0) {
    throw new Error(`No usable triangles found in ${filePath}`);
  }

  return { triangles, bounds };
}

function sampleSurface(triangles, count, seed) {
  const random = createRandom(seed);
  const cumulativeAreas = new Float64Array(triangles.length);
  let totalArea = 0;
  triangles.forEach((triangle, index) => {
    totalArea += triangle.area;
    cumulativeAreas[index] = totalArea;
  });

  const points = [];
  for (let pointIndex = 0; pointIndex < count; pointIndex += 1) {
    const targetArea = random() * totalArea;
    let low = 0;
    let high = cumulativeAreas.length - 1;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if (cumulativeAreas[middle] < targetArea) low = middle + 1;
      else high = middle;
    }

    const [a, b, c] = triangles[low].vertices;
    const rootR1 = Math.sqrt(random());
    const r2 = random();
    const wa = 1 - rootR1;
    const wb = rootR1 * (1 - r2);
    const wc = rootR1 * r2;
    points.push(new Vector3(
      a.x * wa + b.x * wb + c.x * wc,
      a.y * wa + b.y * wb + c.y * wc,
      a.z * wa + b.z * wb + c.z * wc,
    ));
  }
  return points;
}

function spreadBits(value) {
  let result = value & 0x3ff;
  result = (result | (result << 16)) & 0x030000ff;
  result = (result | (result << 8)) & 0x0300f00f;
  result = (result | (result << 4)) & 0x030c30c3;
  result = (result | (result << 2)) & 0x09249249;
  return result;
}

function mortonCode([x, y, z], bounds) {
  const quantize = (value, axis) => {
    const span = Math.max(bounds.max[axis] - bounds.min[axis], 1e-6);
    return Math.max(0, Math.min(1023, Math.round(((value - bounds.min[axis]) / span) * 1023)));
  };
  return spreadBits(quantize(x, 0)) | (spreadBits(quantize(y, 1)) << 1) | (spreadBits(quantize(z, 2)) << 2);
}

function sortSpatially(points) {
  const bounds = getArrayBounds(points);
  return points
    .map((point, originalIndex) => ({ point, originalIndex, code: mortonCode(point, bounds) }))
    .sort((a, b) => a.code - b.code || a.originalIndex - b.originalIndex)
    .map(({ point }) => point);
}

function getArrayBounds(points) {
  const min = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
  const max = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];
  for (const point of points) {
    for (let axis = 0; axis < 3; axis += 1) {
      min[axis] = Math.min(min[axis], point[axis]);
      max[axis] = Math.max(max[axis], point[axis]);
    }
  }
  return { min, max };
}

function writeFloat32(filePath, points) {
  const values = new Float32Array(points.length * 3);
  points.forEach((point, index) => values.set(point, index * 3));
  fs.writeFileSync(filePath, Buffer.from(values.buffer));
}

function reverseBits(value, bitCount) {
  let reversed = 0;
  for (let bit = 0; bit < bitCount; bit += 1) {
    reversed = (reversed << 1) | ((value >>> bit) & 1);
  }
  return reversed;
}

function distributePairedPoints(points) {
  const bitCount = Math.log2(points.length);
  if (!Number.isInteger(bitCount)) {
    return points;
  }
  return points.map((_, index) => points[reverseBits(index, bitCount)]);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const chunk = Buffer.alloc(12 + data.length);
  chunk.writeUInt32BE(data.length, 0);
  typeBuffer.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 8 + data.length);
  return chunk;
}

function writeFallbackPreview(filePath, points) {
  const width = 1280;
  const height = 720;
  const pixels = Buffer.alloc(width * height * 4);
  for (let index = 0; index < width * height; index += 1) {
    pixels[index * 4] = 3;
    pixels[index * 4 + 1] = 17;
    pixels[index * 4 + 2] = 12;
    pixels[index * 4 + 3] = 255;
  }

  const bounds = getArrayBounds(points);
  const scale = Math.min(920 / (bounds.max[0] - bounds.min[0]), 370 / (bounds.max[1] - bounds.min[1]));
  const centerX = (bounds.min[0] + bounds.max[0]) * 0.5;
  const centerY = (bounds.min[1] + bounds.max[1]) * 0.5;
  for (const [x, y, z] of points) {
    const px = Math.round(width * 0.5 + (x - centerX) * scale);
    const py = Math.round(height * 0.51 - (y - centerY) * scale);
    const depth = (z - bounds.min[2]) / Math.max(bounds.max[2] - bounds.min[2], 1e-6);
    const colors = [Math.round(84 + depth * 72), Math.round(169 + depth * 50), Math.round(126 + depth * 42)];
    for (let oy = -1; oy <= 1; oy += 1) {
      for (let ox = -1; ox <= 1; ox += 1) {
        const drawX = px + ox;
        const drawY = py + oy;
        if (drawX < 0 || drawX >= width || drawY < 0 || drawY >= height) continue;
        const offset = (drawY * width + drawX) * 4;
        const weight = ox === 0 && oy === 0 ? 1 : 0.46;
        pixels[offset] = Math.max(pixels[offset], Math.round(colors[0] * weight));
        pixels[offset + 1] = Math.max(pixels[offset + 1], Math.round(colors[1] * weight));
        pixels[offset + 2] = Math.max(pixels[offset + 2], Math.round(colors[2] * weight));
      }
    }
  }

  const scanlines = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const sourceOffset = y * width * 4;
    const targetOffset = y * (width * 4 + 1);
    scanlines[targetOffset] = 0;
    pixels.copy(scanlines, targetOffset + 1, sourceOffset, sourceOffset + width * 4);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(scanlines, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
  fs.writeFileSync(filePath, png);
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
const manifest = {
  version: 2,
  count: PARTICLE_COUNT,
  mobileCount: MOBILE_PARTICLE_COUNT,
  fallbackUrl: '/assets/intro/intro-fallback.png',
  targets: {},
};
const generated = {};

for (const target of targets) {
  const { triangles, bounds } = readTriangles(target.source);
  const sampled = sampleSurface(triangles, PARTICLE_COUNT, target.seed)
    .map((point) => target.transform(point, bounds));
  const ordered = sortSpatially(sampled);
  generated[target.id] = ordered;
  const targetBounds = getArrayBounds(ordered);
  manifest.targets[target.id] = {
    url: `/assets/intro/${target.output}`,
    sourceBounds: {
      min: bounds.min.toArray(),
      max: bounds.max.toArray(),
    },
    bounds: targetBounds,
    normalization: target.normalization,
  };
  console.log(`${target.id}: ${triangles.length} triangles -> ${ordered.length} particles`);
}

// Both arrays use the same permutation so particle correspondence remains stable,
// while the mobile prefix still samples the complete shape instead of one corner.
for (const target of targets) {
  generated[target.id] = distributePairedPoints(generated[target.id]);
  writeFloat32(path.join(OUTPUT_DIR, target.output), generated[target.id]);
}

writeFallbackPreview(path.join(OUTPUT_DIR, 'intro-fallback.png'), generated.mountain);
fs.writeFileSync(path.join(OUTPUT_DIR, 'particle-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote intro assets to ${OUTPUT_DIR}`);
