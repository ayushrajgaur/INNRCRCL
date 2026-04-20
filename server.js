const fs = require("fs");
const http = require("http");
const path = require("path");
const next = require("next");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");

loadEnv();

const port = Number(process.env.PORT || 3000);
const dev = process.env.NODE_ENV !== "production" && process.env.npm_lifecycle_event !== "start";
const app = next({ dev });
const handle = app.getRequestHandler();
const prisma = new PrismaClient();

const SOCKET_ROOM_PREFIX = "chat:";
const MAX_MESSAGE_LENGTH = 1000;

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server, {
    cors: { origin: true, credentials: true },
  });

  io.use(async (socket, nextSocket) => {
    try {
      const token = parseCookies(socket.handshake.headers.cookie || "").gla_whisper_token;
      if (!token) return nextSocket(new Error("Unauthorized"));

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, anonHandle: true, isVerified: true },
      });

      if (!user || !user.isVerified) return nextSocket(new Error("Unauthorized"));

      socket.data.user = user;
      nextSocket();
    } catch {
      nextSocket(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("joinQueue", async () => {
      await joinQueue(io, socket);
    });

    socket.on("sendMessage", async (payload) => {
      await sendMessage(io, socket, payload);
    });

    socket.on("endChat", async (payload) => {
      await endChat(io, socket, payload?.sessionId);
    });

    socket.on("disconnect", async () => {
      await prisma.matchQueue.deleteMany({ where: { userId: socket.data.user.id } });
      await endActiveSessionsForUser(io, socket.data.user.id, "Partner disconnected.");
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});

async function joinQueue(io, socket) {
  const user = socket.data.user;

  const activeSession = await prisma.chatSession.findFirst({
    where: {
      isActive: true,
      OR: [{ userAId: user.id }, { userBId: user.id }],
    },
    include: {
      userA: { select: { anonHandle: true } },
      userB: { select: { anonHandle: true } },
    },
  });

  if (activeSession) {
    socket.join(roomName(activeSession.id));
    socket.emit("matched", sessionPayload(activeSession, user.id));
    return;
  }

  await prisma.matchQueue.upsert({
    where: { userId: user.id },
    create: { userId: user.id, socketId: socket.id },
    update: { socketId: socket.id },
  });

  const candidates = await prisma.matchQueue.findMany({
    where: { userId: { not: user.id } },
    orderBy: { createdAt: "asc" },
    take: 8,
    include: { user: { select: { id: true, anonHandle: true, isVerified: true } } },
  });

  for (const candidate of candidates) {
    const partnerSocket = io.sockets.sockets.get(candidate.socketId);
    if (!partnerSocket || !candidate.user.isVerified) {
      await prisma.matchQueue.deleteMany({ where: { id: candidate.id } });
      continue;
    }

    const session = await prisma.$transaction(async (tx) => {
      await tx.matchQueue.deleteMany({
        where: { userId: { in: [user.id, candidate.userId] } },
      });

      return tx.chatSession.create({
        data: { userAId: candidate.userId, userBId: user.id },
        include: {
          userA: { select: { anonHandle: true } },
          userB: { select: { anonHandle: true } },
        },
      });
    });

    socket.join(roomName(session.id));
    partnerSocket.join(roomName(session.id));
    socket.emit("matched", sessionPayload(session, user.id));
    partnerSocket.emit("matched", sessionPayload(session, candidate.userId));
    return;
  }

  socket.emit("waiting");
}

async function sendMessage(io, socket, payload) {
  const user = socket.data.user;
  const sessionId = typeof payload?.sessionId === "string" ? payload.sessionId : "";
  const content = typeof payload?.content === "string" ? payload.content.trim() : "";

  if (!sessionId || !content) return;

  const session = await prisma.chatSession.findFirst({
    where: {
      id: sessionId,
      isActive: true,
      OR: [{ userAId: user.id }, { userBId: user.id }],
    },
  });

  if (!session) {
    socket.emit("chatEnded", { message: "Chat is no longer active." });
    return;
  }

  const message = await prisma.message.create({
    data: {
      sessionId,
      senderId: user.id,
      content: content.slice(0, MAX_MESSAGE_LENGTH),
    },
  });

  io.to(roomName(sessionId)).emit("receiveMessage", {
    id: message.id,
    sessionId,
    content: message.content,
    senderHandle: user.anonHandle,
    createdAt: message.createdAt.toISOString(),
  });
}

async function endChat(io, socket, sessionId) {
  const user = socket.data.user;
  if (typeof sessionId !== "string" || !sessionId) return;

  const session = await prisma.chatSession.findFirst({
    where: {
      id: sessionId,
      isActive: true,
      OR: [{ userAId: user.id }, { userBId: user.id }],
    },
  });

  if (!session) return;

  await prisma.chatSession.update({
    where: { id: session.id },
    data: { isActive: false, endedAt: new Date() },
  });

  io.to(roomName(session.id)).emit("chatEnded", { message: "Chat ended." });
  io.in(roomName(session.id)).socketsLeave(roomName(session.id));
}

async function endActiveSessionsForUser(io, userId, message) {
  const sessions = await prisma.chatSession.findMany({
    where: {
      isActive: true,
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    select: { id: true },
  });

  if (!sessions.length) return;

  await prisma.chatSession.updateMany({
    where: { id: { in: sessions.map((session) => session.id) } },
    data: { isActive: false, endedAt: new Date() },
  });

  for (const session of sessions) {
    io.to(roomName(session.id)).emit("chatEnded", { message });
    io.in(roomName(session.id)).socketsLeave(roomName(session.id));
  }
}

function sessionPayload(session, currentUserId) {
  const isUserA = session.userAId === currentUserId;
  return {
    sessionId: session.id,
    ownHandle: isUserA ? session.userA.anonHandle : session.userB.anonHandle,
    partnerHandle: isUserA ? session.userB.anonHandle : session.userA.anonHandle,
  };
}

function roomName(sessionId) {
  return `${SOCKET_ROOM_PREFIX}${sessionId}`;
}

function parseCookies(cookieHeader) {
  return cookieHeader.split(";").reduce((cookies, cookie) => {
    const [rawName, ...rest] = cookie.trim().split("=");
    if (!rawName) return cookies;
    cookies[rawName] = decodeURIComponent(rest.join("="));
    return cookies;
  }, {});
}

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}
