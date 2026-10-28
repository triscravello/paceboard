"use server";
import { redirect } from "next/navigation";
import { authenticateUser, registerUser } from "@/lib/auth-service";
import { destroyCurrentSession, setSessionCookie, startSession } from "@/lib/session";
export async function registerAction(formData: FormData): Promise<never> {
  const result = await registerUser({ name: formData.get("name"), email: formData.get("email"), password: formData.get("password") });
  if (!result.ok) redirect(`/register?error=${result.reason}`);
  const session = await startSession(result.user.id);
  await setSessionCookie(session.token, session.expiresAt);
  redirect("/");
}
export async function loginAction(formData: FormData): Promise<never> {
  const result = await authenticateUser({ email: formData.get("email"), password: formData.get("password") });
  if (!result.ok) redirect("/login?error=credentials");
  const session = await startSession(result.user.id);
  await setSessionCookie(session.token, session.expiresAt);
  redirect("/");
}
export async function logoutAction(): Promise<never> { await destroyCurrentSession(); redirect("/login"); }