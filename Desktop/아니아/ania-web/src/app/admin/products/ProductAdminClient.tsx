'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Product, ProductCategory } from '@/lib/types';
import styles from './products.module.css';

const CATEGORIES: ProductCategory[] = [
  'outerwear', 'tops', 'bottoms', 'dresses',
  'bags', 'shoes', 'accessories', 'etc',
];

const EMPTY_FORM = {
  name: '', name_ko: '', price: '', category: 'etc' as ProductCategory,
  stock: '100', is_available: true, description: '',
};

interface ProductAdminClientProps {
  initialProducts: Product[];
}

export default function ProductAdminClient({ initialProducts }: ProductAdminClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [images, setImages] = useState<string[]>([]);      // current image URLs
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function openAdd() {
    setForm({ ...EMPTY_FORM });
    setImages([]);
    setMsg('');
    setEditTarget(null);
    setModal('add');
  }

  function openEdit(p: Product) {
    setForm({
      name: p.name,
      name_ko: p.name_ko ?? '',
      price: String(p.price),
      category: p.category,
      stock: String(p.stock),
      is_available: p.is_available,
      description: p.description ?? '',
    });
    setImages(p.images ?? []);
    setMsg('');
    setEditTarget(p);
    setModal('edit');
  }

  function closeModal() {
    setModal(null);
    setEditTarget(null);
  }

  async function uploadImages(files: FileList) {
    setUploading(true);
    const supabase = getSupabaseBrowserClient();
    const urls: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from('product-images')
        .upload(path, file, { upsert: false });

      if (!error) {
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(path);
        urls.push(publicUrl);
      }
    }

    setImages((prev) => [...prev, ...urls]);
    setUploading(false);
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
  }

  async function handleSave() {
    setSaving(true);
    setMsg('');
    const supabase = getSupabaseBrowserClient();

    const payload = {
      name: form.name,
      name_ko: form.name_ko || null,
      price: Number(form.price),
      category: form.category,
      stock: Number(form.stock),
      is_available: form.is_available,
      description: form.description || null,
      images,
    };

    let error;
    if (modal === 'add') {
      // id omitted → Supabase auto-generates UUID via gen_random_uuid()
      const res = await supabase.from('products').insert(payload).select().single();
      error = res.error;
      if (!error && res.data) {
        setProducts((prev) => [res.data as Product, ...prev]);
      }
    } else if (editTarget) {
      const res = await supabase.from('products').update(payload).eq('id', editTarget.id).select().single();
      error = res.error;
      if (!error && res.data) {
        setProducts((prev) => prev.map((p) => p.id === editTarget.id ? res.data as Product : p));
      }
    }

    setSaving(false);
    if (error) {
      setMsg(`오류: ${error.message}`);
    } else {
      closeModal();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>상품 관리</h1>
        <div className={styles.headerActions}>
          <a href="/admin/members" className={styles.linkBtn}>회원 관리</a>
          <button className={styles.addBtn} onClick={openAdd}>+ 상품 추가</button>
        </div>
      </div>
      <p className={styles.count}>총 {products.length}개</p>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>사진</th>
            <th>이름 (EN)</th>
            <th>이름 (KO)</th>
            <th>가격</th>
            <th>카테고리</th>
            <th>재고</th>
            <th>활성</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>
                {p.images[0] ? (
                  <div className={styles.thumb}>
                    <Image src={p.images[0]} alt={p.name} width={52} height={52} className={styles.thumbImg} />
                  </div>
                ) : (
                  <div className={styles.noImg}>—</div>
                )}
              </td>
              <td className={styles.nameEn}>{p.name}</td>
              <td className={styles.nameKo}>{p.name_ko ?? '—'}</td>
              <td>{p.price.toLocaleString()}원</td>
              <td>{p.category}</td>
              <td>{p.stock}</td>
              <td>
                <span className={p.is_available ? styles.on : styles.off}>
                  {p.is_available ? '판매중' : '중단'}
                </span>
              </td>
              <td className={styles.actions}>
                <button className={styles.editBtn} onClick={() => openEdit(p)}>수정</button>
                <button className={styles.delBtn} onClick={() => handleDelete(p.id)}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {modal && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{modal === 'add' ? '상품 추가' : '상품 수정'}</h2>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label>이름 (EN) *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="PRODUCT NAME" />
              </div>
              <div className={styles.field}>
                <label>이름 (KO)</label>
                <input value={form.name_ko} onChange={(e) => setForm({ ...form, name_ko: e.target.value })} placeholder="상품명" />
              </div>
              <div className={styles.field}>
                <label>가격 (원) *</label>
                <input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0" />
              </div>
              <div className={styles.field}>
                <label>카테고리</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label>재고</label>
                <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
              <div className={styles.field}>
                <label>판매 상태</label>
                <select value={form.is_available ? 'true' : 'false'} onChange={(e) => setForm({ ...form, is_available: e.target.value === 'true' })}>
                  <option value="true">판매중</option>
                  <option value="false">판매중단</option>
                </select>
              </div>
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label>설명</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="상품 설명" />
              </div>
            </div>

            {/* Image upload */}
            <div className={styles.imageSection}>
              <label className={styles.imageLabel}>
                상품 이미지
                <span className={styles.imageSub}>(여러 장 선택 가능, Supabase Storage 업로드)</span>
              </label>
              <div className={styles.imageGrid}>
                {images.map((url, i) => (
                  <div key={url} className={styles.imageItem}>
                    <Image src={url} alt={`상품이미지${i + 1}`} width={80} height={80} className={styles.previewImg} />
                    <button className={styles.removeImg} onClick={() => removeImage(url)}>✕</button>
                  </div>
                ))}
                <button
                  type="button"
                  className={styles.uploadBtn}
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? '업로드 중...' : '+ 사진 추가'}
                </button>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className={styles.fileInput}
                onChange={(e) => e.target.files && uploadImages(e.target.files)}
              />
            </div>

            {msg && <p className={styles.errMsg}>{msg}</p>}

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeModal}>취소</button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving || uploading || !form.name}>
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
