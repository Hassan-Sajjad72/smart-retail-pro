import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req) {
  await getSession(req);
  try {
    const views = await query(
      "SELECT table_name FROM information_schema.views WHERE table_schema = 'public' AND table_name IN ('vw_product_catalogue','vw_order_details','vw_customer_summary','vw_low_stock')"
    );
    const procedures = await query(
      "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name IN ('sp_place_order','sp_restock_product','sp_cancel_order','sp_generate_report')"
    );
    const triggers = await query(
      "SELECT tgname AS trigger_name, tgrelid::regclass::text AS table_name FROM pg_trigger WHERE NOT tgisinternal AND tgname IN ('trg_increase_stock','trg_low_stock_alert','trg_validate_review')"
    );
    const explain = await query("EXPLAIN ANALYZE SELECT * FROM orders LIMIT 5");
    const rankings = await query(
      `SELECT customer_id, COALESCE(total_spent, 0) AS total_spent,
        RANK() OVER (ORDER BY COALESCE(total_spent,0) DESC) AS customer_rank
       FROM vw_customer_summary LIMIT 10`
    );
    return NextResponse.json({
      views: views.rows,
      procedures: procedures.rows,
      triggers: triggers.rows,
      explain: explain.rows,
      rankings: rankings.rows,
    });
  } catch (error) {
    return NextResponse.json({ error: "Unable to load ADBMS insights." }, { status: 500 });
  }
}
