// src/app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { sendOTPEmail } from "@/lib/mail";
import { generateOTP, generateAnonHandle } from "@/lib/auth";

const SALT_ROUNDS = 12;
const OTP_TTL_MINUTES = 10;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body as { email?: string; password?: string };

    // ── Validation ────────────────────────────────────────────────────────
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const emailLower = email.trim().toLowerCase();

    if (!emailLower.endsWith("@gla.ac.in")) {
      return NextResponse.json(
        { error: "Only @gla.ac.in email addresses are allowed." },
        { status: 403 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    // ── Check existing verified user ──────────────────────────────────────
    const existingUser = await prisma.user.findUnique({ where: { email: emailLower } });
    if (existingUser?.isVerified) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // ── Hash password ─────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // ── Upsert user (allow re-signup if not yet verified) ─────────────────
    let anonHandle = existingUser?.anonHandle;
    if (!anonHandle) {
      // ensure unique handle
      let handle = generateAnonHandle();
      while (await prisma.user.findUnique({ where: { anonHandle: handle } })) {
        handle = generateAnonHandle();
      }
      anonHandle = handle;
    }

    await prisma.user.upsert({
      where: { email: emailLower },
      create: { email: emailLower, passwordHash, anonHandle, isVerified: false },
      update: { passwordHash },
    });

    // ── Generate & store OTP ──────────────────────────────────────────────
    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    // Invalidate any previous unused OTPs for this email
    await prisma.emailVerificationOTP.updateMany({
      where: { email: emailLower, usedAt: null },
      data: { usedAt: new Date() },
    });

    await prisma.emailVerificationOTP.create({
      data: { email: emailLower, otp: otpHash, expiresAt },
    });

    // ── Send OTP email ────────────────────────────────────────────────────
    await sendOTPEmail(emailLower, otp);

    return NextResponse.json(
      { message: "OTP sent. Please check your GLA email inbox." },
      { status: 201 }
    );
  } catch (err) {
    console.error("[signup]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
