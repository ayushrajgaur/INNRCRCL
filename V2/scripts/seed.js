#!/usr/bin/env node
// scripts/seed.js — Firestore demo data seeder for INNR-CRCL
// Usage: node scripts/seed.js
//
// Reads Firebase Admin credentials from .env.local.
// Safe to re-run: checks for existing docs before writing.
// ─────────────────────────────────────────────────────────────────────────────

const { readFileSync } = require("fs");
const { resolve } = require("path");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");

// ── Load .env.local manually (no dotenv dependency needed) ───────────────────
function loadEnv() {
  try {
    const raw = readFileSync(resolve(__dirname, "../.env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      process.env[key] = val;
    }
  } catch {
    console.error("❌  Could not read .env.local — make sure it exists in the project root.");
    process.exit(1);
  }
}

loadEnv();

// ── Firebase Admin init ───────────────────────────────────────────────────────
initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const db = getFirestore();

// ── Helpers ───────────────────────────────────────────────────────────────────
const now = Timestamp.now();
const hoursAgo = (h) => Timestamp.fromMillis(Date.now() - h * 60 * 60 * 1000);

async function upsert(collection, docId, data) {
  const ref = db.collection(collection).doc(docId);
  await ref.set(data, { merge: true });
  console.log(`  ✅  ${collection}/${docId}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. USERS (8 fake students, all gla.ac.in)
// ─────────────────────────────────────────────────────────────────────────────
const USERS = [
  {
    uid: "user_001",
    realName: "Aarav Sharma",
    alias: "CrimsonNova47",
    email: "aarav.sharma@gla.ac.in",
    collegeDomain: "gla.ac.in",
    collegeName: "GLA University",
    department: "CSE",
    year: 2,
    photoURL: "",
    isListener: false,
    isBanned: false,
    chatBanUntil: null,
    aliasLastChanged: hoursAgo(200),
    createdAt: hoursAgo(300),
    role: "user",
  },
  {
    uid: "user_002",
    realName: "Priya Verma",
    alias: "SilverMoon22",
    email: "priya.verma@gla.ac.in",
    collegeDomain: "gla.ac.in",
    collegeName: "GLA University",
    department: "MBA",
    year: 1,
    photoURL: "",
    isListener: true,  // peer listener
    isBanned: false,
    chatBanUntil: null,
    aliasLastChanged: hoursAgo(180),
    createdAt: hoursAgo(280),
    role: "user",
  },
  {
    uid: "user_003",
    realName: "Rohit Gupta",
    alias: "TurboComet99",
    email: "rohit.gupta@gla.ac.in",
    collegeDomain: "gla.ac.in",
    collegeName: "GLA University",
    department: "ECE",
    year: 3,
    photoURL: "",
    isListener: false,
    isBanned: false,
    chatBanUntil: null,
    aliasLastChanged: hoursAgo(160),
    createdAt: hoursAgo(260),
    role: "user",
  },
  {
    uid: "user_004",
    realName: "Sneha Patel",
    alias: "NeonBlast55",
    email: "sneha.patel@gla.ac.in",
    collegeDomain: "gla.ac.in",
    collegeName: "GLA University",
    department: "CSE",
    year: 4,
    photoURL: "",
    isListener: true,  // peer listener
    isBanned: false,
    chatBanUntil: null,
    aliasLastChanged: hoursAgo(140),
    createdAt: hoursAgo(240),
    role: "user",
  },
  {
    uid: "user_005",
    realName: "Karan Mehta",
    alias: "VioletPulse31",
    email: "karan.mehta@gla.ac.in",
    collegeDomain: "gla.ac.in",
    collegeName: "GLA University",
    department: "MBA",
    year: 2,
    photoURL: "",
    isListener: false,
    isBanned: false,
    chatBanUntil: null,
    aliasLastChanged: hoursAgo(120),
    createdAt: hoursAgo(220),
    role: "user",
  },
  {
    uid: "user_006",
    realName: "Ananya Singh",
    alias: "AzureDrift08",
    email: "ananya.singh@gla.ac.in",
    collegeDomain: "gla.ac.in",
    collegeName: "GLA University",
    department: "ECE",
    year: 1,
    photoURL: "",
    isListener: false,
    isBanned: false,
    chatBanUntil: null,
    aliasLastChanged: hoursAgo(100),
    createdAt: hoursAgo(200),
    role: "user",
  },
  {
    uid: "user_007",
    realName: "Dev Tiwari",
    alias: "GalacticWave73",
    email: "dev.tiwari@gla.ac.in",
    collegeDomain: "gla.ac.in",
    collegeName: "GLA University",
    department: "CSE",
    year: 3,
    photoURL: "",
    isListener: false,
    isBanned: false,
    chatBanUntil: null,
    aliasLastChanged: hoursAgo(80),
    createdAt: hoursAgo(180),
    role: "user",
  },
  {
    uid: "user_008",
    realName: "Meha Joshi",
    alias: "SolarEcho19",
    email: "meha.joshi@gla.ac.in",
    collegeDomain: "gla.ac.in",
    collegeName: "GLA University",
    department: "MBA",
    year: 4,
    photoURL: "",
    isListener: false,
    isBanned: false,
    chatBanUntil: null,
    aliasLastChanged: hoursAgo(60),
    createdAt: hoursAgo(160),
    role: "user",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. POSTS
// ─────────────────────────────────────────────────────────────────────────────
const POSTS = [
  // ── Confessions (5) ──
  {
    id: "post_conf_001",
    authorUid: "user_001",
    authorAlias: "CrimsonNova47",
    collegeDomain: "gla.ac.in",
    tab: "confessions",
    content:
      "I've been copying practical files from the same guy for 2 years and I still don't know his name. He sits 3 rows ahead. Sorry bro.",
    mediaURL: null,
    upvotes: 142,
    downvotes: 4,
    commentCount: 18,
    isAnonymous: true,
    isFlagged: false,
    isPostOfDay: false,
    expiresAt: null,
    createdAt: hoursAgo(14),
    keyword: null,
  },
  {
    id: "post_conf_002",
    authorUid: "user_003",
    authorAlias: "TurboComet99",
    collegeDomain: "gla.ac.in",
    tab: "confessions",
    content:
      "I actually enjoy the 8 AM class. Not because of the subject but because the chai wala outside only comes at 8:05 and I need that chai to survive.",
    mediaURL: null,
    upvotes: 89,
    downvotes: 2,
    commentCount: 11,
    isAnonymous: true,
    isFlagged: false,
    isPostOfDay: false,
    expiresAt: null,
    createdAt: hoursAgo(18),
    keyword: null,
  },
  {
    id: "post_conf_003",
    authorUid: "user_005",
    authorAlias: "VioletPulse31",
    collegeDomain: "gla.ac.in",
    tab: "confessions",
    content:
      "I told my parents I joined the coding club but I've been using that free period to nap in the library reading room. 6 months. No regrets.",
    mediaURL: null,
    upvotes: 204,
    downvotes: 3,
    commentCount: 27,
    isAnonymous: true,
    isFlagged: false,
    isPostOfDay: false,
    expiresAt: null,
    createdAt: hoursAgo(22),
    keyword: null,
  },
  {
    id: "post_conf_004",
    authorUid: "user_006",
    authorAlias: "AzureDrift08",
    collegeDomain: "gla.ac.in",
    tab: "confessions",
    content:
      "Went to wrong classroom for an entire month thinking it was my section. Nobody told me. I'm in 3rd year.",
    mediaURL: null,
    upvotes: 317,
    downvotes: 1,
    commentCount: 45,
    isAnonymous: true,
    isFlagged: false,
    isPostOfDay: false,
    expiresAt: null,
    createdAt: hoursAgo(30),
    keyword: null,
  },
  {
    id: "post_conf_005",
    authorUid: "user_007",
    authorAlias: "GalacticWave73",
    collegeDomain: "gla.ac.in",
    tab: "confessions",
    content:
      "I have a crush on someone from my department but I only know them by their roll number. I check attendance sheets to figure out who they are. Help.",
    mediaURL: null,
    upvotes: 188,
    downvotes: 5,
    commentCount: 33,
    isAnonymous: true,
    isFlagged: false,
    isPostOfDay: false,
    expiresAt: null,
    createdAt: hoursAgo(40),
    keyword: null,
  },

  // ── Memes (4) ──
  {
    id: "post_meme_001",
    authorUid: "user_002",
    authorAlias: "SilverMoon22",
    collegeDomain: "gla.ac.in",
    tab: "memes",
    content:
      "DSA sir: 'This is a simple problem'\nThe problem: Implement a self-balancing AVL tree from scratch in 45 minutes\n\n[everyone.jpg]",
    mediaURL: null,
    upvotes: 256,
    downvotes: 3,
    commentCount: 22,
    isAnonymous: false,
    isFlagged: false,
    isPostOfDay: false,
    expiresAt: null,
    createdAt: hoursAgo(8),
    keyword: null,
  },
  {
    id: "post_meme_002",
    authorUid: "user_004",
    authorAlias: "NeonBlast55",
    collegeDomain: "gla.ac.in",
    tab: "memes",
    content:
      "Me at 11:59 PM submitting the assignment due at 12 AM:\n\nsubmit button: error 504\n\nMe at 12:01 AM: 'Ma'am internet was down'",
    mediaURL: null,
    upvotes: 441,
    downvotes: 6,
    commentCount: 58,
    isAnonymous: false,
    isFlagged: false,
    isPostOfDay: false,
    expiresAt: null,
    createdAt: hoursAgo(12),
    keyword: null,
  },
  {
    id: "post_meme_003",
    authorUid: "user_008",
    authorAlias: "SolarEcho19",
    collegeDomain: "gla.ac.in",
    tab: "memes",
    content:
      "Placement season energy:\nCSE students: grinding LC\nECE students: making resumes look longer\nMBA students: bro what's CTC",
    mediaURL: null,
    upvotes: 178,
    downvotes: 9,
    commentCount: 31,
    isAnonymous: false,
    isFlagged: false,
    isPostOfDay: false,
    expiresAt: null,
    createdAt: hoursAgo(16),
    keyword: null,
  },
  {
    id: "post_meme_004",
    authorUid: "user_001",
    authorAlias: "CrimsonNova47",
    collegeDomain: "gla.ac.in",
    tab: "memes",
    content:
      "Wifi in the hostel at 2 AM vs Wifi in the hostel at 2 PM:\n\n💀 vs 💀\n\nSame energy. Loss condition regardless.",
    mediaURL: null,
    upvotes: 302,
    downvotes: 4,
    commentCount: 41,
    isAnonymous: false,
    isFlagged: false,
    isPostOfDay: false,
    expiresAt: null,
    createdAt: hoursAgo(20),
    keyword: null,
  },

  // ── Tea (3) ──
  {
    id: "post_tea_001",
    authorUid: "user_003",
    authorAlias: "TurboComet99",
    collegeDomain: "gla.ac.in",
    tab: "tea",
    content:
      "The placement cell sir who keeps saying 'our students get 40 LPA packages' — spill: those are 2 students out of 400. The rest got 4.5.",
    mediaURL: null,
    upvotes: 389,
    downvotes: 12,
    commentCount: 67,
    isAnonymous: true,
    isFlagged: false,
    isPostOfDay: false,
    expiresAt: null,
    createdAt: hoursAgo(6),
    keyword: null,
  },
  {
    id: "post_tea_002",
    authorUid: "user_005",
    authorAlias: "VioletPulse31",
    collegeDomain: "gla.ac.in",
    tab: "tea",
    content:
      "Apparently the canteen uncle waters down the sambar by 3 PM. The morning batch people eat like kings. The evening batch? Memories of sambar.",
    mediaURL: null,
    upvotes: 214,
    downvotes: 7,
    commentCount: 29,
    isAnonymous: true,
    isFlagged: false,
    isPostOfDay: false,
    expiresAt: null,
    createdAt: hoursAgo(10),
    keyword: null,
  },
  {
    id: "post_tea_003",
    authorUid: "user_007",
    authorAlias: "GalacticWave73",
    collegeDomain: "gla.ac.in",
    tab: "tea",
    content:
      "HOT TAKE: the internal marks for the OS lab are not based on your viva performance. The teacher marks based on whether you smiled at her. Prove me wrong.",
    mediaURL: null,
    upvotes: 503,
    downvotes: 22,
    commentCount: 88,
    isAnonymous: true,
    isFlagged: false,
    isPostOfDay: false,
    expiresAt: null,
    createdAt: hoursAgo(4),
    keyword: null,
  },

  // ── Nerd (4, one per keyword) ──
  {
    id: "post_nerd_001",
    authorUid: "user_001",
    authorAlias: "CrimsonNova47",
    collegeDomain: "gla.ac.in",
    tab: "nerd",
    content:
      "doubt: why does Dijkstra fail on negative edge weights? I get that it's greedy but can someone explain what specifically breaks? My exam is tomorrow pls.",
    mediaURL: null,
    upvotes: 34,
    downvotes: 0,
    commentCount: 12,
    isAnonymous: false,
    isFlagged: false,
    isPostOfDay: false,
    expiresAt: null,
    createdAt: hoursAgo(3),
    keyword: "doubt",
  },
  {
    id: "post_nerd_002",
    authorUid: "user_004",
    authorAlias: "NeonBlast55",
    collegeDomain: "gla.ac.in",
    tab: "nerd",
    content:
      "Sharing CN PYQ from 2021-2023 end sem — has OSI model, TCP/IP, subnetting. Found it in the library server. Drive link in comments.",
    mediaURL: null,
    upvotes: 91,
    downvotes: 1,
    commentCount: 8,
    isAnonymous: false,
    isFlagged: false,
    isPostOfDay: false,
    expiresAt: null,
    createdAt: hoursAgo(5),
    keyword: "pyq",
  },
  {
    id: "post_nerd_003",
    authorUid: "user_006",
    authorAlias: "AzureDrift08",
    collegeDomain: "gla.ac.in",
    tab: "nerd",
    content:
      "GLA Hackathon 2026 team needed — I'm working on an AI attendance system using face recognition. Need 1 backend dev + 1 ML person. DM me via chat.",
    mediaURL: null,
    upvotes: 67,
    downvotes: 2,
    commentCount: 19,
    isAnonymous: false,
    isFlagged: false,
    isPostOfDay: false,
    expiresAt: null,
    createdAt: hoursAgo(7),
    keyword: "hackathon",
  },
  {
    id: "post_nerd_004",
    authorUid: "user_008",
    authorAlias: "SolarEcho19",
    collegeDomain: "gla.ac.in",
    tab: "nerd",
    content:
      "Handwritten notes for DBMS unit 3 and 4 (ER diagrams, normalization up to BCNF). Scanned properly. Sharing free — just comment your email.",
    mediaURL: null,
    upvotes: 112,
    downvotes: 0,
    commentCount: 24,
    isAnonymous: false,
    isFlagged: false,
    isPostOfDay: false,
    expiresAt: null,
    createdAt: hoursAgo(9),
    keyword: "notes",
  },

  // ── Hot (3, one is Post of Day) ──
  {
    id: "post_hot_001",
    authorUid: "user_002",
    authorAlias: "SilverMoon22",
    collegeDomain: "gla.ac.in",
    tab: "hot",
    content:
      "You know what's underrated? The 10 minutes before class starts where everyone's just vibing, no pressure, someone's playing music — that's the actual college experience. Savor it.",
    mediaURL: null,
    upvotes: 612,
    downvotes: 8,
    commentCount: 74,
    isAnonymous: false,
    isFlagged: false,
    isPostOfDay: true,   // 🏆 Post of the Day
    expiresAt: null,
    createdAt: hoursAgo(2),
    keyword: null,
  },
  {
    id: "post_hot_002",
    authorUid: "user_003",
    authorAlias: "TurboComet99",
    collegeDomain: "gla.ac.in",
    tab: "hot",
    content:
      "Petition to make the college band perform at every fest and not just the annual day. Those guys are genuinely talented and half the college doesn't even know they exist.",
    mediaURL: null,
    upvotes: 488,
    downvotes: 11,
    commentCount: 52,
    isAnonymous: false,
    isFlagged: false,
    isPostOfDay: false,
    expiresAt: null,
    createdAt: hoursAgo(5),
    keyword: null,
  },
  {
    id: "post_hot_003",
    authorUid: "user_005",
    authorAlias: "VioletPulse31",
    collegeDomain: "gla.ac.in",
    tab: "hot",
    content:
      "To whoever left a full tiffin of homemade rajma chawal in the common room fridge with a note that said 'eat me, I was made with love' — I ate it. I needed that.",
    mediaURL: null,
    upvotes: 571,
    downvotes: 2,
    commentCount: 63,
    isAnonymous: false,
    isFlagged: false,
    isPostOfDay: false,
    expiresAt: null,
    createdAt: hoursAgo(8),
    keyword: null,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. CHAT (1 revealed chat between user_001 and user_002)
// ─────────────────────────────────────────────────────────────────────────────
const CHAT = {
  id: "chat_demo_001",
  chatId: "chat_demo_001",
  participants: ["user_001", "user_002"],
  participantAliases: {
    user_001: "CrimsonNova47",
    user_002: "SilverMoon22",
  },
  collegeDomain: "gla.ac.in",
  status: "revealed",
  matchType: "random",
  keyword: null,
  revealRequests: { user_001: true, user_002: true },
  revealedAt: hoursAgo(1),
  isSupport: false,
  createdAt: hoursAgo(3),
  endedAt: null,
};

const MESSAGES = [
  {
    id: "msg_001",
    messageId: "msg_001",
    senderUid: "user_001",
    content: "Hey! Random match haha. What dept are you from?",
    type: "text",
    readBy: ["user_001", "user_002"],
    createdAt: hoursAgo(2.9),
  },
  {
    id: "msg_002",
    messageId: "msg_002",
    senderUid: "user_002",
    content: "MBA 1st year 😄 You?",
    type: "text",
    readBy: ["user_001", "user_002"],
    createdAt: hoursAgo(2.8),
  },
  {
    id: "msg_003",
    messageId: "msg_003",
    senderUid: "user_001",
    content: "CSE 2nd! Nice. You enjoying MBA so far?",
    type: "text",
    readBy: ["user_001", "user_002"],
    createdAt: hoursAgo(2.7),
  },
  {
    id: "msg_004",
    messageId: "msg_004",
    senderUid: "user_002",
    content: "It's a lot of presentations lol but yeah I like it. Want to reveal?",
    type: "text",
    readBy: ["user_001", "user_002"],
    createdAt: hoursAgo(1.5),
  },
  {
    id: "msg_005",
    messageId: "msg_005",
    senderUid: "user_001",
    content: "Yeah let's do it!",
    type: "text",
    readBy: ["user_001", "user_002"],
    createdAt: hoursAgo(1.2),
  },
  {
    id: "msg_006",
    messageId: "msg_006",
    senderUid: "system",
    content: "Both users revealed their identity!",
    type: "system",
    readBy: ["user_001", "user_002"],
    createdAt: hoursAgo(1),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. FRIENDSHIPS (2 — one pending, one accepted)
// ─────────────────────────────────────────────────────────────────────────────
const FRIENDSHIPS = [
  {
    id: "friendship_001",
    friendshipId: "friendship_001",
    participants: ["user_001", "user_002"],
    status: "accepted",
    requestedBy: "user_001",
    originChatId: "chat_demo_001",
    createdAt: hoursAgo(0.9),
    acceptedAt: hoursAgo(0.5),
  },
  {
    id: "friendship_002",
    friendshipId: "friendship_002",
    participants: ["user_003", "user_004"],
    status: "pending",
    requestedBy: "user_003",
    originChatId: null,
    createdAt: hoursAgo(2),
    acceptedAt: null,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SEED RUNNER
// ─────────────────────────────────────────────────────────────────────────────
async function seed() {
  console.log("\n🌱  INNR-CRCL Firestore Seeder\n");

  // Users
  console.log("👤  Seeding users...");
  for (const user of USERS) {
    await upsert("users", user.uid, user);
  }

  // Posts
  console.log("\n📝  Seeding posts...");
  for (const post of POSTS) {
    const { id, ...data } = post;
    await upsert("posts", id, { ...data, postId: id });
  }

  // Chat + messages
  console.log("\n💬  Seeding chat...");
  const { id: chatId, ...chatData } = CHAT;
  await upsert("chats", chatId, chatData);

  console.log("  💬  Seeding messages...");
  for (const msg of MESSAGES) {
    const { id: msgId, ...msgData } = msg;
    const ref = db.collection("chats").doc(chatId).collection("messages").doc(msgId);
    await ref.set({ ...msgData, messageId: msgId }, { merge: true });
    console.log(`  ✅  chats/${chatId}/messages/${msgId}`);
  }

  // Friendships
  console.log("\n🤝  Seeding friendships...");
  for (const fs of FRIENDSHIPS) {
    const { id, ...data } = fs;
    await upsert("friendships", id, data);
  }

  console.log("\n✨  Seed complete!\n");
  console.log("Summary:");
  console.log(`  Users       : ${USERS.length}`);
  console.log(`  Posts       : ${POSTS.length} (confessions: 5 | memes: 4 | tea: 3 | nerd: 4 | hot: 3)`);
  console.log(`  Chats       : 1 (revealed)`);
  console.log(`  Messages    : ${MESSAGES.length}`);
  console.log(`  Friendships : ${FRIENDSHIPS.length} (1 accepted, 1 pending)`);
  console.log("\nOpen Firebase Console → Firestore to verify.\n");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
