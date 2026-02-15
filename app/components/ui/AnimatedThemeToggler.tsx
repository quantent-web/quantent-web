'use client';

import { useEffect, useState, type KeyboardEvent } from 'react';
import styles from './AnimatedThemeToggler.module.css';

export type AnimatedThemeTogglerProps = {
  ariaLabel?: string;
  className?: string;
};

const getIsDarkTheme = () => document.documentElement.dataset.theme === 'dark';

export default function AnimatedThemeToggler({
  ariaLabel = 'Toggle theme',
  className = '',
}: AnimatedThemeTogglerProps) {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(getIsDarkTheme());
  }, []);

  const applyTheme = (nextChecked: boolean) => {
    const nextTheme = nextChecked ? 'dark' : 'light';
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('theme', nextTheme);
    setChecked(nextChecked);
  };

  const toggle = () => applyTheme(!checked);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle();
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      className={`${styles.toggler} ${checked ? styles.checked : ''} ${className}`.trim()}
      onClick={toggle}
      onKeyDown={onKeyDown}
    >
      <span className={styles.iconWrap} aria-hidden="true">
        <svg className={styles.sunIcon} viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
        <svg className={styles.moonIcon} viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3c.19 0 .37.01.56.02A7 7 0 0 0 21 12.79Z" />
        </svg>
      </span>
    </button>
  );
}
