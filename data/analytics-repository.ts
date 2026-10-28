import { prisma } from "@/lib/prisma";
import type { AnalyticsActivity } from "@/types/training-analytics";
export interface AnalyticsRepository { listOwnedRuns(ownerId: string, from: Date, until: Date): Promise<readonly AnalyticsActivity[]> }
class PostgresAnalyticsRepository implements AnalyticsRepository {
  async listOwnedRuns(ownerId: string, from: Date, until: Date): Promise<readonly AnalyticsActivity[]> {
    return prisma.activity.findMany({ where: { ownerId, type: "RUN", recordedAt: { gte: from, lt: until } }, orderBy: { recordedAt: "asc" }, select: { recordedAt: true, distanceHundredthsMiles: true, elapsedSeconds: true, elevationGainFeet: true } });
  }
}
export const analyticsRepository: AnalyticsRepository = new PostgresAnalyticsRepository();
