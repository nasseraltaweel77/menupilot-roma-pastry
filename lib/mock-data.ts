import type { MenuCategory, MenuItem, Restaurant } from "@/types/database";

export function hasSupabaseEnv() {
  return false;
}

const now = new Date();

export const mockRestaurant: Restaurant = {
  id: "roma-pastry",
  owner_id: "mock-admin",
  name: "Roma Pastry",
  slug: "roma",
  phone: "966545199610",
  currency: "SAR",
  created_at: now.toISOString(),
};

export const romaMeta = {
  city: "Jeddah",
  instagram: "romapastry.sa",
  tagline: "Follow the sweetest road to Rome",
  taglineAr: "اتبع أحلى طريق إلى روما",
  whatsappDisplay: "0545199610",
};

export const mockCategories: MenuCategory[] = [
  category("cat-signature", "Signature", "سيجنتشر", 1),
  category("cat-millefeuille", "Millefeuille Bites", "ميلفيه بايتس", 2),
  category("cat-cheesecakes", "Cheesecakes", "تشيز كيك", 3),
  category("cat-italian-french", "Italian & French Desserts", "حلويات إيطالية وفرنسية", 4),
  category("cat-platters", "Platters", "بلاترز", 5),
  category("cat-macarons", "Macarons", "ماكرون", 6),
];

export const mockItems: MenuItem[] = [
  item("item-original", "cat-millefeuille", "Original Millefeuille Bites", "ميلفيه بايتس أورجنال", 79),
  item("item-mix", "cat-millefeuille", "Mixed Millefeuille Bites", "ميلفيه بايتس مكس", 89),
  item("item-savory", "cat-millefeuille", "Savory Millefeuille Bites", "ميلفيه بايتس مالح", 86),
  item("item-signature", "cat-signature", "Roma Signature", "روما سيجنتشر", 145),
  item("item-madrid-classic", "cat-cheesecakes", "Madrid Classic Cheesecake", "تشيز كيك مدريد كلاسيك", 129),
  item("item-madrid-mix", "cat-cheesecakes", "Madrid Mixed Cheesecake", "تشيز كيك مدريد مكس", 139),
  item("item-chocolate-madrid", "cat-cheesecakes", "Chocolate Madrid Cheesecake", "تشوكلت مدريد تشيز كيك", 139),
  item("item-italian-french-box", "cat-italian-french", "Italian & French Desserts Box", "بوكس الحلويات الإيطالية والفرنسية", 159),
  item("item-eclair-platter", "cat-platters", "Eclair Platter", "إكلير بلاتر", 119),
  item("item-roma-show", "cat-platters", "Roma Show", "روما شو", 189),
  item("item-macaron", "cat-macarons", "Macarons", "ماكرون", 95),
];

function category(id: string, name_en: string, name_ar: string, sort_order: number): MenuCategory {
  return { id, restaurant_id: mockRestaurant.id, name_en, name_ar, sort_order, created_at: now.toISOString() };
}

function item(id: string, category_id: string, name_en: string, name_ar: string, price: number): MenuItem {
  return {
    id,
    restaurant_id: mockRestaurant.id,
    category_id,
    name_en,
    name_ar,
    description_en: "A refined Roma Pastry selection prepared for elegant occasions.",
    description_ar: "اختيار فاخر من روما باستري يليق بالمناسبات الراقية.",
    price,
    image_url: null,
    is_available: true,
    created_at: now.toISOString(),
  };
}
