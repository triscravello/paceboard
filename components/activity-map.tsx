"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { ActivityId } from "@/types/activity";
import type { AuthorizedRouteDto, PublicRoutePoint } from "@/types/route-privacy";
const LeafletMap = dynamic(() => import("@/components/leaflet-map").then((m) => m.LeafletMap), { ssr: false });
export function ActivityMap({ title, activityId }: { readonly title: string; readonly activityId: ActivityId }) {
  const [segments, setSegments] = useState<readonly (readonly PublicRoutePoint[])[] | null>(null); const [failed, setFailed] = useState(false);
  useEffect(() => { const c = new AbortController(); fetch(`/api/activities/${activityId}/route`, { cache: "no-store", signal: c.signal }).then(async (r) => { if (!r.ok) throw new Error(); return r.json() as Promise<AuthorizedRouteDto>; }).then((d) => setSegments(d.kind === "private" ? [d.points] : d.segments)).catch((e: unknown) => { if (!(e instanceof DOMException && e.name === "AbortError")) setFailed(true); }); return () => c.abort(); }, [activityId]);
  if (failed) return <p>Route is private or unavailable.</p>; if (!segments) return <p>Loading authorized route...</p>; if (!segments.length) return <p>The public route is fully hidden.</p>;
  return <figure aria-label={`${title} interactive route map`}><LeafletMap segments={segments} /></figure>;
}