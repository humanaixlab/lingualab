export const AI_STREAM_CONTENT_TYPE = "application/x-ndjson; charset=utf-8";

export function wantsAiStream(req) {
  return String(req?.headers?.accept || "").includes("application/x-ndjson");
}

export async function createOpenAiOutput({ client, request, req, res, parse, validate, envelope }) {
  if (!wantsAiStream(req)) {
    const response = await client.responses.create(request);
    const value = parse(response.output_text || "");
    if (!validate(value)) throw new Error("AI response did not match the expected shape.");
    return { streamed: false, value };
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", AI_STREAM_CONTENT_TYPE);
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  let output = "";
  try {
    const stream = await client.responses.create({ ...request, stream: true });
    for await (const event of stream) {
      if (event.type !== "response.output_text.delta" || !event.delta) continue;
      output += event.delta;
      res.write(`${JSON.stringify({ type: "delta", delta: event.delta })}\n`);
    }
    const value = parse(output);
    if (!validate(value)) throw new Error("AI response did not match the expected shape.");
    res.write(`${JSON.stringify({ type: "complete", data: envelope(value) })}\n`);
    res.end();
    return { streamed: true, value };
  } catch (error) {
    res.write(`${JSON.stringify({ type: "error", error: "The AI response was interrupted before a valid result was completed." })}\n`);
    res.end();
    error.aiStreamHandled = true;
    throw error;
  }
}

function decodeJsonFragment(value) {
  try { return JSON.parse(`"${value}"`); } catch {
    return value.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
}

export function narrativeFromPartialJson(raw) {
  const values = [];
  const pattern = /"[^"\\]+"\s*:\s*"((?:\\.|[^"\\])*)("|$)/g;
  for (const match of raw.matchAll(pattern)) {
    const value = decodeJsonFragment(match[1]);
    if (value.trim()) values.push(value.trim());
  }
  return values.join("\n\n");
}

export async function fetchAiJson(url, options = {}, onProgress) {
  const response = await fetch(url, {
    ...options,
    headers: { ...(options.headers || {}), Accept: "application/x-ndjson" },
  });
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/x-ndjson")) {
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "AI request failed.");
    return data;
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("Streaming response is unavailable.");
  const decoder = new TextDecoder();
  let buffer = "";
  let raw = "";
  let completed;
  let streamError = "";

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
    const lines = buffer.split("\n");
    buffer = done ? "" : lines.pop();
    for (const line of lines) {
      if (!line.trim()) continue;
      const event = JSON.parse(line);
      if (event.type === "delta") {
        raw += event.delta;
        onProgress?.(narrativeFromPartialJson(raw));
      } else if (event.type === "complete") completed = event.data;
      else if (event.type === "error") streamError = event.error;
    }
    if (done) break;
  }
  if (completed) return completed;
  const error = new Error(streamError || "The AI response ended before completion.");
  error.partialText = narrativeFromPartialJson(raw);
  throw error;
}
