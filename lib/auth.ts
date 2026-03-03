import { and, eq, gt } from "drizzle-orm";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { otpCodes, sessions, userRoles, users } from "@/db/schema";

const OTP_EXPIRE_MINUTES = Number(process.env.OTP_EXPIRE_MINUTES || "10");
const SESSION_TTL_DAYS = Number(process.env.SESSION_TTL_DAYS || "14");
export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "sobatmasjid_session";

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function generateOtpCode() {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
}

export function makeCookie(token: string, expiresAt: Date) {
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}`;
}

export function parseCookie(cookieHeader?: string | null) {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((part) => part.trim());
  const cookie = parts.find((item) => item.startsWith(`${SESSION_COOKIE_NAME}=`));
  if (!cookie) return null;
  return cookie.split("=").slice(1).join("=");
}

async function sendOtpEmail(email: string, code: string) {
  const sender = process.env.OTP_SENDER_EMAIL || "no-reply@sobatmasjid.id";
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpPort = Number(process.env.SMTP_PORT || "587");
  const smtpSecure = (process.env.SMTP_SECURE || "false") === "true";

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log(`[OTP DEV] ${email}: ${code}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail({
    from: sender,
    to: email,
    subject: "Kode OTP SobatMasjid",
    text: `Kode OTP Anda: ${code}. Berlaku ${OTP_EXPIRE_MINUTES} menit.`,
  });
}

export async function requestOtp(email: string) {
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRE_MINUTES * 60_000);

  await db.insert(otpCodes).values({
    email,
    codeHash: sha256(code),
    expiresAt,
  });

  await sendOtpEmail(email, code);
  return code;
}

export async function upsertUserByEmail(email: string, name?: string) {
  const current = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (current) return current;

  const id = randomUUID();
  await db.insert(users).values({
    id,
    email,
    name: name || email.split("@")[0],
    primaryRole: "volunteer",
    activeRole: "volunteer",
  });

  await db.insert(userRoles).values({ userId: id, role: "volunteer" });
  const created = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!created) throw new Error("Failed creating user");
  return created;
}

export async function verifyOtpAndCreateSession(email: string, code: string) {
  const now = new Date();
  const otp = await db.query.otpCodes.findFirst({
    where: and(eq(otpCodes.email, email), gt(otpCodes.expiresAt, now)),
    orderBy: (table, { desc }) => [desc(table.createdAt)],
  });

  if (!otp || otp.usedAt) return null;
  if (otp.codeHash !== sha256(code)) return null;

  await db.update(otpCodes).set({ usedAt: now }).where(eq(otpCodes.id, otp.id));

  const user = await upsertUserByEmail(email);
  const plainToken = randomBytes(32).toString("hex");
  const tokenHash = sha256(plainToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(sessions).values({
    id: tokenHash,
    userId: user.id,
    expiresAt,
  });

  return { user, plainToken, expiresAt };
}

export async function getSessionUserFromCookie(cookieHeader?: string | null) {
  const token = parseCookie(cookieHeader);
  if (!token) return null;
  const tokenHash = sha256(token);

  const session = await db.query.sessions.findFirst({
    where: and(eq(sessions.id, tokenHash), gt(sessions.expiresAt, new Date())),
  });
  if (!session) return null;

  return db.query.users.findFirst({ where: eq(users.id, session.userId) });
}
