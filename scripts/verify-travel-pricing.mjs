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
  await call("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await call("Page.navigate", { url: "http://localhost:3000/travel" });
  await until(async () => (await body()).includes("63 journeys found"), "Full catalogue must load");
  const cards = () =>
    evaluate("[...document.querySelectorAll('#journeys article h3')].map(e=>e.innerText)");
  assert.equal((await cards()).length, 6, "Initial catalogue must stay manageable");
  assert((await body()).includes("From") && (await body()).includes("89,999"));
  assert((await body()).includes("4/5 sharing"), "Sharing basis must be visible");
  await click("SHOW MORE JOURNEYS");
  assert.equal((await cards()).length, 12);
  await setInput("#journeys select:nth-of-type(1)", "all", "HTMLSelectElement");
  const select = async (index, value) => {
    await evaluate(
      "(()=>{const e=document.querySelectorAll('#journeys select')[" +
        index +
        "];Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(e," +
        JSON.stringify(value) +
        ");e.dispatchEvent(new Event('change',{bubbles:true}));})()",
    );
    await pause();
  };
  await select(1, "50000");
  await select(2, "price-low");
  assert.equal(
    (await cards())[0],
    "Ajmer Ziyarat",
    "Budget sorting must use numeric starting prices",
  );
  await evaluate(
    "[...document.querySelectorAll('[aria-label=\"Filter journeys\"] button')].find(b=>b.innerText==='Hajj').click()",
  );
  await pause();
  assert(
    (await body()).includes("8 journeys found"),
    "Changing categories resets incompatible filters",
  );
  assert((await body()).includes("Price on request"), "Duration-only Hajj must stay quote-only");
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
      "Price cards must fit " + width + "px",
    );
  }
  await evaluate(
    "[...document.querySelectorAll('[aria-label=\"Filter journeys\"] button')].find(b=>b.innerText==='Umrah').click()",
  );
  await pause();
  await select(0, "ramadan");
  assert.equal((await cards()).length, 4);
  assert((await body()).toLowerCase().includes("seasonal starting guide"));
  await evaluate("document.querySelector('#journeys article button').click()");
  await pause();
  assert((await body()).includes("Included in the package plan"));
  assert((await body()).includes("Ramadan dates, hotels and flights must be re-quoted"));
  await evaluate(
    "document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))",
  );
  await pause();
  await evaluate(
    "[...document.querySelectorAll('[aria-label=\"Filter journeys\"] button')].find(b=>b.innerText==='Domestic').click()",
  );
  await pause();
  await select(0, "ziyarat");
  assert.deepEqual(await cards(), ["Ajmer Ziyarat", "Multi-Ziyarat India"]);
  await evaluate(
    "if(location.hostname==='localhost'){localStorage.removeItem('ma-travel-draft-v1');sessionStorage.clear()}",
  );
  await call("Page.navigate", { url: "http://localhost:3000/travel/plan?category=umrah" });
  await until(async () => (await body()).includes("Where would you like to go?"), "Planner load");
  await until(
    async () =>
      await evaluate(
        "[...document.querySelectorAll('button')].some(b=>b.innerText==='CONTINUE'&&!b.disabled)",
      ),
    "Planner interactive",
  );
  for (const step of [2, 3, 4]) {
    await click("CONTINUE");
    await until(async () => (await body()).includes("Step " + step + " of 7"), "Step " + step);
  }
  await until(async () => (await body()).includes("Umrah Economy"), "Planner catalogue load");
  await click("Choose this journey");
  assert((await body()).includes("1,79,998"), "Adult estimate must be twice the saved adult rate");
  assert((await body()).includes("Children, room changes and extras are quoted separately"));
  await setInput("input[type=search]", "Turkey");
  assert(
    (await body()).includes("Your selected journey") && (await body()).includes("Umrah Economy"),
    "Selection must remain identified after filtering",
  );
  assert((await body()).includes("Umrah + Turkey"));
  console.log(
    "PASS: 63 live offers, pagination, numeric budget sorting, filter resets, seasonal guides, quote-only Hajj, Ziyarat collections, mobile price layout and adult estimates. No booking writes.",
  );
} finally {
  ws.close();
}
