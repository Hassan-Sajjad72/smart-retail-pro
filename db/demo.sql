-- Smart Retail Pro ADBMS demonstration queries
-- Run these against the Smart database to prove features with actual DB data.
-- Admin: admin@smartretail.local / admin

-- ========================================
-- 1. AUTHENTICATION & USER MANAGEMENT
-- ========================================

-- Verify both users exist in the system
SELECT id, full_name, email, role FROM users ORDER BY id;

-- ========================================
-- 2. PRODUCT CATALOG & VIEWS
-- ========================================

-- View: Product Catalogue with computed metrics
SELECT product_id, name, category, brand, price, effective_price, stock_qty, popularity, rating FROM vw_product_catalogue ORDER BY popularity DESC LIMIT 10;

-- ========================================
-- 3. ORDERS & ORDER MANAGEMENT
-- ========================================

-- View: All orders placed by Ayesha
SELECT order_id, customer_id, status, total_amount, created_at FROM vw_order_details WHERE customer_id = (SELECT id FROM users WHERE email = 'tania@gmail.com') ORDER BY created_at DESC;

-- View: Detailed order items with product information
SELECT order_id, status, total_amount, items FROM vw_order_details LIMIT 3;

-- Raw orders table with partitioning
SELECT id, customer_id, status, total_amount FROM orders WHERE customer_id = (SELECT id FROM users WHERE email = 'saad.khan@example.com') ORDER BY created_at DESC;

-- ========================================
-- 4. WISHLIST & TRIGGERS
-- ========================================

-- Wishlist items for tania
SELECT w.customer_id, w.product_id, p.name, p.category FROM wishlist w JOIN products p ON p.id = w.product_id WHERE w.customer_id = (SELECT id FROM users WHERE email = 'tania@gmail.com');

-- Product wishlist_count updated by trigger
SELECT id, name, wishlist_count FROM products WHERE id IN (3, 5, 8) ORDER BY id;

-- ========================================
-- 5. REVIEWS & VALIDATION TRIGGERS
-- ========================================

-- Reviews submitted by ayesha
SELECT r.id, r.product_id, r.rating, r.comment, r.created_at FROM reviews r WHERE r.customer_id = (SELECT id FROM users WHERE email = 'ayesha@gmail.com') ORDER BY r.created_at DESC;

-- ========================================
-- 6. INVENTORY & TRIGGERS (STOCK REDUCTION)
-- ========================================

-- Stock quantities after orders (trigger-reduced automatically)
SELECT id, name, category, stock_qty FROM products WHERE id IN (1, 2, 3, 4, 5, 10) ORDER BY id;

-- Inventory history showing all stock changes
SELECT product_id, change_qty, reason, created_at FROM inventory_history WHERE product_id IN (1, 2, 3, 5) ORDER BY created_at DESC LIMIT 10;

-- ========================================
-- 7. LOW STOCK ALERTS (TRIGGER-BASED)
-- ========================================

-- View: Products with low stock
SELECT product_id, sku, name, stock_qty FROM vw_low_stock LIMIT 10;

-- ========================================
-- 8. STORED PROCEDURES - PLACE ORDER
-- ========================================

-- Show current order count before placing new order
SELECT COUNT(*) AS order_count FROM orders WHERE customer_id = (SELECT id FROM users WHERE email = 'tania@gmail.com');

-- Place new order via stored procedure (OLTP transaction)
CALL sp_place_order(
  (SELECT id FROM users WHERE email = 'tania@gmail.com'),
  '{"address":"742 Evergreen Terrace","city":"Springfield","zip":"12345"}'::jsonb,
  'card',
  '[{"productId":6,"quantity":1},{"productId":7,"quantity":1}]'::jsonb
);

-- Verify new order was created
SELECT id, status, total_amount FROM orders WHERE customer_id = (SELECT id FROM users WHERE email = 'tania@gmail.com') ORDER BY created_at DESC LIMIT 1;

-- ========================================
-- 9. STORED PROCEDURES - RESTOCK
-- ========================================

-- Restock a product
CALL sp_restock_product(1, 50);

-- Verify stock increased
SELECT id, name, stock_qty FROM products WHERE id = 1;

-- Check inventory history for restock
SELECT product_id, change_qty, reason FROM inventory_history WHERE product_id = 1 AND reason = 'restock' ORDER BY created_at DESC LIMIT 1;

-- ========================================
-- 10. VIEWS - CUSTOMER SUMMARY
-- ========================================

-- View: Customer aggregated data (orders, spend, wishlist, reviews)
SELECT customer_id, full_name, order_count, total_spent, avg_order_value, wishlist_items, reviews_submitted, customer_rank FROM vw_customer_summary ORDER BY customer_rank ASC LIMIT 10;

-- ========================================
-- 11. WINDOW FUNCTIONS - CUSTOMER RANKING
-- ========================================

-- Rank customers by total spending (window function)
SELECT customer_id, full_name, total_spent,
  ROW_NUMBER() OVER (ORDER BY total_spent DESC) AS row_num,
  RANK() OVER (ORDER BY total_spent DESC) AS rank,
  DENSE_RANK() OVER (ORDER BY total_spent DESC) AS dense_rank
FROM (
  SELECT u.id AS customer_id, u.full_name, COALESCE(SUM(o.total_amount), 0) AS total_spent
  FROM users u LEFT JOIN orders o ON o.customer_id = u.id
  WHERE u.role = 'CUSTOMER'
  GROUP BY u.id, u.full_name
) t
ORDER BY rank ASC;

-- ========================================
-- 12. MATERIALIZED VIEW - TOP PRODUCTS
-- ========================================

-- Refresh and view top products (precomputed analytics)
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_products;
SELECT * FROM mv_top_products ORDER BY total_revenue DESC LIMIT 10;

-- ========================================
-- 13. MATERIALIZED VIEW - CUSTOMER ENGAGEMENT
-- ========================================

-- Customer engagement metrics
SELECT * FROM mv_customer_engagement WHERE customer_id = (SELECT id FROM users WHERE email = 'tania@gmail.com');

-- ========================================
-- 14. RECOMMENDATION SYSTEM
-- ========================================

-- Get personalized product recommendations using function
SELECT product_id, name, category, brand, effective_price, recommendation_score FROM fn_recommend_for_customer((SELECT id FROM users WHERE email = 'ayesha@gmail.com')) LIMIT 8;

-- ========================================
-- 15. PARTITIONING - DATE-BASED QUERIES
-- ========================================

-- Query orders from 2025 partition
SELECT id, customer_id, status, total_amount FROM orders WHERE created_at >= '2025-01-01' AND created_at < '2026-01-01' LIMIT 20;

-- Query from default partition
SELECT id, customer_id, status FROM orders WHERE created_at >= '2026-01-01' LIMIT 5;

-- ========================================
-- 16. INDEXING & QUERY OPTIMIZATION
-- ========================================

-- EXPLAIN ANALYZE: Customer orders lookup with index
EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = (SELECT id FROM users WHERE email = 'ayesha@gmail.com');

-- Full-text search on products (GIN index)
SELECT id, name FROM products WHERE to_tsvector('english', name || ' ' || description) @@ to_tsquery('english', 'smartwatch | headphones') LIMIT 10;

-- Trigram search using GIN index
SELECT id, name FROM products WHERE name % 'smart' LIMIT 10;

-- ========================================
-- 17. SALES REPORTS & AGGREGATIONS (OLAP)
-- ========================================

-- Generated sales reports
SELECT * FROM sales_reports ORDER BY report_date DESC LIMIT 5;

-- Revenue trend by category
SELECT category, SUM(COALESCE(price, 0) * 1) AS potential_revenue, COUNT(*) AS product_count
FROM products
GROUP BY category
ORDER BY potential_revenue DESC;

-- ========================================
-- 18. TRANSACTION ATOMICITY (OLTP)
-- ========================================

-- Verify order integrity: orders, order_items, and products are all consistent
SELECT o.id, COUNT(oi.id) AS item_count, SUM(oi.line_total) AS calculated_total, o.total_amount
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id
HAVING SUM(oi.line_total) = o.total_amount
LIMIT 10;

-- ========================================
-- 19. ADVANCED ANALYTICS
-- ========================================

-- Product performance (units sold, revenue, avg rating)
SELECT p.id, p.name, COUNT(DISTINCT oi.order_id) AS orders, SUM(oi.quantity) AS units_sold, 
  SUM(oi.line_total) AS revenue, ROUND(AVG(p.rating), 2) AS avg_rating
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
GROUP BY p.id, p.name
ORDER BY revenue DESC LIMIT 10;

-- Customer order frequency and value
SELECT u.id, u.full_name, COUNT(o.id) AS total_orders, SUM(o.total_amount) AS lifetime_value,
  AVG(o.total_amount) AS avg_order_value, MAX(o.created_at) AS last_order_date
FROM users u
LEFT JOIN orders o ON o.customer_id = u.id
WHERE u.role = 'CUSTOMER'
GROUP BY u.id, u.full_name
ORDER BY lifetime_value DESC;
