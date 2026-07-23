import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(req) {
  const body = await req.json();
  const email = body.email?.trim().toLowerCase();
  const password = String(body.password || "");
  const name = body.name?.trim();

  if (!email || !password || !name) {
    return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
  }

  const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rowCount) {
    return NextResponse.json({ error: "Email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await query(
    `INSERT INTO users (email, password_hash, full_name, role, created_at)
     VALUES ($1, $2, $3, 'CUSTOMER', NOW())
     RETURNING id, email, full_name, role`,
    [email, passwordHash, name]
  );

  const user = result.rows[0];
  const token = await signToken({ sub: user.id, email: user.email, name: user.full_name, role: user.role });
  const response = NextResponse.json({ user: { id: user.id, email: user.email, name: user.full_name, role: user.role }, token });

  response.cookies.set({ name: "sr_token", value: token, httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" });
  return response;
}
