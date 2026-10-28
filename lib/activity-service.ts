import * as z from "zod";
import { prisma } from "@/lib/prisma";
const activitySchema = z.object({
  title: z.string().trim().min(1).max(100),
  activityType: z.enum(["RUN", "RIDE", "WALK"]),
  distanceMiles: z.coerce.number().min(0.01).max(1000),
  durationSeconds: z.coerce.number().int().min(1).max(604800),
  elevationGainFeet: z.coerce.number().int().min(0).max(100000),
  recordedAt: z.string().min(1),
});
export type MutationResult = { readonly ok: true; readonly id: string } | { readonly ok: false; readonly reason: "unauthorized" | "forbidden" | "invalid" | "database_error" };
function parseActivity(input: unknown) {
  const parsed = activitySchema.safeParse(input);
  if (!parsed.success) return null;
  const recordedAt = new Date(parsed.data.recordedAt);
  if (Number.isNaN(recordedAt.getTime())) return null;
  return { title: parsed.data.title, type: parsed.data.activityType, distanceHundredthsMiles: Math.round(parsed.data.distanceMiles * 100), elapsedSeconds: parsed.data.durationSeconds, elevationGainFeet: parsed.data.elevationGainFeet, recordedAt };
}

export async function createActivity(userId: string | null, input: unknown): Promise<MutationResult> {
  if (!userId) return { ok: false, reason: "unauthorized" };
  const data = parseActivity(input);
  if (!data) return { ok: false, reason: "invalid" };
  try { const activity = await prisma.activity.create({ data: { ...data, ownerId: userId }, select: { id: true } }); return { ok: true, id: activity.id }; }
  catch { return { ok: false, reason: "database_error" }; }
}
export async function updateActivity(userId: string | null, activityId: string, input: unknown): Promise<MutationResult> {
  if (!userId) return { ok: false, reason: "unauthorized" };
  const data = parseActivity(input);
  if (!data || !activityId) return { ok: false, reason: "invalid" };
  try { const result = await prisma.activity.updateMany({ where: { id: activityId, ownerId: userId }, data }); return result.count === 1 ? { ok: true, id: activityId } : { ok: false, reason: "forbidden" }; }
  catch { return { ok: false, reason: "database_error" }; }
}
export async function deleteActivity(userId: string | null, activityId: string): Promise<MutationResult> {
  if (!userId) return { ok: false, reason: "unauthorized" };
  try { const result = await prisma.activity.deleteMany({ where: { id: activityId, ownerId: userId } }); return result.count === 1 ? { ok: true, id: activityId } : { ok: false, reason: "forbidden" }; }
  catch { return { ok: false, reason: "database_error" }; }
}