import styles from './StickySplitCard.module.css';

type StickySplitCardProps = {
  title: string;
  text: string;
  className?: string;
};

export default function StickySplitCard({ title, text, className }: StickySplitCardProps) {
  return (
    <article className={`${styles.card}${className ? ` ${className}` : ''}`}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.text}>{text}</p>
    </article>
  );
}
