"use client";

import { useEffect, useRef } from 'react';

export interface StarfieldBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  count?: number;
  speed?: number;
  starColor?: string;
  twinkle?: boolean;
  referenceAspect?: number;
  fit?: 'cover' | 'contain';
  autoDensity?: boolean;
}

interface Star {
  x: number;
  y: number;
  z: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

export default function StarfieldBackground({
  className,
  children,
  count = 400,
  speed = 0.5,
  starColor = '#ffffff',
  twinkle = true,
  referenceAspect = 16 / 9,
  fit = 'cover',
  autoDensity = true,
}: StarfieldBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let fieldW = 0;
    let fieldH = 0;

    const maxDepth = 1500;
    let animationId = 0;
    let tick = 0;

    const computeSizes = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);

      dpr = Math.max(1, window.devicePixelRatio || 1);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const refH = height;
      const refW = refH * referenceAspect;
      const scale =
        fit === 'cover'
          ? Math.max(width / refW, height / refH)
          : Math.min(width / refW, height / refH);

      fieldW = refW * scale;
      fieldH = refH * scale;
    };

    computeSizes();

    const baseArea = 1920 * 1080;
    const currentArea = width * height;
    const effectiveCount = autoDensity
      ? Math.max(50, Math.round(count * (currentArea / baseArea)))
      : count;

    const createStar = (initialZ?: number): Star => ({
      x: (Math.random() - 0.5) * fieldW * 2,
      y: (Math.random() - 0.5) * fieldH * 2,
      z: initialZ ?? Math.random() * maxDepth,
      twinkleSpeed: Math.random() * 0.02 + 0.01,
      twinkleOffset: Math.random() * Math.PI * 2,
    });

    const stars: Star[] = Array.from({ length: effectiveCount }, () =>
      createStar()
    );

    const handleResize = () => {
      const prevFieldW = fieldW || 1;
      const prevFieldH = fieldH || 1;
      computeSizes();

      const sx = fieldW / prevFieldW;
      const sy = fieldH / prevFieldH;
      for (const s of stars) {
        s.x *= sx;
        s.y *= sy;
      }
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    const animate = () => {
      tick += 1;

      ctx.fillStyle = 'rgba(10, 10, 15, 0.2)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      for (const star of stars) {
        star.z -= speed * 2;

        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * fieldW * 2;
          star.y = (Math.random() - 0.5) * fieldH * 2;
          star.z = maxDepth;
        }

        const scale = 400 / star.z;
        const x = cx + star.x * scale;
        const y = cy + star.y * scale;

        if (x < -10 || x > width + 10 || y < -10 || y > height + 10) continue;

        const size = Math.max(0.5, (1 - star.z / maxDepth) * 3);

        let opacity = (1 - star.z / maxDepth) * 0.9 + 0.1;
        if (twinkle && star.twinkleSpeed > 0.015) {
          opacity *=
            0.7 +
            0.3 * Math.sin(tick * star.twinkleSpeed + star.twinkleOffset);
        }

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = starColor;
        ctx.globalAlpha = opacity;
        ctx.fill();

        if (star.z < maxDepth * 0.3 && speed > 0.3) {
          const streakLength = (1 - star.z / maxDepth) * speed * 8;
          const angle = Math.atan2(star.y, star.x);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(
            x - Math.cos(angle) * streakLength,
            y - Math.sin(angle) * streakLength
          );
          ctx.strokeStyle = starColor;
          ctx.globalAlpha = opacity * 0.3;
          ctx.lineWidth = size * 0.5;
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(animate);
    };

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      ro.disconnect();
    };
  }, [count, speed, starColor, twinkle, referenceAspect, fit, autoDensity]);

  const rootClassName = ['starfield-background', className].filter(Boolean).join(' ');

  return (
    <div ref={containerRef} className={rootClassName}>
      <canvas ref={canvasRef} className="starfield-background__canvas" />
      <div className="starfield-background__nebula" />
      <div className="starfield-background__vignette" />
      {children ? (
        <div className="starfield-background__content">{children}</div>
      ) : null}
    </div>
  );
}
