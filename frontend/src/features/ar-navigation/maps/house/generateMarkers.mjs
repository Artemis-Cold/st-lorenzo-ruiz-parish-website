// Run with modern Node: node src/features/ar-navigation/maps/house/generateMarkers.mjs
// SVG artwork, placement map, and printable pack are generated together.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { markerManifest } from "./markers.ts";

const escape = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
const direction = (facing) =>
  ({ 0: "UP", 90: "RIGHT", 180: "DOWN", 270: "LEFT" })[facing];
const wrap = (text, limit = 34) => {
  const lines = [""];
  for (const word of text.split(" ")) {
    if ((lines.at(-1) + " " + word).trim().length > limit) lines.push(word);
    else lines[lines.length - 1] = (lines.at(-1) + " " + word).trim();
  }
  return lines;
};

function artwork(marker, targetIndex) {
  let seed = 713041 + targetIndex * 198491;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const shapes = Array.from({ length: 180 }, (_, index) => {
    const x = Math.round(35 + random() * 535);
    const y = Math.round(220 + random() * 315);
    const size = Math.round(8 + random() * 22);
    const color =
      index % 5 === 0 ? "#b22222" : index % 7 === 0 ? "#9a7418" : "#292524";
    return index % 3 === 0
      ? `<circle cx="${x}" cy="${y}" r="${size / 2}" fill="${color}"/>`
      : `<path d="M${x} ${y} l${size} ${Math.round(random() * size)} l-${Math.round(random() * size)} ${size} Z" fill="${color}"/>`;
  }).join("\n");
  const code = `H${String(targetIndex).padStart(2, "0")}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640">
<rect width="640" height="640" fill="#fff"/>
<rect x="10" y="10" width="620" height="620" rx="5" fill="none" stroke="#b22222" stroke-width="6"/>
<rect x="22" y="22" width="596" height="66" fill="#b22222"/>
<text x="320" y="53" text-anchor="middle" font-family="Georgia,serif" font-size="28" font-weight="bold" fill="#fff">House Navigation Test</text>
<text x="320" y="76" text-anchor="middle" font-family="sans-serif" font-size="14" letter-spacing="3" fill="#f5d76e">CHECKPOINT MARKER</text>
${wrap(marker.name)
  .map(
    (line, index) =>
      `<text x="30" y="${125 + index * 30}" font-family="sans-serif" font-size="28" font-weight="bold" fill="#292524">${escape(line)}</text>`,
  )
  .join("\n")}
<text x="30" y="193" font-family="sans-serif" font-size="19" font-weight="bold" fill="#671313">${code} · FACE ${direction(marker.facing)}</text>
${shapes}
<path d="M30 576H610" stroke="#f5d76e" stroke-width="4"/>
<text x="320" y="606" text-anchor="middle" font-family="sans-serif" font-size="17" fill="#671313">Scan the complete image · Confirm the room name</text>
</svg>\n`;
}

const arrows = [
  [0, 500, 720, 0],
  [1, 500, 675, 180],
  [2, 500, 270, 180],
  [3, 675, 240, 90],
  [4, 325, 585, 270],
  [5, 325, 405, 270],
  [6, 675, 405, 90],
  [7, 675, 585, 90],
  [8, 255, 300, 0],
  [9, 325, 165, 270],
];
const arrow = (index, x, y, rotation) => `<g transform="translate(${x} ${y})">
<g transform="rotate(${rotation})">
<circle r="25" fill="#fff" stroke="#b22222" stroke-width="3"/>
<path d="M0 -18 L14 8 H5 V19 H-5 V8 H-14 Z" fill="#b22222"/>
</g>
<text x="31" y="6" font-family="Arial,sans-serif" font-size="16" font-weight="bold" fill="#671313">H${String(index).padStart(2, "0")}</text>
</g>`;
const placementMap = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000">
<rect width="1000" height="1000" fill="#fff"/>
<text x="500" y="42" text-anchor="middle" font-family="Georgia,serif" font-size="30" font-weight="bold" fill="#292524">House Navigation Marker Placement</text>
<text x="500" y="70" text-anchor="middle" font-family="Arial,sans-serif" font-size="15" fill="#57534e">Arrow direction = direction the user must face while scanning</text>
<g fill="none" stroke="#292524" stroke-width="3">
  <rect x="150" y="90" width="700" height="630"/>
  <path d="M325 90V150 M325 185V335 M325 370V430 M325 465V720"/>
  <path d="M675 90V205 M675 240V335 M675 370V430 M675 465V720"/>
  <path d="M150 225H325 M150 315H255 M150 450H325 M150 585H325"/>
  <path d="M675 315H850 M675 450H850 M675 585H850"/>
  <path d="M375 315H625 M375 315V675 M625 315V675"/>
  <path d="M375 720H475 M525 720H675"/>
  <path d="M325 720V920 H675V835 M675 800V720"/>
</g>
<g font-family="Arial,sans-serif" font-size="18" fill="#292524" text-anchor="middle">
  <text x="235" y="160">Bathroom 2</text><text x="235" y="275">Bathroom 1</text>
  <text x="235" y="390">Room 2</text><text x="235" y="535">Room 1</text>
  <text x="500" y="175">Dining Room</text><text x="760" y="175">Kitchen</text>
  <text x="760" y="390">Room 3</text><text x="760" y="535">Room 4</text>
  <text x="500" y="500">Living Room</text><text x="500" y="820">Terrace</text>
</g>
${arrows.map((item) => arrow(...item)).join("\n")}
</svg>\n`;

const images = markerManifest.map(artwork);
const pack = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>House navigation markers</title>
<style>*{box-sizing:border-box}body{margin:0;color:#292524;background:#f4efe7;font:15px Arial,sans-serif}header{text-align:center;padding:24px}h1,h2{font-family:Georgia,serif}button{background:#b22222;color:#fff;border:0;padding:12px 20px;border-radius:8px;cursor:pointer}article{background:#fff;max-width:760px;padding:24px;margin:24px auto;text-align:center;break-after:page}svg{width:155mm;max-width:100%;height:auto}p{line-height:1.5}.note{font-size:12px}table{margin:20px auto;border-collapse:collapse;text-align:left}th,td{padding:6px;border-bottom:1px solid #e7e2da}@page{size:A4 portrait;margin:12mm}@media print{body{background:#fff}header{display:none}article{margin:0;padding:0;max-width:none}article:last-child{break-after:auto}*{print-color-adjust:exact;-webkit-print-color-adjust:exact}}</style></head><body>
<header><h1>House Navigation Test Markers</h1><p>${markerManifest.length} markers based on the supplied placement map.</p><p>The stated facing direction is relative to the top of the floor plan, not compass north.</p><button onclick="window.print()">Print all house markers</button><table><thead><tr><th>Marker</th><th>Location</th><th>Face</th></tr></thead><tbody>${markerManifest.map((marker, index) => `<tr><td>H${String(index).padStart(2, "0")}</td><td>${escape(marker.name)}</td><td>${direction(marker.facing)}</td></tr>`).join("")}</tbody></table></header>
${markerManifest.map((marker, index) => `<article><h2>H${String(index).padStart(2, "0")} · Face ${direction(marker.facing)}</h2>${images[index]}<p>${escape(marker.placement)}</p><p class="note">Mount flat and keep the complete marker visible. Stand on the stated side and face in the arrow direction before scanning.</p></article>`).join("\n")}
</body></html>\n`;

const artifacts = [
  ...markerManifest.map((_, index) => [
    `marker-H${String(index).padStart(2, "0")}.svg`,
    images[index],
  ]),
  ["marker-placement-map.svg", placementMap],
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
  `${check ? "Verified" : "Generated"} ${images.length} house markers, placement map, and print pack.`,
);
