import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Custom shader material for distorted sphere
const distortionVertexShader = `
  uniform float uTime;
  uniform float uDistortion;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  // Simplex noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
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
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vUv = uv;
    vNormal = normal;
    float distortion = snoise(position * 2.0 + uTime * 0.3) * uDistortion;
    vec3 newPosition = position + normal * distortion;
    vPosition = newPosition;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const distortionFragmentShader = `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  void main() {
    vec3 baseColor = vec3(0.043, 0.043, 0.047); // near-black metallic
    vec3 rimLight = vec3(0.784, 1.0, 0.239); // lime accent
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 3.0);
    vec3 finalColor = mix(baseColor, rimLight, fresnel * 0.4);
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

interface DistortedSphereProps {
  mousePos: { x: number; y: number };
  scrollProgress: number;
  isMobile: boolean;
}

function DistortedSphere({ mousePos, scrollProgress, isMobile }: DistortedSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current || !matRef.current) return;

    const t = clock.getElapsedTime();

    // Smooth rotation based on mouse
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, mousePos.y * 0.5, 0.05);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, mousePos.x * 0.5, 0.05);

    // Slow auto-rotation
    meshRef.current.rotation.z += 0.002;

    // Update uniforms
    matRef.current.uniforms.uTime.value = t;
    matRef.current.uniforms.uDistortion.value = 0.3 + Math.sin(t * 0.5) * 0.1;

    // Scroll-driven position/scale
    const targetY = -scrollProgress * 3;
    const targetScale = 1 - scrollProgress * 0.3;
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.05);
    meshRef.current.scale.setScalar(targetScale * (isMobile ? 0.7 : 1));
  });

  return (
    <mesh ref={meshRef} position={[isMobile ? 2 : 1.5, 0, 0]}>
      <sphereGeometry args={[2, isMobile ? 32 : 64, isMobile ? 32 : 64]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={distortionVertexShader}
        fragmentShader={distortionFragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uDistortion: { value: 0.3 },
        }}
      />
    </mesh>
  );
}

function CameraController({ scrollProgress }: { scrollProgress: number }) {
  const { camera } = useThree();

  useFrame(() => {
    camera.position.z = 6 - scrollProgress * 2;
    camera.position.y = scrollProgress * 0.5;
  });

  return null;
}

export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const [isReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  const scrollProgressRef = useRef(0);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const updateIsMobile = () => setIsMobile(media.matches);
    media.addEventListener('change', updateIsMobile);
    return () => media.removeEventListener('change', updateIsMobile);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mousePos.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (isReducedMotion) return;

    ScrollTrigger.create({
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        scrollProgressRef.current = self.progress;
      },
    });
  }, [isReducedMotion]);

  if (isReducedMotion) return null;

  return (
    <div ref={containerRef} className="absolute inset-0 z-0">
      <Canvas
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: isMobile ? 'low-power' : 'high-performance',
        }}
        dpr={isMobile ? [0.75, 1] : [1, 1.5]}
        camera={{ position: [0, 0, 6], fov: 45 }}
      >
        <color attach="background" args={['#0B0B0C']} />
        <fog attach="fog" args={['#0B0B0C', 5, 15]} />

        <ambientLight intensity={0.15} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#C8FF3D" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />

        <DistortedSphere mousePos={mousePos.current} scrollProgress={scrollProgressRef.current} isMobile={isMobile} />
        <Stars radius={100} depth={50} count={isMobile ? 500 : 2000} factor={4} saturation={0} fade speed={isMobile ? 0.4 : 1} />

        <CameraController scrollProgress={scrollProgressRef.current} />

        {!isMobile && (
          <EffectComposer enableNormalPass={false}>
            <Bloom luminanceThreshold={0.9} intensity={0.3} />
            <Noise opacity={0.05} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}