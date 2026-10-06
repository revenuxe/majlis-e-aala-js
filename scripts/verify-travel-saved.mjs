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
    if (await evaluate(`Boolean(${expression})`)) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(message);
}
const click = (text) =>
  evaluate(
    `(()=>{const button=Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()===${JSON.stringify(text)});if(!button)throw Error('Missing button: '+${JSON.stringify(text)});button.click()})()`,
  );
async function input(selector, value, prototype = "HTMLInputElement") {
  await evaluate(
    `(()=>{const input=document.querySelector(${JSON.stringify(selector)});if(!input)throw Error('Missing input');Object.getOwnPropertyDescriptor(${prototype}.prototype,'value').set.call(input,${JSON.stringify(value)});input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}))})()`,
  );
}
let hook;
try {
  await call("Page.enable");
  await call("Network.enable");
  await call("Network.clearBrowserCookies");
  hook = await call("Page.addScriptToEvaluateOnNewDocument", {
    source: `
    window.__savedErrors=[];window.__catalogReady=false;window.__profileWrites=[];
    window.addEventListener('error',e=>window.__savedErrors.push(e.message));
    window.addEventListener('unhandledrejection',e=>window.__savedErrors.push(String(e.reason)));
    const realFetch=fetch.bind(window);
    const user={id:'22222222-2222-4222-8222-222222222222',email:'saved-test@example.invalid',aud:'authenticated',role:'authenticated',app_metadata:{provider:'email'},user_metadata:{travel_profile:{name:'Travel Test',phone:'+91 9000000001',email:'saved-test@example.invalid'}},created_at:new Date().toISOString()};
    const expiry=Math.floor(Date.now()/1000)+3600;
    const token=btoa(JSON.stringify({alg:'HS256',typ:'JWT'}))+'.'+btoa(JSON.stringify({sub:user.id,exp:expiry,aud:'authenticated',role:'authenticated'}))+'.test';
    const session={access_token:token,refresh_token:'mock-refresh',token_type:'bearer',expires_in:3600,expires_at:expiry,user};
    const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
    window.fetch=async(input,init)=>{
      const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;
      if(url.includes('/rpc/submit_travel_booking'))throw Error('Booking writes blocked');
      if(url.includes('/rest/v1/travel_packages')){window.__catalogReady=true;return json(${JSON.stringify(packages)});}
      if(url.includes('/rest/v1/travel_departures'))return json([]);
      if(url.includes('/auth/v1/token'))return json(session);
      if(url.includes('/auth/v1/user')){
        if(init?.method==='PUT'){const body=JSON.parse(init.body);window.__profileWrites.push(body);user.user_metadata={...user.user_metadata,...body.data};}
        return json(user);
      }
      if(url.includes('/auth/v1/'))return json({});
      if(url.includes('/rpc/get_my_travel_bookings'))return json([]);
      return realFetch(input instanceof URL?input.href:input,init);
    };`,
  });
  await call("Page.navigate", {
    url: base + "/travel/packages/umrah?travellers=3&children=1&seniors=1",
  });
  await until(
    "window.__catalogReady && document.body.innerText.includes('3 adults') && document.body.innerText.includes('1 child')",
    "Package presets not ready",
  );
  await evaluate(
    "localStorage.removeItem('ma-travel-saved-packages-v1');localStorage.removeItem('ma-travel-draft-v1');sessionStorage.clear();window.dispatchEvent(new StorageEvent('storage',{key:'ma-travel-saved-packages-v1'}))",
  );
  const labels = await evaluate(
    "Array.from(document.querySelectorAll('[aria-label=\"Travel quick navigation\"] a')).map(a=>a.textContent.trim())",
  );
  assert.deepEqual(labels, ["Home", "Packages", "PLAN", "Bookings", "Profile"]);
  await click("Select package");
  await until(
    "location.pathname==='/travel/plan' && document.querySelector('main select')",
    "Planner did not open",
  );
  const selections = await evaluate(
    "JSON.parse(localStorage.getItem('ma-travel-saved-packages-v1'))",
  );
  assert.equal(selections.length, 1);
  assert.equal(selections[0].adults, 3);
  assert.equal(selections[0].children, 1);
  assert.equal(selections[0].seniors, 1);
  const selectedName = packages.find((pkg) => pkg.id === selections[0].packageId).name;
  await input("main select", "12", "HTMLSelectElement");
  await until(
    "JSON.parse(localStorage.getItem('ma-travel-draft-v1')).draft.childAges[0]===12",
    "Child age not persisted",
  );
  await evaluate("document.querySelector('header a[href=\"/travel/saved\"]').click()");
  await until(
    "location.pathname==='/travel/saved' && document.querySelector('article')",
    "Saved page missing selected package",
  );
  await until("window.__catalogReady", "Catalogue refresh not ready");
  assert(await evaluate(`document.body.innerText.includes(${JSON.stringify(selectedName)})`));
  assert(
    await evaluate(
      "document.body.innerText.includes('3 adults') && document.body.innerText.includes('1 child')",
    ),
  );
  await call("Page.reload");
  await until(
    "document.querySelector('article') && document.querySelector('header a[href=\"/travel/saved\"]').getAttribute('aria-label').includes('1 saved')",
    "Selection must survive reload",
  );
  await click("Continue booking");
  await until(
    "location.pathname==='/travel/plan' && document.querySelector('main select')?.value==='12'",
    "Saved package must resume with traveller ages",
  );
  assert.equal(
    await evaluate("JSON.parse(localStorage.getItem('ma-travel-saved-packages-v1')).length"),
    1,
    "Repeated selection must not duplicate saved packages",
  );
  await evaluate("document.querySelector('header a[href=\"/travel/saved\"]').click()");
  await until("document.querySelector('article')", "Saved card missing");
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
      `Saved page overflow at ${width}`,
    );
  }
  await click("Remove from saved");
  await until(
    "document.body.innerText.includes('No saved packages yet')",
    "Remove must update empty state",
  );
  await call("Page.reload");
  await until(
    "document.body.innerText.includes('No saved packages yet')",
    "Removal must survive reload",
  );
  await evaluate("localStorage.setItem('ma-travel-saved-packages-v1','invalid JSON')");
  await call("Page.reload");
  await until(
    "document.body.innerText.includes('No saved packages yet')",
    "Invalid saved data must recover",
  );
  await evaluate(
    'document.querySelector(\'[aria-label="Travel quick navigation"] a[href="/travel/profile"]\').click()',
  );
  await until(
    "location.pathname==='/travel/profile' && document.querySelector('form input[type=email]')",
    "Travel profile must support guest sign-in",
  );
  assert(
    await evaluate(
      "!!document.querySelector('[data-service=travel]') && !document.querySelector('[data-service=catering]')",
    ),
  );
  await input("form input[type=email]", "saved-test@example.invalid");
  await input("form input[type=password]", "mock-password");
  await evaluate("document.querySelector('form button[type=submit]').click()");
  await until(
    "document.body.innerText.includes('Personal details') && document.body.innerText.includes('Travel Test')",
    "Signed-in travel profile missing",
  );
  await click("Personal detailsEdit");
  await until(
    "!!document.querySelector('input[autocomplete=name]')",
    "Personal details form missing",
  );
  await input("input[autocomplete=name]", "Updated Traveller");
  await input("input[autocomplete=tel]", "+91 9000000002");
  await click("Save details");
  await until(
    "document.body.innerText.includes('Your travel details are saved.')",
    "Profile save failed",
  );
  const writes = await evaluate("window.__profileWrites");
  assert.equal(writes.length, 1);
  assert.equal(writes[0].data.travel_profile.name, "Updated Traveller");
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
      `Profile overflow at ${width}`,
    );
  }
  await click("Sign out");
  await until(
    "document.body.innerText.includes('Welcome, traveller') && document.querySelector('form input[type=password]')",
    "Sign-out must clear personal profile",
  );
  assert(!(await evaluate("document.body.innerText")).includes("Updated Traveller"));
  assert.equal(await evaluate("window.__savedErrors.length"), 0, "No runtime errors");
  await call("Emulation.setDeviceMetricsOverride", {
    width: 320,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  for (const path of [
    "/",
    "/travel/packages",
    "/travel/packages/umrah",
    "/travel/bookings",
    "/travel/plan",
    "/travel/profile",
    "/travel/saved",
  ]) {
    await call("Page.navigate", { url: base + path });
    await until(
      "!!document.querySelector('header a[href=\"/travel/saved\"]')",
      `${path}: saved shortcut missing`,
    );
    await evaluate("document.fonts.ready.then(()=>true)");
    assert.equal(
      await evaluate("document.documentElement.scrollWidth>innerWidth"),
      false,
      `${path}: header overflow at 320px`,
    );
  }
  const callback = await fetch(base + "/auth/callback?next=%2Ftravel%2Fprofile", {
    redirect: "manual",
  });
  assert.equal(new URL(callback.headers.get("location")).pathname, "/travel/profile");
  for (const path of ["/travel/profile", "/travel/saved"]) {
    const html = await (await fetch(base + path)).text();
    assert(/name="robots" content="[^"]*noindex/.test(html), `${path} must stay private`);
  }
  console.log(
    "PASS: requested navigation, auto-save, traveller counts, reload persistence, resume with child age, deduplication, removal, corrupt storage recovery, private travel profile, mocked profile save/sign-out, OAuth return and 320/390/1280px layouts. No live writes.",
  );
} finally {
  if (hook) await call("Page.removeScriptToEvaluateOnNewDocument", { identifier: hook.identifier });
  await evaluate(
    "localStorage.removeItem('majlise-aala-travel-profile:22222222-2222-4222-8222-222222222222');localStorage.removeItem('ma-travel-saved-packages-v1');localStorage.removeItem('ma-travel-draft-v1');sessionStorage.clear()",
  );
  await call("Network.clearBrowserCookies");
  ws.close();
}
