import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req) {
  const session = await getSession(req);
  try {
    const result = await query(
      `SELECT r.id,
              r.rating,
              r.comment,
              r.product_id,
              r.order_id,
              r.created_at,
              COALESCE(p.name, '') AS product_name
       FROM reviews r
       LEFT JOIN products p ON p.id = r.product_id
       WHERE r.customer_id = $1
       ORDER BY r.created_at DESC`,
      [session.sub],
    );

    return NextResponse.json({ reviews: result.rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to load reviews." }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await getSession(req);
  try {
    const body = await req.json();
    const productId = Number(body.productId || body.product_id);
    const rating = Number(body.rating);
    const comment = String(body.comment || "").trim();
    const orderId = body.orderId ? Number(body.orderId) : null;

    if (!productId || !rating || !comment) {
      return NextResponse.json({ error: "productId, rating and comment are required." }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO reviews (customer_id, order_id, product_id, rating, comment, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, rating, comment, product_id, order_id, created_at`,
      [session.sub, orderId, productId, rating, comment],
    );

    return NextResponse.json({ review: result.rows[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to submit review." }, { status: 500 });
  }
}
