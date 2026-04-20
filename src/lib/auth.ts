// src/lib/auth.ts
import { cookies } from "next/headers";
import { verifyToken, TokenPayload } from "./jwt";

export const AUTH_COOKIE = "gla_whisper_token";

export async function getTokenFromCookies(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE)?.value;
}

export async function getCurrentUser(): Promise<TokenPayload | null> {
  try {
    const token = await getTokenFromCookies();
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

/** Generate a random anonymous handle like "ghost#4821" */
const HANDLES = [
  "ghost", "cipher", "phantom", "shadow", "echo", "void", "raven",
  "nova", "pixel", "drift", "flux", "arc", "neon", "frost", "vex",
  "quill", "static", "myth", "spark", "zero",
];

export function generateAnonHandle(): string {
  const word = HANDLES[Math.floor(Math.random() * HANDLES.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${word}#${num}`;
}

/** Generate a cryptographically random 6-digit OTP */
export function generateOTP(): string {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return String(100000 + (arr[0] % 900000));
}
