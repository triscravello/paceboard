import { getRouteForViewer } from "@/lib/route-access-service";
import { getCurrentViewer } from "@/lib/session";
const headers = { "Cache-Control": "no-store" } as const;
export async function GET(_request: Request, { params }: { params: Promise<{ activityId: string }> }): Promise<Response> {
  const { activityId } = await params; const viewer = await getCurrentViewer();
  const result = await getRouteForViewer(activityId, viewer?.id ?? null);
  return result.ok ? Response.json(result.dto, { headers }) : Response.json({ error: "not_found" }, { status: 404, headers });
}