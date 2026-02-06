'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';

import {
  auroraDisabledRoutes,
  auroraEnabledByDefault,
} from '@/src/config/backgrounds';
import Aurora from './Aurora';
import './AuroraBackground.css';

type AuroraBackgroundProps = {
  /**
   * Toggle the global background on/off.
   * Set `enabled={false}` in the root layout to disable entirely.
   */
  enabled?: boolean;
  className?: string;
  zIndex?: number;
  overlay?: boolean;
};

/**
 * Aurora global background wrapper.
 * - Disable globally: set `auroraEnabledByDefault` to false in `src/config/backgrounds.ts`.
 * - Disable per layout: pass `enabled={false}`.
 * - Adjust layering: pass `zIndex`, and tweak overlay via the `overlay` prop or CSS.
 */
export default function AuroraBackground({
  enabled,
  className = '',
  zIndex = 0,
  overlay = true,
}: AuroraBackgroundProps) {
  const pathname = usePathname();
  const isDisabledRoute = useMemo(
    () => (pathname ? auroraDisabledRoutes.includes(pathname) : false),
    [pathname],
  );
  const isEnabled = enabled ?? auroraEnabledByDefault;

  if (!isEnabled || isDisabledRoute) {
    return null;
  }

  return (
    <div
      className={`qe-aurora-background ${className}`}
      style={{ zIndex }}
      aria-hidden="true"
    >
      <div className="qe-aurora-layer">
        <Aurora
          colorStops={['#7cff67', '#B19EEF', '#5227FF']}
          blend={0.5}
          amplitude={1.0}
          speed={1}
        />
      </div>
      {overlay ? <div className="qe-aurora-overlay" /> : null}
    </div>
  );
}
