import { activityId, type Activity } from "@/types/activity";

export const seededActivities = [
  {
    id: activityId("activity-101"),
    athlete: { id: "athlete-1", name: "Maya Chen", initials: "MC" },
    sport: "Run",
    title: "Riverwalk Progression",
    recordedAtLabel: "Today at 7:12 AM",
    recordedAtIso: "2026-10-26T07:12:00.000Z",
    note: "Finished the last mile strong and held target pace.",
    metrics: {
      distanceMiles: 6.24,
      elapsedSeconds: 3108,
      averagePaceSecondsPerMile: 498,
      elevationGainFeet: 187,
    },
    route: {
      path: "M10 68 C32 54 46 76 72 56 S115 22 139 40 S172 74 210 27",
      start: { x: 10, y: 68 },
      finish: { x: 210, y: 27 },
    },
    initialKudos: 23,
    viewerHasKudos: false,
    ownedByViewer: false,
  },
  {
    id: activityId("activity-102"),
    athlete: { id: "athlete-2", name: "Jordan Ellis", initials: "JE" },
    sport: "Run",
    title: "Bayfront Recovery Run",
    recordedAtLabel: "Yesterday at 6:04 PM",
    recordedAtIso: "2026-10-25T18:04:00.000Z",
    note: "Easy sunset miles with relaxed cadence and steady breathing.",
    metrics: {
      distanceMiles: 5.1,
      elapsedSeconds: 2634,
      averagePaceSecondsPerMile: 517,
      elevationGainFeet: 92,
    },
    route: {
      path: "M10 66 C39 25 64 31 78 55 S113 81 131 49 S165 17 210 31",
      start: { x: 10, y: 66 },
      finish: { x: 210, y: 31 },
    },
    initialKudos: 17,
    viewerHasKudos: false,
    ownedByViewer: false,
  },
] satisfies readonly Activity[];
