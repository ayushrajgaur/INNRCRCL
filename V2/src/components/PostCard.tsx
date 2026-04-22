"use client";

import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, MessageCircle, MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface Post {
  postId:       string;
  authorAlias:  string;
  authorUid:    string;
  content:      string;
  tab:          string;
  upvotes:      number;
  downvotes:    number;
  commentCount: number;
  isAnonymous:  boolean;
  isFlagged:    boolean;
  isPostOfDay:  boolean;
  keyword:      string | null;
  mediaURL:     string | null;
  collegeDomain: string;
  createdAt:    { seconds: number } | null;
  expiresAt:    { seconds: number } | null;
}

interface PostCardProps {
  post:       Post;
  glowBorder?: boolean;
}

const GLASS: React.CSSProperties = {
  background:     "rgba(255,255,255,0.04)",
  backdropFilter: "blur(20px)",
  border:         "1px solid rgba(167,139,250,0.15)",
  borderRadius:   "16px",
  padding:        "16px",
  boxShadow:      "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
  transition:     "border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease",
};

const ALIAS_PILL: React.CSSProperties = {
  background:   "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(167,139,250,0.1))",
  border:       "1px solid rgba(167,139,250,0.3)",
  borderRadius: "9999px",
  padding:      "3px 12px",
  color:        "#A78BFA",
  fontSize:     "0.8rem",
  fontWeight:   600,
};

export default function PostCard({ post, glowBorder = false }: PostCardProps) {
  const time = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt.seconds * 1000), { addSuffix: true })
    : "";

  const cardStyle: React.CSSProperties = glowBorder
    ? {
        ...GLASS,
        border:    "1px solid rgba(124,58,237,0.5)",
        boxShadow: "0 0 24px rgba(124,58,237,0.25), 0 8px 32px rgba(0,0,0,0.3)",
      }
    : GLASS;

  return (
    <motion.div
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="relative flex flex-col gap-3"
      style={cardStyle}
      onMouseEnter={(e) => {
        if (!glowBorder) {
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(167,139,250,0.35)";
          (e.currentTarget as HTMLDivElement).style.boxShadow   =
            "0 8px 40px rgba(124,58,237,0.15), inset 0 1px 0 rgba(255,255,255,0.07)";
        }
      }}
      onMouseLeave={(e) => {
        if (!glowBorder) {
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(167,139,250,0.15)";
          (e.currentTarget as HTMLDivElement).style.boxShadow   =
            "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)";
        }
      }}
    >
      {/* Gradient left border for anonymous posts */}
      {post.isAnonymous && (
        <div
          className="absolute left-0 top-3 bottom-3 rounded-full"
          style={{
            width:      "3px",
            background: "linear-gradient(to bottom, #7C3AED, #A78BFA)",
          }}
        />
      )}

      {/* Top row */}
      <div className={`flex items-center justify-between gap-2 ${post.isAnonymous ? "pl-3" : ""}`}>
        <div className="flex items-center gap-2 flex-wrap">
          <span style={ALIAS_PILL}>{post.authorAlias}</span>
          {post.isAnonymous && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(124,58,237,0.1)",
                border:     "1px solid rgba(124,58,237,0.25)",
                color:      "#7C3AED",
              }}
            >
              anon
            </span>
          )}
          {post.keyword && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(167,139,250,0.08)",
                border:     "1px solid rgba(167,139,250,0.2)",
                color:      "#A78BFA",
              }}
            >
              #{post.keyword}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "#6B7280" }}>{time}</span>
          <button
            className="transition-colors duration-150"
            style={{ color: "#6B7280" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color = "#A78BFA")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color = "#6B7280")
            }
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <p
        className={`text-sm leading-relaxed line-clamp-4 ${post.isAnonymous ? "pl-3" : ""}`}
        style={{ color: "#F1F0FF" }}
      >
        {post.content}
      </p>

      {/* Bottom action row */}
      <div className={`flex items-center gap-5 ${post.isAnonymous ? "pl-3" : ""}`}>
        <button
          className="flex items-center gap-1.5 text-xs transition-all duration-150"
          style={{ color: "#6B7280" }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.color      = "#7C3AED";
            el.style.textShadow = "0 0 8px rgba(124,58,237,0.5)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.color      = "#6B7280";
            el.style.textShadow = "none";
          }}
        >
          <ArrowUp size={14} /> {post.upvotes}
        </button>

        <button
          className="flex items-center gap-1.5 text-xs transition-all duration-150"
          style={{ color: "#6B7280" }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "#EF4444")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "#6B7280")
          }
        >
          <ArrowDown size={14} /> {post.downvotes}
        </button>

        <button
          className="flex items-center gap-1.5 text-xs transition-all duration-150"
          style={{ color: "#6B7280" }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "#A78BFA")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "#6B7280")
          }
        >
          <MessageCircle size={14} /> {post.commentCount}
        </button>
      </div>
    </motion.div>
  );
}
