import { verifyToken } from "@/lib/auth";

export async function getSession(req) {
  const token = req.cookies.get("sr_token")?.value;
  if (!token) {
    throw new Error("Unauthorized");
  }
  return verifyToken(token);
}
