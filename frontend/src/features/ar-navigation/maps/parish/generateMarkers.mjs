// Run with modern Node: node src/features/ar-navigation/maps/parish/generateMarkers.mjs
// --check verifies the generated print pack without writing any files.
// SVG artwork and its printable copy are always generated together.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { parishMarkers } from "./markers.ts";

const escape = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
const floorNames = {
  basement: "1st Floor - Basement",
  church: "2nd Floor - Main Church",
  outside: "Outside - Ground Level",
};
const wrap = (text) => {
  const lines = [""];
  for (const word of text.split(" ")) {
    if ((lines.at(-1) + " " + word).trim().length > 34) lines.push(word);
    else lines[lines.length - 1] = (lines.at(-1) + " " + word).trim();
  }
  return lines;
};

function artwork(marker) {
  // Distinct, deterministic features: no dependency on AI or external images.
  let seed = 1821197 + marker.targetIndex * 237637;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const shapes = Array.from({ length: 180 }, (_, i) => {
    const x = Math.round(35 + random() * 535),
      y = Math.round(220 + random() * 315),
      size = Math.round(8 + random() * 22);
    const color = i % 5 === 0 ? "#b22222" : i % 7 === 0 ? "#9a7418" : "#292524";
    return i % 3 === 0
      ? `<circle cx="${x}" cy="${y}" r="${size / 2}" fill="${color}"/>`
      : `<path d="M${x} ${y} l${size} ${Math.round(random() * size)} l-${Math.round(random() * size)} ${size} Z" fill="${color}"/>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640">
<rect width="640" height="640" fill="#fff"/>
<rect x="10" y="10" width="620" height="620" rx="5" fill="none" stroke="#b22222" stroke-width="6"/>
<rect x="22" y="22" width="596" height="66" fill="#b22222"/>
<text x="320" y="53" text-anchor="middle" font-family="Georgia,serif" font-size="28" font-weight="bold" fill="#fff">St. Lorenzo Ruiz Parish</text>
<text x="320" y="76" text-anchor="middle" font-family="sans-serif" font-size="14" letter-spacing="3" fill="#f5d76e">AR NAVIGATION</text>
${wrap(marker.name)
  .map(
    (line, i) =>
      `<text x="30" y="${125 + i * 30}" font-family="sans-serif" font-size="28" font-weight="bold" fill="#292524">${escape(line)}</text>`,
  )
  .join("\n")}
<text x="30" y="193" font-family="sans-serif" font-size="19" font-weight="bold" fill="#671313">${marker.code} · ${floorNames[marker.floorId]}</text>
${shapes}
<path d="M30 576H610" stroke="#f5d76e" stroke-width="4"/>
<text x="320" y="606" text-anchor="middle" font-family="sans-serif" font-size="17" fill="#671313">Scan the complete image · Confirm the name and floor</text>
</svg>\n`;
}

const images = parishMarkers.map(artwork);
const pack = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Parish test markers</title>
<style>*{box-sizing:border-box}body{margin:0;color:#292524;background:#f4efe7;font:15px Arial,sans-serif}header{text-align:center;padding:24px}h1,h2{font-family:Georgia,serif}button{background:#b22222;color:white;border:0;padding:12px 20px;border-radius:8px;cursor:pointer}article{background:white;max-width:760px;padding:24px;margin:24px auto;text-align:center;break-after:page}svg{width:155mm;max-width:100%;height:auto}p{line-height:1.5}.note{font-size:12px}table{margin:20px auto;border-collapse:collapse;text-align:left}th,td{padding:6px;border-bottom:1px solid #e7e2da}@page{size:A4 portrait;margin:12mm}@media print{body{background:white}header{display:none}article{margin:0;padding:0;max-width:none}article:last-child{break-after:auto}*{print-color-adjust:exact;-webkit-print-color-adjust:exact}}</style></head><body>
<header><h1>St. Lorenzo Ruiz Parish</h1><p>${parishMarkers.length} test markers · Public entrances and landings only</p><p>Print at 100% scale in color, without browser headers/footers. Do not crop or modify the artwork.</p><p>Draft placements require on-site verification. Not a visitor-ready navigation system.</p><button onclick="window.print()">Print all parish test markers</button><table><thead><tr><th>Marker</th><th>Location</th><th>Floor</th></tr></thead><tbody>${parishMarkers.map((m) => `<tr><td>${m.code}</td><td>${escape(m.name)}</td><td>${floorNames[m.floorId]}</td></tr>`).join("")}</tbody></table></header>
${parishMarkers.map((m, i) => `<article><h2>${m.code} · ${floorNames[m.floorId]}</h2>${images[i]}<p>${escape(m.placement)}</p><p class="note">TEST PLACEMENT — verify before mounting. Maintain the scanning direction specified above when reading the instruction (relative to the drawing, not compass north). The app does not detect your heading. Keep markers flat, well lit, and clear of doors and walking paths.</p></article>`).join("\n")}
</body></html>\n`;
const artifacts = [
  ...parishMarkers.map((m, i) => [`marker-${m.code}.svg`, images[i]]),
  ["markers-print.html", pack],
];
const check = process.argv.includes("--check");
const directory = new URL("./assets/", import.meta.url);
if (!check) mkdirSync(directory, { recursive: true });
for (const [name, content] of artifacts) {
  const path = new URL(name, directory);
  if (check) {
    if (readFileSync(path, "utf8") !== content)
      throw new Error(`Regenerate ${name}, then recompile targets.mind`);
  } else writeFileSync(path, content);
}
console.log(
  `${check ? "Verified" : "Generated"} ${images.length} SVG markers and matching print pack. ${check ? "" : "Recompile targets.mind before scanning."}`,
);
