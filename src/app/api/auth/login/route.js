import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(req) {
  const body = await req.json();
  const email = body.email?.trim().toLowerCase();
  const password = String(body.password || "");

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const result = await query(
    `SELECT id, email, full_name, role, password_hash FROM users WHERE email = $1 LIMIT 1`,
    [email]
  );

  if (!result.rowCount) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const user = result.rows[0];
  const passwordMatch = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatch) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const token = await signToken({ sub: user.id, email: user.email, name: user.full_name, role: user.role });
  const response = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.full_name,
      role: user.role,
    },
    token,
  });

  response.cookies.set({
    name: "sr_token",
    value: token,
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });

  return response;
}
