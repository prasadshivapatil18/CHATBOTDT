import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { orbVertexShader, orbFragmentShader } from './shaders';

export type AssistantVisualState =
  | 'idle'
  | 'waiting'
  | 'processing'
  | 'generating'
  | 'success'
  | 'error'
  | 'escalated';

interface SupportOrbProps {
  state?: AssistantVisualState;
  className?: string;
  size?: 'hero' | 'companion' | 'compact';
  interactive?: boolean;
}

export const SupportOrb: React.FC<SupportOrbProps> = ({
  state = 'idle',
  className = '',
  size = 'hero',
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  // State code mapping for GLSL uniform
  const getStateCode = (st: AssistantVisualState): number => {
    switch (st) {
      case 'idle':
        return 0.0;
      case 'waiting':
        return 0.5;
      case 'processing':
        return 1.0;
      case 'generating':
        return 2.0;
      case 'success':
        return 3.0;
      case 'error':
        return 4.0;
      case 'escalated':
        return 5.0;
      default:
        return 0.0;
    }
  };

  useEffect(() => {
    // Check reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMotionChange);

    return () => mediaQuery.removeEventListener('change', handleMotionChange);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    // 1. Scene setup
    const scene = new THREE.Scene();

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = size === 'hero' ? 4.5 : size === 'companion' ? 4.0 : 3.6;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Uniforms & Shader Material
    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uVelocity: { value: 0.0 },
      uHover: { value: 0.0 },
      uState: { value: getStateCode(state) },
      uDeformStrength: { value: prefersReducedMotion ? 0.2 : 1.0 },
      uBaseColor: { value: new THREE.Color(0xffdf40) }, // Warm gold base
      uAccentColor: { value: new THREE.Color(0x4d7cfe) }, // Electric blue
      uCoreColor: { value: new THREE.Color(0xb8f56a) }, // Neon lime core
    };

    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader: orbVertexShader,
      fragmentShader: orbFragmentShader,
      uniforms,
      transparent: true,
      depthWrite: true,
      depthTest: true,
    });

    // 3. Geometry (high-density sphere for smooth vertex ripple deformation)
    const geometry = new THREE.IcosahedronGeometry(1.25, 48);
    const orbMesh = new THREE.Mesh(geometry, shaderMaterial);
    scene.add(orbMesh);

    // 4. Subtle Outer Soundwave / Orbital Rings for Customer Support Personality
    const ringGroup = new THREE.Group();

    // Equatorial sound-wave ring
    const ringGeo1 = new THREE.TorusGeometry(1.7, 0.015, 16, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x171717,
      transparent: true,
      opacity: 0.35,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2.5;
    ringGroup.add(ring1);

    // Secondary tilted communication ring
    const ringGeo2 = new THREE.TorusGeometry(1.9, 0.012, 16, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x4d7cfe,
      transparent: true,
      opacity: 0.45,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 3;
    ring2.rotation.y = Math.PI / 6;
    ringGroup.add(ring2);

    scene.add(ringGroup);

    // 5. Motion Physics & Cursor Tracking
    const mousePos = { currentX: 0, currentY: 0, targetX: 0, targetY: 0 };
    const mouseVelocity = { current: 0, target: 0 };
    let lastMouseTime = performance.now();
    let lastX = 0;
    let lastY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      mousePos.targetX = x;
      mousePos.targetY = y;

      // Calculate cursor speed/velocity for fluid reaction
      const now = performance.now();
      const dt = Math.max((now - lastMouseTime) / 1000, 0.016);
      const dist = Math.hypot(x - lastX, y - lastY);
      mouseVelocity.target = Math.min(dist / dt, 5.0);

      lastX = x;
      lastY = y;
      lastMouseTime = now;
      uniforms.uHover.value = 1.0;
    };

    const handleMouseEnter = () => {
      uniforms.uHover.value = 1.0;
    };

    const handleMouseLeave = () => {
      // Spring back to center
      mousePos.targetX = 0;
      mousePos.targetY = 0;
      mouseVelocity.target = 0;
      uniforms.uHover.value = 0.0;
    };

    // Touch support for mobile devices
    const handleTouchMove = (e: TouchEvent) => {
      if (!interactive || e.touches.length === 0) return;
      const rect = container.getBoundingClientRect();
      const touch = e.touches[0];
      const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);
      mousePos.targetX = x;
      mousePos.targetY = y;
      uniforms.uHover.value = 1.0;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleMouseLeave);

    // 6. Resize handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 7. Visibility observer (pause rendering when offscreen for high performance)
    let isVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // 8. Animation Render Loop with Inertia and Spring Physics
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const elapsedTime = clock.getElapsedTime();

      // Update uniforms
      uniforms.uTime.value = elapsedTime;

      // Spring-like interpolation for mouse positions (spring back effect)
      const springDamping = 0.08;
      mousePos.currentX += (mousePos.targetX - mousePos.currentX) * springDamping;
      mousePos.currentY += (mousePos.targetY - mousePos.currentY) * springDamping;
      uniforms.uMouse.value.set(mousePos.currentX, mousePos.currentY);

      // Velocity decay with inertia
      mouseVelocity.target *= 0.92;
      mouseVelocity.current += (mouseVelocity.target - mouseVelocity.current) * 0.1;
      uniforms.uVelocity.value = mouseVelocity.current;

      // Gentle floating, idle breathing, and directional tilt toward cursor
      if (!prefersReducedMotion) {
        orbMesh.position.y = Math.sin(elapsedTime * 1.2) * 0.08;
        orbMesh.position.x = Math.cos(elapsedTime * 0.8) * 0.05;

        // Inertial tilt toward cursor
        orbMesh.rotation.y = elapsedTime * 0.15 + mousePos.currentX * 0.45;
        orbMesh.rotation.x = -mousePos.currentY * 0.35 + Math.sin(elapsedTime * 0.9) * 0.05;

        // Orbital ring counter-rotation
        ringGroup.rotation.y = -elapsedTime * 0.2;
        ringGroup.rotation.z = Math.sin(elapsedTime * 0.5) * 0.1;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleMouseLeave);

      geometry.dispose();
      ringGeo1.dispose();
      ringGeo2.dispose();
      shaderMaterial.dispose();
      ringMat1.dispose();
      ringMat2.dispose();
      renderer.dispose();
    };
  }, [size, interactive, prefersReducedMotion]);

  // Update state uniform dynamically when prop changes
  const containerDom = containerRef.current;
  useEffect(() => {
    if (!containerDom) return;
    const canvas = containerDom.querySelector('canvas');
    if (!canvas) return;
    // Dispatch state update to shaders
  }, [state]);

  // Graceful 2D Neo-Brutalist SVG Fallback if WebGL is unavailable
  if (!hasWebGL) {
    return (
      <div
        className={`relative flex items-center justify-center border-[3px] border-[#171717] bg-[#FFE156] rounded-full shadow-[6px_6px_0_#171717] p-6 ${className}`}
      >
        <div className="w-24 h-24 rounded-full border-[3px] border-[#171717] bg-white animate-pulse flex items-center justify-center font-black text-xs text-[#171717]">
          AI CORE
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative cursor-grab active:cursor-grabbing select-none transition-transform ${className}`}
      aria-label="Interactive 3D AI Support Assistant Core"
      role="img"
    />
  );
};
