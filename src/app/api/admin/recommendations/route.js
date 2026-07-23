import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

async function safeCatalogQuery(primarySql) {
  try {
    const result = await query(primarySql);
    return result.rows;
  } catch (error) {
    const fallback = await query("SELECT * FROM vw_product_catalogue LIMIT 6");
    return fallback.rows;
  }
}

export async function GET(req) {
  await getSession(req);
  try {
    const trending = await safeCatalogQuery("SELECT * FROM vw_product_catalogue ORDER BY COALESCE(popularity, 0) DESC NULLS LAST LIMIT 6");
    const boughtTogether = await safeCatalogQuery("SELECT * FROM vw_product_catalogue ORDER BY COALESCE(wishlist_count, 0) DESC NULLS LAST LIMIT 6");
    const personalized = await safeCatalogQuery("SELECT * FROM vw_product_catalogue ORDER BY COALESCE(rating, 0) DESC NULLS LAST LIMIT 6");
    return NextResponse.json({ trending, boughtTogether, personalized });
  } catch (error) {
    console.error("Recommendations API error:", error);
    return NextResponse.json({ error: error.message || "Unable to load recommendation data." }, { status: 500 });
  }
}
