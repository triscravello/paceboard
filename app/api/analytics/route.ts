import { getTrainingAnalytics } from "@/lib/analytics-service";
import { parseAnalyticsSelection } from "@/lib/training-analytics";
import { getCurrentViewer } from "@/lib/session";

const headers = { "Cache-Control": "private, no-store" } as const;

export async function GET(request: Request): Promise<Response> {
  const selection = parseAnalyticsSelection(new URL(request.url).searchParams);
  if (!selection) return Response.json({ error: "invalid_query" }, { status: 400, headers });
  const viewer = await getCurrentViewer();
  const result = await getTrainingAnalytics(viewer?.id ?? null, selection);
  return result.ok
    ? Response.json(result.dto, { headers })
    : Response.json({ error: result.error }, { status: result.status, headers });
}
