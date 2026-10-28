import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ActivityFeed } from "@/components/activity-feed";
import { seededActivities } from "@/data/seeded-activities";

describe("ActivityFeed", () => {
  test("renders formatted running metrics and an accessible route", () => {
    render(<ActivityFeed activities={seededActivities} authenticated />);

    const card = screen.getByRole("article", {
      name: "Riverwalk Progression by Maya Chen",
    });
    const cardQueries = within(card);

    expect(cardQueries.getByText("6.24 mi")).toBeDefined();
    expect(cardQueries.getByText("51:48")).toBeDefined();
    expect(cardQueries.getByText("8:18 /mi")).toBeDefined();
    expect(cardQueries.getByText("187 ft")).toBeDefined();
    expect(
      cardQueries.getByRole("img", {
        name: "Riverwalk Progression route preview",
      }),
    ).toBeDefined();
  });

  test("preserves stable, unique activity IDs", () => {
    const ids = seededActivities.map((activity) => activity.id);

    expect(ids).toEqual(["activity-101", "activity-102"]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("renders Kudos state independently per activity", () => {
    const [first, second] = seededActivities;
    render(
      <ActivityFeed
        activities={[{ ...first, viewerHasKudos: true }, { ...second, viewerHasKudos: false }]}
        authenticated
      />,
    );

    const firstCard = within(
      screen.getByRole("article", { name: "Riverwalk Progression by Maya Chen" }),
    );
    const secondCard = within(
      screen.getByRole("article", { name: "Bayfront Recovery Run by Jordan Ellis" }),
    );

    expect(
      firstCard
        .getByRole("button", { name: "Remove kudos from Riverwalk Progression" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(firstCard.getByText("23 kudos")).toBeDefined();
    expect(
      secondCard
        .getByRole("button", { name: "Give kudos to Bayfront Recovery Run" })
        .getAttribute("aria-pressed"),
    ).toBe("false");
    expect(secondCard.getByText("17 kudos")).toBeDefined();
  });

  test("prompts unauthenticated viewers to log in instead of showing Kudos", () => {
    render(<ActivityFeed activities={seededActivities} authenticated={false} />);

    expect(screen.getAllByText("Log in to give Kudos")).toHaveLength(2);
    expect(screen.queryByRole("button", { name: /kudos/i })).toBeNull();
  });
});
