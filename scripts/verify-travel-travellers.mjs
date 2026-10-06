import assert from "node:assert/strict";
import { normalizeTravellers, restoreTravellers } from "../src/lib/travel-travellers.ts";

const group = { adults: 7, children: 2, seniors: 3 };
assert.deepEqual(restoreTravellers(new URLSearchParams(), group), group);
assert.deepEqual(
  restoreTravellers(new URLSearchParams("travellers=9&children=3&seniors=4"), group),
  { adults: 9, children: 3, seniors: 4 },
);
assert.deepEqual(restoreTravellers(new URLSearchParams("travellers=1"), group), {
  adults: 1,
  children: 0,
  seniors: 0,
});
for (const value of ["", "0", "101", "2.5", "NaN", "-1"]) {
  assert.deepEqual(restoreTravellers(new URLSearchParams(`travellers=${value}`), group), group);
}
assert.deepEqual(normalizeTravellers({ adults: 99, children: 20, seniors: 100 }), {
  adults: 99,
  children: 1,
  seniors: 99,
});
assert.deepEqual(normalizeTravellers({ adults: 1, children: 0, seniors: 3 }), {
  adults: 1,
  children: 0,
  seniors: 1,
});
assert.deepEqual(restoreTravellers(new URLSearchParams(), { adults: "7", children: -1 }), {
  adults: 2,
  children: 0,
  seniors: 0,
});
console.log("Traveller validation and restoration checks passed.");

if (!process.env.CHROME_DEBUG_URL) process.exit(0);
const base = process.env.SEO_BASE_URL || "http://localhost:3000";
const tabs = await (await fetch(`${process.env.CHROME_DEBUG_URL}/json`)).json();
const tab = tabs.find((item) => item.type === "page");
assert(tab);
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((resolve) => {
  ws.onopen = resolve;
});
let id = 0;
const pending = new Map();
ws.onmessage = (event) => {
  const response = JSON.parse(event.data);
  if (!response.id) return;
  const task = pending.get(response.id);
  pending.delete(response.id);
  response.error ? task.reject(response.error) : task.resolve(response.result);
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
async function until(expression) {
  for (let n = 0; n < 100; n++) {
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out: ${expression}`);
}
async function navigate(path, count) {
  await call("Page.navigate", { url: `${base}${path}` });
  await until(
    `new URLSearchParams(location.search).get('travellers') === '${count}' && document.querySelector('main') !== null`,
  );
}
async function setCount(label, value) {
  await evaluate(`(() => {
    const input = document.querySelector('input[aria-label="${label} quantity"]');
    if (!input) throw Error('Missing count input');
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, '${value}');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
  })()`);
}
try {
  await call("Page.enable");
  await navigate("/travel/packages?travellers=7&children=2&seniors=3", 7);
  await until(`document.querySelector('input[aria-label="Adults quantity"]')?.value === '7'`);
  await setCount("Adults", 9);
  await until(`new URLSearchParams(location.search).get('travellers') === '9'`);
  await call("Page.reload");
  await until(`document.querySelector('input[aria-label="Adults quantity"]')?.value === '9'`);
  await navigate("/travel/packages/umrah?q=test", 9);
  await until(`document.body.innerText.includes('11 travellers')`);
  await evaluate(
    `[...document.querySelectorAll('button')].find(b => b.innerText === 'Edit travellers').click()`,
  );
  await until(`document.querySelector('input[aria-label="Adults quantity"]') !== null`);
  await setCount("Adults", 1);
  await until(
    `new URLSearchParams(location.search).get('travellers') === '1' && new URLSearchParams(location.search).get('seniors') === '1'`,
  );
  assert.equal(await evaluate(`new URLSearchParams(location.search).get('q')`), "test");
  await call("Page.reload");
  await until(`document.body.innerText.includes('3 travellers')`);
  await navigate("/travel", 1);
  await until(`document.querySelector('input[aria-label="Travellers quantity"]')?.value === '1'`);
  await navigate("/travel/plan?category=umrah&travellers=8&children=2&seniors=3", 8);
  await until(
    `JSON.parse(localStorage.getItem('ma-travel-draft-v1') || 'null')?.draft?.adults === 8`,
  );
  await call("Page.reload");
  await until(`document.body.innerText.includes('10 travellers')`);
  assert.deepEqual(await evaluate(`JSON.parse(localStorage.getItem('ma-travel-travellers-v1'))`), {
    adults: 8,
    children: 2,
    seniors: 3,
  });
  await until(`document.querySelector('input[aria-label="Adults quantity"]')?.value === '8'`);
  await setCount("Adults", 12);
  await until(`new URLSearchParams(location.search).get('travellers') === '12'`);
  await call("Page.reload");
  await until(`document.querySelector('input[aria-label="Adults quantity"]')?.value === '12'`);
  const hook = await call("Page.addScriptToEvaluateOnNewDocument", {
    source: `Storage.prototype.setItem = () => { throw new Error('Storage blocked'); }; Storage.prototype.getItem = () => { throw new Error('Storage blocked'); };`,
  });
  await navigate("/travel/packages?travellers=6&children=1&seniors=2", 6);
  await until(`document.querySelector('input[aria-label="Adults quantity"]')?.value === '6'`);
  await setCount("Adults", 10);
  await until(`new URLSearchParams(location.search).get('travellers') === '10'`);
  await call("Page.reload");
  await until(`document.querySelector('input[aria-label="Adults quantity"]')?.value === '10'`);
  await navigate("/travel/plan?category=umrah&travellers=5&children=2&seniors=1", 5);
  await until(`document.querySelector('input[aria-label="Adults quantity"]')?.value === '5'`);
  await setCount("Adults", 6);
  await until(`new URLSearchParams(location.search).get('travellers') === '6'`);
  await call("Page.reload");
  await until(`document.querySelector('input[aria-label="Adults quantity"]')?.value === '6'`);
  await call("Page.removeScriptToEvaluateOnNewDocument", { identifier: hook.identifier });
  console.log(
    "Browser refresh, edits, navigation, booking handoff, senior bounds and blocked-storage checks passed.",
  );
} finally {
  ws.close();
}
