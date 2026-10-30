import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ledgerRows = (page: Page) => page.locator(".desktop-ledger tbody tr");

async function waitForLedger(page: Page) {
  await expect(
    page.getByRole("region", { name: "Transaction ledger" }),
  ).toBeVisible();
  await expect(
    page.getByRole("status", { name: "Ledger results" }),
  ).toContainText(/transactions found|Updating transactions/);
  await expect(
    page.getByRole("status", { name: "Ledger results" }),
  ).not.toContainText("Updating transactions");
}

async function goLedger(page: Page, query = "") {
  await page.goto(`/transactions${query}`);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /Every movement, accounted for/,
    }),
  ).toBeVisible();
  await waitForLedger(page);
}

test.describe("dashboard and transaction ledger", () => {
  test("overview content, chart range, and no browser errors", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: /Your business, in focus/ }),
    ).toBeVisible();
    await expect(
      page.getByText("Local SQLite · synthetic data", { exact: true }),
    ).toBeVisible();
    for (const name of [
      "Collected revenue",
      "Successful payments",
      "Active customers",
      "Payment success",
    ]) {
      await expect(
        page.locator(".kpi-grid").getByText(name, { exact: true }),
      ).toBeVisible();
    }
    const chart = page.getByRole("img", {
      name: /Revenue for the last 6 months/,
    });
    await expect(chart).toBeVisible();
    const details = page
      .locator("details")
      .filter({ has: page.getByText("View monthly data") });
    await details.locator("summary").click();
    await expect(details.locator("tbody tr")).toHaveCount(6);
    await page
      .getByRole("group", { name: "Revenue chart period" })
      .getByRole("button", { name: "12 months" })
      .click();
    await expect(
      page.getByRole("img", { name: /Revenue for the last 12 months/ }),
    ).toBeVisible();
    await expect(details.locator("tbody tr")).toHaveCount(12);
    expect(errors).toEqual([]);
  });

  test("collection links select pending and failed ledger states", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Review pending" }).click();
    await expect(page).toHaveURL(/status=Pending/);
    await expect(
      page.getByRole("button", { name: /^Pending/ }),
    ).toHaveAttribute("aria-pressed", "true");
    await page.goto("/");
    await page.getByRole("link", { name: "View failed" }).click();
    await expect(page).toHaveURL(/status=Failed/);
    await expect(page.getByRole("button", { name: /^Failed/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("global search, recent links, and clipboard actions work", async ({
    page,
    context,
  }) => {
    await page.goto("/");
    await page
      .getByRole("searchbox", { name: "Search transactions", exact: true })
      .fill("Northstar");
    await page
      .getByRole("searchbox", { name: "Search transactions", exact: true })
      .press("Enter");
    await expect(page).toHaveURL(/q=Northstar/);
    await waitForLedger(page);
    await expect(ledgerRows(page).first()).toContainText("Northstar");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const copy = ledgerRows(page)
      .first()
      .getByRole("button", { name: /^Copy transaction ID / });
    const id = (await copy.getAttribute("aria-label"))!.replace(
      "Copy transaction ID ",
      "",
    );
    await copy.click();
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe(id);
    await page.goto("/");
    await page.locator(".recent-list").getByRole("link").first().click();
    await expect(page).toHaveURL(/q=30000000-/);
    await waitForLedger(page);
    await expect(ledgerRows(page)).toHaveCount(1);
  });

  test("security headers, keyboard skip, and not-found navigation", async ({
    page,
  }) => {
    const response = await page.goto("/");
    const headers = response!.headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["content-security-policy"]).toContain("object-src 'none'");
    expect(headers["content-security-policy"]).toContain(
      "frame-ancestors 'none'",
    );
    expect(headers["x-powered-by"]).toBeUndefined();
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Skip to content" }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
    const missing = await page.goto("/no-such-workspace");
    expect(missing!.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "This view isn’t in the workspace.",
    );
    await expect(
      page.getByRole("link", { name: "Back to overview" }),
    ).toBeVisible();
  });

  test("search, clear, and browser history restore canonical queries", async ({
    page,
  }) => {
    await goLedger(page);
    const search = page.getByRole("search", { name: "Filter ledger" });
    await search
      .getByLabel("Search by transaction ID, customer or email")
      .fill("Northstar");
    await search.getByRole("button", { name: "Search" }).click();
    await expect(page).toHaveURL(/q=Northstar/);
    await expect(page.getByText("Results for")).toContainText("Northstar");
    await expect(ledgerRows(page).first()).toContainText("Northstar");
    await page.getByRole("button", { name: "Clear search" }).click();
    await expect(page).not.toHaveURL(/q=/);
    await page.goBack();
    await expect(page).toHaveURL(/q=Northstar/);
    await expect(page.getByText("Results for")).toContainText("Northstar");
    await page.goForward();
    await expect(page).not.toHaveURL(/q=/);
    await expect(
      page.getByRole("status", { name: "Ledger results" }),
    ).toContainText("transactions found");
  });

  test("status filters, pagination, and accessible desktop sorting", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await goLedger(page);
    await page
      .getByRole("group", { name: "Payment status" })
      .getByRole("button", { name: /^Paid/ })
      .click();
    await expect(page.getByRole("button", { name: /^Paid/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(
      page.getByRole("status", { name: "Ledger results" }),
    ).toContainText("transactions found");
    await page.getByRole("button", { name: "All" }).click();
    const amountHeader = page
      .locator(".desktop-ledger th")
      .filter({ has: page.getByRole("button", { name: /^Amount/ }) });
    await amountHeader.getByRole("button", { name: /^Amount/ }).click();
    await expect(amountHeader).toHaveAttribute(
      "aria-sort",
      /ascending|descending/,
    );
    await expect(page).toHaveURL(/sortBy=amount/);
    await expect(ledgerRows(page)).toHaveCount(10);
    await page.getByRole("button", { name: "Next page" }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByText(/^2 \/ /)).toBeVisible();
  });

  test("normalizes hostile filters and clamps oversized page", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("pageerror", (error) => consoleErrors.push(error.message));
    for (const query of [
      "?page=-1&sortBy=%3Cscript%3E&order=asc",
      "?page=Infinity&sortBy=amount%3B%20DROP%20TABLE&order=wat",
    ]) {
      await page.goto(`/transactions${query}`);
      await expect(page).toHaveURL(/\/transactions(?:\?|$)/);
      await expect(
        page.getByRole("heading", { level: 1, name: /Every movement/ }),
      ).toBeVisible();
      await waitForLedger(page);
      await expect(page.locator(".desktop-ledger th[aria-sort]")).toHaveCount(
        2,
      );
      await expect(
        page.locator(
          '.desktop-ledger th[aria-sort="ascending"], .desktop-ledger th[aria-sort="descending"], .desktop-ledger th[aria-sort="none"]',
        ),
      ).toHaveCount(2);
    }
    await page.goto("/transactions?page=99999");
    await expect(page).toHaveURL(/\/transactions(?:\?.*page=\d+)?$/);
    await waitForLedger(page);
    const lastPage = new URL(page.url()).searchParams.get("page");
    expect(Number(lastPage)).toBeGreaterThan(1);
    expect(Number(lastPage)).toBeLessThan(99999);
    await expect(
      page.getByRole("button", { name: "Next page" }),
    ).toBeDisabled();
    await expect(
      page.getByText(`${lastPage} / ${lastPage}`, { exact: true }),
    ).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("empty results provide a reset action", async ({ page }) => {
    await goLedger(page, "?q=NoSuchCustomer_7f3c");
    await expect(
      page.getByRole("heading", { name: "No matching transactions" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Reset all filters" }).click();
    await expect(page).toHaveURL(/\/transactions$/);
    await expect(ledgerRows(page)).toHaveCount(10);
  });

  test("CSV export downloads current page with expected headers and ten records", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await goLedger(page);
    await expect(ledgerRows(page)).toHaveCount(10);
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export page" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("nattitor-transactions-page.csv");
    const path = await download.path();
    expect(path).toBeTruthy();
    const fs = await import("node:fs/promises");
    const csv = await fs.readFile(path!, "utf8");
    const lines = csv
      .replace(/^\uFEFF/, "")
      .trim()
      .split(/\r?\n/);
    expect(lines[0]).toBe(
      '"Transaction ID","Customer","Email","Plan","Amount USD","Status","Created UTC"',
    );
    expect(lines).toHaveLength(11);
  });

  for (const width of [320, 390, 768, 1440]) {
    test(`responsive layout at ${width}px on overview and ledger`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ["/", "/transactions"]) {
        await page.goto(route);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await expect
          .poll(() =>
            page.evaluate(
              () =>
                document.documentElement.scrollWidth <=
                document.documentElement.clientWidth,
            ),
          )
          .toBe(true);
        if (width < 768) {
          await expect(
            page.getByRole("navigation", { name: "Mobile navigation" }),
          ).toBeVisible();
        }
        if (route === "/transactions" && width < 1100) {
          await expect(page.getByLabel("Sort transactions")).toBeVisible();
        }
      }
    });
  }

  test("axe WCAG 2 A/AA has no serious or critical violations", async ({
    page,
  }) => {
    for (const route of ["/", "/transactions"]) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      const serious = results.violations.filter(
        (violation) =>
          violation.impact === "serious" || violation.impact === "critical",
      );
      expect(
        serious,
        `${route}: ${JSON.stringify(serious.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map(({ target }) => target) })))}`,
      ).toEqual([]);
    }
  });
});
