// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { AUTH_COOKIE } from "@/lib/auth";

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const emailLower = email.trim().toLowerCase();

    // ── Find user ─────────────────────────────────────────────────────────
    const user = await prisma.user.findUnique({ where: { email: emailLower } });

    // Generic error to prevent user enumeration
    const INVALID_MSG = "Invalid credentials.";

    if (!user) {
      return NextResponse.json({ error: INVALID_MSG }, { status: 401 });
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { error: "Email not verified. Please complete OTP verification first." },
        { status: 403 }
      );
    }

    // ── Verify password ───────────────────────────────────────────────────
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json({ error: INVALID_MSG }, { status: 401 });
    }

    // ── Issue JWT ─────────────────────────────────────────────────────────
    const token = signToken({
      userId: user.id,
      email: user.email,
      anonHandle: user.anonHandle,
    });

    // ── Set HttpOnly cookie ───────────────────────────────────────────────
    const response = NextResponse.json({
      message: "Logged in successfully.",
      user: { anonHandle: user.anonHandle },
    });

    response.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    return response;
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
