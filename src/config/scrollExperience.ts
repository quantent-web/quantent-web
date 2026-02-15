export const SNAP_ENABLED_DEFAULT = true;
export const PINNED_ENABLED_DEFAULT = true;

const MOBILE_MAX_WIDTH = 768;

function hasWindow() {
  return typeof window !== 'undefined';
}

function shouldDisableForEnvironment(): boolean {
  if (!hasWindow()) return true;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const smallViewport = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).matches;

  return prefersReducedMotion || coarsePointer || smallViewport;
}

export function shouldEnableSnap(): boolean {
  if (!SNAP_ENABLED_DEFAULT) return false;
  return !shouldDisableForEnvironment();
}

export function shouldEnablePinned(): boolean {
  if (!PINNED_ENABLED_DEFAULT) return false;
  return !shouldDisableForEnvironment();
}
