import { chromium } from "playwright";

const BASE = "http://localhost:3001";
let failures = 0;

function check(name, cond) {
  if (cond) {
    console.log(`  ok - ${name}`);
  } else {
    console.log(`  FAIL - ${name}`);
    failures++;
  }
}

const browser = await chromium.launch();
const page = await browser.newPage();
page.on("console", (msg) => {
  if (msg.type() === "error") console.log("  [browser console error]", msg.text());
});
page.on("pageerror", (err) => console.log("  [page error]", err.message));

console.log("1. Login");
await page.goto(`${BASE}/login`);
await page.fill("#email", "admin@parking.demo");
await page.fill("#password", "admin123");
await page.click('button[type="submit"]');
await page.waitForURL(`${BASE}/`, { timeout: 10000 });
check("redirected to dashboard after login", page.url() === `${BASE}/`);
check("dashboard heading visible", (await page.textContent("h2")) === "Dashboard");

console.log("2. Check in a new vehicle");
await page.fill("#plate", "TEST-001");
await page.getByRole("combobox").first().click();
await page.getByRole("option").first().click();
await page.locator('form:has(#plate) button[type="submit"]').click();
await page.waitForTimeout(1500);
const bodyAfterCheckin = await page.textContent("body");
check("TEST-001 appears on dashboard after check-in", bodyAfterCheckin.includes("TEST-001"));

console.log("3. Check out that vehicle by plate");
await page.fill("#plate-out", "TEST-001");
await page.locator('form:has(#plate-out) button[type="submit"]').click();
await page.waitForTimeout(1500);
check(
  "TEST-001 no longer in the live sessions table",
  !(await page.locator("table >> text=TEST-001").count())
);

console.log("4. Subscriber check-in shows as free");
await page.fill("#plate", "SUB-002");
await page.getByRole("combobox").first().click();
await page.getByRole("option").nth(1).click();
await page.locator('form:has(#plate) button[type="submit"]').click();
await page.waitForTimeout(1500);
const row = page.locator("tr", { hasText: "SUB-002" }).last();
check("SUB-002 row shows Subscriber badge", (await row.textContent()).includes("Subscriber"));
check("SUB-002 row shows Free fee", (await row.textContent()).includes("Free"));
// clean up: check it back out
await page.fill("#plate-out", "SUB-002");
await page.locator('form:has(#plate-out) button[type="submit"]').click();
await page.waitForTimeout(1000);

console.log("5. Reports page");
await page.goto(`${BASE}/reports`);
check("reports heading visible", (await page.textContent("h2")) === "Reports");
const reportsBody = await page.textContent("body");
check("closed session history is populated", /session\(s\)/.test(reportsBody));
check("revenue total is shown", /\$\d/.test(reportsBody));

console.log("6. Admin: zones & spots");
await page.goto(`${BASE}/admin/zones`);
await page.fill("#code", "Z");
await page.fill("#name", "Smoke Test Zone");
await page.getByRole("button", { name: "Add zone" }).click();
await page.waitForTimeout(1000);
let zonesBody = await page.textContent("body");
check("new zone appears", zonesBody.includes("Smoke Test Zone"));

console.log("7. Admin: rate config");
await page.goto(`${BASE}/admin/rate`);
await page.fill("#hourlyRate", "3.50");
await page.getByRole("button", { name: "Save new rate" }).click();
await page.waitForTimeout(1000);
check("rate input reflects saved value", (await page.inputValue("#hourlyRate")) === "3.50");

console.log("8. Admin: subscribers");
await page.goto(`${BASE}/admin/subscribers`);
await page.fill("#sub-plate", "SMOKE-1");
await page.fill("#holderName", "Smoke Tester");
await page.fill("#validUntil", "2027-01-01");
await page.getByRole("button", { name: "Add subscriber" }).click();
await page.waitForTimeout(1000);
const subsBody = await page.textContent("body");
check("new subscriber appears", subsBody.includes("SMOKE-1") && subsBody.includes("Smoke Tester"));

console.log("9. Logout");
await page.getByRole("button", { name: "Sign out" }).click();
await page.waitForURL(`${BASE}/login`, { timeout: 10000 });
check("redirected to login after logout", page.url() === `${BASE}/login`);

console.log("10. Route protection");
await page.goto(`${BASE}/`);
await page.waitForURL(`${BASE}/login*`, { timeout: 10000 });
check("dashboard redirects to login when signed out", page.url().startsWith(`${BASE}/login`));

await browser.close();

console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);
