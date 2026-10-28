import { ActivityCard } from "@/components/activity-card";
import type { Activity } from "@/types/activity";
export function ActivityFeed({ activities, authenticated }: { readonly activities: readonly Activity[]; readonly authenticated: boolean }) {
  if (activities.length === 0) return <p className="rounded-3xl bg-white p-8 text-slate-600 shadow-sm">No persistent activities yet. Register and log your first run.</p>;
  return <div className="grid gap-5">{activities.map((activity) => <ActivityCard key={activity.id} activity={activity} authenticated={authenticated} />)}</div>;
}
