import styles from './SplitCard.module.css';

type SplitCardProps = {
  title: string;
  text: string;
  className?: string;
};

export default function SplitCard({ title, text, className }: SplitCardProps) {
  return (
    <article className={`${styles.card}${className ? ` ${className}` : ''}`}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.text}>{text}</p>
    </article>
  );
}
