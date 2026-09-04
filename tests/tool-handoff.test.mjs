import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import { setImmediate } from "node:timers/promises";
import { test } from "node:test";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const swc = require("next/dist/build/swc");
await swc.loadBindings();
const helperSource = readFileSync(new URL("../lib/tool-handoff.js", import.meta.url), "utf8").replaceAll("export function", "function").replaceAll("export const", "const");
const compiled = {};
for (const name of ["prompt", "code", "excel", "colab"]) {
  compiled[name] = (await swc.transform(readFileSync(new URL(`../pages/tools/${name}.js`, import.meta.url), "utf8"), {
    jsc: { parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } }, module: { type: "commonjs" },
  })).code;
}
function find(node, predicate) {
  if (!node || typeof node !== "object") return null;
  if (predicate(node)) return node;
  for (const child of React.Children.toArray(node.props?.children)) {
    const found = find(child, predicate);
    if (found) return found;
  }
  return null;
}
function session() {
  const stored = new Map();
  return { stored, getItem: (k) => stored.get(k) ?? null, setItem: (k, v) => stored.set(k, v), removeItem: (k) => stored.delete(k) };
}
function page(name, storage = session(), search = "") {
  const slots = [];
  let cursor = 0;
  let effect;
  const frames = [];
  const calls = [];
  const copied = [];
  const opened = [];
  const exports = {};
  const hooks = {
    ...React,
    useState(initial) {
      const i = cursor++;
      if (!(i in slots)) slots[i] = initial;
      return [slots[i], (v) => { slots[i] = typeof v === "function" ? v(slots[i]) : v; }];
    },
    useRef(initial) { const i = cursor++; return slots[i] ??= { current: initial }; },
    useEffect(fn) { effect = fn; },
  };
  const scope = {
    exports, URLSearchParams, AbortController, sessionStorage: storage,
    window: {
      crypto: { randomUUID }, location: { search, href: "" },
      requestAnimationFrame(fn) { frames.push(fn); return frames.length; }, cancelAnimationFrame() {},
      setTimeout() { return 1; }, clearTimeout() {}, open: (...args) => opened.push(args),
    },
    navigator: { clipboard: { writeText: async (value) => copied.push(value) } },
    fetch: async (url, options) => { calls.push({ url, body: JSON.parse(options.body) }); return { ok: true, json: async () => ({ result: name === "prompt" ? "Prepare a frequency-analysis program." : "Explanation followed by JavaScript: console.log('review first');" }) }; },
    require(module) {
      if (module === "react") return hooks;
      if (module === "next/router") return { useRouter: () => ({ asPath: `/tools/${name}${search}` }) };
      if (module === "next/link") return function MockLink({ children, ...props }) { return React.createElement("a", props, children); };
      if (module === "../../components/Layout") return function MockLayout({ children }) { return React.createElement("main", null, children); };
      if (module === "../../components/LanguageProvider") return { useLanguage: () => ({ language: "en", direction: "ltr" }) };
      if (module === "../../lib/tool-handoff") return { createToolHandoff: scope.createToolHandoff, readToolHandoff: scope.readToolHandoff, codeTask: scope.codeTask };
      if (module === "xlsx") return {
        read: () => ({ SheetNames: ["Sheet1", "Sheet2"], Sheets: { Sheet1: {}, Sheet2: {} } }),
        utils: { sheet_to_json: () => [["text", "label"], ["PRIVATE CELL SENTINEL", "SECRET VALUE"]] },
      };
      return require(module);
    },
  };
  vm.createContext(scope); vm.runInContext(helperSource, scope); vm.runInContext(compiled[name], scope);
  const render = () => { cursor = 0; return exports.default(); };
  return {
    scope, storage, calls, copied, opened, render,
    stateValues: () => [...slots],
    mount() { render(); effect?.(); while (frames.length) frames.shift()(); },
    button(label) { const button = find(render(), (el) => el.type === "button" && React.Children.toArray(el.props.children).join("").includes(label)); assert.ok(button, label); return button; },
    input(id) { const el = find(render(), (el) => el.props.id === id); assert.ok(el, id); return el; },
  };
}

test("Prompt → Code prefills an editable task only after explicit continuation", async () => {
  const prompt = page("prompt"); prompt.mount();
  await prompt.button("Generate").props.onClick();
  assert.equal(prompt.storage.stored.size, 0);
  prompt.button("Continue to Code").props.onClick();
  const code = page("code", prompt.storage, new URL(prompt.scope.window.location.href, "https://example.test").search); code.mount();
  assert.equal(code.input("research-code-task").props.value, "Prepare a frequency-analysis program.");
  assert.equal(code.calls.length, 0);
  code.input("research-code-task").props.onChange({ target: { value: "User revised task" } });
  assert.equal(code.input("research-code-task").props.value, "User revised task");
  await code.button("Generate Research Code").props.onClick();
  assert.equal(code.calls[0].body.task, "User revised task");
});

test("Excel → Code transfers structural metadata and excludes preview/cell/file contents", async () => {
  const excel = page("excel"); excel.mount();
  const input = find(excel.render(), (el) => el.type === "input" && el.props.type === "file");
  input.props.onChange({ target: { files: [{ name: "study.xlsx", size: 10, arrayBuffer: async () => new ArrayBuffer(0) }] } });
  await setImmediate();
  assert.match(renderToStaticMarkup(excel.render()), /PRIVATE CELL SENTINEL/);
  excel.button("Continue to Code").props.onClick();
  const serialized = excel.storage.getItem("lingualab-tool-handoff:code");
  assert.doesNotMatch(serialized, /PRIVATE CELL|SECRET VALUE|previewRows|arrayBuffer|workbook/);
  assert.deepEqual(JSON.parse(serialized).payload, { filename: "study.xlsx", sheet: "Sheet1", headers: ["text", "label"], rowCount: 1, columnCount: 2 });
  const code = page("code", excel.storage, new URL(excel.scope.window.location.href, "https://example.test").search); code.mount();
  assert.match(code.input("research-code-task").props.value, /study.xlsx/);
  assert.match(code.input("research-code-task").props.value, /Data rows: 1; column count: 2/);
  assert.equal(code.calls.length, 0);
  const safe = excel.scope.createToolHandoff("excel", "code", { filename: "x", sheet: "s", headers: ["a"], rowCount: 1, columnCount: 1, previewRows: [["SECRET"]], cell: "SECRET", workbook: "SECRET" });
  assert.ok(safe); assert.doesNotMatch(excel.storage.getItem("lingualab-tool-handoff:code"), /SECRET|previewRows|workbook/);
});

test("Code → Colab preserves the response for deliberate copying without execution or external transfer", async () => {
  const code = page("code"); code.mount();
  code.input("research-code-task").props.onChange({ target: { value: "Explain JavaScript" } });
  code.input("code-language").props.onChange({ target: { value: "JavaScript" } });
  await code.button("Generate Research Code").props.onClick();
  const generatedResponse = find(code.render(), (el) => el.type === "pre").props.children;
  code.input("code-language").props.onChange({ target: { value: "Python" } });
  assert.equal(code.storage.stored.size, 0);
  code.button("Continue to Google Colab").props.onClick();
  assert.equal(JSON.parse(code.storage.getItem("lingualab-tool-handoff:colab")).payload.response, generatedResponse);
  const colab = page("colab", code.storage, new URL(code.scope.window.location.href, "https://example.test").search); colab.mount();
  const html = renderToStaticMarkup(colab.render());
  assert.match(html, /Selected language: JavaScript/);
  assert.match(html, /Explanation followed by JavaScript/);
  assert.equal(find(colab.render(), (el) => el.type === "pre").props.children, generatedResponse);
  assert.equal(colab.calls.length, 0); assert.equal(colab.opened.length, 0); assert.equal(colab.copied.length, 0);
  await colab.button("Copy response").props.onClick();
  assert.equal(colab.copied[0], generatedResponse);
  colab.button("فتح Google Colab").props.onClick();
  assert.deepEqual(colab.opened[0], ["https://colab.research.google.com/", "_blank"]);
});

test("expired, invalid, missing and destination-mismatched handoffs fall back to standalone", () => {
  for (const destination of ["code", "colab"]) {
    const h = page(destination);
    const source = destination === "code" ? "prompt" : "code";
    const payload = destination === "code" ? { prompt: "draft" } : { response: "draft", language: "Python" };
    const url = h.scope.createToolHandoff(source, destination, payload);
    const key = `lingualab-tool-handoff:${destination}`;
    const record = JSON.parse(h.storage.getItem(key));
    const query = new URL(url, "https://example.test").search;
    const standalone = page(destination, h.storage); standalone.mount();
    if (destination === "code") assert.equal(standalone.input("research-code-task").props.value, "");
    else assert.doesNotMatch(renderToStaticMarkup(standalone.render()), /Review your generated response/);
    for (const value of ["bad JSON", JSON.stringify({ ...record, createdAt: Date.now() - 600000 }), JSON.stringify({ ...record, createdAt: Date.now() + 60000 }), JSON.stringify({ ...record, id: "wrong" }), JSON.stringify({ ...record, destination: "wrong" }), JSON.stringify({ ...record, payload: {} })]) {
      h.storage.setItem(key, value);
      const tool = page(destination, h.storage, query); tool.mount();
      assert.equal(tool.calls.length, 0);
      if (destination === "code") assert.equal(tool.input("research-code-task").props.value, "");
      else assert.doesNotMatch(renderToStaticMarkup(tool.render()), /Review your generated response/);
    }
  }
});

test("all four tools retain standalone access, and transfers are bounded", () => {
  for (const name of ["prompt", "code", "excel", "colab"]) {
    const h = page(name); h.mount();
    assert.ok(renderToStaticMarkup(h.render()));
    assert.equal(h.calls.length, 0); assert.equal(h.storage.stored.size, 0);
  }
  const h = page("code");
  assert.throws(() => h.scope.createToolHandoff("prompt", "code", { prompt: "x".repeat(6001) }));
  assert.throws(() => h.scope.createToolHandoff("code", "colab", { response: "x".repeat(100001), language: "Python" }));
  assert.equal(h.storage.stored.size, 0);
});

test("Colab clear removes UI state even when sessionStorage removal throws", async () => {
  for (const blocked of [false, true]) {
    const h = page("colab");
    const url = h.scope.createToolHandoff("code", "colab", { response: "response to clear", language: "Python" });
    const colab = page("colab", h.storage, new URL(url, "https://example.test").search); colab.mount();
    await colab.button("Copy response").props.onClick();
    if (blocked) h.storage.removeItem = () => { throw new Error("Storage unavailable"); };
    assert.doesNotThrow(() => colab.button("Clear transferred response").props.onClick());
    const html = renderToStaticMarkup(colab.render());
    assert.doesNotMatch(html, /Review your generated response|response to clear|Copied\./);
    assert.equal(colab.calls.length, 0); assert.equal(colab.opened.length, 0);
    if (blocked) {
      assert.match(html, /saved handoff could not be removed/);
      assert.ok(h.storage.getItem("lingualab-tool-handoff:colab"));
    } else {
      assert.doesNotMatch(html, /saved handoff could not be removed/);
      assert.equal(h.storage.getItem("lingualab-tool-handoff:colab"), null);
    }
  }
});

test("matching expired records are removed and oversized stored records are rejected", () => {
  for (const destination of ["code", "colab"]) {
    const h = page(destination);
    const payload = destination === "code" ? { prompt: "draft" } : { response: "draft", language: "Python" };
    const url = h.scope.createToolHandoff(destination === "code" ? "prompt" : "code", destination, payload);
    const query = new URL(url, "https://example.test").search;
    const key = `lingualab-tool-handoff:${destination}`;
    const record = JSON.parse(h.storage.getItem(key));
    h.storage.setItem(key, JSON.stringify({ ...record, createdAt: Date.now() - 600000 }));
    assert.equal(h.scope.readToolHandoff(destination, query), null);
    assert.equal(h.storage.getItem(key), null);
    const oversizedPayload = destination === "code" ? { prompt: "x".repeat(6001) } : { response: "x".repeat(100001), language: "Python" };
    for (const oversized of [{ ...record, padding: "x".repeat(120001) }, { ...record, payload: oversizedPayload }]) {
      h.storage.setItem(key, JSON.stringify(oversized));
      assert.equal(h.scope.readToolHandoff(destination, query), null);
      const tool = page(destination, h.storage, query);
      assert.doesNotThrow(() => tool.mount());
      assert.equal(tool.calls.length, 0);
      if (destination === "code") assert.equal(tool.input("research-code-task").props.value, "");
      else assert.doesNotMatch(renderToStaticMarkup(tool.render()), /Review your generated response/);
    }
  }
});

test("Excel clears stale transfer errors on reset, file replacement and sheet change", async () => {
  for (const action of ["reset", "file", "sheet"]) {
    const excel = page("excel"); excel.mount();
    const upload = (name) => find(excel.render(), (el) => el.type === "input" && el.props.type === "file").props.onChange({
      target: { files: [{ name, size: 10, arrayBuffer: async () => new ArrayBuffer(0) }] },
    });
    upload("study.xlsx"); await setImmediate();
    excel.storage.setItem = () => { throw new Error("Storage unavailable"); };
    excel.button("Continue to Code").props.onClick();
    const error = find(excel.render(), (el) => el.props.role === "alert").props.children;
    assert.match(error, /transfer could not be saved/);
    if (action === "reset") excel.button("Remove file").props.onClick();
    if (action === "file") { upload("replacement.xlsx"); await setImmediate(); }
    if (action === "sheet") excel.input("sheet-selector").props.onChange({ target: { value: "Sheet2" } });
    assert.equal(excel.stateValues().includes(error), false);
    assert.doesNotMatch(renderToStaticMarkup(excel.render()), /transfer could not be saved/);
    if (action === "reset") assert.match(renderToStaticMarkup(excel.render()), /No spreadsheet selected/);
    if (action === "file") assert.match(renderToStaticMarkup(excel.render()), /replacement.xlsx/);
    if (action === "sheet") assert.equal(excel.input("sheet-selector").props.value, "Sheet2");
  }
});
