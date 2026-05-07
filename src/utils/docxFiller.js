// Browser-only DOCX placeholder filler.
// Uses native CompressionStream / DecompressionStream — no npm deps.
// .docx is a ZIP. We:
//   1. Fetch template, parse local file headers
//   2. Decompress word/document.xml, normalize split placeholder runs, replace tokens
//   3. Recompress, rebuild ZIP with original entries (only document.xml mutated)

const TEMPLATE_URL = '/GG MUSIC LICENSING AGMNT TEMPLATE 29042026.docx';
const TARGET_ENTRY = 'word/document.xml';

// CRC-32 (IEEE 802.3) — needed for ZIP entries
let CRC_TABLE = null;
function getCrcTable() {
  if (CRC_TABLE) return CRC_TABLE;
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  CRC_TABLE = t;
  return t;
}
function crc32(buf) {
  const t = getCrcTable();
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = t[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

async function streamToUint8(stream) {
  const reader = stream.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.length;
  }
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) { out.set(c, off); off += c.length; }
  return out;
}

async function inflateRaw(buf) {
  const ds = new DecompressionStream('deflate-raw');
  const stream = new Blob([buf]).stream().pipeThrough(ds);
  return streamToUint8(stream);
}
async function deflateRaw(buf) {
  const cs = new CompressionStream('deflate-raw');
  const stream = new Blob([buf]).stream().pipeThrough(cs);
  return streamToUint8(stream);
}

// Parse all local file entries from a ZIP buffer.
// Returns list of { name, method, crc, compSize, uncompSize, headerBytes, dataStart, extra, flags, time, date, internalAttr, externalAttr, version }
function parseZip(u8) {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  // Find End-of-central-directory (EOCD) — search backward
  let eocdOff = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 65557); i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { eocdOff = i; break; }
  }
  if (eocdOff < 0) throw new Error('Invalid ZIP: EOCD not found');
  const cdSize = dv.getUint32(eocdOff + 12, true);
  const cdOff = dv.getUint32(eocdOff + 16, true);
  const totalEntries = dv.getUint16(eocdOff + 10, true);

  const entries = [];
  let p = cdOff;
  for (let i = 0; i < totalEntries; i++) {
    if (dv.getUint32(p, true) !== 0x02014b50) throw new Error('Bad central dir signature');
    const versionMade = dv.getUint16(p + 4, true);
    const versionNeeded = dv.getUint16(p + 6, true);
    const flags = dv.getUint16(p + 8, true);
    const method = dv.getUint16(p + 10, true);
    const time = dv.getUint16(p + 12, true);
    const date = dv.getUint16(p + 14, true);
    const crc = dv.getUint32(p + 16, true);
    const compSize = dv.getUint32(p + 20, true);
    const uncompSize = dv.getUint32(p + 24, true);
    const nameLen = dv.getUint16(p + 28, true);
    const extraLen = dv.getUint16(p + 30, true);
    const commentLen = dv.getUint16(p + 32, true);
    const internalAttr = dv.getUint16(p + 36, true);
    const externalAttr = dv.getUint32(p + 38, true);
    const localHeaderOff = dv.getUint32(p + 42, true);
    const name = new TextDecoder('utf-8').decode(u8.subarray(p + 46, p + 46 + nameLen));
    const extra = u8.subarray(p + 46 + nameLen, p + 46 + nameLen + extraLen);

    // Now read the LOCAL header to find data offset
    const lp = localHeaderOff;
    if (dv.getUint32(lp, true) !== 0x04034b50) throw new Error('Bad local header signature');
    const lNameLen = dv.getUint16(lp + 26, true);
    const lExtraLen = dv.getUint16(lp + 28, true);
    const dataStart = lp + 30 + lNameLen + lExtraLen;
    const data = u8.subarray(dataStart, dataStart + compSize);

    entries.push({
      name, method, flags, crc, compSize, uncompSize,
      time, date, versionMade, versionNeeded,
      internalAttr, externalAttr, extra, data
    });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

// Build a fresh ZIP from entries (each entry has name, method, crc, data (already compressed for method 8 / raw for method 0), uncompSize)
function buildZip(entries) {
  const enc = new TextEncoder();
  const localChunks = [];
  const cdChunks = [];
  let offset = 0;
  const cdEntries = [];

  for (const e of entries) {
    const nameBytes = enc.encode(e.name);
    const extra = e.extra || new Uint8Array(0);

    // Local file header
    const lh = new Uint8Array(30 + nameBytes.length + extra.length);
    const ldv = new DataView(lh.buffer);
    ldv.setUint32(0, 0x04034b50, true);
    ldv.setUint16(4, e.versionNeeded || 20, true);
    ldv.setUint16(6, e.flags & ~0x0008, true); // strip data-descriptor flag
    ldv.setUint16(8, e.method, true);
    ldv.setUint16(10, e.time || 0, true);
    ldv.setUint16(12, e.date || 0x21, true);
    ldv.setUint32(14, e.crc, true);
    ldv.setUint32(18, e.compSize, true);
    ldv.setUint32(22, e.uncompSize, true);
    ldv.setUint16(26, nameBytes.length, true);
    ldv.setUint16(28, extra.length, true);
    lh.set(nameBytes, 30);
    lh.set(extra, 30 + nameBytes.length);

    localChunks.push(lh, e.data);
    const localHeaderOff = offset;
    offset += lh.length + e.data.length;

    cdEntries.push({ e, nameBytes, extra, localHeaderOff });
  }

  let cdSize = 0;
  for (const c of cdEntries) {
    const { e, nameBytes, extra } = c;
    const ch = new Uint8Array(46 + nameBytes.length + extra.length);
    const cdv = new DataView(ch.buffer);
    cdv.setUint32(0, 0x02014b50, true);
    cdv.setUint16(4, e.versionMade || 20, true);
    cdv.setUint16(6, e.versionNeeded || 20, true);
    cdv.setUint16(8, e.flags & ~0x0008, true);
    cdv.setUint16(10, e.method, true);
    cdv.setUint16(12, e.time || 0, true);
    cdv.setUint16(14, e.date || 0x21, true);
    cdv.setUint32(16, e.crc, true);
    cdv.setUint32(20, e.compSize, true);
    cdv.setUint32(24, e.uncompSize, true);
    cdv.setUint16(28, nameBytes.length, true);
    cdv.setUint16(30, extra.length, true);
    cdv.setUint16(32, 0, true); // commentLen
    cdv.setUint16(34, 0, true); // diskNumStart
    cdv.setUint16(36, e.internalAttr || 0, true);
    cdv.setUint32(38, e.externalAttr || 0, true);
    cdv.setUint32(42, c.localHeaderOff, true);
    ch.set(nameBytes, 46);
    ch.set(extra, 46 + nameBytes.length);
    cdChunks.push(ch);
    cdSize += ch.length;
  }
  const cdOffset = offset;

  // EOCD
  const eocd = new Uint8Array(22);
  const edv = new DataView(eocd.buffer);
  edv.setUint32(0, 0x06054b50, true);
  edv.setUint16(4, 0, true);
  edv.setUint16(6, 0, true);
  edv.setUint16(8, cdEntries.length, true);
  edv.setUint16(10, cdEntries.length, true);
  edv.setUint32(12, cdSize, true);
  edv.setUint32(16, cdOffset, true);
  edv.setUint16(20, 0, true);

  // Concat
  let total = offset + cdSize + eocd.length;
  const out = new Uint8Array(total);
  let p = 0;
  for (const c of localChunks) { out.set(c, p); p += c.length; }
  for (const c of cdChunks) { out.set(c, p); p += c.length; }
  out.set(eocd, p);
  return out;
}

// Replace placeholder tokens inside document.xml even when split across runs.
// Approach: within each <w:p>...</w:p>, walk runs; whenever a <w:t> opens with content
// containing '[' but not ']', merge the next run's <w:t> into this one (drop the in-between
// closing/opening tags) until the bracket closes. Then do plain string replace.
function escapeXml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function mergeSplitPlaceholders(xml) {
  const tRe = /<w:t(\s[^>]*)?>([^<]*)<\/w:t>/g;
  const tags = [];
  let m;
  while ((m = tRe.exec(xml)) !== null) {
    tags.push({ start: m.index, end: m.index + m[0].length, attrs: m[1] || '', text: m[2] });
  }
  if (tags.length === 0) return xml;

  const merged = [];
  let i = 0;
  while (i < tags.length) {
    let group = [tags[i]];
    let opens = (tags[i].text.match(/\[/g) || []).length;
    let closes = (tags[i].text.match(/\]/g) || []).length;
    while (opens > closes && i + 1 < tags.length) {
      i += 1;
      group.push(tags[i]);
      opens += (tags[i].text.match(/\[/g) || []).length;
      closes += (tags[i].text.match(/\]/g) || []).length;
    }
    merged.push(group);
    i += 1;
  }

  let out = '';
  let cursor = 0;
  for (const g of merged) {
    if (g.length === 1) continue;
    const first = g[0];
    const combinedText = g.map(x => x.text).join('');
    out += xml.slice(cursor, first.start);
    let attrs = first.attrs;
    if (/^\s|\s$/.test(combinedText) && !/xml:space=/.test(attrs)) {
      attrs += ' xml:space="preserve"';
    }
    out += `<w:t${attrs}>${combinedText}</w:t>`;
    cursor = first.end;
    for (let j = 1; j < g.length; j++) {
      const t = g[j];
      out += xml.slice(cursor, t.start);
      out += `<w:t></w:t>`;
      cursor = t.end;
    }
  }
  out += xml.slice(cursor);
  return out;
}

// Walk every <w:r>...</w:r> with a placeholder token in its <w:t>. Rebuild that run with
// the substituted value. When `redize` is true, mark the substituted run with red color
// (used for the in-app preview); when false, keep original styling (used for export).
// Each substituted run is also wrapped in a sentinel attribute (data-filled="1") so the
// HTML preview can detect filled values and color them red there even when redize=false.
function replacePlaceholdersWithRed(xml, map, redize = true) {
  const keys = Object.keys(map);
  if (keys.length === 0) return xml;
  const tokenRe = new RegExp(keys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');

  const runRe = /<w:r\b[^>]*>([\s\S]*?)<\/w:r>/g;
  return xml.replace(runRe, (runMatch, runInner) => {
    if (!tokenRe.test(runInner)) return runMatch;
    tokenRe.lastIndex = 0;

    const rPrMatch = runInner.match(/<w:rPr>[\s\S]*?<\/w:rPr>/);
    const rPrOriginal = rPrMatch ? rPrMatch[0] : '';

    const rPrFilled = (() => {
      if (!redize) return rPrOriginal;
      if (!rPrOriginal) return '<w:rPr><w:color w:val="FF0000"/></w:rPr>';
      const stripped = rPrOriginal.replace(/<w:color\b[^/]*\/>/g, '');
      return stripped.replace('</w:rPr>', '<w:color w:val="FF0000"/></w:rPr>');
    })();

    const tMatch = runInner.match(/<w:t(\s[^>]*)?>([^<]*)<\/w:t>/);
    if (!tMatch) return runMatch;
    const tAttrs = tMatch[1] || '';
    const tText = tMatch[2];

    const exactMatch = keys.find(k => tText === k);
    if (exactMatch) {
      const replaced = escapeXml(map[exactMatch]);
      let attrs = tAttrs;
      if (/^\s|\s$/.test(replaced) && !/xml:space=/.test(attrs)) attrs += ' xml:space="preserve"';
      return `<w:r data-filled="1">${rPrFilled}<w:t${attrs}>${replaced}</w:t></w:r>`;
    }

    const parts = [];
    let lastIdx = 0;
    let mm;
    const partRe = new RegExp(keys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
    while ((mm = partRe.exec(tText)) !== null) {
      if (mm.index > lastIdx) parts.push({ text: tText.slice(lastIdx, mm.index), filled: false });
      parts.push({ text: escapeXml(map[mm[0]]), filled: true });
      lastIdx = mm.index + mm[0].length;
    }
    if (lastIdx < tText.length) parts.push({ text: tText.slice(lastIdx), filled: false });

    return parts.map(p => {
      let attrs = '';
      if (/^\s|\s$/.test(p.text)) attrs = ' xml:space="preserve"';
      const props = p.filled ? rPrFilled : rPrOriginal;
      const runOpen = p.filled ? '<w:r data-filled="1">' : '<w:r>';
      return `${runOpen}${props}<w:t${attrs}>${p.text}</w:t></w:r>`;
    }).join('');
  });
}

export const PLACEHOLDER_FIELDS = [
  { key: '[Artist Name]', label: 'Artist Name', dbKey: 'artistName', required: true },
  { key: '[PAN Number]', label: 'PAN Number', dbKey: 'panNumber', required: true },
  { key: '[GST Number]', label: 'GST Number', dbKey: 'gstNumber', required: true },
  { key: '[Aadhaar Number]', label: 'Aadhaar Number', dbKey: 'aadharNumber', required: true },
  { key: '[Address]', label: 'Address', dbKey: 'address', required: true },
  { key: '[Account Name]', label: 'Account Name', dbKey: 'accountName', required: true },
  { key: '[Account Number]', label: 'Account Number', dbKey: 'accountNumber', required: true },
  { key: '[Bank Name]', label: 'Bank Name', dbKey: 'bankName', required: true },
  { key: '[IFSC Code]', label: 'IFSC Code', dbKey: 'ifscCode', required: true },
  { key: '[Branch Name]', label: 'Branch Name', dbKey: 'branchName', required: true },
];

// Build the substitution map from a values object using the field definitions.
export function buildPlaceholderMap(values) {
  const map = {};
  for (const f of PLACEHOLDER_FIELDS) {
    map[f.key] = values[f.dbKey] ?? '';
  }
  return map;
}

// Shared template fetch + decompress.
async function fetchTemplateXml() {
  const resp = await fetch(TEMPLATE_URL);
  if (!resp.ok) throw new Error(`Template fetch failed: ${resp.status}`);
  const buf = new Uint8Array(await resp.arrayBuffer());
  const entries = parseZip(buf);
  const target = entries.find(e => e.name === TARGET_ENTRY);
  if (!target) throw new Error('document.xml not found in template');
  let xmlBytes;
  if (target.method === 0) xmlBytes = target.data;
  else if (target.method === 8) xmlBytes = await inflateRaw(target.data);
  else throw new Error(`Unsupported compression: ${target.method}`);
  return { xml: new TextDecoder('utf-8').decode(xmlBytes), entries };
}

// Generate the filled .docx as a Blob — substituted text uses ORIGINAL color (no red).
export async function generateFilledDocx(values) {
  const { xml: rawXml, entries } = await fetchTemplateXml();
  let xml = mergeSplitPlaceholders(rawXml);
  xml = replacePlaceholdersWithRed(xml, buildPlaceholderMap(values), /* redize */ false);

  const newBytes = new TextEncoder().encode(xml);
  const compressed = await deflateRaw(newBytes);

  const newEntries = entries.map(e => {
    if (e.name !== TARGET_ENTRY) return e;
    return {
      ...e,
      method: 8,
      data: compressed,
      compSize: compressed.length,
      uncompSize: newBytes.length,
      crc: crc32(newBytes),
    };
  });

  const zipBytes = buildZip(newEntries);
  return new Blob([zipBytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}

// ---------- HTML preview renderer ----------
// Produces HTML matching the Word doc's visual layout: bold/italic/underline/alignment,
// font size, paragraph spacing. Filled placeholders are tagged via data-filled="1" on the
// run so the preview can color them red — without affecting the export.

function decodeXmlEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function parseRunStyle(rPr, isFilled) {
  const styles = [];
  if (!rPr) {
    if (isFilled) styles.push('color:#dc2626');
    return styles.join(';');
  }
  if (/<w:b\s*\/>|<w:b\s+[^>]*\/>/.test(rPr) && !/<w:b\s+w:val="(0|false)"/.test(rPr)) styles.push('font-weight:bold');
  if (/<w:i\s*\/>|<w:i\s+[^>]*\/>/.test(rPr) && !/<w:i\s+w:val="(0|false)"/.test(rPr)) styles.push('font-style:italic');
  if (/<w:u\s+w:val="(?!none)/.test(rPr)) styles.push('text-decoration:underline');
  const sz = rPr.match(/<w:sz\s+w:val="(\d+)"/);
  if (sz) styles.push(`font-size:${parseInt(sz[1], 10) / 2}pt`);
  if (isFilled) {
    // Override any other color directive — preview always shows filled values in red.
    styles.push('color:#dc2626');
  } else {
    const color = rPr.match(/<w:color\s+w:val="([0-9A-Fa-f]{6})"/);
    if (color) styles.push(`color:#${color[1]}`);
  }
  return styles.join(';');
}

function parseParaStyle(pPr) {
  if (!pPr) return '';
  const styles = [];
  const jc = pPr.match(/<w:jc\s+w:val="(\w+)"/);
  if (jc) {
    const map = { center: 'center', right: 'right', both: 'justify', left: 'left' };
    if (map[jc[1]]) styles.push(`text-align:${map[jc[1]]}`);
  }
  return styles.join(';');
}

// Convert a single <w:r ...>...</w:r> into HTML.
function renderRun(runMatch) {
  // Detect data-filled marker (we add it to substituted runs).
  const isFilled = /data-filled="1"/.test(runMatch);
  const rPrMatch = runMatch.match(/<w:rPr>[\s\S]*?<\/w:rPr>/);
  const rPr = rPrMatch ? rPrMatch[0] : '';
  const style = parseRunStyle(rPr, isFilled);

  // Walk children of the run in order: <w:t>, <w:br/>, <w:tab/>
  const inner = runMatch.replace(/<w:rPr>[\s\S]*?<\/w:rPr>/, '');
  let html = '';
  const childRe = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>|<w:br\s*\/>|<w:tab\s*\/>/g;
  let m;
  while ((m = childRe.exec(inner)) !== null) {
    if (m[0].startsWith('<w:br')) html += '<br/>';
    else if (m[0].startsWith('<w:tab')) html += '<span style="display:inline-block;width:0.5in"></span>';
    else html += escapeHtml(decodeXmlEntities(m[1] || ''));
  }
  if (!html) return '';
  if (style) return `<span style="${style}">${html}</span>`;
  return html;
}

// Render a <w:p>...</w:p> to <p>.
function renderParagraph(paraInner) {
  const pPrMatch = paraInner.match(/<w:pPr>[\s\S]*?<\/w:pPr>/);
  const pStyle = parseParaStyle(pPrMatch ? pPrMatch[0] : '');
  const body = paraInner.replace(/<w:pPr>[\s\S]*?<\/w:pPr>/, '');

  const runRe = /<w:r\b[^>]*>[\s\S]*?<\/w:r>/g;
  const runs = body.match(runRe) || [];
  const html = runs.map(renderRun).join('');

  if (!html.trim()) return `<p style="margin:0.5em 0;min-height:1em">&nbsp;</p>`;
  return `<p style="margin:0.5em 0${pStyle ? ';' + pStyle : ''}">${html}</p>`;
}

// Build a Word-like HTML preview of the filled document. Filled placeholders -> red.
export async function renderPreviewHtml(values) {
  const { xml: rawXml } = await fetchTemplateXml();
  let xml = mergeSplitPlaceholders(rawXml);
  // Use redize=false so DOCX colors aren't inherited; preview's own CSS adds the red.
  xml = replacePlaceholdersWithRed(xml, buildPlaceholderMap(values), /* redize */ false);

  const bodyMatch = xml.match(/<w:body>([\s\S]*?)<\/w:body>/);
  if (!bodyMatch) return '';
  const body = bodyMatch[1];
  const paraRe = /<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g;
  const out = [];
  let m;
  while ((m = paraRe.exec(body)) !== null) {
    out.push(renderParagraph(m[1]));
  }
  return out.join('');
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Print-to-PDF via hidden iframe — uses the user's "Save as PDF" printer.
export function printAsPdf(htmlContent, title) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>
      body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; padding: 1in; color: #000; }
      h1 { text-align: center; text-decoration: underline; font-size: 14pt; }
      p { margin: 0.5em 0; white-space: pre-wrap; }
      @page { margin: 1in; }
    </style></head><body>${htmlContent}</body></html>`);
  doc.close();
  iframe.contentWindow.focus();
  setTimeout(() => {
    iframe.contentWindow.print();
    setTimeout(() => iframe.remove(), 1000);
  }, 250);
}
