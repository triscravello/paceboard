import { prisma } from "@/lib/prisma";
import { activityId, type Activity, type ActivitySport } from "@/types/activity";
export interface ActivityRepository { listForViewer(viewerId: string | null): Promise<readonly Activity[]> }
const toSport = (v: string): ActivitySport => v === "RIDE" ? "Ride" : v === "WALK" ? "Walk" : "Run";
const initials = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
class PostgresActivityRepository implements ActivityRepository {
  async listForViewer(viewerId: string | null): Promise<readonly Activity[]> {
    const records = await prisma.activity.findMany({ where: viewerId === null ? { visibility: "PUBLIC" } : { OR: [{ visibility: "PUBLIC" }, { ownerId: viewerId }] }, orderBy: { recordedAt: "desc" }, include: { owner: true, gpsRoute: { select: { id: true } }, kudos: { select: { userId: true } }, _count: { select: { kudos: true } } } });
    return records.map((r) => { const id = activityId(r.id), miles = r.distanceHundredthsMiles / 100; return { id, athlete: { id: r.owner.id, name: r.owner.name, initials: initials(r.owner.name) }, sport: toSport(r.type), title: r.title, recordedAtLabel: new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(r.recordedAt), recordedAtIso: r.recordedAt.toISOString(), note: r.gpsRoute ? "Imported and processed with gps-v1." : "Logged with Paceboard.", metrics: { distanceMiles: miles, elapsedSeconds: r.elapsedSeconds, averagePaceSecondsPerMile: Math.round(r.elapsedSeconds / miles), elevationGainFeet: r.elevationGainFeet }, route: { path: "M10 68 C42 38 75 76 112 45 S170 18 210 31", start: { x: 10, y: 68 }, finish: { x: 210, y: 31 }, gpsActivityId: r.gpsRoute ? id : null }, initialKudos: r._count.kudos, viewerHasKudos: viewerId !== null && r.kudos.some((k) => k.userId === viewerId), ownedByViewer: viewerId !== null && r.ownerId === viewerId } satisfies Activity; });
  }
}
export const activityRepository: ActivityRepository = new PostgresActivityRepository();