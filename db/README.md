# Smart Retail Pro Database Setup

This folder contains the PostgreSQL schema, stored procedures, triggers, views, materialized views, and seed data for Smart Retail Pro.

## Run the database setup

1. Create the database in PostgreSQL if you have not already:

```bash
createdb Smart
```

2. Set environment variables if your database connection differs from defaults:

- `DB_HOST` (default: `localhost`)
- `DB_PORT` (default: `5432`)
- `DB_NAME` (default: `Smart`)
- `DB_USER` (default: `postgres`)
- `DB_PASSWORD` (default: `admin123`)

3. Run the initializer:

```bash
npm run db:init
```

## What this setup creates

- `users`, `products`, `orders`, `order_items`, `wishlist`, `reviews`, `inventory_history`, `sales_reports`
- Partitioned `orders` table for OLTP-scale date partitioning
- Stored procedures for order placement, restocking, cancelling orders, and reporting
- Triggers for low-stock alerts, review validation, and wishlist tracking
- Analytical views and materialized views for product catalog, customer summaries, order details, and top products
- Indexes and full-text search support for performance
- Sample customers, products, orders, wishlist entries, reviews, and report history
- Demo query file at `db/demo.sql` for ADBMS feature proofs
- Node-based runner at `npm run db:demo` when `psql` is not installed
