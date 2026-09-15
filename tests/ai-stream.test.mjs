import assert from "node:assert/strict";
import test from "node:test";
import { AI_STREAM_CONTENT_TYPE, createOpenAiOutput, fetchAiJson, narrativeFromPartialJson, wantsAiStream } from "../lib/ai-stream.js";
import { readFileSync } from "node:fs";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("stream negotiation is explicit and preserves the ordinary JSON API fallback", () => {
  assert.equal(wantsAiStream({ headers: { accept: AI_STREAM_CONTENT_TYPE } }), true);
  assert.equal(wantsAiStream({ headers: { accept: "application/json" } }), false);
  for (const api of ["research-advisor", "research-interpreter"]) {
    const page = source(`pages/api/${api}.js`);
    assert.match(page, /createOpenAiOutput/);
  }
});

test("the server streams real Responses API deltas then validates one final structured value", async () => {
  const writes = [];
  const res = { setHeader() {}, flushHeaders() {}, write(value) { writes.push(value); }, end() {}, statusCode: 0 };
  const client = { responses: { create: async ({ stream }) => {
    assert.equal(stream, true);
    return (async function* () {
      yield { type: "response.output_text.delta", delta: '{"summary":"مرحبا ' };
      yield { type: "response.output_text.delta", delta: 'بكم"}' };
    })();
  } } };
  const generated = await createOpenAiOutput({ client, req: { headers: { accept: AI_STREAM_CONTENT_TYPE } }, res, request: {}, parse: JSON.parse, validate: (value) => value.summary === "مرحبا بكم", envelope: (value) => ({ value }) });
  assert.equal(generated.streamed, true);
  assert.match(writes.join(""), /"type":"delta"/);
  assert.match(writes.at(-1), /"type":"complete"/);
});

test("partial structured JSON exposes narrative chunks without breaking Arabic shaping", () => {
  assert.equal(narrativeFromPartialJson('{"summary":"التحليل اللغوي مت'), "التحليل اللغوي مت");
  assert.equal(narrativeFromPartialJson('{"summary":"First paragraph","limitations":"Second'), "First paragraph\n\nSecond");
});

test("the client keeps partial text visible and never accepts an interrupted stream as final", async () => {
  const previousFetch = globalThis.fetch;
  const events = `${JSON.stringify({ type: "delta", delta: '{"summary":"جزء مستلم' })}\n${JSON.stringify({ type: "error", error: "Interrupted" })}\n`;
  globalThis.fetch = async () => new Response(events, { headers: { "Content-Type": AI_STREAM_CONTENT_TYPE } });
  let visible = "";
  try {
    await assert.rejects(() => fetchAiJson("/api/test", {}, (value) => { visible = value; }), (error) => error.message === "Interrupted" && error.partialText === "جزء مستلم");
    assert.equal(visible, "جزء مستلم");
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test("progressive output uses language direction, status semantics, and reduced motion", () => {
  const component = source("components/ProgressiveAiOutput.js");
  const css = source("styles/ProgressiveAiOutput.module.css");
  assert.match(component, /language === "ar" \? "rtl" : "ltr"/);
  assert.match(component, /aria-busy=\{active\}/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.doesNotMatch(component, /split\(""\)|charAt|substring/);
});

test("streaming is limited to narrative advisor and interpreter UI, not deterministic results", () => {
  assert.match(source("pages/research-advisor.js"), /fetchAiJson[\s\S]*ProgressiveAiOutput/);
  assert.match(source("pages/tools/analyze.js"), /fetchAiJson[\s\S]*ProgressiveAiOutput/);
  for (const page of ["frequency", "concordance", "ngrams", "pos"]) {
    assert.doesNotMatch(source(`pages/tools/${page}.js`), /ProgressiveAiOutput|fetchAiJson/);
  }
});
