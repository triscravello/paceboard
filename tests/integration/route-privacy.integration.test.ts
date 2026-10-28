import { beforeEach, describe, expect, test } from "vitest";
import { prisma } from "@/lib/prisma";
import { getRouteForViewer } from "@/lib/route-access-service";
const points = [{ latitude: 27.95, longitude: -82.463 }, { latitude: 27.95, longitude: -82.462 }, { latitude: 27.95, longitude: -82.46 }, { latitude: 27.95, longitude: -82.458 }, { latitude: 27.95, longitude: -82.457 }];
beforeEach(async () => { await prisma.user.deleteMany(); });
async function seed() {
  const owner = await prisma.user.create({ data: { name: "Owner", email: "owner-privacy@example.com", passwordHash: "test" } }); const viewer = await prisma.user.create({ data: { name: "Viewer", email: "viewer-privacy@example.com", passwordHash: "test" } });
  await prisma.privacyZone.create({ data: { ownerId: owner.id, label: "Synthetic home", centerLatitude: 27.95, centerLongitude: -82.46, radiusMeters: 120 } });
  const activity = await prisma.activity.create({ data: { ownerId: owner.id, type: "RUN", visibility: "PRIVATE", title: "Fixture", distanceHundredthsMiles: 60, elapsedSeconds: 240, elevationGainFeet: 12, recordedAt: new Date("2026-10-27T10:00:00Z"), gpsRoute: { create: { policyVersion: "gps-v1", sourcePointCount: 5, acceptedPointCount: 5, routeDistanceMeters: 400, points, warnings: [] } } } }); return { owner, viewer, activity };
}
describe("route access", () => {
  test("owner gets full route and stranger is denied while private", async () => { const { owner, viewer, activity } = await seed(); const own = await getRouteForViewer(activity.id, owner.id); expect(own.ok && own.dto.kind).toBe("private"); expect(await getRouteForViewer(activity.id, viewer.id)).toEqual({ ok: false, status: 404 }); });
  test("public DTO is minimal, deterministic, and visibility-fresh", async () => { const { viewer, activity } = await seed(); await prisma.activity.update({ where: { id: activity.id }, data: { visibility: "PUBLIC" } }); const first = await getRouteForViewer(activity.id, viewer.id); expect(first).toEqual(await getRouteForViewer(activity.id, viewer.id)); if (!first.ok || first.dto.kind !== "public") throw new Error(); expect(Object.keys(first.dto).sort()).toEqual(["activityId", "kind", "projectionPolicyVersion", "segments"]); await prisma.activity.update({ where: { id: activity.id }, data: { visibility: "PRIVATE" } }); expect(await getRouteForViewer(activity.id, viewer.id)).toEqual({ ok: false, status: 404 }); });
});