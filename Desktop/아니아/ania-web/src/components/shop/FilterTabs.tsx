'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { ProductCategory } from '@/lib/types';
import styles from './FilterTabs.module.css';

const TABS: { label: string; value: ProductCategory | 'all' }[] = [
  { label: 'ALL',        value: 'all'        },
  { label: 'OUTERWEAR',  value: 'outerwear'  },
  { label: 'TOPS',       value: 'tops'       },
  { label: 'BOTTOMS',    value: 'bottoms'    },
  { label: 'DRESSES',    value: 'dresses'    },
  { label: 'BAGS',       value: 'bags'       },
  { label: 'SHOES',      value: 'shoes'      },
  { label: 'ACCESSORIES',value: 'accessories'},
];

export default function FilterTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = (searchParams.get('category') ?? 'all') as ProductCategory | 'all';

  function handleChange(value: ProductCategory | 'all') {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete('category');
    } else {
      params.set('category', value);
    }
    router.push(`/shop?${params.toString()}`);
  }

  return (
    <div className={styles.tabs}>
      {TABS.map(({ label, value }) => (
        <button
          key={value}
          className={`${styles.tab} ${active === value ? styles.active : ''}`}
          onClick={() => handleChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
