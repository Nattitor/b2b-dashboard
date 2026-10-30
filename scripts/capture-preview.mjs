import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const baseURL = new URL(
  process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3100",
);
if (!["127.0.0.1", "localhost", "[::1]"].includes(baseURL.hostname)) {
  throw new Error("Preview capture is limited to a local dashboard.");
}
const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.goto(new URL("/brand/portfolio-cover.svg", baseURL).href, {
    waitUntil: "networkidle",
  });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: "public/brand/portfolio-cover.png" });
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.goto(baseURL.href, { waitUntil: "networkidle" });
  await page
    .getByText("Local SQLite · synthetic data", { exact: true })
    .waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page
    .getByRole("img", { name: /Revenue for the last 6 months/ })
    .waitFor();
  await page.mouse.move(0, 0);
  await page.screenshot({ path: "public/preview.png", fullPage: true });
  await mkdir("docs/screenshots", { recursive: true });
  await page.goto(new URL("/transactions", baseURL).href, {
    waitUntil: "networkidle",
  });
  await page.getByRole("region", { name: "Transaction ledger" }).waitFor();
  await page.screenshot({
    path: "docs/screenshots/transactions-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "docs/screenshots/transactions-mobile.png",
    fullPage: true,
  });
  console.log(
    "Captured the portfolio cover, overview, and desktop/mobile ledger from the local demo.",
  );
} finally {
  await browser.close();
}
