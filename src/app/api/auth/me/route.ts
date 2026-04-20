// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Fetch fresh data from DB to ensure user is still valid/verified
    const user = await prisma.user.findUnique({
      where: { id: tokenUser.userId },
      select: { id: true, email: true, anonHandle: true, isVerified: true, createdAt: true },
    });

    if (!user || !user.isVerified) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error("[me]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
