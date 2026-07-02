#!/usr/bin/env node
/**
 * Exports src/data/tour.ts to web/content/tour.json so GitHub Pages serves
 * the same content the app bundles. Run after editing tour.ts:
 *   node scripts/export-tour.js
 */
const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const srcPath = path.join(__dirname, "..", "src", "data", "tour.ts");
const outPath = path.join(__dirname, "..", "web", "content", "tour.json");

const source = fs.readFileSync(srcPath, "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
const mod = { exports: {} };
new Function("exports", "require", "module", outputText)(
  mod.exports,
  require,
  mod,
);

const { TOUR_STOPS, TOUR_TITLE, TOUR_INTRO } = mod.exports;
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(
  outPath,
  JSON.stringify(
    { title: TOUR_TITLE, intro: TOUR_INTRO, updated: new Date().toISOString().slice(0, 10), stops: TOUR_STOPS },
    null,
    2,
  ) + "\n",
);
console.log(`wrote ${outPath} (${TOUR_STOPS.length} stops)`);
