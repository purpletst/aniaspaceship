import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Order, Profile } from '@/lib/types';
import MyPageClient from './MyPageClient';

export const metadata = {
  title: '마이페이지 — 아니아',
};

export default async function MyPage() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?return=/mypage');
  }

  const [{ data: orders }, { data: profile }] = await Promise.all([
    supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
  ]);

  return (
    <MyPageClient
      email={user.email ?? ''}
      orders={(orders ?? []) as Order[]}
      profile={profile as Profile | null}
    />
  );
}
