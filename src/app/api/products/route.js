import { NextResponse } from "next/server";
import { query } from "@/lib/db";

function normalizeQuery(value) {
  return value ? String(value).trim() : "";
}

export async function GET(req) {
  const url = new URL(req.url);
  const search = normalizeQuery(url.searchParams.get("search"));
  const category = normalizeQuery(url.searchParams.get("category"));
  const brand = normalizeQuery(url.searchParams.get("brand"));
  const minPrice = Number(url.searchParams.get("min") || 0);
  const maxPrice = Number(url.searchParams.get("max") || 0);
  const sort = normalizeQuery(url.searchParams.get("sort") || "popularity");

  const filters = ["TRUE"];
  const values = [];

  if (search) {
    values.push(`%${search.toLowerCase()}%`);
    filters.push(`(LOWER(name) LIKE $${values.length} OR LOWER(category) LIKE $${values.length} OR LOWER(brand) LIKE $${values.length})`);
  }
  if (category) {
    values.push(category.toLowerCase());
    filters.push(`LOWER(category) = $${values.length}`);
  }
  if (brand) {
    values.push(brand.toLowerCase());
    filters.push(`LOWER(brand) = $${values.length}`);
  }
  if (minPrice > 0) {
    values.push(minPrice);
    filters.push(`price >= $${values.length}`);
  }
  if (maxPrice > 0) {
    values.push(maxPrice);
    filters.push(`price <= $${values.length}`);
  }

  let orderBy = "COALESCE(popularity, 0) DESC";
  if (sort === "price_asc") orderBy = "price ASC";
  if (sort === "price_desc") orderBy = "price DESC";
  if (sort === "rating") orderBy = "COALESCE(rating, 0) DESC";

  try {
    const sql = `SELECT * FROM vw_product_catalogue WHERE ${filters.join(" AND ")} ORDER BY ${orderBy} LIMIT 60`;
    const result = await query(sql, values);
    return NextResponse.json({ items: result.rows });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json({ error: error.message || "Unable to fetch products." }, { status: 500 });
  }
}
