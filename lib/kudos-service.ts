import { prisma } from "@/lib/prisma";
export interface KudosResult { readonly ok: true; readonly created?: boolean; readonly removed?: boolean; readonly count: number }
// Check-then-insert baseline kept to demonstrate the race the database constraint catches. Not for production use; call giveKudos.
export async function giveKudosNaive(userId: string, activityId: string, afterCheck?: () => Promise<void>): Promise<KudosResult> {
  const existing = await prisma.kudos.findUnique({ where: { oneKudosPerUserActivity: { userId, activityId } } });
  await afterCheck?.();
  if (!existing) await prisma.kudos.create({ data: { userId, activityId } });
  return { ok: true, created: !existing, count: await prisma.kudos.count({ where: { activityId } }) };
}
export async function giveKudos(userId: string, activityId: string): Promise<KudosResult> {
  const inserted = await prisma.kudos.createMany({ data: [{ userId, activityId }], skipDuplicates: true });
  return { ok: true, created: inserted.count === 1, count: await prisma.kudos.count({ where: { activityId } }) };
}
export async function removeKudos(userId: string, activityId: string): Promise<KudosResult> {
  const removed = await prisma.kudos.deleteMany({ where: { userId, activityId } });
  return { ok: true, removed: removed.count === 1, count: await prisma.kudos.count({ where: { activityId } }) };
}