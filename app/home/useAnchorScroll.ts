'use client';

import { useCallback } from 'react';
import type { MouseEvent, RefObject } from 'react';

type HashHref = `#${string}`;
type ScrollToFn = (target: HTMLElement | string, opts?: { offset?: number }) => void;

type UseAnchorScrollArgs = {
  scrollTo: ScrollToFn;
  navRef: RefObject<HTMLElement | null>;
};

export function useAnchorScroll({ scrollTo, navRef }: UseAnchorScrollArgs) {
  const scrollToHash = useCallback((href: HashHref) => {
    const targetId = href.replace('#', '');
    const el = document.getElementById(targetId);
    const navH = navRef.current?.getBoundingClientRect().height ?? 0;
    const offset = -(navH + 8);

    scrollTo(el ?? href, { offset });
    history.replaceState(null, '', href);
  }, [navRef, scrollTo]);

  const handleAnchorClick = useCallback((e: MouseEvent<HTMLAnchorElement>, href: HashHref) => {
    e.preventDefault();
    scrollToHash(href);
  }, [scrollToHash]);

  return { scrollToHash, handleAnchorClick };
}
