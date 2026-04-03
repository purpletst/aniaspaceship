'use client';

import styles from './SizeSelector.module.css';

interface SizeSelectorProps {
  sizes: string[];
  selected: string | null;
  onSelect: (size: string) => void;
}

export default function SizeSelector({ sizes, selected, onSelect }: SizeSelectorProps) {
  return (
    <div className={styles.wrap}>
      <p className={styles.label}>SIZE</p>
      <div className={styles.buttons}>
        {sizes.map((size) => (
          <button
            key={size}
            className={`${styles.btn} ${selected === size ? styles.selected : ''}`}
            onClick={() => onSelect(size)}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}
