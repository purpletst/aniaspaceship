'use client';

import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Product } from '@/lib/types';
import styles from './AddToCartButton.module.css';

interface AddToCartButtonProps {
  product: Product;
  selectedSize: string | null;
}

type State = 'idle' | 'loading' | 'success' | 'error';

export default function AddToCartButton({ product, selectedSize }: AddToCartButtonProps) {
  const [state, setState] = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleClick() {
    if (!selectedSize) {
      setErrorMsg('사이즈를 선택해주세요.');
      return;
    }

    setErrorMsg('');
    setState('loading');

    const supabase = getSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setErrorMsg('로그인이 필요합니다.');
      setState('error');
      return;
    }

    const { error } = await supabase.from('orders').insert({
      user_id: user.id,
      items: [{
        product_id: product.id,
        product_name: product.name,
        size: selectedSize,
        quantity: 1,
        unit_price: product.price,
      }],
      total_price: product.price,
      status: 'pending',
    });

    if (error) {
      setErrorMsg('주문 중 오류가 발생했습니다.');
      setState('error');
    } else {
      setState('success');
    }
  }

  return (
    <div>
      <button
        className={`${styles.btn} ${state === 'loading' ? styles.loading : ''}`}
        onClick={handleClick}
        disabled={state === 'loading' || state === 'success'}
      >
        {state === 'loading' && '처리 중...'}
        {state === 'success' && '✓ 주문 완료'}
        {(state === 'idle' || state === 'error') && '구매하기'}
      </button>
      {errorMsg && <p className={styles.error}>{errorMsg}</p>}
    </div>
  );
}
