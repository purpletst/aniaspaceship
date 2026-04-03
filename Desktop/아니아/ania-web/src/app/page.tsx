import HeroPanel from '@/components/home/HeroPanel';
import ProductGrid from '@/components/shop/ProductGrid';
import XpPopupWrapper from '@/components/popup/XpPopupWrapper';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/types';
import styles from './page.module.css';

// Seed data — shown before Supabase is connected
const SEED_PRODUCTS: Product[] = [
  { id: '1', name: 'SATIN BLOUSE SET', name_ko: '새틴 블라우스 세트', price: 298000, description: null, images: ['/assets/products/satin-blouse-set.jpeg'], category: 'tops', stock: 10, is_available: true, created_at: '' },
  { id: '2', name: 'TRACK JACKET MINT', name_ko: '트랙 재킷 민트', price: 198000, description: null, images: ['/assets/products/track-jacket-mint.jpeg'], category: 'outerwear', stock: 5, is_available: true, created_at: '' },
  { id: '3', name: 'LEATHER GLOVES GREEN', name_ko: '그린 레더 글러브', price: 89000, description: null, images: ['/assets/products/leather-gloves-green.jpeg'], category: 'accessories', stock: 20, is_available: true, created_at: '' },
  { id: '4', name: 'HAIR CLIP SET', name_ko: '헤어 클립 세트', price: 45000, description: null, images: ['/assets/products/hair-clip-set.png'], category: 'accessories', stock: 30, is_available: true, created_at: '' },
  { id: '5', name: 'EDITORIAL LOOK 01', name_ko: '에디토리얼 룩 01', price: 550000, description: null, images: ['/assets/products/editorial-look-01.jpeg'], category: 'etc', stock: 3, is_available: true, created_at: '' },
  { id: '6', name: 'GUIDE BOOK', name_ko: '지구인 가이드', price: 0, description: null, images: ['/assets/products/guide-book.png'], category: 'etc', stock: 0, is_available: false, created_at: '' },
];

async function getHomeProducts(): Promise<Product[]> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6);
    if (data && data.length > 0) return data as Product[];
  } catch {
    // Supabase not yet configured
  }
  return SEED_PRODUCTS;
}

export default async function HomePage() {
  const products = await getHomeProducts();

  return (
    <>
      <XpPopupWrapper />
      <main className={styles.split}>
        <HeroPanel />
        <div className={styles.gridPanel}>
          <ProductGrid products={products} columns={2} />
        </div>
      </main>
    </>
  );
}
