// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence specific warnings from bcrypt / nodemailer server-only modules
  serverExternalPackages: ["bcrypt", "nodemailer"],
};

export default nextConfig;
