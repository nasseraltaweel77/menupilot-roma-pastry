export type OrderStatus = "New" | "Paid" | "Preparing" | "Ready" | "Delivered" | "Cancelled";

export type Restaurant = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  phone: string | null;
  currency: string;
  created_at: string;
};

export type MenuCategory = {
  id: string;
  restaurant_id: string;
  name_en: string;
  name_ar: string;
  sort_order: number;
  created_at: string;
};

export type MenuItem = {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
};

export type Order = {
  id: string;
  restaurant_id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  notes: string | null;
  status: OrderStatus;
  total: number;
  items: OrderLineItem[];
  created_at: string;
};

export type OrderLineItem = {
  item_id: string;
  name_en: string;
  name_ar: string;
  price: number;
  quantity: number;
};
