import { promises as fs } from "fs";
import path from "path";
import { mockItems } from "@/lib/mock-data";
import { getProductionStorageClient, hasProductionStorage, isVercelRuntime } from "@/lib/production-storage";
import type { MenuItem } from "@/types/database";

const dataDir = path.join(process.cwd(), "data");
const uploadsDir = path.join(process.cwd(), "public", "uploads");
const imageMapPath = path.join(dataDir, "item-images.json");
const itemOverridesPath = path.join(dataDir, "items.json");
const deletedItemsPath = path.join(dataDir, "deleted-items.json");

type ImageMap = Record<string, string>;
type ItemOverrides = Record<string, Partial<MenuItem>>;

export async function getMockItemsWithImages(): Promise<MenuItem[]> {
  if (isVercelRuntime()) {
    return getProductionMenuItems();
  }

  const imageMap = await readImageMap();
  const itemOverrides = await readItemOverrides();
  const deletedItems = await readDeletedItems();
  return mockItems
    .filter((item) => !deletedItems.includes(item.id))
    .map((item) => ({
      ...item,
      ...itemOverrides[item.id],
      image_url: imageMap[item.id] || itemOverrides[item.id]?.image_url || item.image_url,
    }));
}

export async function saveLocalItem(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) {
    return;
  }

  const currentImageUrl = String(formData.get("current_image_url") || "").trim();
  const submittedImageUrl = String(formData.get("image_url") || "").trim();
  const imageUrl = submittedImageUrl || (currentImageUrl.startsWith("/uploads/") ? currentImageUrl : "");

  const itemOverrides = await readItemOverrides();
  itemOverrides[id] = {
    ...itemOverrides[id],
    id,
    category_id: String(formData.get("category_id") || "") || null,
    name_en: String(formData.get("name_en") || ""),
    name_ar: String(formData.get("name_ar") || ""),
    description_en: String(formData.get("description_en") || "") || null,
    description_ar: String(formData.get("description_ar") || "") || null,
    price: Number(formData.get("price") || 0),
    image_url: imageUrl || null,
    is_available: formData.get("is_available") === "on",
  };

  if (isVercelRuntime()) {
    await saveProductionMenuItem(id, itemOverrides[id]);
    return;
  }

  await fs.mkdir(dataDir, { recursive: true });

  await fs.writeFile(itemOverridesPath, JSON.stringify(itemOverrides, null, 2), "utf8");

  if (imageUrl) {
    const imageMap = await readImageMap();
    imageMap[id] = imageUrl;
    await fs.writeFile(imageMapPath, JSON.stringify(imageMap, null, 2), "utf8");
  }
}

export async function saveLocalItemImage(itemId: string, file: File, fallbackUrl: string) {
  let imageUrl = fallbackUrl.trim();

  if (file.size > 0) {
    if (isVercelRuntime()) {
      const bytes = Buffer.from(await file.arrayBuffer());
      imageUrl = `data:${file.type || "image/jpeg"};base64,${bytes.toString("base64")}`;
    } else {
      const extension = getSafeExtension(file.name, file.type);
      const filename = `${itemId}-${Date.now()}${extension}`;
      const destination = path.join(uploadsDir, filename);
      const bytes = new Uint8Array(await file.arrayBuffer());
      await fs.mkdir(uploadsDir, { recursive: true });
      await fs.writeFile(destination, bytes);
      imageUrl = `/uploads/${filename}`;
    }
  }

  if (!imageUrl) {
    return;
  }

  if (isVercelRuntime()) {
    await saveProductionMenuItemImage(itemId, imageUrl);
    return;
  }

  await fs.mkdir(dataDir, { recursive: true });
  const imageMap = await readImageMap();
  imageMap[itemId] = imageUrl;
  await fs.writeFile(imageMapPath, JSON.stringify(imageMap, null, 2), "utf8");
}

export async function deleteLocalItem(itemId: string) {
  if (!itemId) {
    return;
  }

  if (isVercelRuntime()) {
    await deleteProductionMenuItem(itemId);
    return;
  }

  await fs.mkdir(dataDir, { recursive: true });

  const deletedItems = await readDeletedItems();
  if (!deletedItems.includes(itemId)) {
    deletedItems.push(itemId);
    await fs.writeFile(deletedItemsPath, JSON.stringify(deletedItems, null, 2), "utf8");
  }

  const itemOverrides = await readItemOverrides();
  delete itemOverrides[itemId];
  await fs.writeFile(itemOverridesPath, JSON.stringify(itemOverrides, null, 2), "utf8");
}

async function readImageMap(): Promise<ImageMap> {
  if (isVercelRuntime()) {
    return readProductionImageMap();
  }

  try {
    const raw = await fs.readFile(imageMapPath, "utf8");
    return JSON.parse(raw) as ImageMap;
  } catch {
    return {};
  }
}

async function readItemOverrides(): Promise<ItemOverrides> {
  if (isVercelRuntime()) {
    return readProductionItemOverrides();
  }

  try {
    const raw = await fs.readFile(itemOverridesPath, "utf8");
    return JSON.parse(raw) as ItemOverrides;
  } catch {
    return {};
  }
}

async function readDeletedItems(): Promise<string[]> {
  if (isVercelRuntime()) {
    return readProductionDeletedItems();
  }

  try {
    const raw = await fs.readFile(deletedItemsPath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

async function readProductionImageMap(): Promise<ImageMap> {
  if (!hasProductionStorage()) return {};
  const supabase = getProductionStorageClient();
  const { data, error } = await supabase.from("roma_item_images").select("item_id,image_url");
  if (error) throw new Error(error.message);
  return Object.fromEntries((data || []).map((row) => [row.item_id as string, row.image_url as string]));
}

async function getProductionMenuItems(): Promise<MenuItem[]> {
  if (!hasProductionStorage()) {
    throw new Error("Production menu storage is not configured. Add Supabase env vars and run schema.sql.");
  }

  const supabase = getProductionStorageClient();
  const { data, error } = await supabase
    .from("roma_menu_items")
    .select("item_data,is_deleted,sort_order")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  const rows = data || [];
  const missingItems = mockItems.filter((item) => !rows.some((row) => (row.item_data as MenuItem).id === item.id));
  if (missingItems.length) {
    await seedProductionMenuItems(missingItems);
    return getProductionMenuItems();
  }

  return rows
    .filter((row) => !row.is_deleted)
    .map((row) => row.item_data as MenuItem);
}

async function seedProductionMenuItems(itemsToSeed: MenuItem[]) {
  const supabase = getProductionStorageClient();
  const seedItems = await getSeedMenuItems(itemsToSeed);
  const { error } = await supabase.from("roma_menu_items").upsert(
    seedItems.map((item) => ({
      item_id: item.id,
      item_data: item,
      is_deleted: false,
      sort_order: mockItems.findIndex((mockItem) => mockItem.id === item.id),
      updated_at: new Date().toISOString(),
    })),
  );

  if (error) throw new Error(error.message);
}

async function getSeedMenuItems(itemsToSeed: MenuItem[]) {
  const [imageMap, itemOverrides] = await Promise.all([
    readBundledJson<ImageMap>(imageMapPath, {}),
    readBundledJson<ItemOverrides>(itemOverridesPath, {}),
  ]);

  return itemsToSeed.map((item) => ({
    ...item,
    ...itemOverrides[item.id],
    image_url: imageMap[item.id] || itemOverrides[item.id]?.image_url || item.image_url,
  }));
}

async function readBundledJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function saveProductionMenuItem(itemId: string, itemData: Partial<MenuItem>) {
  const items = await getProductionMenuItems();
  const existing = items.find((item) => item.id === itemId) || mockItems.find((item) => item.id === itemId);
  if (!existing) return;

  const updatedItem = { ...existing, ...itemData };
  const supabase = getProductionStorageClient();
  const { error } = await supabase.from("roma_menu_items").upsert({
    item_id: itemId,
    item_data: updatedItem,
    is_deleted: false,
    sort_order: mockItems.findIndex((item) => item.id === itemId),
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
}

async function saveProductionMenuItemImage(itemId: string, imageUrl: string) {
  const items = await getProductionMenuItems();
  const existing = items.find((item) => item.id === itemId) || mockItems.find((item) => item.id === itemId);
  if (!existing) return;

  await saveProductionMenuItem(itemId, { ...existing, image_url: imageUrl });
}

async function deleteProductionMenuItem(itemId: string) {
  const items = await getProductionMenuItems();
  const existing = items.find((item) => item.id === itemId) || mockItems.find((item) => item.id === itemId);
  const supabase = getProductionStorageClient();
  const { error } = await supabase.from("roma_menu_items").upsert({
    item_id: itemId,
    item_data: existing || { id: itemId },
    is_deleted: true,
    sort_order: mockItems.findIndex((item) => item.id === itemId),
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
}

async function readProductionItemOverrides(): Promise<ItemOverrides> {
  if (!hasProductionStorage()) return {};
  const supabase = getProductionStorageClient();
  const { data, error } = await supabase.from("roma_item_overrides").select("item_id,item_data");
  if (error) throw new Error(error.message);
  return Object.fromEntries((data || []).map((row) => [row.item_id as string, row.item_data as Partial<MenuItem>]));
}

async function readProductionDeletedItems(): Promise<string[]> {
  if (!hasProductionStorage()) return [];
  const supabase = getProductionStorageClient();
  const { data, error } = await supabase.from("roma_deleted_items").select("item_id");
  if (error) throw new Error(error.message);
  return (data || []).map((row) => row.item_id as string);
}

function getSafeExtension(filename: string, mimeType: string) {
  const extension = path.extname(filename).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(extension)) {
    return extension;
  }

  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/webp") return ".webp";
  if (mimeType === "image/gif") return ".gif";
  return ".jpg";
}
