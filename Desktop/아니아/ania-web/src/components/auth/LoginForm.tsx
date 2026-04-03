'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import styles from './LoginForm.module.css';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnPath = searchParams.get('return') ?? '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = getSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      setLoading(false);
    } else {
      router.push(returnPath);
      router.refresh();
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.box}>
        <h1 className={styles.title}>로그인 / LOGIN</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            EMAIL
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label className={styles.label}>
            PASSWORD
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? '처리 중...' : '로그인'}
          </button>
        </form>
        <p className={styles.signupLink}>
          아직 회원이 아니신가요? <a href="/signup">회원가입</a>
        </p>
      </div>
    </div>
  );
}
