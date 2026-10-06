// Isolated Chrome on port 9226; this check performs no booking or auth writes.
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
const base = process.env.SEO_BASE_URL || "http://localhost:3001";
const tab = (await (await fetch("http://localhost:9226/json")).json()).find(
  (t) => t.type === "page" && t.url.startsWith(base),
);
assert(tab, "Open the isolated test browser on the local production server.");
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((resolve) => {
  ws.onopen = resolve;
});
let id = 0;
const pending = new Map();
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (!data.id) return;
  const task = pending.get(data.id);
  pending.delete(data.id);
  data.error ? task.reject(data.error) : task.resolve(data.result);
};
const call = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const next = ++id;
    pending.set(next, { resolve, reject });
    ws.send(JSON.stringify({ id: next, method, params }));
  });
const evaluate = async (expression) => {
  const result = await call("Runtime.evaluate", { expression, returnByValue: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
async function until(test) {
  for (let n = 0; n < 80; n++) {
    if (await test()) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Homepage did not become ready.");
}
try {
  await call("Page.enable");
  for (const width of [320, 390, 1280]) {
    await call("Emulation.setDeviceMetricsOverride", {
      width,
      height: 844,
      deviceScaleFactor: 1,
      mobile: width < 600,
    });
    await call("Page.navigate", { url: base + "/" });
    await until(() =>
      evaluate(
        "document.querySelector('h1')?.innerText.trim().length > 0 && !!document.querySelector('a[href=\"/catering\"]')",
      ),
    );
    await until(() =>
      evaluate(
        "(()=>{const img=document.querySelector('picture img') || document.querySelector('img[alt=\"The Kaaba in Makkah\"]');return !!img && img.complete && img.naturalWidth > 0;})()",
      ),
    );
    assert.equal(
      await evaluate("document.documentElement.scrollWidth > innerWidth"),
      false,
      `Overflow at ${width}px`,
    );
    assert.equal(await evaluate("document.querySelectorAll('h1').length"), 1);
    assert.equal(await evaluate("document.body.innerText.includes('Catering in')"), false);
    if (width === 390 && process.env.SEO_SCREENSHOT_PATH) {
      const screenshot = await call("Page.captureScreenshot", { format: "png" });
      await writeFile(process.env.SEO_SCREENSHOT_PATH, Buffer.from(screenshot.data, "base64"));
    }
  }
  await evaluate("document.querySelector('a[href=\"/travel/packages/umrah\"]').click()");
  await until(() => evaluate("location.pathname === '/travel/packages/umrah'"));
  await call("Emulation.setScriptExecutionDisabled", { value: true });
  await call("Page.navigate", { url: base + "/" });
  await until(() =>
    evaluate(
      "location.pathname === '/' && document.querySelector('h1')?.innerText.trim().length > 0",
    ),
  );
  assert.equal(
    await evaluate("document.body.innerText.includes('Loading featured journeys')"),
    false,
  );
  assert.equal(
    await evaluate("!!document.querySelector('a[href=\"/travel/packages/domestic\"]')"),
    true,
  );
  assert.equal(
    await evaluate(
      "getComputedStyle(document.querySelector('picture img') || document.querySelector('img[alt=\"The Kaaba in Makkah\"]')).opacity",
    ),
    "1",
  );
  console.log(
    "PASS: mobile and desktop homepage, no horizontal overflow, travel navigation, and heading, category links and hero image without JavaScript.",
  );
} finally {
  await call("Emulation.setScriptExecutionDisabled", { value: false });
  await call("Browser.close");
  ws.close();
}
