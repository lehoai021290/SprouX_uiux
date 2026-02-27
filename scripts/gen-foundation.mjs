#!/usr/bin/env node
/**
 * Generate foundation-export.json from index.css
 *
 * Run:  pnpm gen:foundation
 *
 * Parses all foundation tokens from src/index.css and produces
 * a JSON file matching the Figma plugin's expected format exactly.
 * Key normalization matches code.js normalizeName/extractTokenName.
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { homedir } from "os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSS_PATH = join(__dirname, "..", "src", "index.css");
const OUT_PATH = join(__dirname, "..", "public", "foundation-export.json");

// Also write to the Figma plugin folder so file picker finds it immediately
const PLUGIN_DIR = join(
  homedir(),
  "Library/CloudStorage/GoogleDrive-phamthanhnhan@evol.vn",
  ".mirror-symlink/1Ayz-LSsa8E6zcyY0DqM3em-orN_rQhes",
  "Update Foundation SprouX"
);
const PLUGIN_OUT = join(PLUGIN_DIR, "foundation-export.json");

const css = readFileSync(CSS_PATH, "utf-8");

// ─── Key normalization (must match plugin code.js) ──────────
function normalizeName(cssName) {
  return cssName.toLowerCase().replace(/[\s\-\_]/g, "");
}

// ─── Helpers ────────────────────────────────────────────────

function rgbaToHex(r, g, b, a) {
  const hex = [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
  const alpha = Math.round(a * 255)
    .toString(16)
    .padStart(2, "0");
  return `#${hex}${alpha}`;
}

/** Extract content of a CSS block by selector pattern (brace-counting). */
function extractBlock(source, selectorRe) {
  const match = source.match(selectorRe);
  if (!match) return "";
  const braceStart = match.index + match[0].length - 1;
  let depth = 1;
  let i = braceStart + 1;
  while (depth > 0 && i < source.length) {
    if (source[i] === "{") depth++;
    if (source[i] === "}") depth--;
    i++;
  }
  return source.substring(braceStart + 1, i - 1);
}

/** Parse all `--name: value;` declarations from a CSS block string */
function parseVars(block) {
  const vars = {};
  const re = /--([a-z0-9][\w-]*):\s*([^;]+);/gi;
  let m;
  while ((m = re.exec(block)) !== null) {
    let value = m[2].replace(/\/\*.*?\*\//g, "").trim();
    vars[m[1]] = value;
  }
  return vars;
}

// ─── 1. Parse Palette (raw colors) from @theme inline ──────

const palette = {}; // { slate: { "50": "#f7f7f6", … }, … }
const paletteRe = /--color-([a-z]+)-(\d+):\s*(#[0-9a-fA-F]+)/g;
let pm;
while ((pm = paletteRe.exec(css)) !== null) {
  if (!palette[pm[1]]) palette[pm[1]] = {};
  palette[pm[1]][pm[2]] = pm[3];
}

// ─── 2. Extract :root and .dark blocks ──────────────────────

const rootBlock = extractBlock(css, /:root\s*\{/);
const darkBlock = extractBlock(css, /\.dark\s*\{/);

const lightVars = parseVars(rootBlock);
const darkVars = parseVars(darkBlock);

// ─── 3. Resolve CSS value → { hex, raw } (plugin format) ───

function resolveValue(val) {
  // var(--color-XXX-YYY) → palette reference
  const varRef = val.match(/var\(--color-([a-z]+)-(\d+)\)/);
  if (varRef) {
    const hex = palette[varRef[1]]?.[varRef[2]];
    return { hex: hex || val, raw: `${varRef[1]}/${varRef[2]}` };
  }

  // transparent → #ffffff00 (matches Figma's representation)
  if (val === "transparent") {
    return { hex: "#ffffff00", raw: null };
  }

  // white/black hex values → Figma references raw color variables
  if (val === "#ffffff") {
    return { hex: "#ffffff", raw: "white" };
  }
  if (val === "#000000") {
    return { hex: "#000000", raw: "black" };
  }

  // rgba(r,g,b,a)
  const rgbaMatch = val.match(
    /rgba\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*\)/
  );
  if (rgbaMatch) {
    return {
      hex: rgbaToHex(
        parseInt(rgbaMatch[1]),
        parseInt(rgbaMatch[2]),
        parseInt(rgbaMatch[3]),
        parseFloat(rgbaMatch[4])
      ),
      raw: null,
    };
  }

  // direct hex or other
  return { hex: val, raw: null };
}

// ─── 4. Build semantic colors ───────────────────────────────

function buildSemantic(vars) {
  const tokens = {};
  for (const [name, val] of Object.entries(vars)) {
    let cssName = name;
    // CSS "sidebar-background" → Figma "sidebar"
    if (cssName === "sidebar-background") cssName = "sidebar";
    // CSS "brand-subtle-foreground-hover" → Figma "brand-subtle-foreground-hover-hover"
    if (cssName === "brand-subtle-foreground-hover") cssName = "brand-subtle-foreground-hover-hover";
    // CSS "area-*" and "static-*" → Figma has them under "chart/" group
    if (cssName.startsWith("area-") || cssName.startsWith("static-")) {
      cssName = "chart-" + cssName;
    }
    const key = normalizeName(cssName);
    tokens[key] = resolveValue(val);
  }
  return tokens;
}

const semanticLight = buildSemantic(lightVars);
const semanticDark = buildSemantic(darkVars);

// Tokens only in :root (static) are same in light/dark
for (const [key, val] of Object.entries(semanticLight)) {
  if (!(key in semanticDark)) {
    semanticDark[key] = { ...val };
  }
}

// Remove tokens not present in Figma's semantic colors collection
delete semanticLight["shadowcolor"];
delete semanticDark["shadowcolor"];
// primarysubtle/primarysubtleforeground are repo-only (used in badge, not in Figma)
delete semanticLight["primarysubtle"];
delete semanticLight["primarysubtleforeground"];
delete semanticDark["primarysubtle"];
delete semanticDark["primarysubtleforeground"];

// ─── 5. Typography ──────────────────────────────────────────
// Mixed STRING + FLOAT tokens — must match Figma exactly.

const typography = {};

// STRING: font family tokens (Figma path: "Font Family/{Sans|Serif|Monospace}")
const fontRe = /--font-(\w+):\s*"([^"]+)"/g;
let fm;
const fontCssToFigma = {
  heading: "fontdefinitionsfontfamilyserif",
  body: "fontdefinitionsfontfamilysans",
  mono: "fontdefinitionsfontfamilymonospace",
};
while ((fm = fontRe.exec(css)) !== null) {
  const figmaKey = fontCssToFigma[fm[1]];
  if (figmaKey) {
    const familyOnly = fm[2].split(",")[0].trim().replace(/"/g, "");
    typography[figmaKey] = familyOnly;
  }
}

// STRING: font family aliases (Figma has these as VARIABLE_ALIAS to serif/sans)
typography["fontdefinitionsfontfamilyheadings"] = typography["fontdefinitionsfontfamilyserif"];
typography["fontdefinitionsfontfamilybody"] = typography["fontdefinitionsfontfamilysans"];

// STRING: weight tokens (matching Figma variable names exactly)
// Figma paths: "Heading 1/Weight", "Heading 2/Weight", etc.
const figmaWeights = {
  heading1weight: "Semibold",              // Figma: "Heading 1/Weight"
  heading2weight: "Semibold",              // Figma: "Heading 2/Weight"
  heading3heading3weight: "Semibold",      // Figma: "Heading 3/Heading 3 Weight"
  heading4weight: "Semibold",              // Figma: "Heading 4/Weight"
  monospacedfontweight: "Regular",         // Figma: "Monospaced/Font Weight"
  paragraphparagraphweight: "Regular",     // Figma: "Paragraph/Paragraph Weight"
  paragraphparagraphitalicweight: "Italic",    // Figma: "Paragraph/Paragraph Italic Weight"
  paragraphparagraphboldweight: "Semibold",    // Figma: "Paragraph/Paragraph Bold Weight"
  paragraphparagraphmediumweight: "Medium",    // Figma: "Paragraph/Paragraph Medium Weight"
};
for (const [k, v] of Object.entries(figmaWeights)) {
  typography[k] = v;
}

// FLOAT: typography sizing tokens (from Figma)
const typoFloats = {
  // Heading sizes
  heading1fontsize: 48, heading1lineheight: 48, heading1spacing: 48, heading1letterspacing: -1.5,
  heading2fontsize: 30, heading2lineheight: 32, heading2spacing: 30, heading2letterspacing: -1,
  heading3fontsize: 24, heading3lineheight: 28.799999237060547, heading3spacing: 20, heading3letterspacing: -1,
  heading4fontsize: 20, heading4lineheight: 24, heading4spacing: 20, heading4letterspacing: 0,
  // Paragraph sizes
  paragraphregularfontsize: 16, paragraphregularlineheight: 24, paragraphregularspacing: 2, paragraphregularletterspacing: 0,
  paragraphsmallfontsize: 14, paragraphsmalllineheight: 20, paragraphsmallspacing: 2, paragraphsmallletterspacing: 0,
  paragraphminifontsize: 12, paragraphminilineheight: 16, paragraphminispacing: 12, paragraphminiletterspacing: 0,
  paragraphlargefontsize: 30, paragraphlargelineheight: 32, paragraphlargespacing: 30, paragraphlargeletterspacing: -1,
  paragraphtinyfontsize: 10, paragraphtinylineheight: 12, paragraphtinyspacing: 10, paragraphtinyletterspacing: 0,
  paragraphmediumfontsize: 20, paragraphmediumlineheight: 24, paragraphmediumspacing: 20, paragraphmediumletterspacing: -1,
  // Monospaced
  monospacedfontsize: 16, monospacedlineheight: 24, monospacedletterspacing: 0, monospacedspacing: 16,
};
for (const [k, v] of Object.entries(typoFloats)) {
  typography[k] = v;
}

// ─── 6. Border Radius ───────────────────────────────────────
// Includes both absolute radius values AND semantic rounded aliases

const radiusFromCss = {};
const radRe = /--radius-([a-z0-9]+):\s*(\d+)px/g;
let rm;
while ((rm = radRe.exec(css)) !== null) {
  radiusFromCss[rm[1]] = parseInt(rm[2]);
}

const borderradius = {
  // Absolute radius values (Figma path: "Absolute/Radius/{N}")
  absoluteradius2: 2,
  absoluteradius4: radiusFromCss.sm ?? 4,
  absoluteradius6: radiusFromCss.md ?? 6,
  absoluteradius8: radiusFromCss.lg ?? 8,
  absoluteradius10: radiusFromCss["10"] ?? 10,
  absoluteradius12: radiusFromCss.xl ?? 12,
  absoluteradius16: 16,
  absoluteradius24: 24,
  absoluteradius32: 32,
  absoluteradiusinfinite: 9999,
  // Semantic rounded aliases (Figma path: "Semantic/Rounded/{Name}")
  semanticroundednone: 0,
  semanticroundedxs: 2,
  semanticroundedsm: radiusFromCss.sm ?? 4,
  semanticroundedmd: radiusFromCss.md ?? 6,
  semanticroundedlg: radiusFromCss.lg ?? 8,
  semanticroundedxl: radiusFromCss.xl ?? 12,
  semanticrounded2xl: 16,
  semanticrounded3xl: 24,
  semanticroundedfull: 9999,
};

// ─── 7. Spacing ─────────────────────────────────────────────
// 3 responsive modes: desktop, tablet, mobile
// Absolute tokens are same across all modes.
// Layout tokens differ per mode.

// Figma spacing uses comma for fractional values (e.g., "0,5" not "0.5")
// All non-semantic spacing tokens have "absolute" prefix in Figma
const twNumeric = {
  "absolute0": 0, "absolute0,5": 2, "absolute1": 4, "absolute1,5": 6, "absolute2": 8, "absolute2,5": 10,
  "absolute3": 12, "absolute3,5": 14, "absolute4": 16, "absolute5": 20, "absolute6": 24, "absolute7": 28, "absolute8": 32,
  "absolute9": 36, "absolute10": 40, "absolute11": 44, "absolute12": 48, "absolute14": 56, "absolute16": 64,
  "absolute20": 80, "absolute24": 96, "absolute28": 112, "absolute32": 128, "absolute36": 144, "absolute40": 160,
  "absolute44": 176, "absolute48": 192, "absolute52": 208, "absolute56": 224, "absolute60": 240, "absolute64": 256,
  "absolute72": 288, "absolute80": 320, "absolute96": 384,
};

const spacingFromCss = {};
const spRe = /--spacing-([a-z0-9]+):\s*(\d+)px/g;
let sm;
while ((sm = spRe.exec(css)) !== null) {
  spacingFromCss[sm[1]] = parseInt(sm[2]);
}

// Base spacing (same across all modes)
function buildBaseSpacing() {
  const sp = {};
  for (const [k, v] of Object.entries(twNumeric)) {
    sp[k] = v;
  }
  // spacingFromCss values are used by semantic aliases below
  // but NOT added as bare keys (Figma has only "Semantic/3xs", not bare "3xs")
  // Semantic aliases
  sp["semantic0"] = 0;
  sp["semantic4xs"] = 2;
  sp["semantic3xs"] = spacingFromCss["3xs"] ?? 4;
  sp["semantic2xs"] = spacingFromCss["2xs"] ?? 6;
  sp["semanticxs"] = spacingFromCss["xs"] ?? 8;
  sp["semanticsm"] = spacingFromCss["sm"] ?? 12;
  sp["semanticmd"] = spacingFromCss["md"] ?? 16;
  sp["semanticlg"] = spacingFromCss["lg"] ?? 20;
  sp["semanticxl"] = spacingFromCss["xl"] ?? 24;
  sp["semantic2xl"] = spacingFromCss["2xl"] ?? 32;
  sp["semantic3xl"] = spacingFromCss["3xl"] ?? 40;
  sp["semantic4xl"] = spacingFromCss["4xl"] ?? 48;
  sp["semantic5xl"] = 64;
  sp["absoluteinfinite"] = 9999;
  // Screen max widths (Figma path: "Absolute/Screen Max Width/{Name}")
  sp["absolutescreenmaxwidthauthorize"] = 552;
  sp["absolutescreenmaxwidthsetup"] = 800;
  sp["absolutescreenmaxwidthmain"] = 1200;
  sp["absolutescreenmaxwidthdiscovery"] = 1384;
  // Sidebar (Figma path: "Absolute/Sidebar Left/Width Expand", etc.)
  sp["absolutesidebarleftwidthexpand"] = 240;
  sp["absolutesidebarleftwidthcollapse"] = 60;
  sp["absolutesidebartopheight"] = 60;
  return sp;
}

// Layout tokens per mode (from Figma export) — all have "absolute" prefix
const layoutTokens = {
  desktop: {
    absolutesectionslotcreatormarginleft: 32, absolutesectionslotcreatormarginright: 32,
    absolutesectionslotcreatormargintop: 16, absolutesectionslotcreatormarginbottom: 16,
    absolutesectionslotcreatorgap: 16,
    absolutescreenpagemarginbottom: 24,
    absolutescreentitlepaddingtop: 32, absolutescreentitlepaddingbottom: 16,
    absolutescreentitlepaddingleft: 32, absolutescreentitlepaddingright: 32, absolutescreentitlegap: 12,
    absolutesectiontitlepaddingleft: 32, absolutesectiontitlepaddingright: 32,
    absolutesectiontitlepaddingtop: 16, absolutesectiontitlepaddingbottom: 4, absolutesectiontitlegap: 4,
    absolutecardslot16pxpaddingleft: 16, absolutecardslot16pxpaddingright: 16,
    absolutecardslot16pxpaddingtop: 16, absolutecardslot16pxpaddingbottom: 16,
    absolutecardtitle16pxpaddingleft: 16, absolutecardtitle16pxpaddingright: 16,
    absolutecardtitle16pxpaddingtop: 16, absolutecardtitle16pxpaddingbottom: 0, absolutecardtitle16pxgap: 4,
    absolutescreenactionpaddingleft: 32, absolutescreenactionpaddingright: 32,
    absolutescreenactionpaddingtop: 16, absolutescreenactionpaddingbottom: 16, absolutescreenactiongap: 8,
    absolutesectionslotauthorizationmarginleft: 32, absolutesectionslotauthorizationmarginright: 32,
    absolutesectionslotauthorizationmargintop: 64, absolutesectionslotauthorizationmarginbottom: 64,
    absolutedialogtomobilepopupmarginleft: 24, absolutedialogtomobilepopupmarginright: 24,
    absolutedialogtomobilepopupmargintop: 24, absolutedialogtomobilepopupmarginbottom: 24,
    absolutedialogtomobilefullscreenmarginleft: 24, absolutedialogtomobilefullscreenmarginright: 24,
    absolutedialogtomobilefullscreenmargintop: 24, absolutedialogtomobilefullscreenmarginbottom: 24,
    absolutecardslot24pxpaddingleft: 24, absolutecardslot24pxpaddingright: 24,
    absolutecardslot24pxpaddingtop: 24, absolutecardslot24pxpaddingbottom: 24,
    absolutecardtitle24pxpaddingleft: 24, absolutecardtitle24pxpaddingright: 24,
    absolutecardtitle24pxpaddingtop: 24, absolutecardtitle24pxpaddingbottom: 0, absolutecardtitle24pxgap: 4,
    absolutesidebartoppaddingleft: 32, absolutesidebartoppaddingright: 32, absolutesidebartopgap: 32,
    absolutesidebarleftpaddingleft: 20, absolutesidebarleftpaddingright: 20,
    absolutesidebarleftpaddingtop: 16, absolutesidebarleftpaddingbottom: 16,
    absolutesectionslotdiscoverymarginleft: 32, absolutesectionslotdiscoverymarginright: 32,
    absolutesectionslotdiscoverymargintop: 16, absolutesectionslotdiscoverymarginbottom: 16, absolutesectionslotdiscoverygap: 24,
    absolutedialogslot16pxpaddingleft: 16, absolutedialogslot16pxpaddingright: 16,
    absolutedialogslot16pxpaddingtop: 16, absolutedialogslot16pxpaddingbottom: 16,
    absolutedialogslot24pxpaddingleft: 24, absolutedialogslot24pxpaddingright: 24,
    absolutedialogslot24pxpaddingtop: 24, absolutedialogslot24pxpaddingbottom: 24,
  },
  tablet: {
    absolutesectionslotcreatormarginleft: 24, absolutesectionslotcreatormarginright: 24,
    absolutesectionslotcreatormargintop: 16, absolutesectionslotcreatormarginbottom: 16,
    absolutesectionslotcreatorgap: 16,
    absolutescreenpagemarginbottom: 24,
    absolutescreentitlepaddingtop: 24, absolutescreentitlepaddingbottom: 8,
    absolutescreentitlepaddingleft: 24, absolutescreentitlepaddingright: 24, absolutescreentitlegap: 12,
    absolutesectiontitlepaddingleft: 24, absolutesectiontitlepaddingright: 24,
    absolutesectiontitlepaddingtop: 16, absolutesectiontitlepaddingbottom: 4, absolutesectiontitlegap: 4,
    absolutecardslot16pxpaddingleft: 16, absolutecardslot16pxpaddingright: 16,
    absolutecardslot16pxpaddingtop: 16, absolutecardslot16pxpaddingbottom: 16,
    absolutecardtitle16pxpaddingleft: 16, absolutecardtitle16pxpaddingright: 16,
    absolutecardtitle16pxpaddingtop: 16, absolutecardtitle16pxpaddingbottom: 0, absolutecardtitle16pxgap: 4,
    absolutescreenactionpaddingleft: 24, absolutescreenactionpaddingright: 24,
    absolutescreenactionpaddingtop: 16, absolutescreenactionpaddingbottom: 16, absolutescreenactiongap: 8,
    absolutesectionslotauthorizationmarginleft: 24, absolutesectionslotauthorizationmarginright: 24,
    absolutesectionslotauthorizationmargintop: 64, absolutesectionslotauthorizationmarginbottom: 64,
    absolutedialogtomobilepopupmarginleft: 24, absolutedialogtomobilepopupmarginright: 24,
    absolutedialogtomobilepopupmargintop: 24, absolutedialogtomobilepopupmarginbottom: 24,
    absolutedialogtomobilefullscreenmarginleft: 24, absolutedialogtomobilefullscreenmarginright: 24,
    absolutedialogtomobilefullscreenmargintop: 24, absolutedialogtomobilefullscreenmarginbottom: 24,
    absolutecardslot24pxpaddingleft: 20, absolutecardslot24pxpaddingright: 20,
    absolutecardslot24pxpaddingtop: 20, absolutecardslot24pxpaddingbottom: 20,
    absolutecardtitle24pxpaddingleft: 20, absolutecardtitle24pxpaddingright: 20,
    absolutecardtitle24pxpaddingtop: 20, absolutecardtitle24pxpaddingbottom: 0, absolutecardtitle24pxgap: 4,
    absolutesidebartoppaddingleft: 24, absolutesidebartoppaddingright: 24, absolutesidebartopgap: 24,
    absolutesidebarleftpaddingleft: 12, absolutesidebarleftpaddingright: 12,
    absolutesidebarleftpaddingtop: 16, absolutesidebarleftpaddingbottom: 16,
    absolutesectionslotdiscoverymarginleft: 24, absolutesectionslotdiscoverymarginright: 24,
    absolutesectionslotdiscoverymargintop: 16, absolutesectionslotdiscoverymarginbottom: 16, absolutesectionslotdiscoverygap: 24,
    absolutedialogslot16pxpaddingleft: 16, absolutedialogslot16pxpaddingright: 16,
    absolutedialogslot16pxpaddingtop: 16, absolutedialogslot16pxpaddingbottom: 16,
    absolutedialogslot24pxpaddingleft: 20, absolutedialogslot24pxpaddingright: 20,
    absolutedialogslot24pxpaddingtop: 20, absolutedialogslot24pxpaddingbottom: 20,
  },
  mobile: {
    absolutesectionslotcreatormarginleft: 16, absolutesectionslotcreatormarginright: 16,
    absolutesectionslotcreatormargintop: 16, absolutesectionslotcreatormarginbottom: 16,
    absolutesectionslotcreatorgap: 16,
    absolutescreenpagemarginbottom: 24,
    absolutescreentitlepaddingtop: 24, absolutescreentitlepaddingbottom: 8,
    absolutescreentitlepaddingleft: 16, absolutescreentitlepaddingright: 16, absolutescreentitlegap: 12,
    absolutesectiontitlepaddingleft: 16, absolutesectiontitlepaddingright: 16,
    absolutesectiontitlepaddingtop: 16, absolutesectiontitlepaddingbottom: 4, absolutesectiontitlegap: 4,
    absolutecardslot16pxpaddingleft: 16, absolutecardslot16pxpaddingright: 16,
    absolutecardslot16pxpaddingtop: 16, absolutecardslot16pxpaddingbottom: 16,
    absolutecardtitle16pxpaddingleft: 16, absolutecardtitle16pxpaddingright: 16,
    absolutecardtitle16pxpaddingtop: 16, absolutecardtitle16pxpaddingbottom: 0, absolutecardtitle16pxgap: 4,
    absolutescreenactionpaddingleft: 16, absolutescreenactionpaddingright: 16,
    absolutescreenactionpaddingtop: 16, absolutescreenactionpaddingbottom: 16, absolutescreenactiongap: 8,
    absolutesectionslotauthorizationmarginleft: 0, absolutesectionslotauthorizationmarginright: 0,
    absolutesectionslotauthorizationmargintop: 0, absolutesectionslotauthorizationmarginbottom: 0,
    absolutedialogtomobilepopupmarginleft: 24, absolutedialogtomobilepopupmarginright: 24,
    absolutedialogtomobilepopupmargintop: 24, absolutedialogtomobilepopupmarginbottom: 24,
    absolutedialogtomobilefullscreenmarginleft: 0, absolutedialogtomobilefullscreenmarginright: 0,
    absolutedialogtomobilefullscreenmargintop: 0, absolutedialogtomobilefullscreenmarginbottom: 0,
    absolutecardslot24pxpaddingleft: 16, absolutecardslot24pxpaddingright: 16,
    absolutecardslot24pxpaddingtop: 16, absolutecardslot24pxpaddingbottom: 16,
    absolutecardtitle24pxpaddingleft: 16, absolutecardtitle24pxpaddingright: 16,
    absolutecardtitle24pxpaddingtop: 16, absolutecardtitle24pxpaddingbottom: 0, absolutecardtitle24pxgap: 4,
    absolutesidebartoppaddingleft: 16, absolutesidebartoppaddingright: 16, absolutesidebartopgap: 16,
    absolutesidebarleftpaddingleft: 12, absolutesidebarleftpaddingright: 12,
    absolutesidebarleftpaddingtop: 16, absolutesidebarleftpaddingbottom: 16,
    absolutesectionslotdiscoverymarginleft: 16, absolutesectionslotdiscoverymarginright: 16,
    absolutesectionslotdiscoverymargintop: 16, absolutesectionslotdiscoverymarginbottom: 16, absolutesectionslotdiscoverygap: 16,
    absolutedialogslot16pxpaddingleft: 16, absolutedialogslot16pxpaddingright: 16,
    absolutedialogslot16pxpaddingtop: 16, absolutedialogslot16pxpaddingbottom: 16,
    absolutedialogslot24pxpaddingleft: 16, absolutedialogslot24pxpaddingright: 16,
    absolutedialogslot24pxpaddingtop: 16, absolutedialogslot24pxpaddingbottom: 16,
  },
};

// Build per-mode spacing
const spacing = {};
for (const mode of ["desktop", "tablet", "mobile"]) {
  const base = buildBaseSpacing();
  const layout = layoutTokens[mode];
  for (const [k, v] of Object.entries(layout)) {
    base[k] = v;
  }
  spacing[mode] = base;
}

// ─── 8. Shadows ─────────────────────────────────────────────
// Full shadow properties: COLOR + FLOAT geometry tokens per level.
// Plugin Tab 2 compare iterates ALL Figma variables, so repo must include both.

const shadowProps = {
  "2xs":  { x: 0, y: 1, blur: 0, spread: 0, color: "#0000000d" },
  "xs":   { x: 0, y: 1, blur: 2, spread: 0, color: "#0000000d" },
  "sm": {
    shadow1: { x: 0, y: 1, blur: 3, spread: 0 },
    shadow2: { x: 0, y: 1, blur: 2, spread: -1 },
    color: "#0000001a",
  },
  "md": {
    shadow1: { x: 0, y: 4, blur: 6, spread: -1 },
    shadow2: { x: 0, y: 2, blur: 4, spread: -2 },
    color: "#0000001a",
  },
  "lg": {
    shadow1: { x: 0, y: 10, blur: 15, spread: -3 },
    shadow2: { x: 0, y: 4, blur: -4, spread: 6 },
    color: "#0000001a",
  },
  "xl": {
    shadow1: { x: 0, y: 20, blur: 25, spread: -5 },
    shadow2: { x: 0, y: 8, blur: -6, spread: 10 },
    color: "#0000001a",
  },
  "2xl": { x: 0, y: 25, blur: 50, spread: 12, color: "#00000040" },
};

function buildShadowMode(props) {
  const result = {};
  for (const [level, def] of Object.entries(props)) {
    if (def.shadow1) {
      // Multi-shadow levels (sm, md, lg, xl)
      result[`${level}shadow1x`] = def.shadow1.x;
      result[`${level}shadow1y`] = def.shadow1.y;
      result[`${level}shadow1blur`] = def.shadow1.blur;
      result[`${level}shadow1spread`] = def.shadow1.spread;
      if (def.shadow2) {
        // sm uses "shadow2x2" not "shadow2x" in Figma (quirk)
        const x2key = level === "sm" ? `${level}shadow2x2` : `${level}shadow2x`;
        result[x2key] = def.shadow2.x;
        result[`${level}shadow2y`] = def.shadow2.y;
        result[`${level}shadow2blur`] = def.shadow2.blur;
        result[`${level}shadow2spread`] = def.shadow2.spread;
      }
      result[`${level}color`] = { hex: def.color, raw: null };
    } else {
      // Simple levels (2xs, xs, 2xl)
      result[`${level}x`] = def.x;
      result[`${level}y`] = def.y;
      result[`${level}blur`] = def.blur;
      result[`${level}spread`] = def.spread;
      result[`${level}color`] = { hex: def.color, raw: null };
    }
  }
  return result;
}

const shadows = {
  light: buildShadowMode(shadowProps),
  dark: buildShadowMode(shadowProps),
};

// ─── 9. Raw Colors ──────────────────────────────────────────

const rawcolors = {};
const familyOrder = Object.keys(palette);
for (const family of familyOrder) {
  const shades = palette[family];
  const sortedShades = Object.keys(shades).sort((a, b) => +a - +b);
  for (const shade of sortedShades) {
    rawcolors[`${family}${shade}`] = shades[shade];
  }
}
rawcolors["white"] = "#ffffff";
rawcolors["black"] = "#000000";

// ─── 10. Write JSON ─────────────────────────────────────────

const result = {
  semanticcolors: { light: semanticLight, dark: semanticDark },
  typography,
  borderradius,
  spacing,
  shadows,
  rawcolors,
  _exportedAt: new Date().toISOString(),
  _source: "repo",
};

const jsonOut = JSON.stringify(result, null, 2) + "\n";
writeFileSync(OUT_PATH, jsonOut);

// Copy to plugin folder if it exists
if (existsSync(PLUGIN_DIR)) {
  writeFileSync(PLUGIN_OUT, jsonOut);
}

// Summary
const lc = Object.keys(semanticLight).length;
const dc = Object.keys(semanticDark).length;
const rc = Object.keys(rawcolors).length;
const dsk = Object.keys(spacing.desktop).length;
const tc = Object.keys(typography).length;
const br = Object.keys(borderradius).length;
const sl = Object.keys(shadows.light).length;

console.log(`✅ foundation-export.json generated`);
console.log(`   Semantic: ${lc} light, ${dc} dark`);
console.log(`   Typography: ${tc} (${Object.keys(figmaWeights).length + Object.keys(fontCssToFigma).length + 2} STRING + ${Object.keys(typoFloats).length} FLOAT)`);
console.log(`   Border radius: ${br} (10 absoluteradius + 9 semanticrounded)`);
console.log(`   Spacing: ${dsk} per mode x 3 modes (desktop/tablet/mobile)`);
console.log(`   Shadows: ${sl} per mode (light/dark) | Raw colors: ${rc}`);
if (existsSync(PLUGIN_DIR)) {
  console.log(`   📁 Copied to plugin folder`);
}
