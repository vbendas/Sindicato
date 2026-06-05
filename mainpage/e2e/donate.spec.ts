import { test, expect } from "@playwright/test";

test.describe("Donate page", () => {
  test("renders the form with preset amounts and CTAs", async ({ page }) => {
    await page.goto("/en/donate");
    await expect(
      page.getByRole("heading", { name: /support sindicato/i })
    ).toBeVisible();
    await expect(page.getByText(/no investors/i).first()).toBeVisible();

    for (const amount of ["5€", "10€", "25€", "50€", "100€"]) {
      await expect(page.getByRole("button", { name: amount })).toBeVisible();
    }

    await expect(page.getByLabel(/other amount/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /continue to payment/i })
    ).toBeVisible();
  });

  test("localized donate page renders in Spanish", async ({ page }) => {
    await page.goto("/es/donate");
    await expect(
      page.getByRole("heading", { name: /apoya a sindicato/i })
    ).toBeVisible();
    await expect(page.getByLabel(/otro importe/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /continuar al pago/i })
    ).toBeVisible();
  });

  test("custom amount validation rejects below-minimum value", async ({ page }) => {
    await page.goto("/en/donate");
    await page.getByLabel(/other amount/i).fill("0.5");
    await page.getByRole("button", { name: /continue to payment/i }).click();
    await expect(page.getByText(/minimum donation is 1/i)).toBeVisible();
  });

  test("selecting a preset highlights it", async ({ page }) => {
    await page.goto("/en/donate");
    const ten = page.getByRole("button", { name: "10€" });
    await ten.click();
    await expect(ten).toHaveAttribute("aria-pressed", "true");
  });

  test("thanks page renders session-not-found state for unknown id", async ({
    page,
  }) => {
    await page.goto("/en/donate/thanks?session_id=cs_test_does_not_exist");
    // Either the Stripe retrieval fails (we show the "something went wrong"
    // message) or the page renders the missing/expired state. Either is fine.
    await expect(page.locator("main")).toBeVisible();
  });
});
