import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req, { params }) {
  await getSession(req);
  const productId = Number(params.id);
  if (!productId) {
    return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
  }

  const result = await query("SELECT * FROM products WHERE id = $1 LIMIT 1", [productId]);
  if (!result.rowCount) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }
  return NextResponse.json({ item: result.rows[0] });
}

export async function PATCH(req, { params }) {
  await getSession(req);
  const productId = Number(params.id);
  const body = await req.json();
  if (!productId) {
    return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
  }

  const fields = ["name", "description", "category", "brand", "price", "discount_price", "stock_qty", "sku"];
  const updates = [];
  const values = [];
  let index = 1;

  for (const key of fields) {
    if (body[key] !== undefined) {
      updates.push(`${key} = $${index}`);
      values.push(body[key]);
      index += 1;
    }
  }

  if (!updates.length) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 });
  }

  values.push(productId);
  const sql = `UPDATE products SET ${updates.join(", ")}, updated_at = NOW() WHERE id = $${index} RETURNING *`;
  const result = await query(sql, values);
  return NextResponse.json({ item: result.rows[0] });
}

export async function DELETE(req, { params }) {
  await getSession(req);
  const productId = Number(params.id);
  if (!productId) {
    return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
  }

  await query("DELETE FROM products WHERE id = $1", [productId]);
  return NextResponse.json({ success: true });
}
