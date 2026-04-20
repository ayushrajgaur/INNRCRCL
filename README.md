# GLA Whisper — Phase 1 MVP

> Anonymous campus voice platform, exclusively for GLA University students.

---

## 1. Folder Structure

```
gla-whisper/
├── prisma/
│   └── schema.prisma            # User + EmailVerificationOTP models
│
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout (fonts, metadata)
│   │   ├── globals.css          # Tailwind + custom CSS variables & animations
│   │   ├── page.tsx             # Landing page
│   │   │
│   │   ├── (auth)/              # Route group — no extra URL segment
│   │   │   ├── layout.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx     # Signup form
│   │   │   ├── verify-otp/
│   │   │   │   └── page.tsx     # 6-digit OTP entry
│   │   │   └── login/
│   │   │       └── page.tsx     # Login form
│   │   │
│   │   ├── dashboard/
│   │   │   ├── page.tsx         # Server component — auth gate
│   │   │   └── DashboardClient.tsx  # Client component — feed UI
│   │   │
│   │   └── api/auth/
│   │       ├── signup/route.ts      # POST /api/auth/signup
│   │       ├── verify-otp/route.ts  # POST /api/auth/verify-otp
│   │       ├── login/route.ts       # POST /api/auth/login
│   │       ├── me/route.ts          # GET  /api/auth/me
│   │       └── logout/route.ts      # POST /api/auth/logout
│   │
│   ├── components/
│   │   ├── AuthCard.tsx         # Shared auth page wrapper
│   │   └── ui/
│   │       ├── Button.tsx       # Primary / ghost button
│   │       └── Input.tsx        # Labelled input with error state
│   │
│   └── lib/
│       ├── prisma.ts            # Singleton Prisma client
│       ├── jwt.ts               # sign / verify JWT
│       ├── mail.ts              # Nodemailer — send OTP email
│       └── auth.ts              # Cookie helpers, OTP generator, handle generator
│
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
└── package.json
```

---

## 2. Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18.17 |
| npm / pnpm / yarn | any recent |
| PostgreSQL | ≥ 14 |

---

## 3. Quick Start

### Step 1 — Clone / create project

```bash
# If scaffolding fresh:
npx create-next-app@14 gla-whisper --typescript --tailwind --app --src-dir --import-alias "@/*"
cd gla-whisper

# Then copy all files from this repo into the project,
# replacing the generated ones.
```

### Step 2 — Install dependencies

```bash
npm install @prisma/client bcrypt jsonwebtoken nodemailer
npm install -D prisma @types/bcrypt @types/jsonwebtoken @types/nodemailer
```

### Step 3 — Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/glachat?schema=public"
JWT_SECRET="your-64-char-random-secret"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-gmail@gmail.com"
SMTP_PASS="your-16-char-app-password"   # Gmail → Security → App Passwords
SMTP_FROM="GLA Whisper <no-reply@gla.ac.in>"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> **Gmail App Password**: Go to `myaccount.google.com` → Security → 2-Step Verification → App Passwords → generate one for "Mail".

### Step 4 — Create the database

```bash
# Create the database in psql
psql -U postgres -c "CREATE DATABASE glachat;"
```

### Step 5 — Run Prisma migrations

```bash
npx prisma generate          # generates the Prisma Client
npx prisma migrate dev --name init   # runs migration + creates tables
```

To inspect the database visually:
```bash
npx prisma studio
```

### Step 6 — Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 4. API Reference

### `POST /api/auth/signup`
```json
// Request
{ "email": "student@gla.ac.in", "password": "secure123" }

// 201 Success
{ "message": "OTP sent. Please check your GLA email inbox." }

// 403 Wrong domain
{ "error": "Only @gla.ac.in email addresses are allowed." }

// 409 Already exists
{ "error": "An account with this email already exists." }
```

---

### `POST /api/auth/verify-otp`
```json
// Request
{ "email": "student@gla.ac.in", "otp": "839271" }

// 200 Success
{ "message": "Email verified successfully. You can now log in." }

// 400 Expired
{ "error": "OTP has expired. Please request a new one." }

// 400 Wrong OTP
{ "error": "Invalid OTP. Please try again." }
```

---

### `POST /api/auth/login`
```json
// Request
{ "email": "student@gla.ac.in", "password": "secure123" }

// 200 Success — sets HttpOnly cookie "gla_whisper_token"
{ "message": "Logged in successfully.", "user": { "anonHandle": "ghost#4821" } }

// 403 Not verified
{ "error": "Email not verified. Please complete OTP verification first." }

// 401 Bad credentials
{ "error": "Invalid credentials." }
```

---

### `GET /api/auth/me`
```
// Requires cookie: gla_whisper_token

// 200 Success
{
  "user": {
    "id": "clxxxxx",
    "email": "student@gla.ac.in",
    "anonHandle": "ghost#4821",
    "isVerified": true,
    "createdAt": "2024-..."
  }
}

// 401 Not authenticated
{ "error": "Unauthorized." }
```

---

### `POST /api/auth/logout`
```
// Clears the cookie

// 200 Success
{ "message": "Logged out." }
```

---

## 5. Security Notes

- Passwords are hashed with **bcrypt** (12 salt rounds)
- OTPs are hashed with **bcrypt** (10 rounds) before storing
- OTPs **expire in 10 minutes** and are **single-use** — marked `usedAt` immediately on verification
- Auth tokens are **HttpOnly cookies** — inaccessible to JavaScript
- Cookies are **Secure** in production and use **SameSite=Lax**
- Login error messages are intentionally generic to prevent **user enumeration**
- Signup is hard-gated to `@gla.ac.in` domain at both frontend and backend

---

## 6. Useful Scripts

```bash
npm run dev           # Start dev server
npm run build         # Production build
npm run db:migrate    # Apply new migrations
npm run db:studio     # Open Prisma Studio GUI
npm run db:push       # Push schema without migration (prototyping)
```

---

## 7. Phase 2 Roadmap

- [ ] Anonymous post feed (stored in DB)
- [ ] Nested replies
- [ ] Emoji reactions
- [ ] Topic rooms / channels
- [ ] Rate limiting (Upstash Redis)
- [ ] Report / moderation system
- [ ] Socket.io for real-time feed
