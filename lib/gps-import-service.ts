import { prisma } from "@/lib/prisma";
import { GPS_POLICY_V1, parseGpxTrack, processTrack } from "@/lib/gps-pipeline";
const METERS_PER_MILE = 1609.344;
const METERS_PER_FOOT = 0.3048;
export interface GpxUpload { readonly name: string; readonly size: number; readonly text: string }
export type ImportResult = { readonly ok: true; readonly activityId: string } | { readonly ok: false; readonly reason: "unauthorized" | "invalid_file" | "file_too_large" | "invalid_gpx" | "insufficient_track" | "database_error" };

export async function importGpxActivity(userId: string | null, upload: GpxUpload): Promise<ImportResult> {
  if (!userId) return { ok: false, reason: "unauthorized" };
  if (!upload.name.toLowerCase().endsWith(".gpx") || upload.size <= 0) return { ok: false, reason: "invalid_file" };
  if (upload.size > GPS_POLICY_V1.maxFileBytes) return { ok: false, reason: "file_too_large" };
  const parsed = parseGpxTrack(upload.text);
  if (!parsed.ok) return { ok: false, reason: "invalid_gpx" };
  const processed = processTrack(parsed.rawPoints);
  if (!processed.ok) return { ok: false, reason: "insufficient_track" };
  const points = processed.acceptedPoints.map((point) => ({ latitude: point.latitude, longitude: point.longitude, elevationMeters: point.elevationMeters, timestamp: point.timestampMs === null ? null : new Date(point.timestampMs).toISOString() }));
  const warnings = processed.warnings.map((warning) => ({ code: warning.code, sourceIndex: warning.sourceIndex }));
  try {
    const activity = await prisma.activity.create({
      data: {
        ownerId: userId,
        type: "RUN",
        title: parsed.title.slice(0, 100),
        distanceHundredthsMiles: Math.max(1, Math.round((processed.metrics.timedDistanceMeters / METERS_PER_MILE) * 100)),
        elapsedSeconds: processed.metrics.elapsedSeconds,
        elevationGainFeet: Math.round(processed.metrics.elevationGainMeters / METERS_PER_FOOT),
        recordedAt: processed.metrics.recordedAt,
        gpsRoute: { create: { policyVersion: GPS_POLICY_V1.version, sourcePointCount: parsed.rawPoints.length, acceptedPointCount: processed.acceptedPoints.length, routeDistanceMeters: Math.round(processed.metrics.routeDistanceMeters), points, warnings } },
      },
      select: { id: true },
    });
    return { ok: true, activityId: activity.id };
  } catch {
    return { ok: false, reason: "database_error" };
  }
}