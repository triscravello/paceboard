import { giveKudosAction, removeKudosAction } from "@/app/actions/kudos";
import type { ActivityId } from "@/types/activity";
export function KudosButton({ activityId, activityTitle, pressed, authenticated }: { readonly activityId: ActivityId; readonly activityTitle: string; readonly pressed: boolean; readonly authenticated: boolean }) {
  if (!authenticated) return <a className="font-bold text-orange-700" href="/login">Log in to give Kudos</a>;
  return <form action={pressed ? removeKudosAction : giveKudosAction}>
    <input type="hidden" name="activityId" value={activityId} />
    <button type="submit" aria-label={`${pressed ? "Remove kudos from" : "Give kudos to"} ${activityTitle}`} aria-pressed={pressed} className={`rounded-full border px-4 py-2 text-sm font-bold ${pressed ? "border-orange-500 bg-orange-500 text-white" : "border-orange-500 bg-white text-orange-700"}`}>{pressed ? "Kudos given" : "Give kudos"}</button>
  </form>;
}
