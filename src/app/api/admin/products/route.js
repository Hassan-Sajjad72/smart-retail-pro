import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req) {
  await getSession(req);
  try {
    const result = await query("SELECT * FROM products ORDER BY updated_at DESC NULLS LAST LIMIT 120");
    return NextResponse.json({ items: result.rows });
  } catch (error) {
    return NextResponse.json({ error: "Unable to load products." }, { status: 500 });
  }
}

export async function POST(req) {
  await getSession(req);
  const body = await req.json();
  const name = body.name?.trim();
  const description = body.description?.trim() || "";
  const category = body.category?.trim() || "Uncategorized";
  const brand = body.brand?.trim() || "Unknown";
  const price = Number(body.price || 0);
  const discountPrice = body.discount_price != null ? Number(body.discount_price) : null;
  const stockQty = Number(body.stock_qty || 0);
  const sku = body.sku?.trim() || `SKU-${Date.now()}`;

  if (!name || price <= 0) {
    return NextResponse.json({ error: "Product name and price are required." }, { status: 400 });
  }

  try {
    const result = await query(
      `INSERT INTO products (name, description, category, brand, price, discount_price, stock_qty, sku, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING *`,
      [name, description, category, brand, price, discountPrice, stockQty, sku]
    );
    return NextResponse.json({ item: result.rows[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Unable to create product." }, { status: 500 });
  }
}
