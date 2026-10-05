// Uses the isolated Chrome profile on port 9226. All auth and booking writes are mocked.
import assert from "node:assert/strict";
const tab = (await (await fetch("http://localhost:9226/json")).json()).find(
  (t) => t.type === "page" && t.url.includes("localhost:3000"),
);
assert(tab);
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const d = JSON.parse(e.data);
  if (d.id) {
    const p = pending.get(d.id);
    pending.delete(d.id);
    d.error ? p.reject(d.error) : p.resolve(d.result);
  }
};
const call = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const n = ++id;
    pending.set(n, { resolve, reject });
    ws.send(JSON.stringify({ id: n, method, params }));
  });
const pause = () => new Promise((r) => setTimeout(r, 180));
const evaluate = async (expression) => {
  const r = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
};
const body = () => evaluate("document.body.innerText");
async function until(test, message) {
  for (let n = 0; n < 80; n++) {
    if (await test()) return;
    await pause();
  }
  throw Error(message);
}
async function click(text) {
  await evaluate(
    `(()=>{const e=[...document.querySelectorAll('button')].find(b=>b.innerText.includes(${JSON.stringify(text)}));if(!e)throw Error('Missing button');e.click();})()`,
  );
  await pause();
}
async function input(selector, value, prototype = "HTMLInputElement") {
  await evaluate(
    `(()=>{const e=document.querySelector(${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(${prototype}.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));})()`,
  );
  await pause();
}
const userId = "22222222-2222-4222-8222-222222222222";
let hook;
try {
  await call("Page.enable");
  await call("Runtime.enable");
  await call("Network.enable");
  await call("Network.clearBrowserCookies");
  await evaluate("localStorage.removeItem('ma-travel-draft-v1');sessionStorage.clear()");
  hook = await call("Page.addScriptToEvaluateOnNewDocument", {
    source: `
window.__authTestBoot=crypto.randomUUID();window.__authPosts=[];window.__bookings=[];window.__trackingStatus='quoted';
const realFetch=window.fetch.bind(window);
const testUser={id:${JSON.stringify(userId)},aud:'authenticated',role:'authenticated',email:'signed-in-traveller@example.com',app_metadata:{provider:'email',providers:['email']},user_metadata:{travel_profile:{name:'Saved Travel Customer',phone:'+91 9000000001',email:'signed-in-traveller@example.com'}},created_at:new Date().toISOString()};
const expiry=Math.floor(Date.now()/1000)+3600;
const token=btoa(JSON.stringify({alg:'HS256',typ:'JWT'}))+'.'+btoa(JSON.stringify({sub:testUser.id,exp:expiry,aud:'authenticated',role:'authenticated'}))+'.test-signature';
const session={access_token:token,refresh_token:'mock-refresh-token',token_type:'bearer',expires_in:3600,expires_at:expiry,user:testUser};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
window.fetch=async(input,init)=>{
const url=typeof input==='string'?input:input.url;
if(url.includes('/auth/v1/')){
window.__authPosts.push({url,method:init?.method||'GET'});
if(url.includes('/signup'))return json({user:testUser,session:null});
if(url.includes('/token'))return json(session);
if(url.includes('/user')&&init?.method==='PUT')return json({msg:'Mock profile sync failure'},500);
if(url.includes('/user'))return json(testUser);
return json({});
}
if(url.includes('/rpc/submit_travel_booking')){window.__bookings.push(JSON.parse(init.body));return json([{booking_reference:'MAT-SIGNED-IN-TEST'}]);}
if(url.includes('/rpc/get_my_travel_booking'))return json([{booking_reference:'MAT-SIGNED-IN-TEST',category:'umrah',package_name:'The Essential Umrah',departure_city:'Hyderabad',preferred_date:null,preferred_month:null,dates_flexible:true,adults:2,children:0,status:window.__trackingStatus,estimated_adult_total:null,quoted_total:12345,created_at:new Date().toISOString()}]);
if(url.includes('/rest/v1/orders'))return json([{id:'33333333-3333-4333-8333-333333333333',booking_reference:'CAT-TEST-ONLY',customer_name:'Catering Test Customer',phone:'910000000010',occasion:'Nikah',event_date:'2026-12-20',guests:100,estimated_total:45000,status:'confirmed',venue:{area:'Bengaluru'},created_at:new Date().toISOString()}]);
if(url.includes('/rest/v1/travel_booking_requests'))return json([{id:'44444444-4444-4444-8444-444444444444',booking_reference:'MAT-SIGNED-IN-TEST',customer_name:'Travel Test Customer',phone:'910000000020',category:'umrah',departure_city:'Hyderabad',adults:2,children:0,child_ages:[],preferences:{room:'twin',stay:'comfort',assistance:[]},package_snapshot:{name:'The Essential Umrah'},estimated_adult_total:null,quoted_total:12345,notes:'',admin_notes:'',status:'quoted',created_at:new Date().toISOString()}]);
if(url.includes('/travel_packages')||url.includes('/travel_departures')||url.includes('/travel_hero_carousels')){const headers=new Headers(init?.headers);headers.delete('Authorization');return realFetch(input,{...init,headers});}
if(url.includes('/rest/v1/')&&!url.includes('/travel_packages')&&!url.includes('/travel_departures')&&!url.includes('/travel_hero_carousels'))return json([]);
return realFetch(input,init);
};`,
  });
  await call("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await call("Page.navigate", {
    url: "http://localhost:3000/travel/plan?category=umrah&travellers=2",
  });
  await until(
    async () =>
      await evaluate(
        "[...document.querySelectorAll('button')].some(b=>b.innerText==='CONTINUE'&&!b.disabled)",
      ),
    "Planner not ready",
  );
  assert(
    !(await evaluate("location.search.includes('category')")),
    "Homepage presets consumed once",
  );
  await click("CONTINUE");
  await input("input[autocomplete='address-level2']", "Hyderabad");
  await click("CONTINUE");
  await click("CONTINUE");
  await until(async () => (await body()).includes("The Essential Umrah"), "Catalogue missing");
  await click("Choose this journey");
  await click("CONTINUE");
  await input("textarea", "A gentle pace for our family", "HTMLTextAreaElement");
  await click("CONTINUE");
  assert((await body()).includes("Step 6 of 7"));
  assert((await body()).includes("Keep your journeys together."));
  await click("Create account");
  await input("form input[type=email]", "signed-in-traveller@example.com");
  await input("form input[type=password]", "mock-password-only");
  await evaluate("document.querySelector('form button[type=submit]').click()");
  await until(
    async () => (await body()).includes("Check your inbox"),
    "Email confirmation notice missing",
  );
  await evaluate(
    "[...document.querySelectorAll('button')].find(b=>b.type==='button'&&b.innerText==='Sign in').click()",
  );
  await pause();
  await evaluate("document.querySelector('form button[type=submit]').click()");
  await until(async () => (await body()).includes("Step 7 of 7"), "Sign-in did not advance");
  assert.equal(
    await evaluate("document.querySelector('input[autocomplete=name]').value"),
    "Saved Travel Customer",
  );
  assert.equal(await evaluate("document.querySelector('input[type=tel]').value"), "+91 9000000001");
  const tokenBefore = await evaluate("sessionStorage.getItem('ma-travel-request-token')");
  // Simulate the browser returning from Google OAuth with the saved draft and session.
  await call("Page.navigate", { url: "http://localhost:3000/travel/plan?step=6" });
  await until(
    async () => (await body()).includes("Step 7 of 7"),
    "Authenticated return did not resume review",
  );
  assert((await body()).includes("Hyderabad"));
  await until(
    async () => (await body()).includes("The Essential Umrah"),
    "Selected package lost after authentication",
  );
  assert.equal(await evaluate("sessionStorage.getItem('ma-travel-request-token')"), tokenBefore);
  await click("Back");
  assert.equal(
    await evaluate("document.querySelector('textarea').value"),
    "A gentle pace for our family",
  );
  await click("CONTINUE");
  assert((await body()).includes("Step 7 of 7"), "Already signed-in user should skip auth");
  await evaluate("document.querySelector('input[type=checkbox]').click()");
  await pause();
  await click("SEND TRAVEL REQUEST");
  await until(
    async () => (await body()).includes("MAT-SIGNED-IN-TEST"),
    "Signed-in request failed",
  );
  assert((await body()).includes("View your travel requests in your account"));
  assert.equal(await evaluate("window.__bookings.length"), 1);
  assert.equal(
    await evaluate("window.__bookings[0].p_booking.notes"),
    "A gentle pace for our family",
  );
  assert.equal(
    await evaluate("localStorage.getItem('ma-travel-draft-v1')"),
    null,
    "Profile failure must not retain submitted draft",
  );
  assert(
    await evaluate(
      `localStorage.getItem('majlise-aala-travel-profile:${userId}').includes('Saved Travel Customer')`,
    ),
  );
  await evaluate(
    "localStorage.setItem('majlise-aala-bookings',JSON.stringify([{reference:'OTHER-CUSTOMER-CACHE',occasion:'Other customer event',guests:999,packageName:'Private package',status:'confirmed'}]))",
  );
  await call("Page.navigate", { url: "http://localhost:3000/profile" });
  await until(
    async () => (await body()).toLowerCase().includes("your travel requests"),
    "Account travel section missing",
  );
  await until(
    async () => (await body()).includes("MAT-SIGNED-IN-TEST"),
    "Account travel history missing",
  );
  assert(
    !(await body()).includes("OTHER-CUSTOMER-CACHE"),
    "Legacy device cache must not leak another customer's booking",
  );
  assert.equal(await evaluate("localStorage.getItem('majlise-aala-bookings')"), null);
  assert.equal(await evaluate("document.documentElement.scrollWidth>innerWidth"), false);
  await call("Page.navigate", {
    url: "http://localhost:3000/orders?service=travel&reference=MAT-SIGNED-IN-TEST",
  });
  await until(
    async () =>
      await evaluate("!!document.querySelector('ol[aria-label=\"Travel booking tracking\"]')"),
    "Travel tracking did not load",
  );
  assert((await body()).includes("Itinerary planning"));
  assert.equal(
    await evaluate(
      "document.querySelector('[aria-current=step]').innerText.includes('Travel quotation shared')",
    ),
    true,
  );
  assert((await body()).includes("12345") || (await body()).includes("12,345"));
  await click("Catering Booking");
  await until(
    async () =>
      await evaluate("!!document.querySelector('ol[aria-label=\"Catering booking tracking\"]')"),
    "Catering tracking did not load",
  );
  assert((await body()).includes("CAT-TEST-ONLY"));
  assert(
    !(await body()).includes("MAT-SIGNED-IN-TEST"),
    "Travel records must not appear in catering tracking",
  );
  assert.equal(
    await evaluate(
      "document.querySelector('[aria-current=step]').innerText.includes('Catering booking confirmed')",
    ),
    true,
  );
  await click("Travel Booking");
  await until(
    async () =>
      await evaluate("!!document.querySelector('ol[aria-label=\"Travel booking tracking\"]')"),
    "Travel tab switch failed",
  );
  for (const width of [320, 390, 1280]) {
    await call("Emulation.setDeviceMetricsOverride", {
      width,
      height: 844,
      deviceScaleFactor: 1,
      mobile: width < 600,
    });
    assert.equal(await evaluate("document.documentElement.scrollWidth>innerWidth"), false);
  }
  await evaluate("window.__trackingStatus='cancelled'");
  await click("Refresh travel status");
  await until(
    async () => (await body()).includes("Travel booking cancelled"),
    "Cancelled travel state missing",
  );
  assert.equal(
    await evaluate("!!document.querySelector('ol[aria-label=\"Travel booking tracking\"]')"),
    false,
    "Cancelled journey must not show completed progress",
  );
  if (process.env.VERIFY_ADMIN_TRACKING === "1") {
    await call("Page.navigate", { url: "http://localhost:3000/travel/admin-check" });
    await until(
      async () =>
        await evaluate("[...document.querySelectorAll('button')].some(b=>b.innerText==='Orders')"),
      "Admin test view missing",
    );
    await click("Orders");
    await until(
      async () => (await body()).includes("Catering orders"),
      "Admin catering tab missing",
    );
    await evaluate(
      "[...document.querySelectorAll('[aria-label=\"Order service\"] button')].find(b=>b.innerText==='Travel').click()",
    );
    await until(
      async () => (await body()).includes("Travel Test Customer"),
      "Admin travel orders missing",
    );
    assert(
      !(await body()).includes("Catering Test Customer"),
      "Admin travel/catering records mixed",
    );
    assert(
      !(await body()).includes("Add travel package"),
      "Order view must not show catalogue editors",
    );
    await evaluate(
      "[...document.querySelectorAll('[aria-label=\"Order service\"] button')].find(b=>b.innerText==='Catering').click()",
    );
    await until(
      async () => (await body()).includes("Catering Test Customer"),
      "Admin catering orders missing",
    );
    assert(!(await body()).includes("Travel Test Customer"));
    console.log("PASS: separate admin Catering/Travel order tabs and isolated records.");
  }
  await call("Network.clearBrowserCookies");
  await call("Page.navigate", { url: "http://localhost:3000/orders?service=travel" });
  await until(
    async () => (await body()).includes("Sign in to view your orders"),
    "Signed-out tracker must require authentication",
  );
  assert(
    !(await body()).includes("MAT-SIGNED-IN-TEST"),
    "Signed-out customer records must be cleared",
  );
  // A callback must not redirect to an attacker-supplied origin.
  const invalid = await fetch(
    "http://localhost:3000/auth/callback?next=https%3A%2F%2Fexample.invalid",
    { redirect: "manual" },
  );
  assert.equal(new URL(invalid.headers.get("location")).pathname, "/profile");
  assert.equal(invalid.headers.get("cache-control"), "no-store");
  const failed = await fetch(
    "http://localhost:3000/auth/callback?next=%2Ftravel%2Fplan%3Fstep%3D6",
    { redirect: "manual" },
  );
  assert.equal(new URL(failed.headers.get("location")).searchParams.get("auth_error"), "1");
  console.log(
    "PASS: shared auth, email confirmation, profile prefill, OAuth resume, saved choices, signed-in submission, profile-sync failure isolation, account history and safe callback redirects. All auth and booking writes were mocked.",
  );
} finally {
  if (hook) await call("Page.removeScriptToEvaluateOnNewDocument", { identifier: hook.identifier });
  await call("Network.clearBrowserCookies");
  await evaluate(
    `localStorage.removeItem('majlise-aala-travel-profile:${userId}');localStorage.removeItem('ma-travel-draft-v1');sessionStorage.clear()`,
  );
  ws.close();
}
