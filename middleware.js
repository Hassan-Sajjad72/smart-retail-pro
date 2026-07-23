import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = process.env.JWT_SECRET || "smart_retail_super_secret_key_change_this";
const signingKey = new TextEncoder().encode(secret);

async function verifyToken(token) {
  return jwtVerify(token, signingKey);
}

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get("sr_token")?.value;
  const authPaths = ["/auth", "/api/auth/login", "/api/auth/register", "/api/auth/logout"];

  if (authPaths.some((path) => pathname === path || pathname.startsWith(path))) {
    if (!token) return NextResponse.next();
    try {
      const { payload } = await verifyToken(token);
      const nextUrl = request.nextUrl.clone();
      nextUrl.pathname = payload.role === "ADMIN" ? "/admin/dashboard" : "/customer/dashboard";
      return NextResponse.redirect(nextUrl);
    } catch (error) {
      return NextResponse.next();
    }
  }

  const protectedAdmin = pathname.startsWith("/admin");
  const protectedCustomer = pathname.startsWith("/customer");

  if (!protectedAdmin && !protectedCustomer) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  try {
    const { payload } = await verifyToken(token);
    if (protectedAdmin && payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
    if (protectedCustomer && payload.role !== "CUSTOMER") {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/customer/:path*", "/auth/:path*", "/auth"],
};
