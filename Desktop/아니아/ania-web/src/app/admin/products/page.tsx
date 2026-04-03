import { notFound } from 'next/navigation';
import { getSupabaseServerClient, getSupabaseAdminClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/types';
import ProductAdminClient from './ProductAdminClient';

export const metadata = { title: '상품 관리 — 아니아 어드민' };

export default async function AdminProductsPage() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!user || !adminEmail || user.email !== adminEmail) notFound();

  const admin = getSupabaseAdminClient();
  const { data: products } = await admin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return <ProductAdminClient initialProducts={(products ?? []) as Product[]} />;
}
