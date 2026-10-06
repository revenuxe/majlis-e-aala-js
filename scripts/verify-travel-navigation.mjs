// Production browser checks. Catalogue responses are fixtures; booking writes are blocked.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const base = process.env.SEO_BASE_URL || "http://localhost:3001";
const debug = process.env.CHROME_DEBUG_URL || "http://localhost:9228";
const migration = await readFile(
  "supabase/migrations/20261006040000_owner_travel_catalogue.sql",
  "utf8",
);
const packages = JSON.parse(migration.split("$catalogue$")[1]).map((pkg, index) => ({
  ...pkg,
  id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
}));
const tab = (await (await fetch(debug + "/json")).json()).find(
  (tab) => tab.type === "page" && tab.url.startsWith(base),
);
assert(tab, "Open an isolated test browser at the production server");
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
const evaluate = async (expression) => {
  const result = await call("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
async function until(expression, message) {
  for (let n = 0; n < 100; n++) {
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(message);
}
const click = (text) =>
  evaluate(
    `(()=>{const button=Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()===${JSON.stringify(text)});if(!button)throw Error('Missing button: '+${JSON.stringify(text)});button.click()})()`,
  );
let hook;
try {
  await call("Page.enable");
  await call("Network.enable");
  await call("Network.clearBrowserCookies");
  hook = await call("Page.addScriptToEvaluateOnNewDocument", {
    source: `
    if(location.pathname.startsWith('/travel/packages')){localStorage.clear();sessionStorage.clear();}
    window.__auditBoot=crypto.randomUUID(); window.__auditErrors=[];
    window.__auditFailDepartures=sessionStorage.getItem('__auditFailDepartures')==='true';
    window.addEventListener('error',e=>window.__auditErrors.push(e.message));
    window.addEventListener('unhandledrejection',e=>window.__auditErrors.push(String(e.reason)));
    const realFetch=fetch.bind(window);
    window.fetch=async(input,init)=>{
      const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;
      const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
      if(url.includes('/rpc/submit_travel_booking'))throw Error('Booking writes blocked by audit');
      if(url.includes('/rest/v1/travel_packages')){
        if(window.__auditFailPackages)return json({message:'Unavailable'},503);
        return json(${JSON.stringify(packages)});
      }
      if(url.includes('/rest/v1/travel_departures')){
        await new Promise(r=>setTimeout(r,300));
        return window.__auditFailDepartures?json({message:'Unavailable'},503):json([]);
      }
      return realFetch(input instanceof URL?input.href:input,init);
    };`,
  });
  for (const width of [320, 390, 1280]) {
    await call("Emulation.setDeviceMetricsOverride", {
      width,
      height: 844,
      deviceScaleFactor: 1,
      mobile: width < 600,
    });
    await call("Page.navigate", {
      url: base + "/travel/packages/umrah?travellers=3&children=1&seniors=1",
    });
    await until(
      "document.querySelectorAll('article').length>0 && !document.querySelector('[aria-label=\"Package categories\"]').getAttribute('aria-busy').includes('true')",
      "Package catalogue not ready",
    );
    await until(
      "document.body.innerText.includes('3 adults') && document.body.innerText.includes('1 child')",
      "Traveller presets must be applied before selection",
    );
    assert.equal(
      await evaluate("document.documentElement.scrollWidth>innerWidth"),
      false,
      `Page overflow at ${width}`,
    );
    const sizes = await evaluate(
      "Array.from(document.querySelectorAll('[aria-label=\"Package categories\"] button')).map(b=>({width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height}))",
    );
    assert(
      sizes.every((size) => size.width >= 150 && size.height >= 100),
      `Collapsed cards at ${width}`,
    );
    assert(
      await evaluate(
        "document.querySelector('[aria-label=\"Package categories\"] h2').textContent.includes('Choose your journey')",
      ),
    );
  }
  const boot = await evaluate("window.__auditBoot");
  await click("Select package");
  await until(
    "location.pathname==='/travel/plan' && document.body.innerText.includes('Step 1 of 7')",
    "Package selection did not enter planner",
  );
  assert.equal(
    await evaluate("window.__auditBoot"),
    boot,
    "Package selection must use client navigation",
  );
  await until("!!document.querySelector('main select')", "Child age select missing");
  assert.equal(
    await evaluate(`(()=>{
    const age=document.querySelector('main select');
    const children=Array.from(document.querySelectorAll('main p')).find(p=>p.textContent.includes('Children')&&p.textContent.includes('Under 18'));
    const seniors=Array.from(document.querySelectorAll('main label')).find(l=>l.textContent.includes('Travelling with senior citizens'));
    return !!(children.compareDocumentPosition(age)&Node.DOCUMENT_POSITION_FOLLOWING)&&!!(age.compareDocumentPosition(seniors)&Node.DOCUMENT_POSITION_FOLLOWING);
  })()`),
    true,
    "Child ages must follow children and precede seniors",
  );
  await evaluate(
    "(()=>{const select=document.querySelector('main select');Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(select,'12');select.dispatchEvent(new Event('change',{bubbles:true}))})()",
  );
  await click("CONTINUE");
  await until(
    "document.body.innerText.includes('Step 3 of 7')",
    "Preset journey should advance to packages",
  );
  await until(
    "document.querySelectorAll('[aria-label=\"Package categories\"] button').length>1",
    "Package groups not ready",
  );
  await evaluate(
    "document.querySelector('[aria-label=\"Package categories\"] button:nth-child(2)').click()",
  );
  await until(
    "document.querySelector('[aria-label=\"Package categories\"] button:nth-child(2)').getAttribute('aria-pressed')==='true'",
    "Group selection failed",
  );
  await evaluate(
    "Array.from(document.querySelectorAll('main button')).find(b=>b.textContent.includes('Edit journey or travellers')).click()",
  );
  await until(
    "document.body.innerText.includes('Step 2 of 7')",
    "Banner back must return to journey step",
  );
  await click("CONTINUE");
  await until("document.body.innerText.includes('Step 3 of 7')", "Could not return to packages");
  assert(
    await evaluate(
      "document.querySelector('[aria-label=\"Package categories\"] button:nth-child(2)').getAttribute('aria-pressed')==='true'",
    ),
    "Back must preserve filter",
  );
  await click("Change");
  await until(
    "document.body.innerText.includes('Step 1 of 7')",
    "Traveller change must open traveller step",
  );
  assert.equal(
    await evaluate("document.querySelector('main select').value"),
    "12",
    "Back must preserve child age",
  );
  await call("Page.reload");
  await until(
    "document.querySelector('main select')?.value==='12'",
    "Reload must preserve child age",
  );
  await click("CONTINUE");
  await until("document.body.innerText.includes('Step 3 of 7')", "Reloaded preset must continue");
  await evaluate("sessionStorage.setItem('__auditFailDepartures','true')");
  await call("Page.reload");
  await until(
    "document.body.innerText.includes('Departure dates couldn')",
    "Departure failure must be recoverable",
  );
  assert(
    await evaluate("document.querySelectorAll('article').length>0"),
    "Departure failure must not discard packages",
  );
  const visibleCards = await evaluate("document.querySelectorAll('article').length");
  await evaluate("window.__auditFailPackages=true");
  await click("Retry departure dates");
  assert.equal(
    await evaluate("document.querySelectorAll('article').length"),
    visibleCards,
    "Refresh must keep existing cards visible",
  );
  await until(
    "document.body.innerText.includes('refresh the latest packages')",
    "Package refresh failure missing",
  );
  assert.equal(
    await evaluate("document.querySelectorAll('article').length"),
    visibleCards,
    "Failed refresh must preserve packages",
  );
  await evaluate(
    "window.__auditFailPackages=false;window.__auditFailDepartures=false;sessionStorage.removeItem('__auditFailDepartures')",
  );
  await click("Retry");
  await until(
    "!document.body.innerText.includes('refresh the latest packages') && !document.body.innerText.includes('Departure dates couldn')",
    "Retry must recover catalogue",
  );
  assert.equal(await evaluate("window.__auditErrors.length"), 0, "No runtime errors");
  console.log(
    "PASS: 320/390/1280px cards, child-age placement, client navigation, banner back, retained filters and ages, draft reload, independent departure failures, background-refresh stability, retry recovery and no runtime errors. No booking writes.",
  );
} finally {
  if (hook) await call("Page.removeScriptToEvaluateOnNewDocument", { identifier: hook.identifier });
  ws.close();
}
