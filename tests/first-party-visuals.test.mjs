import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const home = fs.readFileSync(new URL("../pages/index.js", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../styles/Home.module.css", import.meta.url), "utf8");
const en = fs.readFileSync(new URL("../lib/i18n/en.js", import.meta.url), "utf8");
const ar = fs.readFileSync(new URL("../lib/i18n/ar.js", import.meta.url), "utf8");

test("homepage visuals are first-party inline SVG and CSS", () => {
  assert.match(home, /function VisualIcon/);
  assert.match(home, /function FlowConnector/);
  assert.match(home, /<svg[^>]+viewBox=/);
  assert.match(css, /\.platformStats/);
  assert.doesNotMatch(home, /fontawesome|lucide|heroicons|icons8|unsplash|pexels|pixabay/i);
});

test("workflow and platform stats use current page configuration", () => {
  assert.match(home, /goals\.length/);
  assert.match(home, /workflow\.length/);
  assert.match(home, /capabilities\.length/);
  assert.match(home, /<FlowConnector \/>/);
});

test("visual stat labels are bilingual", () => {
  assert.match(en, /Platform overview/);
  assert.match(en, /visible workflow stages/);
  assert.match(ar, /نظرة عامة على المنصة/);
  assert.match(ar, /مراحل ظاهرة لمسار العمل/);
});
