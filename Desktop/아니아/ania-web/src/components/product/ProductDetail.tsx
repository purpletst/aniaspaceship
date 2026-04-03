'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import SizeSelector from './SizeSelector';
import AddToCartButton from '@/components/cart/AddToCartButton';
import styles from './ProductDetail.module.css';

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeImg, setActiveImg] = useState(0);

  const images = product.images.length > 0 ? product.images : ['/assets/character-base.png'];

  return (
    <div className={styles.layout}>
      {/* Left: images */}
      <div className={styles.imageCol}>
        <div className={styles.mainImgWrap}>
          <Image
            src={images[activeImg]}
            alt={product.name_ko ?? product.name}
            fill
            className={styles.mainImg}
            sizes="(max-width: 960px) 100vw, 50vw"
            priority
          />
        </div>
        {images.length > 1 && (
          <div className={styles.thumbnails}>
            {images.map((src, i) => (
              <button
                key={i}
                className={`${styles.thumb} ${activeImg === i ? styles.thumbActive : ''}`}
                onClick={() => setActiveImg(i)}
              >
                <Image src={src} alt="" fill className={styles.thumbImg} sizes="80px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: info */}
      <div className={styles.infoCol}>
        <p className={styles.category}>{product.category.toUpperCase()}</p>
        <h1 className={styles.name}>{product.name}</h1>
        {product.name_ko && <p className={styles.nameKo}>{product.name_ko}</p>}
        <p className={styles.price}>₩{product.price.toLocaleString()}</p>

        {product.description && (
          <p className={styles.description}>{product.description}</p>
        )}

        <SizeSelector
          sizes={SIZES}
          selected={selectedSize}
          onSelect={setSelectedSize}
        />

        <AddToCartButton product={product} selectedSize={selectedSize} />
      </div>
    </div>
  );
}
