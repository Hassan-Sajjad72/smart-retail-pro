import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req) {
  try {
    const session = await getSession(req);
    const customerId = session.sub;
    const result = await query(
      `SELECT * FROM vw_order_details WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 40`,
      [customerId]
    );
    return NextResponse.json({ orders: result.rows });
  } catch (error) {
    return NextResponse.json({ error: "Unable to retrieve orders." }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getSession(req);
    const customerId = session.sub;
    const body = await req.json();
    const items = Array.isArray(body.items) ? body.items : [];
    const shipping = body.shipping || {};
    const paymentMethod = body.paymentMethod || "card";

    if (!items.length) {
      return NextResponse.json({ error: "Order items are required." }, { status: 400 });
    }

    await query("CALL sp_place_order($1, $2, $3, $4)", [customerId, JSON.stringify(shipping), paymentMethod, JSON.stringify(items)]);
    return NextResponse.json({ success: true, message: "Order placed successfully." }, { status: 201 });
  } catch (error) {
    console.error("Order placement error:", error);
    return NextResponse.json({ error: error.message || "Unable to place order." }, { status: 500 });
  }
}
