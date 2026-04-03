import { notFound } from 'next/navigation';
import ProductDetail from '@/components/product/ProductDetail';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/types';

const SEED_PRODUCTS: Product[] = [
  { id: '1', name: 'SATIN BLOUSE SET', name_ko: '새틴 블라우스 세트', price: 298000, description: '실크 사틴 소재의 세트 구성. 탑과 미니 스커트로 구성되어 있습니다.', images: ['/assets/products/satin-blouse-set.jpeg'], category: 'tops', stock: 10, is_available: true, created_at: '' },
  { id: '2', name: 'TRACK JACKET MINT', name_ko: '트랙 재킷 민트', price: 198000, description: '민트 컬러의 집업 트랙 재킷. 대비되는 스티치 디테일이 포인트.', images: ['/assets/products/track-jacket-mint.jpeg'], category: 'outerwear', stock: 5, is_available: true, created_at: '' },
  { id: '3', name: 'LEATHER GLOVES GREEN', name_ko: '그린 레더 글러브', price: 89000, description: '라임 그린 컬러의 손가락 없는 가죽 장갑.', images: ['/assets/products/leather-gloves-green.jpeg'], category: 'accessories', stock: 20, is_available: true, created_at: '' },
  { id: '4', name: 'HAIR CLIP SET', name_ko: '헤어 클립 세트', price: 45000, description: '서킷 보드 패턴이 프린팅된 헤어 클립 세트.', images: ['/assets/products/hair-clip-set.png'], category: 'accessories', stock: 30, is_available: true, created_at: '' },
  { id: '5', name: 'EDITORIAL LOOK 01', name_ko: '에디토리얼 룩 01', price: 550000, description: '26FW 에디토리얼 룩북 첫 번째 컷.', images: ['/assets/products/editorial-look-01.jpeg'], category: 'etc', stock: 3, is_available: true, created_at: '' },
  { id: '6', name: 'GUIDE BOOK', name_ko: '지구인 가이드', price: 0, description: '지구인으로 살아남기 가이드북.', images: ['/assets/products/guide-book.png'], category: 'etc', stock: 0, is_available: false, created_at: '' },
];

async function getProduct(id: string): Promise<Product | null> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase.from('products').select('*').eq('id', id).single();
    if (data) return data as Product;
  } catch {
    // Supabase not yet configured
  }
  return SEED_PRODUCTS.find((p) => p.id === id) ?? null;
}

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  return <ProductDetail product={product} />;
}
