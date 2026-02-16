'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';

type ScrollTarget = HTMLElement | string;
type ScrollOpts = { offset?: number; immediate?: boolean };

export const LENIS_CONFIG = {
  autoRaf: true,
  duration: 1.15,
  easing: (t: number) => 1 - Math.pow(1 - t, 3),
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 1,
} as const;

export function useLenis() {
  const [enabled, setEnabled] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const width = window.innerWidth;

    const shouldDisable = reduced || width < 768 || (coarse && width < 1024);

    if (shouldDisable) {
      console.log('[Lenis] OFF', { reduced, coarse, width });
      document.documentElement.removeAttribute('data-lenis');
      setEnabled(false);
      return;
    }

    const lenis = new Lenis(LENIS_CONFIG);

    console.log('[Lenis] ON', { reduced, coarse, width });

    lenisRef.current = lenis;
    setEnabled(true);
    document.documentElement.setAttribute('data-lenis', 'on');

    return () => {
      document.documentElement.removeAttribute('data-lenis');
      lenisRef.current = null;
      setEnabled(false);
      lenis.destroy();
    };
  }, []);

  const scrollTo = useCallback((target: ScrollTarget, opts?: ScrollOpts) => {
    const offset = opts?.offset ?? 0;
    const immediate = opts?.immediate ?? false;
    const duration = immediate ? 0 : LENIS_CONFIG.duration;

    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, {
        offset,
        duration,
        easing: LENIS_CONFIG.easing,
        ...(immediate ? { immediate: true } : {}),
      });
      return duration * 1000;
    }

    let element: HTMLElement | null = null;

    if (typeof target === 'string') {
      const id = target.startsWith('#') ? target.slice(1) : target;
      element = document.getElementById(id);
    } else {
      element = target;
    }

    if (element) {
      const top = window.scrollY + element.getBoundingClientRect().top + offset;
      window.scrollTo({ top, behavior: immediate ? 'auto' : 'smooth' });
    }

    return duration * 1000;
  }, []);

  return { enabled, scrollTo, programmaticDurationMs: LENIS_CONFIG.duration * 1000 };
}
