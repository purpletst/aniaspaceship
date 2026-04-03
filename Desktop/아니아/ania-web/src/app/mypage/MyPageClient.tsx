'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Order, OrderStatus, Profile } from '@/lib/types';
import styles from './mypage.module.css';

function formatMobile(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '입금전',
  confirmed: '배송준비중',
  shipped: '배송중',
  delivered: '배송완료',
  cancelled: '취소',
};

const STATUS_ORDER: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered'];

type Tab = 'order' | 'address' | 'profile';

interface MyPageClientProps {
  email: string;
  orders: Order[];
  profile: Profile | null;
}

export default function MyPageClient({ email, orders, profile }: MyPageClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('order');

  // Address / Profile edit state
  const [name, setName] = useState(profile?.name ?? '');
  const [mobile, setMobile] = useState(profile?.mobile ?? '');
  const [postalCode, setPostalCode] = useState(profile?.postal_code ?? '');
  const [address, setAddress] = useState(profile?.address ?? '');
  const [addressDetail, setAddressDetail] = useState(profile?.address_detail ?? '');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const counts = STATUS_ORDER.reduce<Record<string, number>>((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {});

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  async function saveProfile() {
    setSaving(true);
    setSaveMsg('');
    const supabase = getSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = tab === 'address'
      ? { postal_code: postalCode, address, address_detail: addressDetail }
      : { name, mobile };

    const { error } = await supabase.from('profiles').upsert({ id: user.id, ...payload });
    setSaving(false);
    setSaveMsg(error ? '저장 중 오류가 발생했습니다.' : '저장되었습니다.');
  }

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>마이페이지</h1>
      <p className={styles.email}>{email}</p>

      {/* Order status summary */}
      <div className={styles.statusBar}>
        {STATUS_ORDER.map((s) => (
          <div key={s} className={styles.statusItem} onClick={() => setTab('order')}>
            <span className={styles.statusCount}>{counts[s] ?? 0}</span>
            <span className={styles.statusLabel}>{STATUS_LABELS[s]}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {(['order', 'address', 'profile'] as Tab[]).map((t) => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => { setTab(t); setSaveMsg(''); }}
          >
            {t === 'order' ? 'ORDER' : t === 'address' ? 'ADDRESS' : 'PROFILE'}
          </button>
        ))}
        <button className={styles.tab} onClick={handleLogout}>LOGOUT</button>
      </div>

      {/* Tab content */}
      <div className={styles.content}>
        {tab === 'order' && (
          orders.length === 0 ? (
            <p className={styles.empty}>주문 내역이 없습니다.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>주문일</th>
                  <th>상품</th>
                  <th>금액</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{new Date(order.created_at).toLocaleDateString('ko-KR')}</td>
                    <td>{order.items.map((i) => `${i.product_name} (${i.size})`).join(', ')}</td>
                    <td>{order.total_price.toLocaleString()}원</td>
                    <td>{STATUS_LABELS[order.status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}

        {tab === 'address' && (
          <div className={styles.editForm}>
            <div className={styles.field}>
              <label className={styles.label}>우편번호</label>
              <input className={styles.input} value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="우편번호" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>기본주소</label>
              <input className={styles.input} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="기본주소" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>상세주소</label>
              <input className={styles.input} value={addressDetail} onChange={(e) => setAddressDetail(e.target.value)} placeholder="상세주소" />
            </div>
            {saveMsg && <p className={styles.saveMsg}>{saveMsg}</p>}
            <button className={styles.saveBtn} onClick={saveProfile} disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        )}

        {tab === 'profile' && (
          <div className={styles.editForm}>
            <div className={styles.field}>
              <label className={styles.label}>이름</label>
              <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>휴대전화</label>
              <input
                className={styles.input}
                type="tel"
                inputMode="numeric"
                value={mobile}
                onChange={(e) => setMobile(formatMobile(e.target.value))}
                placeholder="010-0000-0000"
                maxLength={13}
              />
            </div>
            {saveMsg && <p className={styles.saveMsg}>{saveMsg}</p>}
            <button className={styles.saveBtn} onClick={saveProfile} disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
