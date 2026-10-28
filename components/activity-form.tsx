import { createActivityAction } from "@/app/actions/activities";
export function ActivityForm() {
  return <form action={createActivityAction} className="grid gap-3 rounded-3xl bg-white p-5 shadow-sm sm:grid-cols-2">
    <h2 className="text-xl font-black sm:col-span-2">Log an activity</h2>
    <input className="rounded-xl border p-3" name="title" placeholder="Title" required />
    <select className="rounded-xl border p-3" name="activityType" defaultValue="RUN"><option value="RUN">Run</option><option value="RIDE">Ride</option><option value="WALK">Walk</option></select>
    <input className="rounded-xl border p-3" name="distanceMiles" type="number" min="0.01" step="0.01" placeholder="Distance in miles" required />
    <input className="rounded-xl border p-3" name="durationSeconds" type="number" min="1" step="1" placeholder="Duration in seconds" required />
    <input className="rounded-xl border p-3" name="elevationGainFeet" type="number" min="0" step="1" placeholder="Elevation gain in feet" required />
    <input className="rounded-xl border p-3" name="recordedAt" type="datetime-local" required />
    <button className="rounded-full bg-orange-600 px-5 py-3 font-bold text-white sm:col-span-2" type="submit">Create activity</button>
  </form>;
}