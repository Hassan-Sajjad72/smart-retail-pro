-- Smart Retail Pro PostgreSQL schema, procedures, triggers, views, materialized views, and seed data.
-- Run this file against the Smart database after creating the database.

BEGIN;

-- Remove existing objects from previous setup runs so the schema can be recreated cleanly.
DROP MATERIALIZED VIEW IF EXISTS mv_customer_engagement;
DROP MATERIALIZED VIEW IF EXISTS mv_top_products;
DROP VIEW IF EXISTS vw_low_stock CASCADE;
DROP VIEW IF EXISTS vw_customer_summary CASCADE;
DROP VIEW IF EXISTS vw_order_details CASCADE;
DROP VIEW IF EXISTS vw_product_catalogue CASCADE;
DROP FUNCTION IF EXISTS fn_recommend_for_customer(INT) CASCADE;
DROP PROCEDURE IF EXISTS sp_generate_report() CASCADE;
DROP PROCEDURE IF EXISTS sp_cancel_order(BIGINT) CASCADE;
DROP PROCEDURE IF EXISTS sp_restock_product(INT, INT) CASCADE;
DROP PROCEDURE IF EXISTS sp_place_order(INT, JSONB, TEXT, JSONB) CASCADE;
DROP TRIGGER IF EXISTS trg_validate_review ON reviews;
DROP TRIGGER IF EXISTS trg_low_stock_alert ON products;
DROP TRIGGER IF EXISTS trg_wishlist_metrics ON wishlist;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS wishlist CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS inventory_history CASCADE;
DROP TABLE IF EXISTS sales_reports CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;

-- Extensions for advanced PostgreSQL features.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Custom enum types.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM ('PENDING', 'PROCESSING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED');
  END IF;
END$$;

-- Core tables.
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER','ADMIN')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  discount_price NUMERIC(12,2),
  effective_price NUMERIC(12,2) GENERATED ALWAYS AS (COALESCE(discount_price, price)) STORED,
  stock_qty INT NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  popularity INT NOT NULL DEFAULT 0 CHECK (popularity >= 0),
  rating NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  wishlist_count INT NOT NULL DEFAULT 0 CHECK (wishlist_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Drop any existing orders table or dependent order_items table so the partitioned schema can be created cleanly.
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;

CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL NOT NULL,
  customer_id INT NOT NULL REFERENCES users(id),
  status order_status NOT NULL DEFAULT 'PENDING',
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  shipping_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  payment_method TEXT NOT NULL DEFAULT 'card',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE IF NOT EXISTS orders_2025 PARTITION OF orders
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE TABLE IF NOT EXISTS orders_default PARTITION OF orders DEFAULT;

CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL,
  order_created_at TIMESTAMPTZ NOT NULL,
  product_id INT NOT NULL REFERENCES products(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
  line_total NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  FOREIGN KEY (order_id, order_created_at) REFERENCES orders(id, created_at) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wishlist (
  customer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (customer_id, product_id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id BIGINT,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_history (
  id BIGSERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  change_qty INT NOT NULL,
  reason TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales_reports (
  id BIGSERIAL PRIMARY KEY,
  report_date DATE NOT NULL,
  total_revenue NUMERIC(14,2) NOT NULL,
  avg_order_value NUMERIC(14,2) NOT NULL,
  gross_profit_margin NUMERIC(5,2) NOT NULL,
  customer_growth NUMERIC(5,2) NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger functions.
CREATE OR REPLACE FUNCTION fn_validate_review() RETURNS trigger AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'rating must be between 1 and 5';
  END IF;
  IF NEW.comment IS NULL OR LENGTH(TRIM(NEW.comment)) < 5 THEN
    RAISE EXCEPTION 'review comments must be at least 5 characters';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_low_stock_alert() RETURNS trigger AS $$
BEGIN
  IF NEW.stock_qty <= 10 AND (OLD.stock_qty IS NULL OR OLD.stock_qty > 10) THEN
    INSERT INTO inventory_history(product_id, change_qty, reason, metadata, created_at)
    VALUES (NEW.id, 0, 'low_stock_alert', jsonb_build_object('stock_qty', NEW.stock_qty), NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_update_wishlist_metrics() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE products SET wishlist_count = COALESCE(wishlist_count, 0) + 1 WHERE id = NEW.product_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE products SET wishlist_count = GREATEST(COALESCE(wishlist_count, 0) - 1, 0) WHERE id = OLD.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers.
DROP TRIGGER IF EXISTS trg_validate_review ON reviews;
CREATE TRIGGER trg_validate_review
  BEFORE INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION fn_validate_review();

DROP TRIGGER IF EXISTS trg_low_stock_alert ON products;
CREATE TRIGGER trg_low_stock_alert
  AFTER INSERT OR UPDATE OF stock_qty ON products
  FOR EACH ROW EXECUTE FUNCTION fn_low_stock_alert();

DROP TRIGGER IF EXISTS trg_wishlist_metrics ON wishlist;
CREATE TRIGGER trg_wishlist_metrics
  AFTER INSERT OR DELETE ON wishlist
  FOR EACH ROW EXECUTE FUNCTION fn_update_wishlist_metrics();

-- Stored procedures.
CREATE OR REPLACE PROCEDURE sp_place_order(
  p_customer_id INT,
  p_shipping JSONB,
  p_payment_method TEXT,
  p_items JSONB
)
LANGUAGE plpgsql
AS $$
DECLARE
  new_order_id BIGINT;
  new_order_created_at TIMESTAMPTZ;
  item_record RECORD;
  item_price NUMERIC(12,2);
  item_discount NUMERIC(12,2);
  unit_price NUMERIC(12,2);
  order_total NUMERIC(14,2) := 0;
BEGIN
  IF p_customer_id IS NULL THEN
    RAISE EXCEPTION 'customer_id is required';
  END IF;
  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'items must be a non-empty json array';
  END IF;

  INSERT INTO orders (customer_id, status, shipping_details, payment_method, total_amount, created_at, updated_at)
  VALUES (p_customer_id, 'PENDING', p_shipping, p_payment_method, 0, NOW(), NOW())
  RETURNING id, created_at INTO new_order_id, new_order_created_at;

  FOR item_record IN
    SELECT
      (item ->> 'productId')::INT AS product_id,
      (item ->> 'quantity')::INT AS quantity
    FROM jsonb_array_elements(p_items) AS item
  LOOP
    IF item_record.product_id IS NULL OR item_record.quantity IS NULL OR item_record.quantity <= 0 THEN
      RAISE EXCEPTION 'each order item must include productId and positive quantity';
    END IF;

    UPDATE products
    SET stock_qty = stock_qty - item_record.quantity,
        popularity = COALESCE(popularity, 0) + GREATEST(item_record.quantity, 1),
        updated_at = NOW()
    WHERE id = item_record.product_id AND stock_qty >= item_record.quantity
    RETURNING price, discount_price INTO item_price, item_discount;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'product % is unavailable or out of stock', item_record.product_id;
    END IF;

    unit_price := COALESCE(item_discount, item_price, 0);
    INSERT INTO order_items (order_id, order_created_at, product_id, quantity, unit_price)
    VALUES (new_order_id, new_order_created_at, item_record.product_id, item_record.quantity, unit_price);

    INSERT INTO inventory_history(product_id, change_qty, reason, metadata, created_at)
    VALUES (item_record.product_id, -item_record.quantity, 'sale', jsonb_build_object('order_id', new_order_id), NOW());

    order_total := order_total + unit_price * item_record.quantity;
  END LOOP;

  UPDATE orders SET total_amount = order_total, updated_at = NOW() WHERE id = new_order_id;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_restock_product(
  p_product_id INT,
  p_quantity INT
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_product_id IS NULL OR p_quantity <= 0 THEN
    RAISE EXCEPTION 'product_id and positive quantity are required';
  END IF;

  UPDATE products
  SET stock_qty = stock_qty + p_quantity,
      updated_at = NOW()
  WHERE id = p_product_id;

  INSERT INTO inventory_history(product_id, change_qty, reason, metadata, created_at)
  VALUES (p_product_id, p_quantity, 'restock', '{}'::jsonb, NOW());
END;
$$;

CREATE OR REPLACE PROCEDURE sp_cancel_order(
  p_order_id BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
  item_row RECORD;
BEGIN
  UPDATE orders
  SET status = 'CANCELLED', updated_at = NOW()
  WHERE id = p_order_id AND status NOT IN ('CANCELLED', 'DELIVERED');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % cannot be cancelled or does not exist', p_order_id;
  END IF;

  FOR item_row IN SELECT product_id, quantity FROM order_items WHERE order_id = p_order_id LOOP
    UPDATE products
    SET stock_qty = stock_qty + item_row.quantity,
        updated_at = NOW()
    WHERE id = item_row.product_id;

    INSERT INTO inventory_history(product_id, change_qty, reason, metadata, created_at)
    VALUES (item_row.product_id, item_row.quantity, 'cancelled_order', jsonb_build_object('order_id', p_order_id), NOW());
  END LOOP;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_generate_report()
LANGUAGE plpgsql
AS $$
DECLARE
  total_revenue NUMERIC(14,2);
  avg_order_value NUMERIC(14,2);
  gross_profit_margin NUMERIC(5,2);
  customer_growth NUMERIC(5,2);
BEGIN
  SELECT COALESCE(SUM(total_amount), 0), COALESCE(AVG(total_amount), 0)
  INTO total_revenue, avg_order_value
  FROM orders
  WHERE status <> 'CANCELLED';

  SELECT COALESCE(100.0 * SUM((COALESCE(p.price, 0) - COALESCE(p.discount_price, p.price)) * oi.quantity) / NULLIF(SUM(o.total_amount), 0), 0)
  INTO gross_profit_margin
  FROM order_items oi
  JOIN products p ON p.id = oi.product_id
  JOIN orders o ON o.id = oi.order_id
  WHERE o.status <> 'CANCELLED';

  SELECT CASE WHEN COUNT(*) = 0 THEN 0 ELSE 100.0 * SUM(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) / COUNT(*) END
  INTO customer_growth
  FROM orders;

  INSERT INTO sales_reports(report_date, total_revenue, avg_order_value, gross_profit_margin, customer_growth, generated_at)
  VALUES (CURRENT_DATE, total_revenue, avg_order_value, gross_profit_margin, customer_growth, NOW());

  IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_top_products') THEN
    EXECUTE 'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_products';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION fn_recommend_for_customer(p_customer_id INT)
RETURNS TABLE (
  product_id INT,
  name TEXT,
  category TEXT,
  brand TEXT,
  effective_price NUMERIC,
  recommendation_score NUMERIC
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.category,
    p.brand,
    p.effective_price,
    ROUND((COALESCE(p.rating, 0) * 2 + COALESCE(p.popularity, 0) / 10 + COALESCE(p.wishlist_count, 0) / 5)::NUMERIC, 2)
  FROM products p
  WHERE p.id NOT IN (
    SELECT oi.product_id
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.customer_id = p_customer_id
  )
  ORDER BY recommendation_score DESC NULLS LAST, p.popularity DESC NULLS LAST
  LIMIT 8;
END;
$$;

-- Views and materialized views.
CREATE OR REPLACE VIEW vw_product_catalogue AS
SELECT
  p.id AS product_id,
  p.name,
  p.description,
  p.category,
  p.brand,
  p.sku,
  p.price,
  p.discount_price,
  p.effective_price,
  p.stock_qty,
  p.popularity,
  p.rating,
  p.wishlist_count,
  p.created_at,
  p.updated_at,
  (p.stock_qty <= 10) AS is_low_stock,
  ROUND((COALESCE(p.rating, 0) * 2 + COALESCE(p.popularity, 0) / 10 + COALESCE(p.wishlist_count, 0) / 5)::NUMERIC, 2) AS recommendation_score
FROM products p;

CREATE OR REPLACE VIEW vw_order_details AS
SELECT
  o.id AS order_id,
  o.customer_id,
  o.status,
  o.total_amount,
  o.currency,
  o.shipping_details,
  o.payment_method,
  o.created_at,
  o.updated_at,
  jsonb_agg(jsonb_build_object(
    'product_id', oi.product_id,
    'name', p.name,
    'category', p.category,
    'quantity', oi.quantity,
    'unit_price', oi.unit_price,
    'line_total', oi.line_total
  ) ORDER BY oi.id) AS items,
  string_agg(p.name, ', ' ORDER BY oi.id) AS product_names
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN products p ON p.id = oi.product_id
GROUP BY o.id, o.customer_id, o.status, o.total_amount, o.currency, o.shipping_details, o.payment_method, o.created_at, o.updated_at;

CREATE OR REPLACE VIEW vw_customer_summary AS
SELECT
  u.id AS customer_id,
  u.full_name,
  u.email,
  u.created_at AS member_since,
  CASE WHEN COUNT(DISTINCT o.id) = 0 THEN 'New' ELSE 'Active' END AS status,
  COUNT(DISTINCT o.id) AS order_count,
  COALESCE(SUM(o.total_amount), 0) AS total_spent,
  COALESCE(AVG(o.total_amount), 0) AS avg_order_value,
  COUNT(DISTINCT w.product_id) AS wishlist_items,
  COUNT(DISTINCT r.id) AS reviews_submitted,
  RANK() OVER (ORDER BY COALESCE(SUM(o.total_amount), 0) DESC) AS customer_rank
FROM users u
LEFT JOIN orders o ON o.customer_id = u.id
LEFT JOIN wishlist w ON w.customer_id = u.id
LEFT JOIN reviews r ON r.customer_id = u.id
WHERE u.role = 'CUSTOMER'
GROUP BY u.id, u.full_name, u.email, u.created_at;

CREATE OR REPLACE VIEW vw_low_stock AS
SELECT
  id AS product_id,
  sku,
  name,
  category,
  stock_qty,
  updated_at
FROM products
WHERE stock_qty <= 10
ORDER BY stock_qty ASC;

CREATE MATERIALIZED VIEW mv_top_products AS
SELECT
  p.id AS product_id,
  p.name,
  p.category,
  SUM(oi.quantity) AS total_units_sold,
  SUM(oi.line_total) AS total_revenue,
  COUNT(DISTINCT o.customer_id) AS unique_buyers
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
WHERE o.status <> 'CANCELLED'
GROUP BY p.id, p.name, p.category
ORDER BY total_revenue DESC
LIMIT 50;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_top_products_product_id ON mv_top_products(product_id);

CREATE MATERIALIZED VIEW mv_customer_engagement AS
SELECT
  u.id AS customer_id,
  u.full_name,
  COALESCE(SUM(o.total_amount), 0) AS total_spent,
  COUNT(DISTINCT w.product_id) AS wishlist_size,
  COUNT(DISTINCT r.id) AS review_count,
  MAX(o.created_at) AS last_order_at
FROM users u
LEFT JOIN orders o ON o.customer_id = u.id
LEFT JOIN wishlist w ON w.customer_id = u.id
LEFT JOIN reviews r ON r.customer_id = u.id
WHERE u.role = 'CUSTOMER'
GROUP BY u.id, u.full_name;

-- Indexes for query performance and search.
CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_products_category_brand ON products(category, brand);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_low_stock ON products(stock_qty) WHERE stock_qty <= 10;
CREATE INDEX IF NOT EXISTS idx_products_popularity ON products(popularity DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_customer_product ON wishlist(customer_id, product_id);
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_products_trgm_name ON products USING gin(name gin_trgm_ops);

-- Seed data for users, products, orders, wishlist, reviews, and reports.
INSERT INTO users (email, password_hash, full_name, role, created_at)
VALUES
  ('admin@smartretail.local', '$2a$10$AozDvgiM18bWifnI.ZKF.OFn2U4YSFmIfcQnyPIq5Ufajx7M7P5O.', 'System Admin', 'ADMIN', NOW() - INTERVAL '40 days'),
  ('saad.khan@example.com', '$2a$10$1i8GT31FDgvtiGpXeek8m.pFP4SYt7isRm1bHJJp5T8Q0FhjVU7lW', 'Saad Khan', 'CUSTOMER', NOW() - INTERVAL '15 days')
ON CONFLICT (email) DO NOTHING;

INSERT INTO products (sku, name, description, category, brand, price, discount_price, stock_qty, popularity, rating, wishlist_count, created_at, updated_at)
VALUES
  ('SRP-SW-001', 'UltraFit Smartwatch', 'Fitness tracker with heart rate monitoring, stock alerts, and loyalty credit.', 'Wearables', 'SmartLine', 199.99, 179.99, 118, 142, 4.6, 32, NOW() - INTERVAL '50 days', NOW() - INTERVAL '18 days'),
  ('SRP-HD-003', 'Infinity Noise-Cancelling Headphones', 'Over-ear wireless headphones with real-time order notifications and digital receipts.', 'Audio', 'AeroSound', 149.99, 129.99, 84, 98, 4.4, 19, NOW() - INTERVAL '48 days', NOW() - INTERVAL '12 days'),
  ('SRP-SP-022', 'Home Office Smart Speaker', 'Voice assistant for shopping suggestions and inventory reminders.', 'Smart Home', 'EchoMax', 129.99, 99.99, 56, 76, 4.2, 25, NOW() - INTERVAL '38 days', NOW() - INTERVAL '20 days'),
  ('SRP-PD-014', 'Wireless Charging Desk Lamp', 'LED desk lamp with fast charging and product discovery integration.', 'Office', 'BrightWork', 89.99, NULL, 212, 45, 4.0, 11, NOW() - INTERVAL '30 days', NOW() - INTERVAL '10 days'),
  ('SRP-BT-007', 'Compact Bluetooth Tracker', 'Tile-style tracker for inventory and order pick-up reminders.', 'Accessories', 'TrackIt', 29.99, 24.99, 320, 55, 4.8, 46, NOW() - INTERVAL '22 days', NOW() - INTERVAL '5 days'),
  ('SRP-KT-035', 'Smart Kitchen Scale', 'Nutrition and reorder alerts integrated with customer wishlists.', 'Home', 'KitchenPro', 59.99, 49.99, 92, 31, 4.3, 8, NOW() - INTERVAL '28 days', NOW() - INTERVAL '8 days'),
  ('SRP-BK-009', 'Ergonomic Office Chair', 'Adjustable chair with vendor restock recommendation triggers.', 'Office', 'ComfortLab', 329.99, 299.99, 24, 68, 4.7, 14, NOW() - INTERVAL '40 days', NOW() - INTERVAL '16 days'),
  ('SRP-PL-006', 'Portable Projector', 'Compact projector for presentation-ready product demos and checkout promotions.', 'Electronics', 'Visionary', 249.99, 219.99, 48, 38, 4.1, 6, NOW() - INTERVAL '26 days', NOW() - INTERVAL '9 days'),
  ('SRP-CL-011', 'Premium Denim Jacket', 'Fashion item with seasonal order history and recommendation score.', 'Apparel', 'TrendWear', 119.99, 99.99, 65, 57, 4.5, 21, NOW() - INTERVAL '32 days', NOW() - INTERVAL '11 days'),
  ('SRP-TO-020', 'Wireless Gaming Mouse', 'High-precision mouse with bundled product cross-sell suggestions.', 'Gaming', 'ProClick', 79.99, 69.99, 140, 51, 4.4, 29, NOW() - INTERVAL '20 days', NOW() - INTERVAL '6 days')
ON CONFLICT (sku) DO NOTHING;

-- Seed orders and order items via stored procedure for Saad Khan.
CALL sp_place_order(2, '{"address":"742 Evergreen Terrace","city":"Springfield","zip":"12345"}'::jsonb, 'card', '[{"productId":1,"quantity":1},{"productId":5,"quantity":2}]'::jsonb);
CALL sp_place_order(2, '{"address":"742 Evergreen Terrace","city":"Springfield","zip":"12345"}'::jsonb, 'card', '[{"productId":3,"quantity":1},{"productId":4,"quantity":1}]'::jsonb);
CALL sp_place_order(2, '{"address":"742 Evergreen Terrace","city":"Springfield","zip":"12345"}'::jsonb, 'card', '[{"productId":2,"quantity":1},{"productId":10,"quantity":1}]'::jsonb);

INSERT INTO wishlist (customer_id, product_id)
VALUES
  (2, 3),
  (2, 5),
  (2, 8)
ON CONFLICT DO NOTHING;

INSERT INTO reviews (customer_id, order_id, product_id, rating, comment, created_at)
VALUES
  (2, 1, 1, 5, 'Tania Khawar found the smartwatch easy to use and inventory-friendly.', NOW() - INTERVAL '17 days'),
  (2, 2, 3, 4, 'The smart speaker is helpful for order reminders and home automation.', NOW() - INTERVAL '10 days'),
  (2, 3, 10, 4, 'Great gaming mouse with reliable checkout experience.', NOW() - INTERVAL '6 days')
ON CONFLICT DO NOTHING;

CALL sp_generate_report();

REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_products;
REFRESH MATERIALIZED VIEW mv_customer_engagement;

COMMIT;
