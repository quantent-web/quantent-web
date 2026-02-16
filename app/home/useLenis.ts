'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';

type ScrollTarget = HTMLElement | string;
type ScrollOpts = { offset?: number };

export function useLenis() {
  const [enabled, setEnabled] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;

    if (reduced || coarse) {
      setEnabled(false);
      return;
    }

    const lenis = new Lenis({
      autoRaf: true,
    });

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

    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, {
        offset,
        duration: 1.15,
      });
      return;
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
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  return { enabled, scrollTo };
}
