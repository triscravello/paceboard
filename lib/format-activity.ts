export function formatDistance(distanceMiles: number): string {
  return `${distanceMiles.toFixed(2)} mi`;
}

export function formatElapsedTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const tail = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  return hours > 0 ? `${hours}:${tail}` : tail;
}

export function formatPace(secondsPerMile: number): string {
  const minutes = Math.floor(secondsPerMile / 60);
  const seconds = secondsPerMile % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")} /mi`;
}

export function formatElevation(feet: number): string {
  return `${feet.toLocaleString()} ft`;
}
