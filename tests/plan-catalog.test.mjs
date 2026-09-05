import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

// Exercise the provider's real loading effects with independently delayed queries.
const source = ts.transpileModule(
  readFileSync(new URL("../src/lib/plan-store.tsx", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } },
).outputText;
const flush = () => new Promise((resolve) => setImmediate(resolve));

function setup() {
  const state = [];
  const effects = [];
  const queries = new Map();
  const calls = new Map();
  let cursor = 0;
  let mounted = false;
  const react = {
    createContext: () => ({ Provider: "provider" }),
    useState(initial) {
      const index = cursor++;
      if (!mounted) state[index] = typeof initial === "function" ? initial() : initial;
      return [
        state[index],
        (next) => {
          state[index] = typeof next === "function" ? next(state[index]) : next;
        },
      ];
    },
    useEffect(effect) {
      if (!mounted) effects.push(effect);
    },
    useMemo: (fn) => fn(),
  };
  const supabase = {
    auth: {
      getUser: async () => ({ data: { user: null } }),
      onAuthStateChange: () => ({ data: { listener: null, subscription: { unsubscribe() {} } } }),
    },
    from(table) {
      let resolve;
      const promise = new Promise((done) => {
        resolve = done;
      });
      queries.set(table, resolve);
      const builder = {
        select: () => builder,
        order: () => builder,
        eq: () => builder,
        then(onSuccess, onError) {
          calls.set(table, (calls.get(table) ?? 0) + 1);
          return promise.then(onSuccess, onError);
        },
      };
      return builder;
    },
  };
  const module = { exports: {} };
  vm.runInNewContext(source, {
    exports: module.exports,
    require(name) {
      if (name === "react") return react;
      if (name === "react/jsx-runtime") return { jsx: (_type, props) => props };
      if (name.includes("supabase/client")) return { supabase };
      if (name === "./data") return { packageTotalFor: () => 0 };
      throw new Error(`Unexpected import: ${name}`);
    },
    window: {
      localStorage: { getItem: () => null, setItem() {} },
      setTimeout: () => 0,
      clearTimeout() {},
    },
  });
  const render = () => {
    cursor = 0;
    const result = module.exports.PlanProvider({ children: null });
    mounted = true;
    return result.value;
  };
  render();
  effects.forEach((effect) => effect());
  const resolve = (table, data = [], error = null) => queries.get(table)({ data, error });
  for (const table of ["menu_categories", "menu_items", "event_categories", "add_ons"])
    resolve(table);
  resolve("packages", [
    {
      id: "shared",
      name: "Shared package",
      tagline: "",
      price_per_mann: 1000,
      guests_per_mann: 100,
      event_category_id: "nikah",
      food_preference: "mixed",
    },
  ]);
  return { render, resolve, calls };
}

test("secondary occasions load before optional menu details, with one package request", async () => {
  const app = setup();
  await flush();
  assert.equal(app.render().catalogLoading, true);
  assert.equal(app.render().packages.length, 0);
  app.resolve("package_event_categories", [
    { package_id: "shared", event_category_id: "nikah" },
    { package_id: "shared", event_category_id: "walima" },
  ]);
  await flush();
  let result = app.render();
  assert.equal(result.catalogLoading, false);
  assert.equal(result.packages[0].eventCategoryIds.includes("walima"), true);
  assert.equal(result.packages[0].sections.length, 0);
  assert.equal(app.calls.get("packages"), 1);
  app.resolve("package_sections", [{ id: "section", package_id: "shared", title: "Main" }]);
  app.resolve("package_section_items", [{ section_id: "section", label: "Biryani" }]);
  await flush();
  result = app.render();
  assert.equal(result.packages[0].sections[0].items[0], "Biryani");
  assert.equal(result.packages[0].eventCategoryIds.includes("walima"), true);
});

test("failed menu details do not hide multi-occasion packages", async () => {
  const app = setup();
  app.resolve("package_event_categories", [{ package_id: "shared", event_category_id: "walima" }]);
  app.resolve("package_sections", null, { message: "Unavailable" });
  app.resolve("package_section_items");
  await flush();
  assert.equal(app.render().packages[0].eventCategoryIds.includes("walima"), true);
  assert.equal(app.render().packagesError, null);
});

test("failed occasion assignments report an error instead of publishing incomplete packages", async () => {
  const app = setup();
  app.resolve("package_event_categories", null, { message: "Unavailable" });
  app.resolve("package_sections");
  app.resolve("package_section_items");
  await flush();
  assert.equal(app.render().catalogLoading, false);
  assert.equal(app.render().packages.length, 0);
  assert.match(app.render().packagesError, /couldn't load/);
});
