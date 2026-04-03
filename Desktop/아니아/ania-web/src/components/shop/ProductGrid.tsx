import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';
import styles from './ProductGrid.module.css';

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 4;
}

export default function ProductGrid({ products, columns = 4 }: ProductGridProps) {
  return (
    <div className={`${styles.grid} ${columns === 2 ? styles.twoCol : styles.fourCol}`}>
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} priority={i < 4} />
      ))}
    </div>
  );
}
