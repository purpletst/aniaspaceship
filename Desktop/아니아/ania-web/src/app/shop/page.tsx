import { Suspense } from 'react';
import FilterTabs from '@/components/shop/FilterTabs';
import ProductGrid from '@/components/shop/ProductGrid';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Product, ProductCategory } from '@/lib/types';
import styles from './shop.module.css';

const SEED_PRODUCTS: Product[] = [
  { id: '1', name: 'SATIN BLOUSE SET', name_ko: '새틴 블라우스 세트', price: 298000, description: null, images: ['/assets/products/satin-blouse-set.jpeg'], category: 'tops', stock: 10, is_available: true, created_at: '' },
  { id: '2', name: 'TRACK JACKET MINT', name_ko: '트랙 재킷 민트', price: 198000, description: null, images: ['/assets/products/track-jacket-mint.jpeg'], category: 'outerwear', stock: 5, is_available: true, created_at: '' },
  { id: '3', name: 'LEATHER GLOVES GREEN', name_ko: '그린 레더 글러브', price: 89000, description: null, images: ['/assets/products/leather-gloves-green.jpeg'], category: 'accessories', stock: 20, is_available: true, created_at: '' },
  { id: '4', name: 'HAIR CLIP SET', name_ko: '헤어 클립 세트', price: 45000, description: null, images: ['/assets/products/hair-clip-set.png'], category: 'accessories', stock: 30, is_available: true, created_at: '' },
  { id: '5', name: 'EDITORIAL LOOK 01', name_ko: '에디토리얼 룩 01', price: 550000, description: null, images: ['/assets/products/editorial-look-01.jpeg'], category: 'etc', stock: 3, is_available: true, created_at: '' },
  { id: '6', name: 'GUIDE BOOK', name_ko: '지구인 가이드', price: 0, description: null, images: ['/assets/products/guide-book.png'], category: 'etc', stock: 0, is_available: false, created_at: '' },
];

async function getProducts(category: string | undefined): Promise<Product[]> {
  try {
    const supabase = await getSupabaseServerClient();
    let query = supabase.from('products').select('*').order('created_at', { ascending: false });
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    const { data } = await query;
    if (data && data.length > 0) return data as Product[];
  } catch {
    // Supabase not yet configured
  }
  if (category && category !== 'all') {
    return SEED_PRODUCTS.filter((p) => p.category === category);
  }
  return SEED_PRODUCTS;
}

interface ShopPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category } = await searchParams;
  const products = await getProducts(category);

  return (
    <main className={styles.page}>
      <Suspense fallback={null}>
        <FilterTabs />
      </Suspense>
      <ProductGrid products={products} columns={4} />
    </main>
  );
}
