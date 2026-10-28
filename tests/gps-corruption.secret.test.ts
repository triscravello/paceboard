import { describe, expect, test } from "vitest";
import { deriveNaiveMetrics, parseGpxTrack, processTrack } from "@/lib/gps-pipeline";
import { buildGpx, referencePoints } from "@/tests/fixtures/gpx";
describe("corrupted GPS repair", () => {
  test("captures naive failure and deterministic gps-v1 repair", () => {
    const corrupted = [...referencePoints.slice(0, 3), { latitude: 35, longitude: -100, elevation: 12, timestamp: new Date(Date.UTC(2026, 9, 27, 10, 3)).toISOString() }, ...referencePoints.slice(3).map((point, index) => index === 2 ? { ...point, timestamp: referencePoints[4].timestamp } : index === 4 ? { latitude: point.latitude, longitude: point.longitude, elevation: point.elevation } : index === 5 ? { latitude: point.latitude, longitude: point.longitude, timestamp: point.timestamp } : point)];
    const parsed = parseGpxTrack(buildGpx(corrupted, "Corrupted Reference Run")); if (!parsed.ok) throw new Error(parsed.reason);
    const naive = deriveNaiveMetrics(parsed.rawPoints);
    const first = processTrack(parsed.rawPoints); if (!first.ok) throw new Error(first.reason);
    const second = processTrack(parsed.rawPoints);
    expect(naive.distanceMeters).toBeGreaterThan(first.metrics.routeDistanceMeters * 100);
    expect(first.warnings.map((warning) => warning.code)).toEqual(expect.arrayContaining(["IMPOSSIBLE_JUMP", "DUPLICATE_TIMESTAMP", "MISSING_TIMESTAMP", "MISSING_ELEVATION"]));
    expect(first.warnings).toEqual(expect.arrayContaining([
      { code: "IMPOSSIBLE_JUMP", sourceIndex: 3 },
      { code: "DUPLICATE_TIMESTAMP", sourceIndex: 6 },
      { code: "MISSING_TIMESTAMP", sourceIndex: 8 },
      { code: "MISSING_ELEVATION", sourceIndex: 9 },
    ]));
    expect(Math.abs(first.metrics.routeDistanceMeters - 900)).toBeLessThan(15);
    expect(first.acceptedPoints).toHaveLength(corrupted.length - 1);
    expect(first.metrics.elapsedSeconds).toBeLessThan(540);
    expect(second).toEqual(first);
  });
});