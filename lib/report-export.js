const COLORS = ["#7c6cf2", "#4da7d8", "#55b89f", "#e6a85c", "#d96f91"];

function cleanEntries(value, limit = 50) {
  return Array.isArray(value)
    ? value.slice(0, limit).filter((item) => Array.isArray(item) && String(item[0]).trim() && Number.isFinite(Number(item[1]))).map(([label, count]) => [String(label), Number(count)])
    : [];
}

export function buildReportExportModel({ context, analysis, language = "en" }) {
  const locale = language === "ar" ? "ar" : "en";
  const figures = [];
  const tables = [];

  if (context) {
    const payload = context.payload || {};
    const entries = context.analysisType === "frequency"
      ? cleanEntries(payload.frequencies)
      : context.analysisType === "ngrams"
        ? cleanEntries(payload.results)
        : context.analysisType === "pos"
          ? cleanEntries(payload.distribution)
          : [];
    if (entries.length) {
      const title = context.analysisType === "pos"
        ? (locale === "ar" ? "توزيع أقسام الكلام" : "Part-of-speech distribution")
        : (locale === "ar" ? "أعلى النتائج" : "Top results");
      figures.push({ id: `${context.analysisType}-bar`, type: "bar", title, entries });
      tables.push({ name: title, headers: [locale === "ar" ? "العنصر" : "Item", locale === "ar" ? "القيمة" : "Value"], rows: entries });
      if (context.analysisType === "pos") figures.push({ id: "pos-donut", type: "donut", title, entries });
    }
    if (context.analysisType === "concordance" && Array.isArray(payload.contexts) && payload.contexts.length) {
      tables.push({
        name: locale === "ar" ? "السياقات" : "Contexts",
        headers: [locale === "ar" ? "الرقم" : "Number", locale === "ar" ? "السياق" : "Context"],
        rows: payload.contexts.map((item, index) => [index + 1, String(item)]),
      });
    }
    if (context.analysisType === "interpretation") {
      const entries = cleanEntries(payload.topWords, 20);
      if (entries.length) {
        const title = locale === "ar" ? "أكثر المفردات تكرارًا" : "Most frequent terms";
        figures.push({ id: "interpretation-terms", type: "bar", title, entries });
        tables.push({ name: title, headers: [locale === "ar" ? "المفردة" : "Term", locale === "ar" ? "التكرار" : "Frequency"], rows: entries });
      }
    }
  } else if (analysis) {
    const topWords = cleanEntries(analysis.topWords, 20);
    const distribution = cleanEntries(analysis.labelDistribution || analysis.distribution);
    if (topWords.length) {
      const title = locale === "ar" ? "أكثر المفردات تكرارًا" : "Most frequent terms";
      figures.push({ id: "frequent-terms", type: "bar", title, entries: topWords });
      tables.push({ name: title, headers: [locale === "ar" ? "المفردة" : "Term", locale === "ar" ? "التكرار" : "Frequency"], rows: topWords });
    }
    if (distribution.length) {
      const title = locale === "ar" ? "توزيع الفئات" : "Category distribution";
      figures.push({ id: "category-distribution", type: "donut", title, entries: distribution });
      tables.push({ name: title, headers: [locale === "ar" ? "الفئة" : "Category", locale === "ar" ? "العدد" : "Count"], rows: distribution });
    }
  }

  return { figures, tables, hasFigures: figures.length > 0, hasData: tables.length > 0 };
}

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character]);
}

export function figureToSvg(figure, language = "en") {
  if (!figure?.entries?.length) return "";
  const rtl = language === "ar";
  const width = 900;
  const title = escapeXml(figure.title);
  if (figure.type === "donut") {
    const entries = figure.entries;
    const total = entries.reduce((sum, [, count]) => sum + Math.max(0, Number(count)), 0);
    if (!total) return "";
    let offset = 0;
    const segments = entries.map(([, count], index) => {
      const length = Math.max(0, Number(count)) / total * 100;
      const segment = `<circle cx="170" cy="190" r="92" fill="none" stroke="${COLORS[index % COLORS.length]}" stroke-width="54" pathLength="100" stroke-dasharray="${length} ${100 - length}" stroke-dashoffset="${-offset}" />`;
      offset += length;
      return segment;
    }).join("");
    const legend = entries.map(([label, count], index) => `<g transform="translate(340 ${110 + index * 38})"><rect width="16" height="16" rx="4" fill="${COLORS[index % COLORS.length]}"/><text x="${rtl ? 520 : 26}" y="14" text-anchor="${rtl ? "end" : "start"}" font-size="18">${escapeXml(label)} · ${count}</text></g>`).join("");
    const height = Math.max(390, 150 + entries.length * 38);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${title}"><rect width="100%" height="100%" fill="#ffffff"/><text x="${rtl ? 850 : 50}" y="48" text-anchor="${rtl ? "end" : "start"}" font-family="${rtl ? "IBM Plex Sans Arabic, sans-serif" : "Inter, sans-serif"}" font-size="25" font-weight="700">${title}</text><g transform="rotate(-90 170 190)">${segments}</g><circle cx="170" cy="190" r="61" fill="#fff"/>${legend}</svg>`;
  }

  const entries = figure.entries.slice(0, 15);
  const max = Math.max(...entries.map(([, count]) => Number(count)), 0);
  if (!max) return "";
  const height = 105 + entries.length * 45;
  const rows = entries.map(([label, count], index) => {
    const barWidth = Math.max(3, Number(count) / max * 430);
    const y = 82 + index * 45;
    return `<text x="${rtl ? 850 : 50}" y="${y + 17}" text-anchor="${rtl ? "end" : "start"}" font-size="16">${escapeXml(label)}</text><rect x="260" y="${y}" width="${barWidth}" height="20" rx="10" fill="${COLORS[index % COLORS.length]}"/><text x="${710}" y="${y + 17}" font-size="15">${count}</text>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${title}"><rect width="100%" height="100%" fill="#ffffff"/><g font-family="${rtl ? "IBM Plex Sans Arabic, sans-serif" : "Inter, sans-serif"}" fill="#24203d"><text x="${rtl ? 850 : 50}" y="42" text-anchor="${rtl ? "end" : "start"}" font-size="25" font-weight="700">${title}</text>${rows}</g></svg>`;
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function tablesToCsv(tables) {
  return tables.map((table) => [
    [csvCell(table.name)],
    table.headers.map(csvCell),
    ...table.rows.map((row) => row.map(csvCell)),
  ].map((row) => row.join(",")).join("\r\n")).join("\r\n\r\n");
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function concat(parts) {
  const output = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) { output.set(part, offset); offset += part.length; }
  return output;
}

function storedZip(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const file of files) {
    const name = encoder.encode(file.name);
    const data = encoder.encode(file.content);
    const crc = crc32(data);
    const local = new Uint8Array(30);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 20, true); lv.setUint16(6, 0x0800, true); lv.setUint16(12, 0x0021, true);
    lv.setUint32(14, crc, true); lv.setUint32(18, data.length, true); lv.setUint32(22, data.length, true); lv.setUint16(26, name.length, true);
    localParts.push(local, name, data);

    const central = new Uint8Array(46);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0x0800, true); cv.setUint16(14, 0x0021, true);
    cv.setUint32(16, crc, true); cv.setUint32(20, data.length, true); cv.setUint32(24, data.length, true); cv.setUint16(28, name.length, true); cv.setUint32(42, offset, true);
    centralParts.push(central, name);
    offset += local.length + name.length + data.length;
  }
  const centralData = concat(centralParts);
  const end = new Uint8Array(22);
  const view = new DataView(end.buffer);
  view.setUint32(0, 0x06054b50, true); view.setUint16(8, files.length, true); view.setUint16(10, files.length, true); view.setUint32(12, centralData.length, true); view.setUint32(16, offset, true);
  return concat([...localParts, centralData, end]);
}

export function createDocxBlob(title, paragraphs, language = "en") {
  const rtl = language === "ar";
  const font = rtl ? "IBM Plex Sans Arabic" : "Inter";
  const body = [title, ...paragraphs].filter((value) => typeof value === "string" && value.trim()).map((text, index) => `<w:p><w:pPr>${rtl ? "<w:bidi/>" : ""}</w:pPr><w:r><w:rPr><w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${font}"/>${index === 0 ? "<w:b/>" : ""}</w:rPr><w:t xml:space="preserve">${escapeXml(text.trim())}</w:t></w:r></w:p>`).join("");
  const files = [
    { name: "[Content_Types].xml", content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>` },
    { name: "_rels/.rels", content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>` },
    { name: "word/document.xml", content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>` },
  ];
  return new Blob([storedZip(files)], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
}
