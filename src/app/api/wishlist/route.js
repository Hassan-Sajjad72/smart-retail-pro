import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req) {
  try {
    const session = await getSession(req);
    const customerId = session.sub;
    const result = await query(
      `SELECT p.* FROM wishlist w JOIN vw_product_catalogue p ON p.product_id = w.product_id WHERE w.customer_id = $1 ORDER BY w.created_at DESC`,
      [customerId]
    );
    return NextResponse.json({ items: result.rows });
  } catch (error) {
    return NextResponse.json({ error: "Unable to load wishlist." }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getSession(req);
    const customerId = session.sub;
    const body = await req.json();
    const productId = Number(body.productId);
    if (!productId) {
      return NextResponse.json({ error: "Product id is required." }, { status: 400 });
    }
    await query(
      `INSERT INTO wishlist (customer_id, product_id, created_at) VALUES ($1, $2, NOW()) ON CONFLICT DO NOTHING`,
      [customerId, productId]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Unable to add wishlist item." }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getSession(req);
    const customerId = session.sub;
    const productId = Number(req.nextUrl.searchParams.get("productId"));
    if (!productId) {
      return NextResponse.json({ error: "Product id is required." }, { status: 400 });
    }
    await query("DELETE FROM wishlist WHERE customer_id = $1 AND product_id = $2", [customerId, productId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Unable to remove wishlist item." }, { status: 500 });
  }
}
