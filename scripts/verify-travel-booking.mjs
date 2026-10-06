// Start Chrome with --headless=new --remote-debugging-port=9226 and the local app on port 3000.
// Booking POSTs are intercepted in the browser; this check creates no customer records.
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
const body = () => evaluate("document.body.innerText");
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
  await call("Page.addScriptToEvaluateOnNewDocument", {
    source: `
    window.__travelPosts=[];
    const originalFetch=window.fetch.bind(window);
    window.fetch=(input,init)=>{
      const url=typeof input==='string'?input:input.url;
      if(url.includes('/rpc/submit_travel_booking')){
        window.__travelPosts.push(JSON.parse(init.body));
        if(window.__travelPosts.length===1)return Promise.resolve(new Response(JSON.stringify({message:'Simulated unavailable service'}),{status:503,headers:{'Content-Type':'application/json'}}));
        return Promise.resolve(new Response(JSON.stringify([{booking_reference:'MAT-TEST-UI-ONLY'}]),{status:200,headers:{'Content-Type':'application/json'}}));
      }
      return originalFetch(input,init);
    };`,
  });
  await call("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await evaluate(
    "if(location.hostname==='localhost'){localStorage.removeItem('ma-travel-draft-v1');sessionStorage.removeItem('ma-travel-request-token')}",
  );
  await call("Page.navigate", { url: "http://localhost:3000/travel/plan" });
  await until(
    async () => (await body()).includes("Who is joining your journey?"),
    "Planner did not load",
  );
  await evaluate(
    "localStorage.removeItem('ma-travel-draft-v1'); sessionStorage.removeItem('ma-travel-request-token')",
  );
  await call("Page.reload");
  await until(
    async () => (await body()).includes("Who is joining your journey?"),
    "Planner did not reload",
  );
  await until(
    async () =>
      await evaluate(
        "[...document.querySelectorAll('button')].some(b=>b.innerText==='CONTINUE'&&!b.disabled)",
      ),
    "Planner did not become interactive",
  );
  await evaluate("document.querySelectorAll('button[aria-label=Increase]')[1].click()");
  await pause();
  await click("CONTINUE");
  assert((await body()).includes("tell us each child’s age"), "Child ages required");
  await call("Page.reload");
  await until(async () => (await body()).includes("Step 1 of 7"), "Incomplete draft must restore");
  await until(
    async () => await evaluate("Boolean(document.querySelector('main select'))"),
    "Child age control restored",
  );
  await setInput("main select", "7", "HTMLSelectElement");
  await evaluate("document.querySelector('input[type=checkbox]').click()");
  await pause();
  await click("CONTINUE");
  await click("Umrah");
  await click("CONTINUE");
  await until(async () => (await body()).includes("Umrah Economy"), "Live packages must load");
  await click("Select package");
  await click("CONTINUE");
  await setInput("input[autocomplete='address-level2']", "Hyderabad");
  await click("CONTINUE");
  assert((await body()).includes("Step 5 of 7"));
  assert((await body()).includes("Any special requests?"));
  assert.equal(await evaluate("document.querySelector('details:has(select)').open"), false);
  assert.equal(
    await evaluate("JSON.parse(localStorage.getItem('ma-travel-draft-v1')).draft.room"),
    "package",
  );
  await evaluate(
    "[...document.querySelectorAll('label')].find(l=>l.innerText.includes('Extra breaks or slower walking')).querySelector('input').click()",
  );
  await pause();
  await evaluate("document.querySelector('details:has(select) summary').click()");
  await setInput("details select", "twin", "HTMLSelectElement");
  await evaluate(
    "[...document.querySelectorAll('label')].find(l=>l.innerText.includes('Mobility assistance')).querySelector('input').click()",
  );
  await pause();
  await click("CONTINUE");
  assert((await body()).includes("Step 6 of 7"));
  assert((await body()).includes("Continue with Google"));
  await click("CONTINUE AS GUEST");
  assert((await body()).includes("Step 7 of 7"));
  assert((await body()).includes("Hyderabad"));
  assert((await body()).includes("7 years"));
  await setInput("input[autocomplete='name']", "Browser Test Traveller");
  await setInput("input[type='tel']", "+91 9000000000");
  await setInput("input[type='email']", "traveller@example.com");
  await click("SEND TRAVEL REQUEST");
  assert((await body()).includes("allow our team to contact"), "Consent must be explicit");
  await evaluate("document.querySelector('input[type=checkbox]').click()");
  await pause();
  const saved = await evaluate("localStorage.getItem('ma-travel-draft-v1')");
  assert(
    !saved.includes("Browser Test") &&
      !saved.includes("9000000000") &&
      !saved.includes("traveller@example.com"),
    "Do not persist contact details",
  );
  for (const width of [320, 390, 1280]) {
    await call("Emulation.setDeviceMetricsOverride", {
      width,
      height: 844,
      deviceScaleFactor: 1,
      mobile: width < 600,
    });
    assert.equal(
      await evaluate("document.documentElement.scrollWidth > innerWidth"),
      false,
      `Review must fit ${width}px`,
    );
  }
  await evaluate(
    "(()=>{const button=Array.from(document.querySelectorAll('button')).find(b=>b.innerText.includes('SEND TRAVEL REQUEST'));button.click();button.click()})()",
  );
  await until(
    async () => (await body()).includes("save your request just now"),
    "Failed submission must show an error",
  );
  assert.equal(
    await evaluate("document.querySelector('input[autocomplete=name]').value"),
    "Browser Test Traveller",
    "Failure must preserve contact fields",
  );
  assert.equal(
    await evaluate("window.__travelPosts.length"),
    1,
    "Double click must send one request",
  );
  await click("SEND TRAVEL REQUEST");
  await until(
    async () => (await body()).includes("MAT-TEST-UI-ONLY"),
    "Retry must show a reference",
  );
  const posts = await evaluate("window.__travelPosts");
  assert.equal(posts.length, 2);
  assert.equal(
    posts[0].p_booking.request_token,
    posts[1].p_booking.request_token,
    "Retry must use same token",
  );
  assert.equal(posts[1].p_booking.adults, 2);
  assert.deepEqual(posts[1].p_booking.child_ages, [7]);
  assert.equal(posts[1].p_booking.preferences.seniors, 1);
  assert.equal(posts[1].p_booking.preferences.pace, "relaxed");
  assert.equal(posts[1].p_booking.preferences.room, "twin");
  assert.equal(posts[1].p_booking.preferences.stay, "package");
  assert.deepEqual(posts[1].p_booking.preferences.assistance, ["mobility"]);
  assert.equal(posts[1].p_booking.contact_consent, true);
  assert.equal(await evaluate("localStorage.getItem('ma-travel-draft-v1')"), null);
  console.log(
    "PASS: mobile/desktop flow, validation, incomplete draft restoration, live package selection, contact privacy, failure/retry and mock confirmation. No booking requests were sent to Supabase.",
  );
} finally {
  ws.close();
}
