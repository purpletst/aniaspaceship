import { notFound } from 'next/navigation';
import { getSupabaseServerClient, getSupabaseAdminClient } from '@/lib/supabase/server';
import styles from './members.module.css';

export const metadata = {
  title: '회원 관리 — 아니아 어드민',
};

export default async function AdminMembersPage() {
  // Auth check — only the admin email may access this page
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!user || !adminEmail || user.email !== adminEmail) {
    notFound();
  }

  const admin = getSupabaseAdminClient();

  // Fetch all users via admin API
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 });

  // Fetch all profiles
  const { data: profiles } = await admin.from('profiles').select('*');
  const profileMap = new Map((profiles ?? []).map((p: { id: string; name: string | null; mobile: string | null }) => [p.id, p]));

  // Fetch order counts per user
  const { data: orderRows } = await admin.from('orders').select('user_id');
  const orderCounts = new Map<string, number>();
  for (const row of orderRows ?? []) {
    orderCounts.set(row.user_id, (orderCounts.get(row.user_id) ?? 0) + 1);
  }

  return (
    <div className={styles.wrapper}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <h1 className={styles.title}>회원 관리</h1>
        <a href="/admin/products" style={{ fontFamily: 'Tahoma,sans-serif', fontSize: '9.5px', color: '#555', textDecoration: 'underline' }}>상품 관리</a>
      </div>
      <p className={styles.count}>총 {users.length}명</p>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>이메일</th>
            <th>이름</th>
            <th>휴대전화</th>
            <th>가입일</th>
            <th>주문수</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const profile = profileMap.get(u.id) as { name?: string; mobile?: string } | undefined;
            return (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{profile?.name ?? '—'}</td>
                <td>{profile?.mobile ?? '—'}</td>
                <td>{new Date(u.created_at).toLocaleDateString('ko-KR')}</td>
                <td>{orderCounts.get(u.id) ?? 0}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
