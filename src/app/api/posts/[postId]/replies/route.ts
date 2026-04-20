// src/app/api/posts/[postId]/replies/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_REPLY_LENGTH = 480;

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

    const replies = await prisma.reply.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          select: { anonHandle: true },
        },
      },
    });

    return NextResponse.json({
      replies: replies.map((reply) => ({
        id: reply.id,
        content: reply.content,
        createdAt: reply.createdAt.toISOString(),
        anonHandle: reply.user.anonHandle,
      })),
    });
  } catch (err) {
    console.error("[replies:get]", err);
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
    const { content, postContent, postHandle } = body as {
      content?: string;
      postContent?: string;
      postHandle?: string;
    };

    const replyContent = content?.trim() ?? "";

    if (!postId) {
      return NextResponse.json({ error: "Post id is required." }, { status: 400 });
    }

    if (!replyContent) {
      return NextResponse.json({ error: "Reply cannot be empty." }, { status: 400 });
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

    const reply = await prisma.reply.create({
      data: {
        postId,
        userId: user.userId,
        content: replyContent.slice(0, MAX_REPLY_LENGTH),
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          select: { anonHandle: true },
        },
      },
    });

    return NextResponse.json(
      {
        reply: {
          id: reply.id,
          content: reply.content,
          createdAt: reply.createdAt.toISOString(),
          anonHandle: reply.user.anonHandle,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[replies:post]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
