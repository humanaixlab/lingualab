import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import { setImmediate } from "node:timers/promises";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const swc = require("next/dist/build/swc");
await swc.loadBindings();
const source = readFileSync(new URL("../pages/workspace.js", import.meta.url), "utf8");
const { code } = await swc.transform(source, {
  jsc: { parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } },
  module: { type: "commonjs" },
});

function find(element, predicate) {
  if (!element || typeof element !== "object") return null;
  if (predicate(element)) return element;
  for (const child of React.Children.toArray(element.props?.children)) {
    const found = find(child, predicate);
    if (found) return found;
  }
  return null;
}

function workspace() {
  const state = [];
  let cursor = 0;
  let pending;
  const hooks = {
    ...React,
    useState(initial) {
      const index = cursor++;
      if (!(index in state)) state[index] = initial;
      return [state[index], (value) => { state[index] = typeof value === "function" ? value(state[index]) : value; }];
    },
    useRef: () => ({ current: null }),
    useMemo: (calculate) => calculate(),
  };
  const exports = {};
  const context = {
    exports,
    require(name) {
      if (name === "react") return hooks;
      if (name === "next/head") return () => null;
      if (name === "next/link") return function MockLink({ children, ...props }) { return React.createElement("a", props, children); };
      if (name.endsWith(".css")) return {};
      return require(name);
    },
    window: { setTimeout(callback, delay) { if (delay === 650) pending = callback; else callback(); } },
    document: { getElementById: () => null },
    sessionStorage: { removeItem() {} },
  };
  vm.runInNewContext(code, context);
  const render = () => { cursor = 0; return exports.default(); };
  return {
    render,
    async upload(count) {
      const csv = "text,label\n" + Array.from({ length: count }, (_, i) => `نص عربي ${i},${i < 3 ? "A" : "B"}`).join("\n");
      const input = find(render(), (el) => el.type === "input" && el.props.type === "file");
      // The onChange callback does not return processFile's promise.
      input.props.onChange({ target: { files: [{ name: "current.csv", size: csv.length, text: async () => csv }] } });
      await setImmediate();
      find(render(), (el) => el.type === "button" && el.props.onClick?.name === "openWorkflow").props.onClick();
    },
    run() { find(render(), (el) => el.type === "button" && el.props.onClick?.name === "runWorkflow").props.onClick(); },
    finish() { assert.ok(pending); pending(); pending = null; },
    step2() { return find(render(), (el) => el.props.id === "guided-workflow"); },
  };
}

test("validation failure appears exactly once, inside Step 2", async () => {
  const page = workspace();
  await page.upload(5);
  page.run(); page.finish();
  const message = "At least six labeled records are required to run the classification baseline.";
  const alert = find(page.step2(), (el) => el.props.role === "alert");
  assert.equal(alert.props.children, message);
  const html = renderToStaticMarkup(page.render());
  assert.equal(html.split(message).length - 1, 1);
});

test("a new run immediately clears the previous error before execution", async () => {
  const page = workspace();
  await page.upload(5);
  page.run(); page.finish();
  page.run();
  assert.equal(find(page.step2(), (el) => el.props.role === "alert"), null);
  assert.match(renderToStaticMarkup(page.step2()), /Building your results/);
});

test("successful classification still renders results after an earlier failure", async () => {
  const page = workspace();
  await page.upload(5);
  page.run(); page.finish();
  await page.upload(6);
  page.run(); page.finish();
  assert.equal(find(page.step2(), (el) => el.props.role === "alert"), null);
  const html = renderToStaticMarkup(page.step2());
  assert.match(html, /Baseline complete/);
  assert.match(html, /test accuracy/);
  assert.match(html, /Confusion matrix/);
  assert.match(html, /Your research-ready report is prepared/);
});
