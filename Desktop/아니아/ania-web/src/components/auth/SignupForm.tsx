'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import styles from './SignupForm.module.css';

declare global {
  interface Window {
    daum: {
      Postcode: new (config: { oncomplete: (data: DaumPostcodeResult) => void }) => { open: () => void };
    };
  }
}

interface DaumPostcodeResult {
  zonecode: string;
  roadAddress: string;
  jibunAddress: string;
}

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const addressDetailRef = useRef<HTMLInputElement>(null);

  function openPostcode() {
    if (!window.daum) return;
    new window.daum.Postcode({
      oncomplete(data: DaumPostcodeResult) {
        setPostalCode(data.zonecode);
        setAddress(data.roadAddress || data.jibunAddress);
        addressDetailRef.current?.focus();
      },
    }).open();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      setError('필수 약관에 동의해주세요.');
      return;
    }

    setLoading(true);
    const supabase = getSupabaseBrowserClient();

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError || !data.user) {
      setError(signUpError?.message ?? '회원가입 중 오류가 발생했습니다.');
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      name,
      mobile,
      postal_code: postalCode,
      address,
      address_detail: addressDetail,
    });

    if (profileError) {
      setError('프로필 저장 중 오류가 발생했습니다.');
      setLoading(false);
      return;
    }

    router.push('/');
  }

  return (
    <>
      <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" />
      <div className={styles.wrapper}>
        <h1 className={styles.title}>회원가입</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>기본 정보</h2>
            <div className={styles.field}>
              <label className={styles.label}>이메일 (아이디) *</label>
              <input
                className={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="example@email.com"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>비밀번호 *</label>
              <input
                className={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="8자 이상"
                minLength={8}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>비밀번호 확인 *</label>
              <input
                className={styles.input}
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                placeholder="비밀번호를 다시 입력해주세요"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>이름 *</label>
              <input
                className={styles.input}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="홍길동"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>휴대전화</label>
              <input
                className={styles.input}
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="010-0000-0000"
              />
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>주소</h2>
            <div className={styles.field}>
              <label className={styles.label}>우편번호</label>
              <div className={styles.row}>
                <input
                  className={styles.input}
                  type="text"
                  value={postalCode}
                  readOnly
                  placeholder="우편번호"
                />
                <button type="button" className={styles.postcodeBtn} onClick={openPostcode}>
                  검색
                </button>
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>기본주소</label>
              <input
                className={styles.input}
                type="text"
                value={address}
                readOnly
                placeholder="주소 검색 후 자동 입력"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>상세주소</label>
              <input
                ref={addressDetailRef}
                className={styles.input}
                type="text"
                value={addressDetail}
                onChange={(e) => setAddressDetail(e.target.value)}
                placeholder="동, 호수 등"
              />
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>약관 동의</h2>
            <label className={styles.checkLabel}>
              <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
              <span>[필수] 이용약관 동의</span>
            </label>
            <label className={styles.checkLabel}>
              <input type="checkbox" checked={agreePrivacy} onChange={(e) => setAgreePrivacy(e.target.checked)} />
              <span>[필수] 개인정보 수집·이용 동의</span>
            </label>
            <label className={styles.checkLabel}>
              <input type="checkbox" checked={agreeMarketing} onChange={(e) => setAgreeMarketing(e.target.checked)} />
              <span>[선택] 쇼핑정보 수신 동의</span>
            </label>
          </section>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? '처리 중...' : '가입하기'}
          </button>

          <p className={styles.loginLink}>
            이미 회원이신가요? <a href="/login">로그인</a>
          </p>
        </form>
      </div>
    </>
  );
}
