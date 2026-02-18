'use client';

import { useCallback } from 'react';

type ScrollTarget = HTMLElement | string;
type ScrollOpts = { offset?: number; immediate?: boolean };

export const LENIS_CONFIG = {
  duration: 0,
} as const;

export function useLenis() {
  const scrollTo = useCallback((target: ScrollTarget, opts?: ScrollOpts) => {
    const offset = opts?.offset ?? 0;
    const immediate = opts?.immediate ?? false;

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

    return 0;
  }, []);

  return { enabled: false, scrollTo, programmaticDurationMs: 0 };
}
