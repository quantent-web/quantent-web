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

  const rotateX = useTransform(scrollYProgress, [0, 1], [15, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);
  const translateY = useTransform(scrollYProgress, [0, 1], [40, -20]);
  const headerTranslateY = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <div ref={sectionRef} className="container-scroll">
      <motion.div className="container-scroll__header" style={{ y: headerTranslateY }}>
        {titleComponent}
      </motion.div>

      <motion.div
        className="container-scroll__card"
        style={{ rotateX, scale, y: translateY }}
      >
        <div className="container-scroll__content">{children}</div>
      </motion.div>
    </div>
  );
}
