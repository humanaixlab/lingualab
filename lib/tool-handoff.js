// Explicit general-tool transfers only; separate from dataset/research context.
// Ten minutes is enough for the next step. Reads never renew the lifetime.
export const TOOL_HANDOFF_TTL_MS = 10 * 60 * 1000;
const PREFIX = "lingualab-tool-handoff:";
const languages = ["Python", "JavaScript", "HTML", "CSS"];
const bounded = (value, max) => typeof value === "string" && value.length <= max;

function payloadFor(source, destination, input) {
  if (!input || typeof input !== "object") return null;
  if (source === "prompt" && destination === "code") {
    return bounded(input.prompt, 6000) && input.prompt.trim() ? { prompt: input.prompt } : null;
  }
  if (source === "excel" && destination === "code") {
    if (!bounded(input.filename, 500) || !bounded(input.sheet, 500) ||
        !Array.isArray(input.headers) || input.headers.length > 100 ||
        !input.headers.every((header) => bounded(header, 500)) ||
        !Number.isSafeInteger(input.rowCount) || input.rowCount < 0 ||
        !Number.isSafeInteger(input.columnCount) || input.columnCount < 1 ||
        input.headers.length !== input.columnCount) return null;
    // Deliberately whitelist structure: never copy preview rows, cells or files.
    const payload = {
      filename: input.filename, sheet: input.sheet, headers: [...input.headers],
      rowCount: input.rowCount, columnCount: input.columnCount,
    };
    return codeTask({ source, payload }).length <= 6000 ? payload : null;
  }
  if (source === "code" && destination === "colab") {
    return bounded(input.response, 100000) && input.response.trim() && languages.includes(input.language)
      ? { response: input.response, language: input.language } : null;
  }
  return null;
}

export function codeTask(handoff) {
  if (handoff.source === "prompt") return handoff.payload.prompt;
  const p = handoff.payload;
  return [
    "Help me prepare code for the following spreadsheet structure. I will specify the analysis task before generating code.",
    `Filename: ${p.filename || "Not provided"}`,
    `Selected sheet: ${p.sheet}`,
    `Columns: ${JSON.stringify(p.headers)}`,
    `Data rows: ${p.rowCount}; column count: ${p.columnCount}.`,
    "Only structural metadata is available; no cell values or file contents have been supplied.",
  ].join("\n");
}

export function createToolHandoff(source, destination, input) {
  const payload = payloadFor(source, destination, input);
  if (!payload) throw new Error("This output is too large or unsupported for transfer. Review it and copy the needed portion manually.");
  const handoff = { version: 1, id: window.crypto.randomUUID(), source, destination, createdAt: Date.now(), payload };
  const serialized = JSON.stringify(handoff);
  if (serialized.length > 120000) throw new Error("This output is too large for transfer. Copy the needed portion manually.");
  try {
    sessionStorage.setItem(PREFIX + destination, serialized);
  } catch {
    throw new Error("The transfer could not be saved in this tab. You can still copy the output manually.");
  }
  return `/tools/${destination}?toolHandoff=${encodeURIComponent(handoff.id)}`;
}

export function readToolHandoff(destination, search) {
  if (typeof window === "undefined" || !["code", "colab"].includes(destination)) return null;
  try {
    const id = new URLSearchParams(search).get("toolHandoff");
    if (!id) return null;
    const saved = sessionStorage.getItem(PREFIX + destination);
    if (!saved || saved.length > 120000) return null;
    const handoff = JSON.parse(saved);
    if (!handoff || handoff.version !== 1 || handoff.id !== id || handoff.destination !== destination) return null;
    const age = Date.now() - handoff.createdAt;
    if (!Number.isFinite(handoff.createdAt) || age < 0 || age >= TOOL_HANDOFF_TTL_MS) {
      sessionStorage.removeItem(PREFIX + destination);
      return null;
    }
    const payload = payloadFor(handoff.source, destination, handoff.payload);
    return payload ? { source: handoff.source, payload } : null;
  } catch {
    return null;
  }
}
