// src/app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_POST_LENGTH = 480;

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        anonHandle: true,
        content: true,
        createdAt: true,
        _count: {
          select: {
            replies: true,
            reactions: { where: { type: "like" } },
          },
        },
        reactions: {
          where: {
            userId: user.userId,
            type: "like",
          },
          select: { id: true },
          take: 1,
        },
      },
    });

    return NextResponse.json({
      posts: posts.map((post) => ({
        id: post.id,
        handle: post.anonHandle,
        content: post.content,
        createdAt: post.createdAt.toISOString(),
        likes: post._count.reactions,
        replies: post._count.replies,
        liked: post.reactions.length > 0,
      })),
    });
  } catch (err) {
    console.error("[posts:get]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const { content } = body as { content?: string };
    const postContent = content?.trim() ?? "";

    if (!postContent) {
      return NextResponse.json({ error: "Post cannot be empty." }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        id: `post_${crypto.randomUUID()}`,
        anonHandle: user.anonHandle,
        content: postContent.slice(0, MAX_POST_LENGTH),
      },
      select: {
        id: true,
        anonHandle: true,
        content: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        post: {
          id: post.id,
          handle: post.anonHandle,
          content: post.content,
          createdAt: post.createdAt.toISOString(),
          likes: 0,
          replies: 0,
          liked: false,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[posts:post]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
