import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
const emailSchema = z.string().trim().toLowerCase().pipe(z.email());
const passwordSchema = z.string().min(12).max(128);
const registrationSchema = z.object({ name: z.string().trim().min(2).max(80), email: emailSchema, password: passwordSchema });
const loginSchema = z.object({ email: emailSchema, password: passwordSchema });
export type AuthResult = { readonly ok: true; readonly user: { readonly id: string; readonly name: string } } | { readonly ok: false; readonly reason: "invalid" | "unavailable" | "credentials" | "database_error" };
export async function registerUser(input: unknown): Promise<AuthResult> {
  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid" };
  try {
    if (await prisma.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } })) return { ok: false, reason: "unavailable" };
    const user = await prisma.user.create({ data: { name: parsed.data.name, email: parsed.data.email, passwordHash: await hashPassword(parsed.data.password) }, select: { id: true, name: true } });
    return { ok: true, user };
  } catch { return { ok: false, reason: "database_error" }; }
}
export async function authenticateUser(input: unknown): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "credentials" };
  try {
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!user) { await hashPassword(parsed.data.password); return { ok: false, reason: "credentials" }; }
    return await verifyPassword(parsed.data.password, user.passwordHash)
      ? { ok: true, user: { id: user.id, name: user.name } }
      : { ok: false, reason: "credentials" };
  } catch { return { ok: false, reason: "database_error" }; }
}