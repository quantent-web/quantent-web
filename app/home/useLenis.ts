'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

export function useLenis() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;

    if (reduced || coarse) return;

    const lenis = new Lenis({
      autoRaf: true,
    });

    document.documentElement.setAttribute('data-lenis', 'on');

    return () => {
      document.documentElement.removeAttribute('data-lenis');
      lenis.destroy();
    };
  }, []);
}
