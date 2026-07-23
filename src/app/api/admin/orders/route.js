import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req) {
  await getSession(req);
  try {
    const result = await query("SELECT * FROM vw_order_details ORDER BY created_at DESC LIMIT 120");
    const countResult = await query("SELECT COUNT(*) AS total_orders FROM orders");
    return NextResponse.json({
      orders: result.rows,
      total_orders: Number(countResult.rows[0]?.total_orders || 0),
    });
  } catch (error) {
    return NextResponse.json({ error: "Unable to load orders." }, { status: 500 });
  }
}

export async function PATCH(req) {
  await getSession(req);
  try {
    const body = await req.json();
    const orderId = Number(body.orderId);
    const status = String(body.status || "").trim();
    if (!orderId || !status) {
      return NextResponse.json({ error: "Order id and status are required." }, { status: 400 });
    }

    await query("UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2", [status, orderId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Unable to update order." }, { status: 500 });
  }
}
