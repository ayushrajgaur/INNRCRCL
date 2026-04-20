// src/app/api/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp } = body as { email?: string; otp?: string };

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required." }, { status: 400 });
    }

    const emailLower = email.trim().toLowerCase();
    const otpValue = otp.trim();

    if (!/^\d{6}$/.test(otpValue)) {
      return NextResponse.json({ error: "Invalid OTP. Please try again." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: emailLower },
      select: { id: true, isVerified: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found for this email. Please sign up first." },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json({ message: "Email is already verified. You can log in." });
    }

    const record = await prisma.emailVerificationOTP.findFirst({
      where: { email: emailLower, usedAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return NextResponse.json(
        { error: "No pending OTP found. Please request a new one." },
        { status: 400 }
      );
    }

    if (record.expiresAt <= new Date()) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(otpValue, record.otp);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid OTP. Please try again." }, { status: 400 });
    }

    const usedAt = new Date();

    await prisma.$transaction([
      prisma.emailVerificationOTP.update({
        where: { id: record.id },
        data: { usedAt },
      }),
      prisma.emailVerificationOTP.updateMany({
        where: {
          email: emailLower,
          usedAt: null,
          id: { not: record.id },
        },
        data: { usedAt },
      }),
      prisma.user.update({
        where: { email: emailLower },
        data: { isVerified: true },
      }),
    ]);

    return NextResponse.json({ message: "Email verified successfully. You can now log in." });
  } catch (err) {
    console.error("[verify-otp]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
