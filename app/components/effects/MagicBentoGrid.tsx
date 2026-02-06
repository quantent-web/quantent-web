'use client';

import {
  type CSSProperties,
  type ElementType,
  type ReactElement,
  type ReactNode,
  type RefObject,
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { gsap } from 'gsap';
import styles from './MagicBentoGrid.module.css';
import { magicBentoConfig } from '@/src/config/magicBento';

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = '132, 0, 255';

const createParticleElement = (x: number, y: number, color = DEFAULT_GLOW_COLOR) => {
  const el = document.createElement('div');
  el.className = styles.particle;
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

const calculateSpotlightValues = (radius: number) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75,
});

const updateCardGlowProperties = (
  card: HTMLElement,
  mouseX: number,
  mouseY: number,
  glow: number,
  radius: number
) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;

  card.style.setProperty('--glow-x', `${relativeX}%`);
  card.style.setProperty('--glow-y', `${relativeY}%`);
  card.style.setProperty('--glow-intensity', glow.toString());
  card.style.setProperty('--glow-radius', `${radius}px`);
};

type Variant = 'auto' | '2' | '3' | '4' | '6' | '8';

type MagicBentoGridProps = {
  children: ReactNode;
  className?: string;
  variant?: Variant;
  disabled?: boolean;
  sectionId?: string;
  enableGlow?: boolean;
  enableTilt?: boolean;
};

type MagicBentoCardProps = {
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  disableAnimations?: boolean;
  particleCount?: number;
  glowColor?: string;
  enableTilt?: boolean;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
} & Record<string, unknown>;

const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);

    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  return prefersReducedMotion;
};

const useTouchScreen = () => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: none), (pointer: coarse)');
    const updateTouch = () => setIsTouch(mediaQuery.matches);

    updateTouch();
    mediaQuery.addEventListener('change', updateTouch);

    return () => mediaQuery.removeEventListener('change', updateTouch);
  }, []);

  return isTouch;
};

const MagicBentoCard = ({
  as: Component = 'div',
  children,
  className = '',
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = false,
  enableMagnetism = false,
  ...rest
}: MagicBentoCardProps) => {
  const cardRef = useRef<HTMLElement | null>(null);
  const particlesRef = useRef<HTMLElement[]>([]);
  const timeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef<HTMLElement[]>([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimationRef = useRef<gsap.core.Tween | null>(null);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return;

    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor)
    );
    particlesInitialized.current = true;
  }, [particleCount, glowColor]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();

    particlesRef.current.forEach(particle => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'back.in(1.7)',
        onComplete: () => {
          particle.parentNode?.removeChild(particle);
        },
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;

    if (!particlesInitialized.current) {
      initializeParticles();
    }

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;

        const clone = particle.cloneNode(true) as HTMLElement;
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);

        gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });

        gsap.to(clone, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: 'none',
          repeat: -1,
          yoyo: true,
        });

        gsap.to(clone, {
          opacity: 0.3,
          duration: 1.5,
          ease: 'power2.inOut',
          repeat: -1,
          yoyo: true,
        });
      }, index * 100);

      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;

    const element = cardRef.current;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 5,
          rotateY: 5,
          duration: 0.3,
          ease: 'power2.out',
          transformPerspective: 1000,
        });
      }
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      }

      if (enableMagnetism) {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!enableTilt && !enableMagnetism) return;

      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        gsap.to(element, {
          rotateX,
          rotateY,
          duration: 0.1,
          ease: 'power2.out',
          transformPerspective: 1000,
        });
      }

      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.05;
        const magnetY = (y - centerY) * 0.05;

        magnetismAnimationRef.current = gsap.to(element, {
          x: magnetX,
          y: magnetY,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    };

    const handleClick = (event: MouseEvent) => {
      if (!clickEffect) return;

      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );

      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `;

      element.appendChild(ripple);

      gsap.fromTo(
        ripple,
        {
          scale: 0,
          opacity: 1,
        },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          onComplete: () => ripple.remove(),
        }
      );
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('click', handleClick);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('click', handleClick);
      clearAllParticles();
    };
  }, [
    animateParticles,
    clearAllParticles,
    clickEffect,
    disableAnimations,
    enableMagnetism,
    enableTilt,
    glowColor,
  ]);

  return (
    <Component
      ref={cardRef}
      className={`${className} ${styles.particleContainer}`}
      style={{ ...style, position: 'relative', overflow: 'hidden' }}
      data-magic-bento-card="true"
      {...rest}
    >
      {children}
    </Component>
  );
};

const GlobalSpotlight = ({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR,
}: {
  gridRef: RefObject<HTMLDivElement | null>;
  disableAnimations?: boolean;
  enabled?: boolean;
  spotlightRadius?: number;
  glowColor?: string;
}) => {
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (disableAnimations || !gridRef?.current || !enabled) return;

    const spotlight = document.createElement('div');
    spotlight.className = styles.globalSpotlight;
    spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%,
        rgba(${glowColor}, 0.08) 15%,
        rgba(${glowColor}, 0.04) 25%,
        rgba(${glowColor}, 0.02) 40%,
        rgba(${glowColor}, 0.01) 65%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const handleMouseMove = (event: MouseEvent) => {
      if (!spotlightRef.current || !gridRef.current) return;

      const section = gridRef.current.closest('[data-magic-bento-section]');
      const rect = section?.getBoundingClientRect();
      const mouseInside =
        rect &&
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      const cards = gridRef.current.querySelectorAll<HTMLElement>('[data-magic-bento-card="true"]');

      if (!mouseInside) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
        cards.forEach(card => {
          card.style.setProperty('--glow-intensity', '0');
        });
        return;
      }

      const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
      let minDistance = Infinity;

      cards.forEach(cardElement => {
        const cardRect = cardElement.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance =
          Math.hypot(event.clientX - centerX, event.clientY - centerY) -
          Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);

        minDistance = Math.min(minDistance, effectiveDistance);

        let glowIntensity = 0;
        if (effectiveDistance <= proximity) {
          glowIntensity = 1;
        } else if (effectiveDistance <= fadeDistance) {
          glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        }

        updateCardGlowProperties(cardElement, event.clientX, event.clientY, glowIntensity, spotlightRadius);
      });

      gsap.to(spotlightRef.current, {
        left: event.clientX,
        top: event.clientY,
        duration: 0.1,
        ease: 'power2.out',
      });

      const targetOpacity =
        minDistance <= proximity
          ? 0.8
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
            : 0;

      gsap.to(spotlightRef.current, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.2 : 0.5,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gridRef.current?.querySelectorAll<HTMLElement>('[data-magic-bento-card="true"]').forEach(card => {
        card.style.setProperty('--glow-intensity', '0');
      });
      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
    };
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

  return null;
};

const getVariantFromCount = (count: number): Variant => {
  if (count <= 2) return '2';
  if (count === 3) return '3';
  if (count === 4) return '4';
  if (count <= 6) return '6';
  return '8';
};

const getLayoutForVariant = (variant: Variant, cardCount: number) => {
  if (variant === 'auto' && cardCount <= 1) {
    return { base: 1, md: 1, lg: 1, xl: 1 };
  }
  const resolvedVariant = variant === 'auto' ? getVariantFromCount(cardCount) : variant;

  switch (resolvedVariant) {
    case '2':
      return { base: 1, md: 2, lg: 2, xl: 2 };
    case '3':
      return { base: 1, md: 2, lg: 3, xl: 3 };
    case '4':
      return { base: 1, md: 2, lg: 2, xl: 2 };
    case '6':
      return { base: 1, md: 2, lg: 3, xl: 3 };
    case '8':
      return { base: 1, md: 2, lg: 3, xl: 4 };
    default:
      return { base: 1, md: 1, lg: 1, xl: 1 };
  }
};

const mergeClassNames = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(' ');

/**
 * MagicBentoGrid
 * - Wrap card sections with <MagicBentoGrid sectionId="features" variant="auto">...</MagicBentoGrid>
 * - Disable per section via config (src/config/magicBento.ts) or with disabled={true}
 * - Force layouts with variant="2" | "3" | "4" | "6" | "8"
 */
const MagicBentoGrid = ({
  children,
  className,
  variant = 'auto',
  disabled,
  sectionId,
  enableGlow = true,
  enableTilt = false,
}: MagicBentoGridProps) => {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isTouch = useTouchScreen();
  const reducedMotion = prefersReducedMotion;
  const configVariant = sectionId ? magicBentoConfig.perSectionVariant[sectionId] : undefined;
  const resolvedVariant = configVariant && variant === 'auto' ? configVariant : variant;
  const configDisabled =
    !magicBentoConfig.enableByDefault ||
    (sectionId ? magicBentoConfig.disabledSections.includes(sectionId) : false);
  const isDisabled = disabled ?? configDisabled;

  const childrenArray = useMemo(() => Children.toArray(children), [children]);
  const cardCount = useMemo(
    () => childrenArray.filter(child => isValidElement(child)).length,
    [childrenArray]
  );
  const layout = useMemo(() => getLayoutForVariant(resolvedVariant, cardCount), [resolvedVariant, cardCount]);

  const shouldDisableAnimations = reducedMotion || isDisabled;
  const allowTilt = enableTilt && !isTouch && !reducedMotion && !isDisabled;
  const allowGlow = enableGlow && !isDisabled;

  const enhancedChildren = useMemo(
    () =>
      childrenArray.map((child, index) => {
        if (!isValidElement(child)) return child;

        const element = child as ReactElement<{
          className?: string;
          style?: CSSProperties;
          children?: ReactNode;
        }>;
        const { className: childClassName, style: childStyle, children: childChildren, ...rest } = element.props;
        const mergedClassName = mergeClassNames(
          childClassName,
          styles.magicBentoCard,
          allowGlow ? styles.magicBentoCardBorderGlow : undefined
        );

        const mergedStyle = {
          ...childStyle,
          '--glow-color': DEFAULT_GLOW_COLOR,
        } as CSSProperties;

        return (
          <MagicBentoCard
            key={element.key ?? index}
            as={element.type as ElementType}
            className={mergedClassName}
            style={mergedStyle}
            disableAnimations={shouldDisableAnimations}
            particleCount={DEFAULT_PARTICLE_COUNT}
            glowColor={DEFAULT_GLOW_COLOR}
            enableTilt={allowTilt}
            clickEffect={!shouldDisableAnimations}
            enableMagnetism={false}
            {...rest}
          >
            {childChildren}
          </MagicBentoCard>
        );
      }),
    [allowGlow, allowTilt, childrenArray, shouldDisableAnimations]
  );

  return (
    <>
      {allowGlow && !shouldDisableAnimations && (
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={shouldDisableAnimations}
          enabled={allowGlow}
          spotlightRadius={DEFAULT_SPOTLIGHT_RADIUS}
          glowColor={DEFAULT_GLOW_COLOR}
        />
      )}
      <div
        ref={gridRef}
        className={mergeClassNames(styles.magicBentoGrid, styles.bentoSection, className)}
        data-magic-bento-section
        data-section-id={sectionId}
        style={
          {
            '--mb-cols-base': layout.base,
            '--mb-cols-md': layout.md,
            '--mb-cols-lg': layout.lg,
            '--mb-cols-xl': layout.xl,
          } as CSSProperties
        }
      >
        {isDisabled ? childrenArray : enhancedChildren}
      </div>
    </>
  );
};

export default MagicBentoGrid;
