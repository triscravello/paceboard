import { GPS_POLICY_V1 } from "@/lib/gps-pipeline";
import { importGpxActivity } from "@/lib/gps-import-service";
import { getCurrentViewer } from "@/lib/session";
function redirect(request: Request, status: string): Response { return Response.redirect(new URL(`/?gpx=${status}`, request.url), 303); }
export async function POST(request: Request): Promise<Response> {
  const viewer = await getCurrentViewer();
  if (!viewer) return redirect(request, "unauthorized");
  let formData: FormData;
  try { formData = await request.formData(); } catch { return redirect(request, "invalid_file"); }
  const value = formData.get("gpx");
  if (!(value instanceof File) || value.size <= 0 || !value.name.toLowerCase().endsWith(".gpx")) return redirect(request, "invalid_file");
  if (value.size > GPS_POLICY_V1.maxFileBytes) return redirect(request, "file_too_large");
  const result = await importGpxActivity(viewer.id, { name: value.name, size: value.size, text: await value.text() });
  return redirect(request, result.ok ? "imported" : result.reason);
}