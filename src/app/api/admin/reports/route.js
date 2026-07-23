import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

async function loadReportData() {
  const reportResult = await query("SELECT * FROM sales_reports ORDER BY report_date DESC LIMIT 12");
  const reportData = reportResult.rows;
  const latest = reportData[0] || {};

  const revenueTrendResult = await query(`
    SELECT to_char(created_at, 'Mon') AS month,
           SUM(total_amount) AS value,
           COUNT(*) AS orders
    FROM orders
    WHERE created_at >= date_trunc('month', current_date) - interval '5 months'
    GROUP BY 1
    ORDER BY min(created_at)
  `);
  const revenueTrendRows = revenueTrendResult.rows.map((row) => ({
    month: row.month,
    value: Number(row.value || 0),
  }));
  const maxTrend = revenueTrendRows.reduce((max, item) => Math.max(max, item.value), 0) || 1;
  const revenueTrend = revenueTrendRows.map((item) => ({
    ...item,
    percent: Math.round((item.value / maxTrend) * 100),
  }));

  const topProductsResult = await query(`
    SELECT p.name,
           p.category,
           SUM(oi.quantity) AS units_sold,
           SUM(oi.unit_price * oi.quantity) AS revenue
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    JOIN orders o ON o.id = oi.order_id
    WHERE o.status <> 'CANCELLED'
    GROUP BY p.name, p.category
    ORDER BY revenue DESC
    LIMIT 5
  `);

  const categoryBreakdownResult = await query(`
    SELECT p.category,
           SUM(oi.unit_price * oi.quantity) AS revenue
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    JOIN orders o ON o.id = oi.order_id
    WHERE o.status <> 'CANCELLED'
    GROUP BY p.category
    ORDER BY revenue DESC
    LIMIT 5
  `);
  return {
    reports: reportData,
    revenue_trend: revenueTrend,
    top_products: topProductsResult.rows,
    category_breakdown: categoryBreakdownResult.rows,
    total_revenue: Number(latest.total_revenue || latest.revenue || 0),
    average_order_value: Number(latest.avg_order_value || latest.average_order_value || 0),
    gross_profit_margin: Number(latest.gross_profit_margin || latest.profit_margin || 0),
    customer_growth: Number(latest.customer_growth || 0),
  };
}

export async function GET(req) {
  await getSession(req);

  try {
    return NextResponse.json(await loadReportData());
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to load reports." }, { status: 500 });
  }
}

export async function POST(req) {
  await getSession(req);
  try {
    await query("CALL sp_generate_report()");
    return NextResponse.json(await loadReportData());
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to generate report." }, { status: 500 });
  }
}
