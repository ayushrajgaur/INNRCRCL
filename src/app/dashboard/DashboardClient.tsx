"use client";
// src/app/dashboard/DashboardClient.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  anonHandle: string;
  email: string;
}

interface FeedPost {
  id: string;
  handle: string;
  content: string;
  createdAt: string;
  likes: number;
  replies: number;
  liked: boolean;
}

interface Reply {
  id: string;
  anonHandle: string;
  content: string;
  createdAt: string;
}

export default function DashboardClient({ anonHandle, email }: Props) {
  const router = useRouter();
  const [postText, setPostText] = useState("");
  const [posting, setPosting] = useState(false);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [feedError, setFeedError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [feed, setFeed] = useState<FeedPost[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoadingFeed(true);
    setFeedError("");
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (!res.ok) {
        setFeedError(data.error ?? "Could not load campus feed.");
        return;
      }
      setFeed(data.posts ?? []);
    } catch {
      setFeedError("Network error. Please try again.");
    } finally {
      setLoadingFeed(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  function openAnonymousChat() {
    window.open("/chat", "_blank", "noopener,noreferrer");
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    const content = postText.trim();
    if (!content) return;

    setPosting(true);
    setFeedError("");
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedError(data.error ?? "Could not create post.");
        return;
      }

      setFeed((current) => [data.post, ...current]);
      setPostText("");
    } catch {
      setFeedError("Network error. Please try again.");
    } finally {
      setPosting(false);
    }
  }

  const [word, num] = anonHandle.split("#");

  return (
    <div className="min-h-dvh bg-void noise scanlines">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] opacity-[0.04]"
          style={{ background: "radial-gradient(ellipse, var(--amber) 0%, transparent 70%)" }}
        />
      </div>

      <header
        className="sticky top-0 z-20 border-b border-border backdrop-blur-sm"
        style={{ background: "rgba(7,7,14,0.85)" }}
      >
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 relative">
              <div className="absolute inset-0 border border-amber rounded-sm animate-spin-slow opacity-50" />
              <div className="absolute inset-1 bg-amber rounded-sm" />
            </div>
            <span className="font-display font-bold text-ash text-sm tracking-wider">
              Innr<span className="text-amber">Crcl</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-1.5 border border-amber/30 rounded px-2.5 py-1"
              style={{ background: "rgba(240,192,64,0.06)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse-amber" />
              <span className="text-xs font-code text-amber">
                {word}
                <span className="text-amber-dim opacity-70">#{num}</span>
              </span>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-xs text-muted hover:text-error transition-colors font-code tracking-wider disabled:opacity-40"
            >
              {loggingOut ? "..." : "LOGOUT"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div
          className="border border-border rounded-lg px-6 py-5 mb-6 animate-fade-up"
          style={{ background: "var(--surface)" }}
        >
          <p className="text-xs text-muted font-code tracking-widest mb-1">LOGGED IN AS</p>
          <h2 className="font-display font-bold text-2xl text-amber">
            {word}
            <span className="text-ash opacity-50">#{num}</span>
          </h2>
          <p className="text-xs text-muted font-code mt-1">
            Your real email <span className="text-ash">{email}</span> is never shown to others.
          </p>
          <button
            type="button"
            onClick={openAnonymousChat}
            className="mt-4 text-xs tracking-[0.15em] uppercase bg-amber text-void font-bold px-4 py-2 rounded hover:bg-amber-dim transition-colors font-code"
          >
            Anonymous Chat
          </button>
        </div>

        <form
          onSubmit={handlePost}
          className="border border-border rounded-lg p-4 mb-6 animate-fade-up delay-100"
          style={{ background: "var(--surface)" }}
        >
          <div className="flex items-start gap-3">
            <div
              className="flex-shrink-0 w-8 h-8 rounded border border-amber/30 flex items-center justify-center"
              style={{ background: "rgba(240,192,64,0.08)" }}
            >
              <span className="text-amber text-xs font-code font-bold">
                {word[0].toUpperCase()}
              </span>
            </div>
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="What's on your mind?"
              maxLength={480}
              rows={3}
              className="flex-1 bg-transparent text-sm text-ash placeholder:text-muted font-code resize-none outline-none leading-relaxed"
            />
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <span className="text-xs text-muted font-code tabular-nums">
              {480 - postText.length} chars left
            </span>
            <button
              type="submit"
              disabled={!postText.trim() || posting}
              className="text-xs tracking-[0.15em] uppercase bg-amber text-void font-bold px-4 py-1.5 rounded hover:bg-amber-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-code"
            >
              {posting ? "Posting..." : "Whisper"}
            </button>
          </div>
        </form>

        {feedError && (
          <div
            className="text-xs text-error border border-error/20 rounded px-3 py-2 font-code mb-4"
            style={{ background: "rgba(255,90,90,0.06)" }}
          >
            {feedError}
          </div>
        )}

        <div className="flex items-center gap-3 mb-4 animate-fade-up delay-200">
          <span className="text-xs tracking-[0.25em] uppercase text-muted font-code">
            Campus Feed
          </span>
          <div className="flex-1 h-px bg-border" />
          <span
            className="text-xs text-amber font-code border border-amber/20 px-2 py-0.5 rounded"
            style={{ background: "rgba(240,192,64,0.05)" }}
          >
            LIVE
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {loadingFeed && (
            <div
              className="border border-border rounded-lg p-4 text-xs text-muted font-code"
              style={{ background: "var(--surface)" }}
            >
              Loading campus feed...
            </div>
          )}

          {!loadingFeed && feed.length === 0 && (
            <div
              className="border border-border rounded-lg p-4 text-xs text-muted font-code"
              style={{ background: "var(--surface)" }}
            >
              No campus posts yet.
            </div>
          )}

          {!loadingFeed &&
            feed.map((post, i) => <PostCard key={post.id} post={post} delay={i} />)}
        </div>

        <div className="mt-8 text-center py-8 border border-dashed border-border rounded-lg animate-fade-up">
          <p className="text-xs text-muted font-code tracking-widest">
            PHASE 2 - REACTIONS - ROOMS
          </p>
          <p className="text-xs text-muted font-code mt-1 opacity-50">Coming in the next build</p>
        </div>
      </main>
    </div>
  );
}

function PostCard({ post, delay }: { post: FeedPost; delay: number }) {
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);
  const [likeLoading, setLikeLoading] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyCount, setReplyCount] = useState(post.replies);
  const [word, num] = post.handle.split("#");

  async function toggleLike() {
    if (likeLoading) return;

    setLikeLoading(true);
    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(post.id)}/reaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postContent: post.content,
          postHandle: post.handle,
        }),
      });
      const data = await res.json();
      if (!res.ok) return;

      setLiked(Boolean(data.liked));
      setLikes(Number(data.likeCount ?? 0));
    } finally {
      setLikeLoading(false);
    }
  }

  async function fetchReplies() {
    setReplyLoading(true);
    setReplyError("");
    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(post.id)}/replies`);
      const data = await res.json();
      if (!res.ok) {
        setReplyError(data.error ?? "Could not load replies.");
        return;
      }

      const nextReplies = data.replies ?? [];
      setReplies(nextReplies);
      setReplyCount(nextReplies.length);
    } catch {
      setReplyError("Network error. Please try again.");
    } finally {
      setReplyLoading(false);
    }
  }

  async function toggleReplies() {
    const nextOpen = !replyOpen;
    setReplyOpen(nextOpen);
    if (nextOpen) await fetchReplies();
  }

  async function submitReply(e: React.FormEvent) {
    e.preventDefault();
    const content = replyText.trim();
    if (!content) {
      setReplyError("Reply cannot be empty.");
      return;
    }

    setReplySubmitting(true);
    setReplyError("");
    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(post.id)}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          postContent: post.content,
          postHandle: post.handle,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReplyError(data.error ?? "Could not post reply.");
        return;
      }

      setReplyText("");
      await fetchReplies();
    } catch {
      setReplyError("Network error. Please try again.");
    } finally {
      setReplySubmitting(false);
    }
  }

  return (
    <article
      className="border border-border rounded-lg p-4 group hover:border-amber/20 transition-colors animate-fade-up"
      style={{
        background: "var(--surface)",
        animationDelay: `${delay * 0.07}s`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded border border-border-bright flex items-center justify-center"
            style={{ background: "var(--surface-2)" }}
          >
            <span className="text-xs font-code text-muted">{word[0].toUpperCase()}</span>
          </div>
          <span className="text-xs font-code">
            <span className="text-ash">{word}</span>
            <span className="text-muted">{num ? `#${num}` : ""}</span>
          </span>
        </div>
        <span className="text-xs text-muted font-code">{formatPostTime(post.createdAt)}</span>
      </div>

      <p className="text-sm text-ash leading-relaxed font-code mb-4">{post.content}</p>

      <div className="flex items-center gap-4 border-t border-border pt-3">
        <button
          onClick={toggleLike}
          disabled={likeLoading}
          className={`flex items-center gap-1.5 text-xs font-code transition-colors ${
            liked ? "text-amber" : "text-muted hover:text-amber"
          } disabled:opacity-40`}
        >
          <span>{liked ? "liked" : "like"}</span>
          <span className="tabular-nums">{likes}</span>
        </button>
        <button
          onClick={toggleReplies}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-ash font-code transition-colors"
        >
          <span>reply</span>
          <span className="tabular-nums">{replyCount}</span>
        </button>
        <button className="ml-auto text-xs text-muted hover:text-amber font-code transition-colors">
          share
        </button>
      </div>

      {replyOpen && (
        <div className="mt-4 border-t border-border pt-4">
          <div className="flex flex-col gap-3 mb-4">
            {replyLoading && <p className="text-xs text-muted font-code">Loading replies...</p>}

            {!replyLoading && replies.length === 0 && (
              <p className="text-xs text-muted font-code">No replies yet.</p>
            )}

            {!replyLoading &&
              replies.map((reply) => (
                <div
                  key={reply.id}
                  className="border border-border rounded p-3"
                  style={{ background: "var(--surface-2)" }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-amber font-code">{reply.anonHandle}</span>
                    <span className="text-[10px] text-muted font-code">
                      {new Date(reply.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-ash leading-relaxed font-code">{reply.content}</p>
                </div>
              ))}
          </div>

          {replyError && (
            <div
              className="text-xs text-error border border-error/20 rounded px-3 py-2 font-code mb-3"
              style={{ background: "rgba(255,90,90,0.06)" }}
            >
              {replyError}
            </div>
          )}

          <form onSubmit={submitReply} className="flex gap-2">
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              maxLength={480}
              placeholder="Write a reply..."
              className="flex-1 rounded border border-border bg-surface-2 px-3 py-2 text-xs text-ash placeholder:text-muted font-code outline-none focus:border-amber"
            />
            <button
              type="submit"
              disabled={!replyText.trim() || replySubmitting}
              className="text-xs tracking-[0.12em] uppercase bg-amber text-void font-bold px-3 py-2 rounded hover:bg-amber-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-code"
            >
              {replySubmitting ? "..." : "Reply"}
            </button>
          </form>
        </div>
      )}
    </article>
  );
}

function formatPostTime(createdAt: string) {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
