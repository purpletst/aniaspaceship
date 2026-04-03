export type ProductCategory =
  | 'outerwear'
  | 'tops'
  | 'bottoms'
  | 'dresses'
  | 'bags'
  | 'shoes'
  | 'accessories'
  | 'etc';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Product {
  id: string;
  name: string;
  name_ko: string | null;
  price: number;
  description: string | null;
  images: string[];
  category: ProductCategory;
  stock: number;
  is_available: boolean;
  created_at: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  size: string;
  quantity: number;
  unit_price: number;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  postal_code: string;
  address: string;
  detail: string;
}

export interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  total_price: number;
  status: OrderStatus;
  shipping_address: ShippingAddress | null;
  created_at: string;
}
