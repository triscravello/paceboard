import { prisma } from "@/lib/prisma";
import { parseStoredRoutePoints, PRIVACY_POLICY_V1, projectPublicRoute } from "@/lib/route-privacy";
import type { AuthorizedRouteDto } from "@/types/route-privacy";
export type RouteAccessResult = { readonly ok: true; readonly dto: AuthorizedRouteDto } | { readonly ok: false; readonly status: 404 };
export async function getRouteForViewer(activityId: string, viewerId: string | null): Promise<RouteAccessResult> {
  const a = await prisma.activity.findUnique({ where: { id: activityId }, select: { id: true, ownerId: true, visibility: true, gpsRoute: { select: { policyVersion: true, points: true, warnings: true } }, owner: { select: { privacyZones: { select: { centerLatitude: true, centerLongitude: true, radiusMeters: true }, orderBy: { createdAt: "asc" } } } } } });
  if (!a?.gpsRoute) return { ok: false, status: 404 };
  const points = parseStoredRoutePoints(a.gpsRoute.points); if (!points) return { ok: false, status: 404 };
  if (viewerId === a.ownerId) return { ok: true, dto: { kind: "private", activityId: a.id, routePolicyVersion: a.gpsRoute.policyVersion, points, warnings: Array.isArray(a.gpsRoute.warnings) ? a.gpsRoute.warnings : [] } };
  if (a.visibility !== "PUBLIC") return { ok: false, status: 404 };
  return { ok: true, dto: { kind: "public", activityId: a.id, projectionPolicyVersion: PRIVACY_POLICY_V1.version, segments: projectPublicRoute(points, a.owner.privacyZones) } };
}