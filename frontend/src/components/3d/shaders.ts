/**
 * GLSL Shaders for the Astra-inspired Interactive Support Orb.
 *
 * Implements 3D Perlin/Simplex noise on the GPU, normal-vector displacement,
 * mouse proximity interaction, sound-wave pulsation, and iridescent Fresnel shading.
 */

export const orbVertexShader = `
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
uniform float uVelocity;
uniform float uState; // 0=idle, 1=processing, 2=generating, 3=success, 4=error, 5=escalated
uniform float uDeformStrength;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vDisplacement;

// Simplex 3D noise functions for organic continuous fluid motion
vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);

  // Time speed adjusts based on chatbot state
  float speed = 0.6;
  if (uState == 1.0) speed = 1.4; // processing
  if (uState == 2.0) speed = 2.0; // generating response
  if (uState == 3.0) speed = 0.9; // success
  if (uState == 5.0) speed = 1.6; // escalation

  // Multi-frequency organic liquid surface waves
  float noise1 = snoise(position * 1.5 + vec3(0.0, uTime * speed * 0.4, 0.0));
  float noise2 = snoise(position * 3.2 - vec3(uTime * speed * 0.6, 0.0, uTime * speed * 0.3)) * 0.5;
  float totalNoise = (noise1 + noise2) * 0.22;

  // Sound-wave speech pulse ripple (subtle concentric wave)
  float pulseFreq = (uState == 2.0) ? 6.0 : 3.0;
  float soundWave = sin(length(position.xy) * pulseFreq - uTime * speed * 3.0) * 0.04;
  if (uState == 2.0) {
    totalNoise += soundWave * 1.5;
  }

  // Interactive Cursor displacement: calculate distance to projected cursor
  vec4 modelPos = modelMatrix * vec4(position, 1.0);
  vec2 screenPos = position.xy;
  float mouseDist = length(screenPos - uMouse * 1.8);
  float mouseInfluence = smoothstep(1.8, 0.0, mouseDist);

  // Dynamic bulge / ripple toward cursor with velocity amplification
  float dynamicDeform = mouseInfluence * (0.35 + uVelocity * 0.45) * uDeformStrength;
  float displacement = totalNoise + dynamicDeform;

  // State-specific pulses
  if (uState == 3.0) { // Success confirmation pulse
    displacement += sin(uTime * 5.0) * 0.05 * smoothstep(1.0, 0.0, abs(position.y));
  } else if (uState == 5.0) { // Escalation alert pulse
    displacement += sin(uTime * 8.0) * 0.07;
  }

  vDisplacement = displacement;
  vec3 newPosition = position + normal * displacement;

  vPosition = (modelViewMatrix * vec4(newPosition, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

export const orbFragmentShader = `
uniform float uTime;
uniform vec3 uBaseColor;
uniform vec3 uAccentColor;
uniform vec3 uCoreColor;
uniform float uState;
uniform float uHover;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vDisplacement;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(-vPosition);

  // Optical Fresnel rim calculation (Astra liquid metal look)
  float fresnel = dot(normal, viewDir);
  fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
  float fresnelPower = pow(fresnel, 2.5);

  // Base metallic chromatic palette
  vec3 colorA = uBaseColor;
  vec3 colorB = uAccentColor;
  vec3 coreGlow = uCoreColor;

  // State-driven color modulations:
  // 0: Idle pearlescent golden (#FFE156 / #171717)
  // 1: Processing indigo blue
  // 2: Generating response dynamic cyan/amber
  // 3: Success electric lime (#B8F56A)
  // 4: Error/not found warm amber (#FFA940)
  // 5: Escalated coral red (#FF6B6B)
  if (uState == 3.0) {
    colorB = vec3(0.72, 0.96, 0.41); // Electric Lime
    coreGlow = vec3(0.50, 0.85, 0.20);
  } else if (uState == 5.0) {
    colorB = vec3(1.0, 0.42, 0.42); // Coral Red
    coreGlow = vec3(0.9, 0.2, 0.2);
  } else if (uState == 1.0 || uState == 2.0) {
    colorB = vec3(0.30, 0.49, 0.99); // Electric Blue
    coreGlow = vec3(0.20, 0.35, 0.85);
  }

  // Liquid displacement gradient
  float mixFactor = clamp((vDisplacement + 0.25) * 2.0, 0.0, 1.0);
  vec3 surfaceColor = mix(colorA, colorB, mixFactor);

  // Subtle iridescent shifting based on surface normal angle
  float iridescence = sin(vNormal.x * 3.14159 + uTime * 0.5) * 0.08;
  surfaceColor += vec3(iridescence * 0.5, iridescence * 0.2, -iridescence * 0.3);

  // Liquid core internal glow
  vec3 finalColor = mix(surfaceColor, coreGlow, fresnelPower * 0.7);

  // Specular highlight representing intelligence and crisp neo-brutalist contrast
  vec3 lightDir = normalize(vec3(1.0, 1.5, 2.0));
  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(normal, halfDir), 0.0), 32.0);
  finalColor += vec3(spec * 0.7);

  // Edge darkening for high-contrast neo-brutalist sharpness
  float edgeOutline = smoothstep(0.95, 0.99, fresnel);
  finalColor = mix(finalColor, vec3(0.09, 0.09, 0.09), edgeOutline * 0.65);

  gl_FragColor = vec4(finalColor, 0.95);
}
`;
