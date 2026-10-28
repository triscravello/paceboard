import { prisma } from "@/lib/prisma";
import { getCurrentViewer } from "@/lib/session";
const back = (r: Request, s: string) => Response.redirect(new URL(`/privacy?status=${s}`, r.url), 303);
export async function POST(request: Request, { params }: { params: Promise<{ activityId: string }> }): Promise<Response> {
  const viewer = await getCurrentViewer(); if (!viewer) return back(request, "unauthorized");
  const { activityId } = await params; let data: FormData; try { data = await request.formData(); } catch { return back(request, "invalid_visibility"); }
  const visibility = data.get("visibility"); if (visibility !== "PRIVATE" && visibility !== "PUBLIC") return back(request, "invalid_visibility");
  const updated = await prisma.activity.updateMany({ where: { id: activityId, ownerId: viewer.id }, data: { visibility } });
  return back(request, updated.count === 1 ? "visibility_updated" : "not_found");
}