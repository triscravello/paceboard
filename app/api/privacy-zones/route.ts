import { prisma } from "@/lib/prisma";
import { PRIVACY_POLICY_V1 } from "@/lib/route-privacy";
import { getCurrentViewer } from "@/lib/session";
const back = (r: Request, s: string) => Response.redirect(new URL(`/privacy?status=${s}`, r.url), 303);
const finite = (v: FormDataEntryValue | null) => { if (typeof v !== "string" || !v.trim()) return null; const n = Number(v); return Number.isFinite(n) ? n : null; };
export async function POST(request: Request): Promise<Response> {
  const viewer = await getCurrentViewer(); if (!viewer) return back(request, "unauthorized");
  let data: FormData; try { data = await request.formData(); } catch { return back(request, "invalid_zone"); }
  if (data.get("action") === "delete") { const id = data.get("zoneId"); if (typeof id !== "string") return back(request, "invalid_zone"); await prisma.privacyZone.deleteMany({ where: { id, ownerId: viewer.id } }); return back(request, "zone_deleted"); }
  const label = typeof data.get("label") === "string" ? String(data.get("label")).trim() : "";
  const lat = finite(data.get("centerLatitude")), lon = finite(data.get("centerLongitude")), radius = finite(data.get("radiusMeters"));
  const count = await prisma.privacyZone.count({ where: { ownerId: viewer.id } });
  const valid = label.length > 0 && label.length <= PRIVACY_POLICY_V1.maxLabelLength && lat !== null && lat >= -90 && lat <= 90 && lon !== null && lon >= -180 && lon < 180 && radius !== null && Number.isInteger(radius) && radius >= PRIVACY_POLICY_V1.minRadiusMeters && radius <= PRIVACY_POLICY_V1.maxRadiusMeters && count < PRIVACY_POLICY_V1.maxZonesPerUser;
  if (!valid) return back(request, "invalid_zone");
  await prisma.privacyZone.create({ data: { ownerId: viewer.id, label, centerLatitude: lat, centerLongitude: lon, radiusMeters: radius } }); return back(request, "zone_created");
}