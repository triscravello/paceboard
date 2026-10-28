import { describe, expect, test } from "vitest";
import { isPointProtected, projectPublicRoute } from "@/lib/route-privacy";
const points = [{ latitude: 27.95, longitude: -82.463 }, { latitude: 27.95, longitude: -82.462 }, { latitude: 27.95, longitude: -82.4605 }, { latitude: 27.95, longitude: -82.46 }, { latitude: 27.95, longitude: -82.458 }, { latitude: 27.95, longitude: -82.457 }] as const;
const zones = [{ centerLatitude: 27.95, centerLongitude: -82.46, radiusMeters: 120 }] as const;
describe("privacy-v1 projection", () => {
  test("removes protected coordinates and breaks the route", () => { const s = projectPublicRoute(points, zones); expect(s).toHaveLength(2); expect(s.map((x) => x.length)).toEqual([2, 2]); expect(s.flat().some((p) => isPointProtected(p, zones))).toBe(false); });
  test("is deterministic", () => expect(projectPublicRoute(points, zones)).toEqual(projectPublicRoute(points, zones)));
});