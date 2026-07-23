import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req) {
  await getSession(req);
  try {
    const result = await query("SELECT * FROM vw_customer_summary ORDER BY total_spent DESC LIMIT 120");
    return NextResponse.json({ customers: result.rows });
  } catch (error) {
    return NextResponse.json({ error: "Unable to load customer summary." }, { status: 500 });
  }
}
