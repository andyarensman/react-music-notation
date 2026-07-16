import { expect, test } from "@playwright/test";

/*
  Screenshot every Storybook story against its per-engine baseline. Soft
  assertions so one run reports every diff, not just the first. The
  story list comes from the built Storybook's index.json, so new stories
  are picked up automatically (their first run fails with "missing
  snapshot" — run test:visual:update and review).
*/

interface IndexEntry {
  id: string;
  type: string;
}

test("every story matches its baseline", async ({ page }) => {
  const response = await page.request.get(
    "http://127.0.0.1:6006/index.json"
  );
  const index = (await response.json()) as {
    entries: Record<string, IndexEntry>;
  };
  const stories = Object.values(index.entries)
    .filter((entry) => entry.type === "story")
    .map((entry) => entry.id)
    .sort();
  expect(stories.length).toBeGreaterThan(30);

  for (const id of stories) {
    await page.goto(
      `http://127.0.0.1:6006/iframe.html?id=${id}&viewMode=story`
    );
    await page.evaluate(() => document.fonts.ready);
    // let ResizeObserver-driven system breaking settle on its second pass
    await page.waitForTimeout(250);
    await expect.soft(page).toHaveScreenshot(`${id}.png`);
  }
});
