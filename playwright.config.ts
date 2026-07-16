import { defineConfig } from "@playwright/test";

/*
  Cross-engine visual regression: every Storybook story is screenshotted
  in Chromium, Firefox, and WebKit and diffed against committed
  baselines (tests/visual/*-snapshots/, suffixed per engine+platform).

  npm run test:visual          — diff against baselines
  npm run test:visual:update   — rewrite baselines (review the diff!)

  Baselines are OS-specific (font rasterization differs per OS); ours
  are generated on Windows, so CI skips this suite — see QUALITY.md.
*/
export default defineConfig({
  testDir: "tests/visual",
  fullyParallel: true,
  timeout: 600_000,
  expect: {
    // a whisker of anti-aliasing noise; anything structural fails
    toHaveScreenshot: { maxDiffPixels: 64 },
  },
  webServer: {
    command:
      "npx storybook build -o .storybook-visual && npx http-server .storybook-visual -p 6006 -c-1 --silent",
    port: 6006,
    reuseExistingServer: true,
    timeout: 300_000,
  },
  use: {
    viewport: { width: 1280, height: 600 },
    deviceScaleFactor: 1,
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
});
