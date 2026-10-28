import { describe, expect, test } from "vitest";
import { isPointProtected, projectPublicRoute } from "@/lib/route-privacy";
const raw = [{ latitude: 27.95, longitude: -82.463, elevationMeters: 10 }, { latitude: 27.95, longitude: -82.462, elevationMeters: 11 }, { latitude: 27.95, longitude: -82.46, elevationMeters: 12 }, { latitude: 27.95, longitude: -82.458, elevationMeters: 13 }, { latitude: 27.95, longitude: -82.457, elevationMeters: 14 }] as const;
const zones = [{ centerLatitude: 27.95, centerLongitude: -82.46, radiusMeters: 120 }] as const;
describe("GPS privacy leak repair", () => {
  test("captures vulnerable raw serialization", () => { const response = { kind: "public", points: raw }; expect(response.points.some((p) => isPointProtected(p, zones))).toBe(true); expect(Object.keys(response)).toContain("points"); });
  test("repairs with minimal deterministic segments", () => { const first = { kind: "public", projectionPolicyVersion: "privacy-v1", segments: projectPublicRoute(raw, zones) }; const second = { ...first, segments: projectPublicRoute(raw, zones) }; expect(first).toEqual(second); expect(first.segments).toHaveLength(2); expect(first.segments.flat().some((p) => isPointProtected(p, zones))).toBe(false); expect(JSON.stringify(first)).not.toContain("elevationMeters"); expect(Object.keys(first)).not.toContain("points"); });
});