// src/app/api/posts/[postId]/reaction/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ postId: string }>;
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { postId } = await context.params;
    if (!postId) {
      return NextResponse.json({ error: "Post id is required." }, { status: 400 });
    }

    const [likeCount, existingReaction] = await Promise.all([
      prisma.postReaction.count({ where: { postId, type: "like" } }),
      prisma.postReaction.findUnique({
        where: { postId_userId: { postId, userId: user.userId } },
        select: { id: true },
      }),
    ]);

    return NextResponse.json({
      liked: Boolean(existingReaction),
      likeCount,
    });
  } catch (err) {
    console.error("[reaction:get]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { postId } = await context.params;
    const body = await req.json();
    const { postContent, postHandle } = body as {
      postContent?: string;
      postHandle?: string;
    };

    if (!postId) {
      return NextResponse.json({ error: "Post id is required." }, { status: 400 });
    }

    await prisma.post.upsert({
      where: { id: postId },
      create: {
        id: postId,
        anonHandle: postHandle?.trim() || "anonymous",
        content: postContent?.trim() || "",
      },
      update: {},
    });

    const existingReaction = await prisma.postReaction.findUnique({
      where: { postId_userId: { postId, userId: user.userId } },
      select: { id: true },
    });

    if (existingReaction) {
      await prisma.postReaction.delete({ where: { id: existingReaction.id } });
    } else {
      await prisma.postReaction.create({
        data: {
          postId,
          userId: user.userId,
          type: "like",
        },
      });
    }

    const likeCount = await prisma.postReaction.count({
      where: { postId, type: "like" },
    });

    return NextResponse.json({
      liked: !existingReaction,
      likeCount,
    });
  } catch (err) {
    console.error("[reaction:post]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
