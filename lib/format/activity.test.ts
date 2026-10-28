import { describe, expect, it } from "vitest";
import {
  formatDistance,
  formatDuration,
  formatHeartRate,
  formatPace,
} from "./activity";

describe("activity formatters", () => {
  it("formats distance in miles", () => {
    expect(formatDistance(5000)).toBe("3.11 mi");
    expect(formatDistance(0)).toBe("0.00 mi");
  });

  it("formats durations with and without hours", () => {
    expect(formatDuration(1530)).toBe("25:30");
    expect(formatDuration(3725)).toBe("1:02:05");
  });

  it("formats pace and guards zero distance", () => {
    expect(formatPace(1609.344, 510)).toBe("8:30 /mi");
    expect(formatPace(0, 100)).toBe("—");
  });

  it("formats missing heart rate", () => {
    expect(formatHeartRate(null)).toBe("—");
    expect(formatHeartRate(150)).toBe("150 bpm");
  });
});
