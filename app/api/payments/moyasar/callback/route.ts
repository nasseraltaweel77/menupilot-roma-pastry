import { NextResponse } from "next/server";
import { markMoyasarInvoicePaid } from "@/lib/local-payments";

type MoyasarCallback = {
  id?: string;
  status?: string;
  metadata?: {
    payment_id?: string;
  };
};

export async function POST(request: Request) {
  const body = await request.json() as MoyasarCallback;

  if (body.id && body.status === "paid") {
    await markMoyasarInvoicePaid(body.id, body.metadata?.payment_id);
  }

  return NextResponse.json({ ok: true });
}
