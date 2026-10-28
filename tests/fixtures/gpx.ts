export interface FixturePoint { readonly latitude: number; readonly longitude: number; readonly elevation?: number; readonly timestamp?: string }
export const referencePoints: readonly FixturePoint[] = Array.from({ length: 10 }, (_, index) => ({ latitude: 27.95, longitude: -82.46 + index * 0.001018, elevation: 10 + index, timestamp: new Date(Date.UTC(2026, 9, 27, 10, index, 0)).toISOString() }));
export function buildGpx(points: readonly FixturePoint[], name = "Tampa Reference Run"): string {
  return `<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" creator="Paceboard Test" xmlns="http://www.topografix.com/GPX/1/1"><trk><name>${name}</name><trkseg>${points.map((point) => `<trkpt lat="${point.latitude}" lon="${point.longitude}">${point.elevation === undefined ? "" : `<ele>${point.elevation}</ele>`}${point.timestamp === undefined ? "" : `<time>${point.timestamp}</time>`}</trkpt>`).join("")}</trkseg></trk></gpx>`;
}
export const validGpx = buildGpx(referencePoints);