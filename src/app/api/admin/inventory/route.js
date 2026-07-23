import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req) {
  await getSession(req);
  try {
    const products = await query(
      `SELECT id, name, sku, stock_qty, category, 10 AS threshold, updated_at FROM products ORDER BY stock_qty ASC LIMIT 120`
    );
    const lowStock = await query(
      `SELECT COUNT(*) AS low_stock FROM products WHERE stock_qty <= 10`
    );
    return NextResponse.json({ items: products.rows, lowStock: lowStock.rows[0]?.low_stock ?? 0 });
  } catch (error) {
    return NextResponse.json({ error: "Unable to load inventory." }, { status: 500 });
  }
}

export async function POST(req) {
  await getSession(req);
  try {
    const body = await req.json();
    const productId = Number(body.productId);
    const quantity = Number(body.quantity || 0);
    if (!productId || quantity <= 0) {
      return NextResponse.json({ error: "Product id and quantity are required." }, { status: 400 });
    }

    await query("CALL sp_restock_product($1, $2)", [productId, quantity]);
    return NextResponse.json({ success: true, message: "Restock request sent." });
  } catch (error) {
    return NextResponse.json({ error: "Unable to restock product." }, { status: 500 });
  }
}
