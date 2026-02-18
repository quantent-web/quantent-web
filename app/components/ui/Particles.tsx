'use client';

import { useEffect, useRef } from 'react';
import { Renderer, Camera, Geometry, Program, Mesh } from 'ogl';

type ParticlesProps = {
  particleCount?: number;
  particleSpread?: number;
  speed?: number;
  particleColors?: string[];
  moveParticlesOnHover?: boolean;
  particleHoverFactor?: number;
  alphaParticles?: boolean;
  particleBaseSize?: number;
  sizeRandomness?: number;
  cameraDistance?: number;
  disableRotation?: boolean;
  pixelRatio?: number;
  className?: string;
};

const defaultColors = ['#05CD98', '#05CD98', '#8DF2D4'];

const hexToRgb = (hex: string): [number, number, number] => {
  let value = hex.replace(/^#/, '');
  if (value.length === 3) {
    value = value
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const int = parseInt(value, 16);
  return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255];
};

const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;

  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpread;
  uniform float uBaseSize;
  uniform float uSizeRandomness;

  varying vec4 vRandom;
  varying vec3 vColor;

  void main() {
    vRandom = random;
    vColor = color;

    vec3 pos = position * uSpread;
    pos.z *= 10.0;

    vec4 mPos = modelMatrix * vec4(pos, 1.0);
    float t = uTime;
    mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.2, random.x);
    mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.2, random.w);
    mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.2, random.z);

    vec4 mvPos = viewMatrix * mPos;
    gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const fragment = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uAlphaParticles;
  varying vec4 vRandom;
  varying vec3 vColor;

  void main() {
    vec2 uv = gl_PointCoord.xy;
    float d = length(uv - vec2(0.5));

    if(uAlphaParticles < 0.5) {
      if(d > 0.5) {
        discard;
      }
      gl_FragColor = vec4(vColor + 0.15 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
    } else {
      float circle = smoothstep(0.5, 0.4, d) * 0.65;
      gl_FragColor = vec4(vColor + 0.15 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);
    }
  }
`;

export default function Particles({
  particleCount = 180,
  particleSpread = 10,
  speed = 0.08,
  particleColors,
  moveParticlesOnHover = true,
  particleHoverFactor = 0.8,
  alphaParticles = true,
  particleBaseSize = 90,
  sizeRandomness = 1,
  cameraDistance = 20,
  disableRotation = false,
  pixelRatio = 1,
  className,
}: ParticlesProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({ dpr: pixelRatio, depth: false, alpha: true });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    gl.clearColor(0, 0, 0, 0);

    const camera = new Camera(gl, { fov: 15 });
    camera.position.set(0, 0, cameraDistance);

    const resize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current = { x, y };
    };

    window.addEventListener('resize', resize);
    if (moveParticlesOnHover) {
      container.addEventListener('mousemove', onMouseMove);
    }
    resize();

    const positions = new Float32Array(particleCount * 3);
    const randoms = new Float32Array(particleCount * 4);
    const colors = new Float32Array(particleCount * 3);
    const palette = particleColors?.length ? particleColors : defaultColors;

    for (let i = 0; i < particleCount; i++) {
      let x: number;
      let y: number;
      let z: number;
      let len: number;
      do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = Math.random() * 2 - 1;
        len = x * x + y * y + z * z;
      } while (len > 1 || len === 0);

      const r = Math.cbrt(Math.random());
      positions.set([x * r, y * r, z * r], i * 3);
      randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
      colors.set(hexToRgb(palette[Math.floor(Math.random() * palette.length)]), i * 3);
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      random: { size: 4, data: randoms },
      color: { size: 3, data: colors },
    });

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: particleSpread },
        uBaseSize: { value: particleBaseSize * pixelRatio },
        uSizeRandomness: { value: sizeRandomness },
        uAlphaParticles: { value: alphaParticles ? 1 : 0 },
      },
      transparent: true,
      depthTest: false,
    });

    const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });
    let frame = 0;
    let elapsed = 0;
    let last = performance.now();

    const update = (t: number) => {
      frame = requestAnimationFrame(update);
      const delta = t - last;
      last = t;
      elapsed += delta * speed;
      program.uniforms.uTime.value = elapsed * 0.001;

      if (moveParticlesOnHover) {
        particles.position.x = -mouseRef.current.x * particleHoverFactor;
        particles.position.y = -mouseRef.current.y * particleHoverFactor;
      }

      if (!disableRotation) {
        particles.rotation.x = Math.sin(elapsed * 0.0002) * 0.08;
        particles.rotation.y = Math.cos(elapsed * 0.0005) * 0.12;
        particles.rotation.z += 0.008 * speed;
      }

      renderer.render({ scene: particles, camera });
    };

    frame = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      if (moveParticlesOnHover) container.removeEventListener('mousemove', onMouseMove);
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas);
    };
  }, [
    alphaParticles,
    cameraDistance,
    disableRotation,
    moveParticlesOnHover,
    particleBaseSize,
    particleColors,
    particleCount,
    particleHoverFactor,
    particleSpread,
    pixelRatio,
    sizeRandomness,
    speed,
  ]);

  return <div ref={containerRef} className={className} />;
}

