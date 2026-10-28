import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
function sessionCookieName(): string { return process.env.NODE_ENV === "production" ? "__Host-paceboard_session" : "paceboard_session"; }
function tokenVerifier(token: string): string { return createHash("sha256").update(token).digest("hex"); }
export async function startSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({ data: { id: tokenVerifier(token), userId, expiresAt } });
  return { token, expiresAt };
}
export async function getSessionUser(token: string | null) {
  if (!token) return null;
  const session = await prisma.session.findUnique({ where: { id: tokenVerifier(token) }, include: { user: { select: { id: true, name: true } } } });
  if (!session) return null;
  if (session.expiresAt <= new Date()) { await prisma.session.deleteMany({ where: { id: session.id } }); return null; }
  return session.user;
}

export async function setSessionCookie(token: string, expiresAt: Date): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName(), token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: expiresAt });
}
export async function getCurrentViewer() {
  const cookieStore = await cookies();
  return getSessionUser(cookieStore.get(sessionCookieName())?.value ?? null);
}
export async function destroyCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName())?.value ?? null;
  if (token) await prisma.session.deleteMany({ where: { id: tokenVerifier(token) } });
  cookieStore.delete(sessionCookieName());
}
export async function destroySession(token: string): Promise<void> {
  await prisma.session.deleteMany({ where: { id: tokenVerifier(token) } });
}