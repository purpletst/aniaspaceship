import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const isOutOfStock = product.stock === 0 || !product.is_available;
  const imageSrc = product.images[0] ?? '/assets/character-base.png';

  return (
    <Link href={`/shop/${product.id}`} className={styles.card}>
      <div className={styles.imgWrap}>
        <Image
          src={imageSrc}
          alt={product.name_ko ?? product.name}
          fill
          className={styles.img}
          sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 25vw"
          priority={priority}
        />
        {isOutOfStock && (
          <div className={styles.outOfStock}>OUT OF STOCK</div>
        )}
      </div>
      <div className={styles.meta}>
        <p className={styles.name}>{product.name}</p>
        <p className={styles.price}>
          {isOutOfStock ? '품절' : `₩${product.price.toLocaleString()}`}
        </p>
      </div>
    </Link>
  );
}
