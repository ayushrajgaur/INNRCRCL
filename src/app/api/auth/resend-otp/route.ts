// src/app/api/auth/resend-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { generateOTP } from "@/lib/auth";
import { sendOTPEmail } from "@/lib/mail";

const OTP_TTL_MINUTES = 10;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body as { email?: string };

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const emailLower = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: emailLower },
      select: { isVerified: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found for this email. Please sign up first." },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { error: "This account is already verified. Please log in." },
        { status: 400 }
      );
    }

    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
    const usedAt = new Date();

    await prisma.$transaction([
      prisma.emailVerificationOTP.updateMany({
        where: { email: emailLower, usedAt: null },
        data: { usedAt },
      }),
      prisma.emailVerificationOTP.create({
        data: { email: emailLower, otp: otpHash, expiresAt },
      }),
    ]);

    await sendOTPEmail(emailLower, otp);

    return NextResponse.json({ message: "OTP resent. Please check your GLA email inbox." });
  } catch (err) {
    console.error("[resend-otp]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
