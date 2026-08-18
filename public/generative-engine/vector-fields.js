export const FIELD_NAMES = [
  '逆向生长', '分枝吸引', '根系寻径', '壳层绽放', '叶脉输运',
  '拓扑碎裂', '径向爆裂', '剪切撕裂', '晶格断裂', '侵蚀喷发',
  '单涡旋', '环面流', '双旋流', '螺旋汇聚', '极向喷流',
  '4D Curl', 'Simplex 平流', 'Domain Warp', '湍流级联', '螺旋度场',
  '球体吸附', '茶叶吸附', '茶山抬升', '环面折叠', '盒域折叠',
  '超立方折叠', '四元数扭转', 'Klein 折叠', '时间反演', '相位编织',
];

export const FULLSCREEN_VERTEX = `in vec3 position;
out vec2 vUv;
void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

export const SIMULATION_FRAGMENT = `precision highp float;
precision highp sampler2D;

in vec2 vUv;
uniform sampler2D uPosition;
uniform sampler2D uVelocity;
uniform sampler2D uLeafTarget;
uniform sampler2D uMountainTarget;
uniform float uTime;
uniform float uDelta;
uniform float uProgress;
uniform float uFieldA;
uniform float uFieldB;
uniform float uFieldMix;
uniform float uDamping;
uniform float uStrength;
layout(location = 0) out vec4 outPosition;
layout(location = 1) out vec4 outVelocity;

float hash41(vec4 p) {
  p = fract(p * vec4(0.1031, 0.11369, 0.13787, 0.09987));
  p += dot(p, p.wzxy + 19.19);
  return fract((p.x + p.y) * (p.z + p.w));
}

// Four-dimensional simplex-inspired tetrahedral gradient noise. It is time-aware
// and remains differentiable enough for the finite-difference curl calculation.
float simplex4(vec4 p) {
  vec4 i = floor(p);
  vec4 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n0 = hash41(i + vec4(0., 0., 0., 0.));
  float n1 = hash41(i + vec4(1., 0., 0., 0.));
  float n2 = hash41(i + vec4(0., 1., 0., 0.));
  float n3 = hash41(i + vec4(0., 0., 1., 0.));
  float n4 = hash41(i + vec4(0., 0., 0., 1.));
  float n5 = hash41(i + vec4(1., 1., 0., 0.));
  float n6 = hash41(i + vec4(0., 1., 1., 0.));
  float n7 = hash41(i + vec4(1., 0., 1., 1.));
  float a = mix(n0, n1, f.x);
  float b = mix(n2, n5, f.x);
  float c = mix(n3, n6, f.y);
  float d = mix(n4, n7, f.z);
  return mix(mix(a, b, f.y), mix(c, d, f.w), f.z) * 2.0 - 1.0;
}

vec3 potential(vec3 p, float time) {
  return vec3(
    simplex4(vec4(p * 0.72, time * 0.13)),
    simplex4(vec4(p.yzx * 0.72 + 13.7, time * 0.13 + 4.1)),
    simplex4(vec4(p.zxy * 0.72 - 9.2, time * 0.13 + 8.3))
  );
}

vec3 curlNoise(vec3 p, float time) {
  const float e = 0.035;
  vec3 dx0 = potential(p - vec3(e, 0., 0.), time);
  vec3 dx1 = potential(p + vec3(e, 0., 0.), time);
  vec3 dy0 = potential(p - vec3(0., e, 0.), time);
  vec3 dy1 = potential(p + vec3(0., e, 0.), time);
  vec3 dz0 = potential(p - vec3(0., 0., e), time);
  vec3 dz1 = potential(p + vec3(0., 0., e), time);
  return normalize(vec3(
    (dy1.z - dy0.z) - (dz1.y - dz0.y),
    (dz1.x - dz0.x) - (dx1.z - dx0.z),
    (dx1.y - dx0.y) - (dy1.x - dy0.x)
  ) / (2.0 * e) + 0.0001);
}

float sdSphere(vec3 p, float radius) { return length(p) - radius; }
float sdTorus(vec3 p, vec2 t) { vec2 q = vec2(length(p.xz) - t.x, p.y); return length(q) - t.y; }
float sdBox(vec3 p, vec3 b) { vec3 q = abs(p) - b; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0); }

vec3 safeNormalize(vec3 value) { return normalize(value + vec3(0.00001)); }

vec3 fieldByIndex(float index, vec3 p, vec3 target, float time) {
  float i = floor(index + 0.5);
  vec3 radial = safeNormalize(p);
  vec3 toTarget = target - p;
  float radius = length(p);
  vec3 force = vec3(0.0);

  if (i < 0.5) force = toTarget * 1.25 - radial * sin(time * .7) * .22;
  else if (i < 1.5) force = normalize(vec3(-p.y, p.x, sin(p.z * 2.4))) + toTarget * .42;
  else if (i < 2.5) force = vec3(sin(p.y * 2.), -abs(sin(p.x)), cos(p.z * 2.)) + toTarget * .5;
  else if (i < 3.5) force = radial * (1.0 - radius * .16) + toTarget * .38;
  else if (i < 4.5) force = normalize(vec3(cos(p.y * 5.), sin(p.x * 4.), cos(p.z * 5.))) + toTarget * .36;
  else if (i < 5.5) force = sin(p.yzx * 7. + time) * 1.3 + toTarget * .28;
  else if (i < 6.5) force = radial * (1.55 + sin(time * 2.)) + toTarget * .18;
  else if (i < 7.5) force = vec3(p.y, -p.x, sin(p.x * 4.)) * .85 + toTarget * .32;
  else if (i < 8.5) force = sign(sin(p * 4. + time)) * .95 + toTarget * .25;
  else if (i < 9.5) force = radial * simplex4(vec4(p * 1.8, time * .3)) * 2.0 + toTarget * .26;
  else if (i < 10.5) force = vec3(-p.z, 0., p.x) + toTarget * .3;
  else if (i < 11.5) force = normalize(vec3(-p.z, sin(radius * 2.), p.x)) + toTarget * .3;
  else if (i < 12.5) force = vec3(-p.y, p.x, sin(time + radius)) + vec3(p.z, 0., -p.x) * .45;
  else if (i < 13.5) force = normalize(vec3(-p.z, -p.y * .18, p.x)) - radial * .35 + toTarget * .35;
  else if (i < 14.5) force = vec3(cos(atan(p.z, p.x) * 5.), sin(p.y * 3.), sin(atan(p.z, p.x) * 5.)) + toTarget * .3;
  else if (i < 15.5) force = curlNoise(p, time) * 1.75 + toTarget * .2;
  else if (i < 16.5) force = potential(p, time) + toTarget * .34;
  else if (i < 17.5) force = curlNoise(p + potential(p, time) * .75, time * 1.2) + toTarget * .22;
  else if (i < 18.5) force = curlNoise(p * 1.4, time) + curlNoise(p * 2.8, time * 1.7) * .5 + toTarget * .16;
  else if (i < 19.5) force = cross(curlNoise(p, time), radial) + toTarget * .3;
  else if (i < 20.5) force = -radial * sdSphere(p, 2.7) + toTarget * .22;
  else if (i < 21.5) force = toTarget * 1.45 + curlNoise(p, time) * .24;
  else if (i < 22.5) force = vec3(0., max(0., 1.5 - p.y) * .9, 0.) + toTarget * .62;
  else if (i < 23.5) force = -safeNormalize(vec3(p.x, 0., p.z)) * sdTorus(p, vec2(1.8, .44)) + toTarget * .22;
  else if (i < 24.5) force = -sign(p) * sdBox(p, vec3(2.1)) + toTarget * .2;
  else if (i < 25.5) force = sin(p.yzx * 1.9) * 1.25 + toTarget * .24;
  else if (i < 26.5) force = vec3(-p.y, p.x, p.z) * cos(time * .8) + toTarget * .32;
  else if (i < 27.5) force = vec3(sin(p.y * 2.), sin(p.z * 2.), sin(p.x * 2.)) - radial * .25 + toTarget * .3;
  else if (i < 28.5) force = -p * sin(time * .9) + curlNoise(p, -time) * .8 + toTarget * .25;
  else force = sin(vec3(p.y + time, p.z - time, p.x + time) * 2.4) + toTarget * .28;
  return force;
}

void main() {
  vec4 previousPosition = texture(uPosition, vUv);
  vec3 p = previousPosition.xyz;
  vec3 velocity = texture(uVelocity, vUv).xyz;
  vec3 leaf = texture(uLeafTarget, vUv).xyz;
  vec3 mountain = texture(uMountainTarget, vUv).xyz;
  float mountainMix = smoothstep(.46, .88, uProgress);
  float growth = smoothstep(.04, .43, uProgress);
  vec3 target = mix(leaf, mountain, mountainMix);
  vec3 firstField = fieldByIndex(uFieldA, p, target, uTime);
  vec3 secondField = fieldByIndex(uFieldB, p, target, uTime + 11.7);
  vec3 force = mix(firstField, secondField, uFieldMix) * uStrength;
  force += (target - p) * mix(.05, .56, growth);
  float dt = min(uDelta, .033);
  vec3 nextVelocity = velocity * exp(-uDamping * dt) + force * dt;
  float speed = length(nextVelocity);
  if (speed > 3.4) nextVelocity *= 3.4 / speed;
  vec3 nextPosition = p + nextVelocity * dt;
  if (length(nextPosition) > 8.0) nextPosition *= .72;
  outPosition = vec4(nextPosition, 1.0);
  outVelocity = vec4(nextVelocity, 1.0);
}`;

export const SEED_FRAGMENT = `precision highp float;
in vec2 vUv;
uniform sampler2D uSeedPosition;
layout(location = 0) out vec4 outPosition;
layout(location = 1) out vec4 outVelocity;
void main() {
  outPosition = texture(uSeedPosition, vUv);
  outVelocity = vec4(0.0);
}`;

export const PARTICLE_VERTEX = `precision highp float;
precision highp sampler2D;
uniform sampler2D uPosition;
uniform sampler2D uVelocity;
uniform float uTextureSize;
uniform float uPointScale;
uniform float uTime;
in float aIndex;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
out float vEnergy;
out float vGold;
void main() {
  int size = int(uTextureSize);
  int index = int(aIndex);
  ivec2 texel = ivec2(index - (index / size) * size, index / size);
  vec3 position = texelFetch(uPosition, texel, 0).xyz;
  vec3 velocity = texelFetch(uVelocity, texel, 0).xyz;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vEnergy = clamp(length(velocity) * .6, 0.0, 1.0);
  vGold = step(.985, fract(aIndex * 0.6180339 + uTime * .007));
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = (1.0 + vEnergy * 1.35) * uPointScale * clamp(8.0 / -mvPosition.z, .45, 1.6);
}`;

export const PARTICLE_FRAGMENT = `precision highp float;
in float vEnergy;
in float vGold;
out vec4 outColor;
void main() {
  vec2 centered = gl_PointCoord - .5;
  float d = length(centered);
  if (d > .5) discard;
  float alpha = smoothstep(.5, .08, d);
  vec3 mint = mix(vec3(.16, .58, .42), vec3(.62, .96, .78), vEnergy);
  vec3 color = mix(mint, vec3(.88, .65, .27), vGold);
  outColor = vec4(color, alpha * (.10 + vEnergy * .14));
}`;
