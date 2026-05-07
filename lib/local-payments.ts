import { promises as fs } from "fs";
import path from "path";
import { fetchMoyasarInvoice, savePaidOrder, type PendingPaymentOrder } from "@/lib/moyasar";

const dataDir = path.join(process.cwd(), "data");
const pendingPaymentsPath = path.join(dataDir, "pending-payments.json");

type PendingPayment = {
  id: string;
  invoiceId?: string;
  status: "initiated" | "paid" | "failed";
  order: PendingPaymentOrder;
  created_at: string;
};

export async function createPendingPayment(order: Omit<PendingPaymentOrder, "id">) {
  await fs.mkdir(dataDir, { recursive: true });
  const payments = await readPendingPayments();
  const payment: PendingPayment = {
    id: `PAY-${Date.now()}`,
    status: "initiated",
    order: {
      ...order,
      id: `PAY-${Date.now()}`,
    },
    created_at: new Date().toISOString(),
  };

  payment.order.id = payment.id;
  payments[payment.id] = payment;
  await writePendingPayments(payments);
  return payment;
}

export async function attachInvoiceToPendingPayment(paymentId: string, invoiceId: string) {
  const payments = await readPendingPayments();
  if (!payments[paymentId]) return;
  payments[paymentId].invoiceId = invoiceId;
  await writePendingPayments(payments);
}

export async function markMoyasarInvoicePaid(invoiceId: string, paymentId?: string) {
  const payments = await readPendingPayments();
  const payment = paymentId ? payments[paymentId] : Object.values(payments).find((entry) => entry.invoiceId === invoiceId);
  if (!payment) return null;

  payment.status = "paid";
  payment.invoiceId = invoiceId;
  const orderId = await savePaidOrder(payment.order, invoiceId);
  payments[payment.id] = payment;
  await writePendingPayments(payments);
  return orderId;
}

export async function finalizePendingPayment(paymentId: string) {
  const payments = await readPendingPayments();
  const payment = payments[paymentId];
  if (!payment?.invoiceId) {
    return { status: "failed" as const, orderId: "" };
  }

  const invoice = await fetchMoyasarInvoice(payment.invoiceId);
  if (invoice?.status !== "paid") {
    return { status: "failed" as const, orderId: "" };
  }

  const orderId = await markMoyasarInvoicePaid(payment.invoiceId, paymentId);
  return { status: "paid" as const, orderId: orderId || "" };
}

async function readPendingPayments(): Promise<Record<string, PendingPayment>> {
  try {
    const raw = await fs.readFile(pendingPaymentsPath, "utf8");
    return JSON.parse(raw) as Record<string, PendingPayment>;
  } catch {
    return {};
  }
}

async function writePendingPayments(payments: Record<string, PendingPayment>) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(pendingPaymentsPath, JSON.stringify(payments, null, 2), "utf8");
}
