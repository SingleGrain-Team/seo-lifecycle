#!/usr/bin/env node
/*
 * Regenerates index.html (what GitHub Pages serves) by injecting the content in
 * data/content.json into the app in source/seo-lifecycle.html.
 *
 * To republish updates:
 *   1. In the app, click "Export JSON" and replace data/content.json with it
 *      (or edit data/content.json directly).
 *   2. Run:  node build.js
 *   3. git add -A && git commit -m "update content" && git push
 *
 * The injected __SEEDED_AT__ timestamp bumps on every build, so returning
 * viewers automatically pick up the new version instead of a stale local copy.
 */
const fs = require("fs");
const path = require("path");

const root = __dirname;
const src = fs.readFileSync(path.join(root, "source/seo-lifecycle.html"), "utf8");
const data = JSON.parse(fs.readFileSync(path.join(root, "data/content.json"), "utf8"));
const seededAt = new Date().toISOString();

// Assemble the tag in pieces so the literal "<script id=seed-data>" never appears
// verbatim here — otherwise a naive strip/scan could match the app's own code.
const seedTag =
  '<scr' + 'ipt id="seed-data">' +
  `window.__SEEDED_DATA__=${JSON.stringify(data)};` +
  `window.__SEEDED_AT__=${JSON.stringify(seededAt)};` +
  '<\/scr' + 'ipt>';

// source/ is always the clean app (no injected head seed), so just inject once
// right before </head>. No stripping needed.
const out = src.replace("</head>", seedTag + "\n</head>");

fs.writeFileSync(path.join(root, "index.html"), out);
console.log(`Wrote index.html (${out.length} bytes), seededAt=${seededAt}`);
