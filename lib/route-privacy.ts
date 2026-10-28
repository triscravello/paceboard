import { haversineMeters } from "@/lib/gps-pipeline";
import type { PrivateRoutePoint, PublicRoutePoint } from "@/types/route-privacy";
export const PRIVACY_POLICY_V1 = { version: "privacy-v1", minRadiusMeters: 50, maxRadiusMeters: 1_000, maxZonesPerUser: 10, maxLabelLength: 60 } as const;
export interface PrivacyZoneProjection { readonly centerLatitude: number; readonly centerLongitude: number; readonly radiusMeters: number }
export function parseStoredRoutePoints(value: unknown): readonly PrivateRoutePoint[] | null {
  if (!Array.isArray(value)) return null;
  const points: PrivateRoutePoint[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) return null;
    const r = item as Record<string, unknown>;
    if (typeof r.latitude !== "number" || !Number.isFinite(r.latitude) || typeof r.longitude !== "number" || !Number.isFinite(r.longitude)) return null;
    if (r.latitude < -90 || r.latitude > 90 || r.longitude < -180 || r.longitude >= 180) return null;
    points.push({ latitude: r.latitude, longitude: r.longitude, elevationMeters: typeof r.elevationMeters === "number" && Number.isFinite(r.elevationMeters) ? r.elevationMeters : null, timestamp: typeof r.timestamp === "string" ? r.timestamp : null });
  }
  return points.length >= 2 ? points : null;
}
export function isPointProtected(point: PublicRoutePoint, zones: readonly PrivacyZoneProjection[]): boolean {
  return zones.some((z) => haversineMeters(point, { latitude: z.centerLatitude, longitude: z.centerLongitude }) <= z.radiusMeters);
}
export function projectPublicRoute(points: readonly PublicRoutePoint[], zones: readonly PrivacyZoneProjection[]): readonly (readonly PublicRoutePoint[])[] {
  const segments: PublicRoutePoint[][] = []; let current: PublicRoutePoint[] = [];
  const flush = () => { if (current.length >= 2) segments.push(current); current = []; };
  for (const p of points) { if (isPointProtected(p, zones)) flush(); else current.push({ latitude: p.latitude, longitude: p.longitude }); }
  flush(); return segments;
}