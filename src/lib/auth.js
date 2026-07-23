import { jwtVerify, SignJWT } from "jose";

const secret = process.env.JWT_SECRET || "smart_retail_super_secret_key_change_this";
const signingKey = new TextEncoder().encode(secret);

export async function signToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN || "7d")
    .sign(signingKey);
}

export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, signingKey);
  return payload;
}
