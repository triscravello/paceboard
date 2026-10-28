"use client";
import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Polyline, TileLayer } from "react-leaflet";
import type { PublicRoutePoint } from "@/types/route-privacy";
export function LeafletMap({ segments }: { readonly segments: readonly (readonly PublicRoutePoint[])[] }) {
  const positions: [number, number][][] = segments.map((s) => s.map((p) => [p.latitude, p.longitude])); const bounds = positions.flat();
  return <MapContainer bounds={bounds} boundsOptions={{ padding: [24, 24] }} scrollWheelZoom={false} style={{ height: 320, width: "100%", borderRadius: 16 }}><TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' /><Polyline positions={positions} pathOptions={{ color: "#0f766e", weight: 5 }} /><CircleMarker center={bounds[0]} radius={7} /><CircleMarker center={bounds[bounds.length - 1]} radius={7} /></MapContainer>;
}