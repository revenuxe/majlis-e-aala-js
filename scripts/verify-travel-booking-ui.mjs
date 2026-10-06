// Run against a local production server and isolated Chrome on port 9226.
// Auth and booking responses are mocked; no customer records are created.
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
const base = process.env.BOOKING_UI_BASE_URL || "http://localhost:3001";
const tab = (await (await fetch("http://localhost:9226/json")).json()).find(
  (t) => t.type === "page" && t.url.startsWith(base),
);
assert(tab);
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
  throw new Error("Booking UI not ready.");
}
let hook;
try {
  await call("Page.enable");
  await call("Network.enable");
  await call("Network.clearBrowserCookies");
  hook = await call("Page.addScriptToEvaluateOnNewDocument", {
    source: `
window.__emptyBookings=true;
const realFetch=fetch.bind(window);const user={id:'22222222-2222-4222-8222-222222222222',email:'ui-test@example.invalid',aud:'authenticated',role:'authenticated',app_metadata:{provider:'email'},user_metadata:{},created_at:new Date().toISOString()};
const expiry=Math.floor(Date.now()/1000)+3600;const token=btoa(JSON.stringify({alg:'HS256',typ:'JWT'}))+'.'+btoa(JSON.stringify({sub:user.id,exp:expiry,aud:'authenticated',role:'authenticated'}))+'.test';
const session={access_token:token,refresh_token:'mock-refresh',token_type:'bearer',expires_in:3600,expires_at:expiry,user};
const row={booking_reference:'MAT-UI-TEST',category:'umrah',package_name:'Umrah Standard',departure_city:'Bengaluru',preferred_date:'2026-12-20',preferred_month:null,adults:2,children:1,status:'new',quoted_total:null,created_at:new Date().toISOString()};
window.fetch=async(input,init)=>{const url=typeof input==='string'?input:input.url;const json=data=>new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json'}});if(url.includes('/auth/v1/token'))return json(session);if(url.includes('/auth/v1/user'))return json(user);if(url.includes('/rpc/get_my_travel_bookings'))return json(window.__emptyBookings?[]:[row]);if(url.includes('/rpc/get_my_travel_booking'))return json([row]);if(url.includes('/auth/v1/'))return json({});return realFetch(input,init);};
`,
  });
  await call("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await call("Page.navigate", { url: base + "/travel/bookings" });
  await until(() => evaluate("!!document.querySelector('form input[type=email]')"));
  for (const [selector, value] of [
    ["form input[type=email]", "ui-test@example.invalid"],
    ["form input[type=password]", "mock-password"],
  ]) {
    await evaluate(
      `(()=>{const e=document.querySelector(${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));})()`,
    );
  }
  await evaluate("document.querySelector('form button[type=submit]').click()");
  await until(() => evaluate("document.body.innerText.includes('No trips booked yet')"));
  assert.equal(await evaluate("document.documentElement.scrollWidth>innerWidth"), false);
  if (process.env.BOOKING_UI_SCREENSHOTS === "1") {
    const shot = await call("Page.captureScreenshot", { format: "png" });
    await writeFile(".next/bookings-empty-390.png", Buffer.from(shot.data, "base64"));
  }
  await evaluate(
    "window.__emptyBookings=false;document.querySelector('button[aria-label=\"Refresh status\"]').click()",
  );
  await until(() => evaluate("document.body.innerText.includes('Umrah Standard')"));
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
      `Overflow at ${width}px`,
    );
  }
  if (process.env.BOOKING_UI_SCREENSHOTS === "1") {
    await call("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    });
    const shot = await call("Page.captureScreenshot", { format: "png" });
    await writeFile(".next/bookings-card-390.png", Buffer.from(shot.data, "base64"));
  }
  console.log(
    "PASS: empty and populated booking page, icon refresh, and 320/390/1280px layouts. Auth and booking responses mocked.",
  );
} finally {
  if (hook) await call("Page.removeScriptToEvaluateOnNewDocument", { identifier: hook.identifier });
  await call("Network.clearBrowserCookies");
  await call("Browser.close");
  ws.close();
}
