import { beforeEach, describe, expect, test } from "vitest";
import { createActivity } from "@/lib/activity-service";
import { registerUser } from "@/lib/auth-service";
import { giveKudos, removeKudos } from "@/lib/kudos-service";
import { prisma } from "@/lib/prisma";
const activityInput = { title: "Race Probe", activityType: "RUN", distanceMiles: 5, durationSeconds: 2500, elevationGainFeet: 50, recordedAt: "2026-10-26T10:00" };
async function user(email: string) { const result = await registerUser({ name: "Runner", email, password: "correct-horse-12" }); if (!result.ok) throw new Error(result.reason); return result.user; }
beforeEach(async () => { await prisma.user.deleteMany(); });
describe("idempotent Kudos race", () => {
  test("returns predictable concurrent outcomes and repeatable removal", async () => {
    const owner = await user("secret-owner@example.com");
    const fan = await user("secret-fan@example.com");
    const activity = await createActivity(owner.id, activityInput);
    if (!activity.ok) throw new Error(activity.reason);
    const [first, second] = await Promise.all([giveKudos(fan.id, activity.id), giveKudos(fan.id, activity.id)]);
    expect([first.created, second.created].sort()).toEqual([false, true]);
    expect(first.count).toBe(1);
    expect(second.count).toBe(1);
    expect(await prisma.kudos.count({ where: { activityId: activity.id } })).toBe(1);
    expect((await giveKudos(fan.id, activity.id)).count).toBe(1);
    expect((await removeKudos(fan.id, activity.id)).count).toBe(0);
    expect((await removeKudos(fan.id, activity.id)).count).toBe(0);
  });
});