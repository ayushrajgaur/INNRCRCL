"use client";
// src/app/chat/ChatClient.tsx
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";

type ChatStatus = "connecting" | "waiting" | "matched" | "ended" | "error";

interface ChatMessage {
  id: string;
  content: string;
  senderHandle: string;
  createdAt: string;
}

interface Props {
  anonHandle: string;
}

export default function ChatClient({ anonHandle }: Props) {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<ChatStatus>("connecting");
  const [sessionId, setSessionId] = useState("");
  const [partnerHandle, setPartnerHandle] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const socket = createSocket();
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function createSocket() {
    const socket = io({
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("waiting");
      socket.emit("joinQueue");
    });

    socket.on("connect_error", () => {
      setStatus("error");
      setNotice("Could not connect to anonymous chat. Please log in again.");
    });

    socket.on("waiting", () => {
      setStatus("waiting");
      setNotice("");
    });

    socket.on("matched", (payload: { sessionId: string; partnerHandle: string }) => {
      setSessionId(payload.sessionId);
      setPartnerHandle(payload.partnerHandle);
      setMessages([]);
      setNotice("");
      setStatus("matched");
    });

    socket.on("receiveMessage", (message: ChatMessage) => {
      setMessages((current) => [...current, message]);
    });

    socket.on("chatEnded", (payload: { message?: string }) => {
      setStatus("ended");
      setNotice(payload.message || "Chat ended.");
      setSessionId("");
    });

    return socket;
  }

  function sendMessage(e: FormEvent) {
    e.preventDefault();
    const content = messageText.trim();
    if (!content || !sessionId || status !== "matched") return;

    socketRef.current?.emit("sendMessage", { sessionId, content });
    setMessageText("");
  }

  function endChat() {
    if (sessionId) socketRef.current?.emit("endChat", { sessionId });
    socketRef.current?.disconnect();
    router.push("/dashboard");
  }

  function returnToDashboard() {
    socketRef.current?.disconnect();
    router.push("/dashboard");
  }

  function findNewChat() {
    socketRef.current?.disconnect();
    setStatus("connecting");
    setMessages([]);
    setNotice("");
    createSocket();
  }

  return (
    <div className="min-h-dvh bg-void noise scanlines">
      <header
        className="sticky top-0 z-20 border-b border-border backdrop-blur-sm"
        style={{ background: "rgba(7,7,14,0.85)" }}
      >
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted font-code tracking-[0.25em] uppercase">
              Anonymous Chat
            </p>
            <p className="text-xs text-amber font-code">{anonHandle}</p>
          </div>
          <button
            onClick={status === "matched" ? endChat : returnToDashboard}
            className="text-xs text-muted hover:text-error transition-colors font-code tracking-wider"
          >
            {status === "matched" ? "END CHAT" : "DASHBOARD"}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {status !== "matched" && (
          <section
            className="border border-border rounded-lg p-6 text-center animate-fade-up"
            style={{ background: "var(--surface)" }}
          >
            <div className="mx-auto mb-4 w-10 h-10 rounded border border-amber/30 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-amber animate-pulse-amber" />
            </div>
            <h1 className="font-display text-2xl font-bold text-ash mb-2">
              {status === "waiting" || status === "connecting"
                ? "Finding someone online..."
                : status === "ended"
                  ? "Chat ended"
                  : "Chat unavailable"}
            </h1>
            <p className="text-sm text-muted font-code">
              {notice || "Your real email is never shared."}
            </p>
            {status === "ended" && (
              <button
                onClick={findNewChat}
                className="mt-5 text-xs tracking-[0.15em] uppercase bg-amber text-void font-bold px-4 py-2 rounded hover:bg-amber-dim transition-colors font-code"
              >
                Find New Chat
              </button>
            )}
          </section>
        )}

        {status === "matched" && (
          <section className="animate-fade-up">
            <div
              className="border border-border rounded-lg p-4 mb-4"
              style={{ background: "var(--surface)" }}
            >
              <p className="text-xs text-muted font-code tracking-widest mb-1">MATCHED WITH</p>
              <h1 className="font-display text-xl font-bold text-amber">{partnerHandle}</h1>
            </div>

            <div
              className="border border-border rounded-lg min-h-[55vh] max-h-[60vh] overflow-y-auto p-4 mb-4 flex flex-col gap-3"
              style={{ background: "var(--surface)" }}
            >
              {messages.length === 0 && (
                <p className="text-sm text-muted font-code text-center mt-10">
                  Say hi. Only anonymous handles are visible here.
                </p>
              )}
              {messages.map((message) => {
                const mine = message.senderHandle === anonHandle;
                return (
                  <div
                    key={message.id}
                    className={`max-w-[80%] ${mine ? "ml-auto text-right" : "mr-auto text-left"}`}
                  >
                    <p className="text-[10px] text-muted font-code mb-1">
                      {mine ? "you" : message.senderHandle}
                    </p>
                    <div
                      className={`rounded px-3 py-2 text-sm font-code leading-relaxed ${
                        mine ? "bg-amber text-void" : "border border-border text-ash"
                      }`}
                      style={mine ? undefined : { background: "var(--surface-2)" }}
                    >
                      {message.content}
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>

            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                maxLength={1000}
                placeholder="Type a message..."
                className="flex-1 rounded border border-border bg-surface-2 px-3 py-2 text-sm text-ash placeholder:text-muted font-code outline-none focus:border-amber"
              />
              <button
                type="submit"
                disabled={!messageText.trim()}
                className="text-xs tracking-[0.15em] uppercase bg-amber text-void font-bold px-4 py-2 rounded hover:bg-amber-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-code"
              >
                Send
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
