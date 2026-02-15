import type { KeyboardEvent } from 'react';
import styles from './Switch.module.css';

export type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  ariaLabel?: string;
  className?: string;
};

export default function Switch({
  checked,
  onCheckedChange,
  ariaLabel = 'Toggle theme',
  className = '',
}: SwitchProps) {
  const handleToggle = () => onCheckedChange(!checked);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      data-state={checked ? 'checked' : 'unchecked'}
      className={`${styles.switch} ${checked ? styles.checked : ''} ${className}`.trim()}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
    >
      <span className={styles.track} aria-hidden="true">
        <span className={styles.glow} />
        <span className={styles.iconSun}>
          <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2.75v2.5M12 18.75v2.5M4.22 4.22l1.77 1.77M18.01 18.01l1.77 1.77M2.75 12h2.5M18.75 12h2.5M4.22 19.78l1.77-1.77M18.01 5.99l1.77-1.77" />
          </svg>
        </span>
        <span className={styles.iconMoon}>
          <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <path d="M21 14.75A9 9 0 1 1 9.25 3 7 7 0 1 0 21 14.75Z" />
          </svg>
        </span>
        <span className={styles.thumb} />
      </span>
    </button>
  );
}
