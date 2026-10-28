import { beforeEach, describe, expect, test } from "vitest";
import { getTrainingAnalytics } from "@/lib/analytics-service";
import { prisma } from "@/lib/prisma";
import type { AnalyticsSelection } from "@/types/training-analytics";

const selection: AnalyticsSelection = { weeks: 4, endDate: "2026-03-15", timeZone: "America/New_York" };

beforeEach(async () => { await prisma.user.deleteMany(); });

describe("training analytics PostgreSQL contract", () => {
  test("is owner-scoped, repeatable, unauthorized without a viewer, and GPS-safe", async () => {
    const owner = await prisma.user.create({ data: { name: "Owner", email: "analytics-owner@example.com", passwordHash: "test" } });
    const other = await prisma.user.create({ data: { name: "Other", email: "analytics-other@example.com", passwordHash: "test" } });
    await prisma.activity.create({ data: {
      ownerId: owner.id, type: "RUN", visibility: "PRIVATE", title: "Private GPS run",
      distanceHundredthsMiles: 500, elapsedSeconds: 2500, elevationGainFeet: 80,
      recordedAt: new Date("2026-03-09T03:30:00Z"),
      gpsRoute: { create: { policyVersion: "gps-v1", sourcePointCount: 2, acceptedPointCount: 2, routeDistanceMeters: 1000, points: [{ latitude: 27.95, longitude: -82.46 }, { latitude: 27.96, longitude: -82.47 }], warnings: [] } },
    } });
    await prisma.activity.create({ data: { ownerId: other.id, type: "RUN", visibility: "PUBLIC", title: "Other run", distanceHundredthsMiles: 900, elapsedSeconds: 4000, elevationGainFeet: 90, recordedAt: new Date("2026-03-10T12:00:00Z") } });

    expect(await getTrainingAnalytics(null, selection)).toEqual({ ok: false, status: 401, error: "unauthorized" });
    const first = await getTrainingAnalytics(owner.id, selection);
    const second = await getTrainingAnalytics(owner.id, selection);
    expect(first).toEqual(second);
    if (!first.ok) throw new Error("owner analytics unavailable");
    expect(first.dto.summary.totalDistanceMiles).toBe(5);
    expect((await getTrainingAnalytics(other.id, selection)).ok).toBe(true);
    const serialized = JSON.stringify(first.dto);
    for (const forbidden of ["points", "gpsRoute", "latitude", "longitude", "privacyZone", "ownerId"]) expect(serialized).not.toContain(forbidden);
    expect(Object.keys(first.dto).sort()).toEqual(["policy", "summary", "weeks"]);
  });
});