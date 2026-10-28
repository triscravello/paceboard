import { describe, expect, test } from "vitest";
import { parseGpxTrack, processTrack } from "@/lib/gps-pipeline";
import { buildGpx, referencePoints, validGpx } from "@/tests/fixtures/gpx";
describe("gps-v1 pipeline", () => {
  test("parses and calculates the known reference route", () => {
    const parsed = parseGpxTrack(validGpx); if (!parsed.ok) throw new Error(parsed.reason);
    const result = processTrack(parsed.rawPoints); if (!result.ok) throw new Error(result.reason);
    expect(parsed.rawPoints).toHaveLength(10);
    expect(Math.abs(result.metrics.routeDistanceMeters - 900)).toBeLessThan(5);
    expect(result.metrics.elapsedSeconds).toBe(540);
    expect(Math.abs(result.metrics.averagePaceSecondsPerMile - 966)).toBeLessThan(3);
    expect(result.metrics.elevationGainMeters).toBe(9);
  });
  test("rejects malformed and unsupported GPX", () => {
    expect(parseGpxTrack("<gpx>").ok).toBe(false);
    expect(parseGpxTrack(validGpx.replace("<trk>", "<rte>").replace("</trk>", "</rte>")).ok).toBe(false);
  });
  test("warns about invalid coordinates and missing values", () => {
    const changed = referencePoints.map((point, index) => index === 3 ? { ...point, latitude: 91 } : index === 5 ? { latitude: point.latitude, longitude: point.longitude } : point);
    const parsed = parseGpxTrack(buildGpx(changed)); if (!parsed.ok) throw new Error(parsed.reason);
    const result = processTrack(parsed.rawPoints); if (!result.ok) throw new Error(result.reason);
    expect(result.warnings.map((warning) => warning.code)).toEqual(expect.arrayContaining(["INVALID_COORDINATE", "MISSING_ELEVATION", "MISSING_TIMESTAMP"]));
  });
  test("reprocesses deterministically", () => {
    const parsed = parseGpxTrack(validGpx); if (!parsed.ok) throw new Error(parsed.reason);
    expect(processTrack(parsed.rawPoints)).toEqual(processTrack(parsed.rawPoints));
  });
});