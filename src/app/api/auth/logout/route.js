import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({ name: "sr_token", value: "", path: "/", maxAge: 0, httpOnly: true, sameSite: "lax" });
  return response;
}
