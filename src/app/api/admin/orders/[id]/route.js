import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req, { params }) {
  await getSession(req);
  const orderId = Number(params.id);
  if (!orderId) {
    return NextResponse.json({ error: "Invalid order id." }, { status: 400 });
  }

  const detail = await query("SELECT * FROM vw_order_details WHERE order_id = $1 OR id = $1 LIMIT 1", [orderId]);
  if (!detail.rowCount) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  return NextResponse.json({ order: detail.rows[0] });
}

export async function DELETE(req, { params }) {
  await getSession(req);
  const orderId = Number(params.id);
  if (!orderId) {
    return NextResponse.json({ error: "Invalid order id." }, { status: 400 });
  }

  await query("CALL sp_cancel_order($1)", [orderId]);
  return NextResponse.json({ success: true, message: "Order cancellation requested." });
}
