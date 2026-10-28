const METERS_PER_MILE = 1609.344;

export function formatDistance(meters: number): string {
  return `${(meters / METERS_PER_MILE).toFixed(2)} mi`;
}

export function formatDuration(seconds: number): string {
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const ss = String(secs).padStart(2, "0");
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${ss}`;
  }
  return `${minutes}:${ss}`;
}

export function formatPace(distanceMeters: number, seconds: number): string {
  if (distanceMeters <= 0) return "—";
  const secondsPerMile = seconds / (distanceMeters / METERS_PER_MILE);
  return `${formatDuration(secondsPerMile)} /mi`;
}

export function formatHeartRate(bpm: number | null): string {
  return bpm === null ? "—" : `${Math.round(bpm)} bpm`;
}
