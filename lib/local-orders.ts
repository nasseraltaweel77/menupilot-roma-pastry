import { promises as fs } from "fs";
import path from "path";
import type { Order, OrderLineItem, OrderStatus } from "@/types/database";

const dataDir = path.join(process.cwd(), "data");
const ordersPath = path.join(dataDir, "orders.json");

export async function getSavedOrders(): Promise<Order[]> {
  const localOrders = await readLocalOrders();
  return localOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function saveLocalOrder(input: {
  restaurantId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  notes: string;
  total: number;
  items: OrderLineItem[];
  status?: OrderStatus;
  id?: string;
}) {
  await fs.mkdir(dataDir, { recursive: true });

  const orders = await readLocalOrders();
  const id = input.id || `ROMA-${Date.now()}`;

  if (orders.some((order) => order.id === id)) {
    return id;
  }

  const order: Order = {
    id,
    restaurant_id: input.restaurantId,
    customer_name: input.customerName,
    customer_phone: input.customerPhone,
    delivery_address: input.deliveryAddress,
    notes: input.notes || null,
    status: input.status || "New",
    total: input.total,
    items: input.items,
    created_at: new Date().toISOString(),
  };

  orders.unshift(order);
  await fs.writeFile(ordersPath, JSON.stringify(orders, null, 2), "utf8");
  return order.id;
}

async function readLocalOrders(): Promise<Order[]> {
  try {
    const raw = await fs.readFile(ordersPath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as Order[] : [];
  } catch {
    return [];
  }
}
