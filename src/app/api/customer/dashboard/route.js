import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

async function safeDashboardCatalogQuery(primarySql, fallbackSql = "SELECT * FROM vw_product_catalogue LIMIT 6") {
  try {
    const result = await query(primarySql);
    return result.rows;
  } catch (error) {
    const fallback = await query(fallbackSql);
    return fallback.rows;
  }
}

export async function GET(req) {
  try {
    const session = await getSession(req);
    const customerId = session.sub;

    const statsResult = await query(
      "SELECT COUNT(*) AS total_orders, COALESCE(SUM(total_amount), 0) AS total_spent FROM orders WHERE customer_id = $1",
      [customerId]
    );
    const wishlistResult = await query(
      "SELECT COUNT(*) AS wishlist_items FROM wishlist WHERE customer_id = $1",
      [customerId]
    );

    const recommendedResult = await safeDashboardCatalogQuery(
      "SELECT * FROM vw_product_catalogue ORDER BY COALESCE(rating, 0) DESC LIMIT 6"
    );
    const trendingResult = await safeDashboardCatalogQuery(
      "SELECT * FROM vw_product_catalogue ORDER BY COALESCE(popularity, 0) DESC NULLS LAST LIMIT 6"
    );
    const discountsResult = await safeDashboardCatalogQuery(
      "SELECT * FROM vw_product_catalogue ORDER BY COALESCE(popularity, 0) DESC NULLS LAST LIMIT 4",
      "SELECT * FROM vw_product_catalogue ORDER BY COALESCE(popularity, 0) DESC NULLS LAST LIMIT 4"
    );

    return NextResponse.json({
      stats: statsResult.rows[0] || { total_orders: 0, total_spent: 0 },
      wishlist: wishlistResult.rows[0] || { wishlist_items: 0 },
      recommended: recommendedResult.rows,
      trending: trendingResult.rows,
      discounts: discountsResult.rows,
    });
  } catch (error) {
    return NextResponse.json({ error: "Unable to load dashboard data." }, { status: 500 });
  }
}
