'use client';

import type { ReactNode } from 'react';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

type ContainerScrollProps = {
  titleComponent?: ReactNode;
  children: ReactNode;
};

export function ContainerScroll({ titleComponent, children }: ContainerScrollProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.55, 1], [24, 10, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.55, 1], [0.82, 0.9, 1]);
  const translateY = useTransform(scrollYProgress, [0, 1], [140, -20]);
  const headerTranslateY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const cardOpacity = useTransform(scrollYProgress, [0, 0.2, 1], [0.35, 0.85, 1]);

  return (
    <section ref={sectionRef} className="container-scroll">
      <div className="container-scroll__sticky">
        <motion.div className="container-scroll__header" style={{ y: headerTranslateY }}>
          {titleComponent}
        </motion.div>

        <motion.div
          className="container-scroll__card"
          style={{ rotateX, scale, y: translateY, opacity: cardOpacity }}
        >
          <div className="container-scroll__content">{children}</div>
        </motion.div>
      </div>
    </section>
  );
}
