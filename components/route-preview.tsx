import { ActivityMap } from "@/components/activity-map";
import type { RouteGeometry } from "@/types/activity";
export function RoutePreview({ title, route }: { readonly title: string; readonly route: RouteGeometry }) {
  if (route.gpsActivityId) return <ActivityMap title={title} activityId={route.gpsActivityId} />;
  return <svg className="min-h-36 w-full rounded-2xl bg-slate-100" viewBox="0 0 220 96" role="img" aria-label={`${title} route preview`}><title>{title} route preview</title><path d={route.path} fill="none" stroke="rgb(203 213 225)" strokeWidth="10" /><path d={route.path} fill="none" stroke="rgb(15 118 110)" strokeWidth="5" /><circle cx={route.start.x} cy={route.start.y} r="5" /><circle cx={route.finish.x} cy={route.finish.y} r="5" /></svg>;
}
