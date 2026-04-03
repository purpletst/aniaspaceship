'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Product } from '@/lib/types';
import styles from './SearchModal.module.css';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase
      .from('products')
      .select('id, name, name_ko, price, images, is_available')
      .or(`name.ilike.%${q}%,name_ko.ilike.%${q}%,description.ilike.%${q}%`)
      .eq('is_available', true)
      .limit(10);
    setResults((data ?? []) as Product[]);
    setLoading(false);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(q), 280);
  }

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.inputRow}>
          <span className={styles.icon}>🔍</span>
          <input
            ref={inputRef}
            className={styles.input}
            value={query}
            onChange={handleChange}
            placeholder="상품명, 카테고리로 검색..."
            autoComplete="off"
          />
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {loading && <p className={styles.status}>검색 중...</p>}

        {!loading && query && results.length === 0 && (
          <p className={styles.status}>검색 결과가 없습니다.</p>
        )}

        {results.length > 0 && (
          <ul className={styles.results}>
            {results.map((product) => (
              <li key={product.id}>
                <Link href={`/shop/${product.id}`} className={styles.resultItem} onClick={onClose}>
                  {product.images[0] && (
                    <div className={styles.thumb}>
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={56}
                        height={56}
                        className={styles.thumbImg}
                      />
                    </div>
                  )}
                  <div className={styles.info}>
                    <span className={styles.nameKo}>{product.name_ko ?? product.name}</span>
                    <span className={styles.nameEn}>{product.name}</span>
                    <span className={styles.price}>{product.price.toLocaleString()}원</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
