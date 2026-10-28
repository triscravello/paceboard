import { beforeEach, describe, expect, test } from "vitest";
import { importGpxActivity } from "@/lib/gps-import-service";
import { prisma } from "@/lib/prisma";
import { validGpx } from "@/tests/fixtures/gpx";
const upload = { name: "reference.gpx", size: Buffer.byteLength(validGpx), text: validGpx };
async function user() { return prisma.user.create({ data: { name: "GPS Runner", email: "gps@example.com", passwordHash: "integration-test-only" } }); }
beforeEach(async () => { await prisma.user.deleteMany(); });
describe("GPS import persistence", () => {
  test("creates one owned activity and route atomically", async () => {
    const owner = await user();
    const result = await importGpxActivity(owner.id, upload); if (!result.ok) throw new Error(result.reason);
    const activity = await prisma.activity.findUnique({ where: { id: result.activityId }, include: { gpsRoute: true } });
    expect(activity?.ownerId).toBe(owner.id);
    expect(activity?.elapsedSeconds).toBe(540);
    expect(activity?.gpsRoute?.policyVersion).toBe("gps-v1");
    expect(activity?.gpsRoute?.sourcePointCount).toBe(10);
    expect(activity?.gpsRoute?.acceptedPointCount).toBe(10);
    expect(Array.isArray(activity?.gpsRoute?.points)).toBe(true);
  });
  test("blocks unauthenticated and malformed imports without partial rows", async () => {
    expect(await importGpxActivity(null, upload)).toEqual({ ok: false, reason: "unauthorized" });
    const owner = await user();
    expect((await importGpxActivity(owner.id, { name: "broken.gpx", size: 5, text: "<gpx>" })).ok).toBe(false);
    expect(await prisma.activity.count()).toBe(0);
    expect(await prisma.gpsRoute.count()).toBe(0);
  });
});