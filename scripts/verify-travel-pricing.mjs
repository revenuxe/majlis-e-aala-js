// Start Chrome with --headless=new --remote-debugging-port=9226 and the local app on port 3000.
// Read-only catalogue and pricing UX checks; no requests are submitted.
import assert from "node:assert/strict";
const tabs = await (await fetch("http://localhost:9226/json")).json();
const tab = tabs.find(
  (t) => t.type === "page" && (t.url.includes("localhost:3000") || t.url === "about:blank"),
);
assert(tab, "Open a browser page first");
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((resolve) => {
  ws.onopen = resolve;
});
let id = 0;
const pending = new Map();
ws.onmessage = (event) => {
  const result = JSON.parse(event.data);
  if (!result.id) return;
  const task = pending.get(result.id);
  pending.delete(result.id);
  result.error ? task.reject(result.error) : task.resolve(result.result);
};
const call = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const next = ++id;
    pending.set(next, { resolve, reject });
    ws.send(JSON.stringify({ id: next, method, params }));
  });
const pause = () => new Promise((resolve) => setTimeout(resolve, 150));
const evaluate = async (expression) => {
  const response = await call("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails));
  return response.result.value;
};
const body = () => evaluate("document.body?.innerText || ''");
async function until(test, message) {
  for (let i = 0; i < 80; i++) {
    if (await test()) return;
    await pause();
  }
  throw new Error(message);
}
const click = async (text) => {
  await evaluate(
    `(() => {const b=[...document.querySelectorAll('button')].find(b=>b.innerText.includes(${JSON.stringify(text)}));if(!b)throw Error('Button missing');b.click();})()`,
  );
  await pause();
};
const setInput = async (selector, value, prototype = "HTMLInputElement") => {
  await evaluate(
    `(() => {const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Input missing');Object.getOwnPropertyDescriptor(${prototype}.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));})()`,
  );
  await pause();
};

try {
  await call("Page.enable");
  await call("Runtime.enable");
  await call("Page.navigate", { url: "http://localhost:3000/travel" });
  await until(async () => (await body()).includes("Sacred beginnings"), "Homepage load");
  assert.equal(
    await evaluate("document.querySelectorAll('article').length"),
    0,
    "Homepage must not contain the package catalogue",
  );
  assert.equal(
    await evaluate(
      "[...document.querySelectorAll('[aria-label=\"Travel quick navigation\"] a')].find(a=>a.innerText==='Packages')?.getAttribute('href')",
    ),
    "/travel/packages",
  );
  await call("Page.navigate", { url: "http://localhost:3000/travel/packages" });
  await until(async () => (await body()).includes("joining your journey?"), "Package count page");
  await new Promise((resolve) => setTimeout(resolve, 600));
  await evaluate("document.querySelectorAll('button[aria-label=Increase]')[0].click()");
  await pause();
  await evaluate("document.querySelectorAll('button[aria-label=Increase]')[1].click()");
  await pause();
  await evaluate("document.querySelector('input[type=checkbox]').click()");
  await pause();
  await click("CHOOSE YOUR JOURNEY");
  assert((await body()).includes("4 travellers"));
  assert.equal(
    await evaluate("document.querySelectorAll('main button img').length"),
    4,
    "Exact shared journey cards",
  );
  await click("Umrah");
  await until(async () => (await body()).includes("2,69,997"), "Three adults priced at 89999 each");
  assert((await body()).includes("4 travellers"));
  assert((await body()).includes("Starting estimate for 3 adults"));
  assert((await body()).includes("1 seniors included"), "Senior count carried to catalogue");
  assert(!(await body()).includes("Travel home"), "Duplicate back link removed");
  await click("Edit journey or travellers");
  await until(
    async () =>
      (await body()).includes("4 travellers") &&
      (await evaluate("document.querySelectorAll('main button img').length===4")),
    "Card back returns to journey selection with counts preserved",
  );
  await click("Umrah");
  await until(async () => (await body()).includes("2,69,997"), "Back preserves adult pricing");
  assert((await body()).includes("1 seniors included"), "Back preserves seniors");
  await evaluate("document.querySelector('article button[aria-pressed]').click()");
  await until(
    async () =>
      await evaluate("JSON.parse(localStorage.getItem('ma-travel-draft-v1'))?.draft.seniors===1"),
    "Senior count carried to booking",
  );
  for (const [category, count] of [
    ["umrah", 17],
    ["hajj", 8],
    ["international", 23],
    ["domestic", 15],
  ]) {
    await call("Page.navigate", { url: "http://localhost:3000/travel/packages/" + category });
    await until(
      async () => (await body()).includes(count + " packages"),
      category + " catalogue load",
    );
    assert.equal(await evaluate("document.querySelectorAll('article').length"), 6);
    assert.equal(
      await evaluate("document.getElementById('package-filters')===null"),
      true,
      "Filters must start closed",
    );
    await click("Filters");
    assert.equal(
      await evaluate(
        "document.querySelector('button[aria-controls=package-filters]').getAttribute('aria-expanded')",
      ),
      "true",
    );
    if (category === "hajj") assert(!(await body()).includes("Journey style"));
    if (category === "international" || category === "domestic")
      assert((await body()).includes("Destination"));
    if (category === "umrah") assert((await body()).includes("Umrah journey type"));
    await evaluate("document.querySelector('button[aria-label=\"Close filters\"]').click()");
    await pause();
    for (const width of [320, 390, 1280]) {
      await call("Emulation.setDeviceMetricsOverride", {
        width,
        height: 844,
        deviceScaleFactor: 1,
        mobile: width < 600,
      });
      assert.equal(
        await evaluate("document.documentElement.scrollWidth>innerWidth"),
        false,
        category + " fits " + width,
      );
    }
    await evaluate("document.querySelector('article button[aria-expanded]').click()");
    await pause();
    assert.equal(
      await evaluate(
        "document.querySelector('article button[aria-expanded]').getAttribute('aria-expanded')",
      ),
      "true",
    );
  }
  await click("Change");
  await evaluate("document.querySelector('button[aria-label=Increase]').click()");
  await pause();
  assert((await body()).includes("3 travellers"), "Traveller count updates");
  assert((await body()).includes("59,997"), "Ooty estimate reflects three adults");
  await click("Done");
  await setInput("input[type=search]", "Ooty");
  assert((await body()).includes("1 packages"));
  await evaluate("document.querySelector('article button[aria-pressed]').click()");
  await until(
    async () => (await body()).includes("Who is joining your journey?"),
    "Selected package must enter planner",
  );
  await until(
    async () =>
      await evaluate(
        "JSON.parse(localStorage.getItem('ma-travel-draft-v1'))?.draft.category==='domestic'",
      ),
    "Domestic preset restored",
  );
  assert.equal(
    await evaluate("JSON.parse(localStorage.getItem('ma-travel-draft-v1')).draft.adults"),
    3,
    "Count carries into booking",
  );
  console.log(
    "PASS: homepage without catalogue, four specific package pages, relevant filters, closed mobile filter panels, responsive cards and package-to-planner selection. No booking writes.",
  );
} finally {
  ws.close();
}
