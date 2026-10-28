export function GpxImportForm() {
  return <form action="/api/gpx/import" method="post" encType="multipart/form-data" className="grid gap-3 rounded-3xl bg-white p-5 shadow-sm">
    <h2 className="text-xl font-black">Import a GPX run</h2>
    <p className="text-sm text-slate-600">One GPX 1.1 track and one segment, up to 1 MB.</p>
    <input name="gpx" type="file" accept=".gpx" required className="rounded-xl border p-3" />
    <button type="submit" className="rounded-full bg-teal-700 px-5 py-3 font-bold text-white">Process and import</button>
  </form>;
}