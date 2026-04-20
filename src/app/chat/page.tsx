// src/app/chat/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import ChatClient from "./ChatClient";

export default async function ChatPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <ChatClient anonHandle={user.anonHandle} />;
}
