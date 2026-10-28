import { logoutAction } from "@/app/actions/auth";
import { ActivityFeed } from "@/components/activity-feed";
import { ActivityForm } from "@/components/activity-form";
import { GpxImportForm } from "@/components/gpx-import-form";
import { activityRepository } from "@/data/activity-repository";
import { getCurrentViewer } from "@/lib/session";
const publicStatus: Record<string, string> = { imported: "GPX run imported successfully.", unauthorized: "Log in before importing a GPX file.", invalid_file: "Choose a non-empty .gpx file.", file_too_large: "The GPX file exceeds the 1 MB project limit.", invalid_gpx: "The file is malformed or outside the supported GPX 1.1 contract.", insufficient_track: "The track does not contain enough defensible geometry and timing data.", database_error: "The import could not be saved." };
export default async function Home({ searchParams }: { searchParams: Promise<{ gpx?: string }> }) {
  const viewer = await getCurrentViewer();
  const activities = await activityRepository.listForViewer(viewer?.id ?? null);
  const { gpx } = await searchParams;
  return <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950 sm:px-6"><div className="mx-auto max-w-5xl space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-widest text-orange-700">Community activity</p><h1 className="text-4xl font-black">Paceboard</h1></div>{viewer ? <form action={logoutAction} className="flex items-center gap-3"><span>Signed in as {viewer.name}</span><button className="font-bold text-orange-700">Log out</button></form> : <nav className="flex gap-4"><a href="/login">Log in</a><a className="font-bold text-orange-700" href="/register">Register</a></nav>}</header>
    {gpx && publicStatus[gpx] ? <p role="status" className="rounded-2xl bg-white p-4 shadow-sm">{publicStatus[gpx]}</p> : null}
    {viewer ? <div className="grid gap-6 lg:grid-cols-2"><ActivityForm /><GpxImportForm /></div> : null}
    <ActivityFeed activities={activities} authenticated={viewer !== null} />
  </div></main>;
}