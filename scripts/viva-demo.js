const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const env = process.env;
const pool = new Pool({
  host: env.DB_HOST || 'localhost',
  port: Number(env.DB_PORT || 5432),
  database: env.DB_NAME || 'Smart',
  user: env.DB_USER || 'postgres',
  password: env.DB_PASSWORD || 'admin123',
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const vivaQueries = [
  {
    title: '1️⃣  USERS & AUTHENTICATION',
    query: "SELECT id, full_name, email, role FROM users ORDER BY id;",
    explanation: 'Admin and Saad Khan customer accounts are persisted in DB.'
  },
  {
    title: '2️⃣  VIEWS - Product Catalogue',
    query: "SELECT product_id, name, category, price, effective_price, stock_qty, popularity, rating FROM vw_product_catalogue LIMIT 5;",
    explanation: 'View combines product data with computed metrics (effective_price, recommendation_score).'
  },
  {
    title: '3️⃣  ORDERS - Via View',
    query: "SELECT order_id, customer_id, status, total_amount FROM vw_order_details LIMIT 3;",
    explanation: 'View joins orders, order_items, and products into single result.'
  },
  {
    title: '4️⃣  WISHLIST - With Triggers',
    query: "SELECT w.customer_id, p.name, p.wishlist_count FROM wishlist w JOIN products p ON p.id = w.product_id WHERE w.customer_id = 2;",
    explanation: 'Wishlist_count is automatically updated by trigger when items are added/removed.'
  },
  {
    title: '5️⃣  REVIEWS - With Validation Trigger',
    query: "SELECT id, product_id, rating, comment FROM reviews WHERE customer_id = 2 LIMIT 3;",
    explanation: 'Review insert fails if rating not 1-5 or comment < 5 chars (trigger validation).'
  },
  {
    title: '6️⃣  TRIGGERS - Stock Reduction on Order',
    query: "SELECT id, name, stock_qty FROM products WHERE id IN (1, 2, 3, 4, 5) ORDER BY id;",
    explanation: 'Stock quantities reduced automatically by trigger when orders placed.'
  },
  {
    title: '7️⃣  INVENTORY HISTORY - Audit Trail',
    query: "SELECT product_id, change_qty, reason, created_at FROM inventory_history ORDER BY created_at DESC LIMIT 5;",
    explanation: 'Triggers log all stock changes for audit trail and analytics.'
  },
  {
    title: '8️⃣  LOW STOCK VIEW - Alert System',
    query: "SELECT product_id, sku, name, stock_qty FROM vw_low_stock LIMIT 5;",
    explanation: 'View filters products with stock <= 10 for alert generation.'
  },
  {
    title: '9️⃣  STORED PROCEDURE - Place Order (OLTP)',
    query: "SELECT id, status, total_amount FROM orders WHERE customer_id = 2 ORDER BY created_at DESC LIMIT 1;",
    explanation: 'sp_place_order is atomic transaction: updates products, creates order, adds items.'
  },
  {
    title: '🔟 WINDOW FUNCTION - Customer Ranking',
    query: `SELECT u.id, u.full_name, COALESCE(SUM(o.total_amount), 0) AS spent,
  RANK() OVER (ORDER BY COALESCE(SUM(o.total_amount), 0) DESC) AS rank
FROM users u LEFT JOIN orders o ON o.customer_id = u.id
WHERE u.role = 'CUSTOMER' GROUP BY u.id, u.full_name;`,
    explanation: 'RANK() window function assigns rank without needing separate sorting.'
  },
  {
    title: '1️⃣1️⃣ MATERIALIZED VIEW - Top Products',
    query: "SELECT product_id, name, total_units_sold, total_revenue FROM mv_top_products ORDER BY total_revenue DESC LIMIT 5;",
    explanation: 'Precomputed view for OLAP-style analytics. Refreshed by triggers.'
  },
  {
    title: '1️⃣2️⃣ CUSTOMER SUMMARY VIEW',
    query: "SELECT customer_id, full_name, order_count, total_spent, customer_rank FROM vw_customer_summary ORDER BY customer_rank ASC;",
    explanation: 'Complex view joining 4 tables with aggregation and window function.'
  },
  {
    title: '1️⃣3️⃣ RECOMMENDATION FUNCTION',
    query: "SELECT product_id, name, recommendation_score FROM fn_recommend_for_customer(2) LIMIT 5;",
    explanation: 'User-defined function calculates personalized recommendations.'
  },
  {
    title: '1️⃣4️⃣ PARTITIONING - Date Range Query',
    query: "SELECT id, customer_id, status FROM orders WHERE created_at >= '2025-01-01' AND created_at < '2026-01-01' LIMIT 5;",
    explanation: 'Orders partitioned by date range for performance on large tables.'
  },
  {
    title: '1️⃣5️⃣ INDEXING - EXPLAIN ANALYZE',
    query: "EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 2;",
    explanation: 'Index on (customer_id) makes lookup fast: Index Scan instead of Seq Scan.'
  },
  {
    title: '1️⃣6️⃣ FULL-TEXT SEARCH - GIN Index',
    query: "SELECT id, name FROM products WHERE to_tsvector('english', name || ' ' || description) @@ to_tsquery('english', 'smartwatch') LIMIT 5;",
    explanation: 'GIN index on tsvector enables full-text search for product discovery.'
  },
  {
    title: '1️⃣7️⃣ SALES REPORTS - OLAP Analytics',
    query: "SELECT report_date, total_revenue, avg_order_value, gross_profit_margin FROM sales_reports ORDER BY report_date DESC LIMIT 3;",
    explanation: 'Precomputed analytics table populated by sp_generate_report stored procedure.'
  }
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('\n🎓 SMART RETAIL PRO - ADBMS VIVA DEMONSTRATION\n');
    console.log('Admin: admin@smartretail.local / admin');
    console.log('Demo Customer: Saad Khan (saad.khan@example.com)\n');
    console.log('=' .repeat(100) + '\n');

    for (const item of vivaQueries) {
      console.log(`\n${item.title}`);
      console.log('-'.repeat(80));
      console.log(`📝 Query: ${item.query.substring(0, 80)}...`);
      console.log(`💡 ${item.explanation}\n`);

      try {
        const result = await client.query(item.query);
        if (result.rows && result.rows.length > 0) {
          console.log('✅ Result:');
          console.log(JSON.stringify(result.rows.slice(0, 5), null, 2));
          if (result.rows.length > 5) {
            console.log(`   ... and ${result.rows.length - 5} more rows`);
          }
        } else {
          console.log('✅ Query executed (no results)');
        }
      } catch (err) {
        console.log(`⚠️  Query failed: ${err.message}`);
      }
    }

    console.log('\n' + '='.repeat(100));
    console.log('\n✨ VIVA DEMONSTRATION COMPLETE\n');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((error) => {
  console.error('Error:', error.message || error);
  process.exit(1);
});
