"use client";

import { Bar, CartesianGrid, ComposedChart, Line, Tooltip, XAxis, YAxis } from "recharts";
import type { WeeklyTrainingDto } from "@/types/training-analytics";

export function TrainingChart({ weeks }: { readonly weeks: readonly WeeklyTrainingDto[] }) {
  return (
    <figure aria-labelledby="training-chart-title" className="rounded-3xl bg-white p-5 shadow-sm">
      <h2 id="training-chart-title" className="text-2xl font-black">Weekly running volume</h2>
      <p className="mt-1 text-sm text-slate-600">Bars show weekly miles. The line shows the four-week rolling average.</p>
      <ComposedChart
        accessibilityLayer
        responsive
        role="img"
        title="Weekly mileage and four-week rolling average"
        style={{ width: "100%", maxHeight: "60vh", aspectRatio: 1.7 }}
        data={weeks}
        margin={{ top: 20, right: 12, bottom: 20, left: 0 }}
      >
        <CartesianGrid strokeDasharray="4 4" />
        <XAxis dataKey="weekStart" />
        <YAxis width="auto" label={{ value: "Miles", angle: -90, position: "insideLeft" }} />
        <Tooltip />
        <Bar dataKey="distanceMiles" name="Weekly mileage (mi)" fill="#0f766e" radius={[6, 6, 0, 0]} />
        <Line dataKey="rollingAverageMiles" name="4-week average (mi)" stroke="#ea580c" strokeWidth={3} connectNulls={false} />
      </ComposedChart>
      <figcaption className="mt-3 text-sm text-slate-600">Monday-based weeks in the selected timezone.</figcaption>
      <table className="sr-only">
        <caption>Numerical weekly training summary</caption>
        <thead><tr><th>Week starting</th><th>Miles</th><th>Runs</th><th>Four-week average</th><th>Change</th></tr></thead>
        <tbody>{weeks.map((week) => (
          <tr key={week.weekStart}>
            <th>{week.weekStart}</th>
            <td>{week.distanceMiles.toFixed(2)}</td>
            <td>{week.activityCount}</td>
            <td>{week.rollingAverageMiles?.toFixed(2) ?? "Not available"}</td>
            <td>{week.changeMiles?.toFixed(2) ?? "Not available"}</td>
          </tr>
        ))}</tbody>
      </table>
    </figure>
  );
}