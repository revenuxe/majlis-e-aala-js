import assert from "node:assert/strict";
const tabs = await (await fetch("http://localhost:9227/json")).json();
const tab = tabs.find((x) => x.url === "about:blank");
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id) {
    const p = pending.get(m.id);
    pending.delete(m.id);
    m.error ? p.reject(m.error) : p.resolve(m.result);
  }
};
const call = (method, params = {}) =>
  new Promise((resolve, reject) => {
    pending.set(++id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async (expression) => {
  const r = await call("Runtime.evaluate", { expression, returnByValue: true });
  if (r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
};
const until = async (f) => {
  for (let n = 0; n < 100; n++) {
    if (await f()) return;
    await new Promise((r) => setTimeout(r, 200));
  }
  throw Error("UI timeout");
};
try {
  await call("Page.enable");
  await call("Page.addScriptToEvaluateOnNewDocument", {
    source: `const realFetch=fetch.bind(window);window.fetch=(input,init)=>{const u=typeof input==='string'?input:input.url;if(u.includes('/rest/v1/travel_packages'))return Promise.resolve(new Response(JSON.stringify([{id:'11111111-1111-4111-8111-111111111111',category:'umrah',name:'Umrah Economy',is_active:true}]),{headers:{'Content-Type':'application/json'}}));if(u.includes('/rest/v1/travel_departures'))return Promise.resolve(new Response(JSON.stringify([{id:'22222222-2222-4222-8222-222222222222',package_id:'11111111-1111-4111-8111-111111111111',start_date:'2026-12-25',end_date:null,departure_city:'Bengaluru',capacity:20,is_active:true,notes:''}]),{headers:{'Content-Type':'application/json'}}));return realFetch(input,init);};`,
  });
  for (const width of [320, 390]) {
    await call("Emulation.setDeviceMetricsOverride", {
      width,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    });
    await call("Page.navigate", {
      url: "http://localhost:3000/travel/dates?category=umrah&package=11111111-1111-4111-8111-111111111111&travellers=2&children=0&datesSelected=1&departure=22222222-2222-4222-8222-222222222222&date=2026-12-25&city=Bengaluru&flexible=false",
    });
    await until(() => evaluate("document.body.innerText.includes('Your selected batch')"));
    assert.equal(await evaluate("document.documentElement.scrollWidth > innerWidth"), false);
    assert.equal(await evaluate("!!document.querySelector('input[type=date]')"), false);
    await evaluate(
      "const s=document.querySelector('select');s.value='';s.dispatchEvent(new Event('change',{bubbles:true}));",
    );
    await until(() => evaluate("!!document.querySelector('input[type=date]')"));
    await call("Page.reload");
    await until(() => evaluate("!!document.querySelector('input[type=date]')"));
    assert.equal(await evaluate("document.querySelector('select').value"), "");
    assert.equal(await evaluate("document.querySelector('input[type=date]').value"), "2026-12-25");
    console.log(
      "Passed " + width + "px: full-width layout, batch summary, preferred date refresh.",
    );
  }
} finally {
  ws.close();
}
