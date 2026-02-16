import { Children } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import styles from './StickySplitBlock.module.css';

type Chapter = {
  key: string;
  title: string;
  eyebrow?: string;
  intro?: string;
  content: ReactNode;
};

type StickySplitBlockProps = {
  id?: string;
  chapters: Chapter[];
  className?: string;
};

export default function StickySplitBlock({ id, chapters, className }: StickySplitBlockProps) {
  return (
    <section id={id} className={`${styles.block}${className ? ` ${className}` : ''}`}>
      {chapters.map((chapter) => {
        const beats = Children.toArray(chapter.content).filter(Boolean);
        const beatsCount = beats.length;
        const chapterStyle = { ['--beats' as any]: beatsCount } as CSSProperties;

        return (
          <article key={chapter.key} className={styles.chapter} aria-label={chapter.title} style={chapterStyle}>
            <div className={styles.left}>
              <div className={styles.sticky}>
                {chapter.eyebrow ? <p className={styles.eyebrow}>{chapter.eyebrow}</p> : null}
                <h2 className={styles.h2}>{chapter.title}</h2>
                {chapter.intro ? <p className={styles.intro}>{chapter.intro}</p> : null}
              </div>
            </div>
            <div className={styles.right}>
              <div className={styles.stack}>
                {beats.map((node, index) => (
                  <div className={styles.beat} key={`${chapter.key}-beat-${index}`}>
                    {node}
                  </div>
                ))}
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
