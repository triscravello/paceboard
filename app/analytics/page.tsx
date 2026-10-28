import { TrainingChart } from "@/components/training-chart";
import { getTrainingAnalytics } from "@/lib/analytics-service";
import { parseAnalyticsSelection } from "@/lib/training-analytics";
import { getCurrentViewer } from "@/lib/session";

function durationLabel(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function paceLabel(seconds: number | null): string {
  if (seconds === null) return "Not available";
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")} /mi`;
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ weeks?: string; endDate?: string; timeZone?: string }>;
}) {
  const viewer = await getCurrentViewer();
  if (!viewer) return <main className="p-8"><h1 className="text-3xl font-black">Training analytics</h1><a href="/login">Log in to view analytics</a></main>;
  const values = await searchParams;
  const params = new URLSearchParams();
  if (values.weeks) params.set("weeks", values.weeks);
  if (values.endDate) params.set("endDate", values.endDate);
  if (values.timeZone) params.set("timeZone", values.timeZone);
  const selection = parseAnalyticsSelection(params);
  if (!selection) return <main className="p-8"><p role="alert">Choose a valid range, date, and IANA timezone.</p><a href="/analytics">Reset analytics</a></main>;
  const result = await getTrainingAnalytics(viewer.id, selection);
  if (!result.ok) return <main className="p-8"><p role="alert">Analytics are unavailable.</p></main>;
  const { dto } = result;
  const cards = [
    ["Distance", `${dto.summary.totalDistanceMiles.toFixed(2)} mi`],
    ["Duration", durationLabel(dto.summary.totalDurationSeconds)],
    ["Weighted pace", paceLabel(dto.summary.averagePaceSecondsPerMile)],
    ["Elevation", `${dto.summary.totalElevationGainFeet.toLocaleString()} ft`],
    ["Runs", String(dto.summary.activityCount)],
    ["Frequency", `${dto.summary.averageRunsPerWeek.toFixed(1)} runs/week`],
  ] as const;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header><a href="/">Back to Paceboard</a><h1 className="mt-2 text-4xl font-black">Training analytics</h1><p>{dto.policy.startDate} through {dto.policy.endDate}, {dto.policy.timeZone}</p></header>
        <form className="grid gap-3 rounded-3xl bg-white p-5 shadow-sm sm:grid-cols-4">
          <label>Period<select name="weeks" defaultValue={String(selection.weeks)} className="mt-1 w-full border p-2"><option value="4">4 weeks</option><option value="8">8 weeks</option><option value="12">12 weeks</option></select></label>
          <label>End date<input name="endDate" type="date" defaultValue={selection.endDate} className="mt-1 w-full border p-2" required /></label>
          <label>Timezone<input name="timeZone" defaultValue={selection.timeZone} className="mt-1 w-full border p-2" required /></label>
          <button className="self-end bg-teal-700 p-2 font-bold text-white">Update analytics</button>
        </form>
        <section aria-label="Training summary" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">{cards.map(([label, value]) => <dl key={label} className="rounded-2xl bg-white p-4 shadow-sm"><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-1 text-xl font-black">{value}</dd></dl>)}</section>
        {dto.summary.activityCount === 0 ? <p className="rounded-3xl bg-white p-8 shadow-sm">No runs exist in this selected period.</p> : <TrainingChart weeks={dto.weeks} />}
      </div>
    </main>
  );
}