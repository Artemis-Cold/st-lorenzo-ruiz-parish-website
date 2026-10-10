# Navigation map profiles

Set `ACTIVE_MAP` in `activeMap.ts` to `"parish"` or `"house"` and rebuild.
This switches the complete map, destinations, facing directions and marker assets
for navigation and staff printing together; there is no visitor map selector.
House navigation data stays in `house/`, parish data in `parish/`; do not rename or swap
directories. Camera navigation loads bundled targets automatically, without a
separate setup step. Printing is under Staff → Navigation Markers. The staff page is
role-protected, but printable assets are static files, not confidential documents.

## Current parish configuration

The final user diagram supersedes earlier generated map illustrations.
There are **17 compiled recognition targets, 14 active checkpoints, and 8 visitor
destinations**. Choir Stand, Sacristy, and Candle Stand are retired from the
visitor experience. Their old image slots remain only inside the compiled target
file so the remaining target indices stay compatible. Placement and facing are in
`parish/markers.ts`. The shared **Comfort Room** approach replaces separate
boys/girls arrival markers.

The Basement Plan is floor 1; the Ground Floor Plan is floor 2. Front stairs are
two-way. Rear/altar stairs are staff-only and filtered before public route
selection. Ramps connect outside ground starts to upper public landings.
Bell Tower and Comfort Room access is THROUGH Multipurpose Hall and its right-side
walkway, not directly from a front stair landing. All coordinates/costs remain
schematic. No surveyed metre estimates or continuous walking tracking are claimed.

## Source files

- `house/layout.ts`, `house/graph.ts`, `house/destinations.ts`, `house/markers.ts`,
  `house/config.ts`: house-layout data and marker definitions.
- `house/assets/`: house marker SVGs, placement map, print pack and compiled target file.
- `parish/layout.ts`: schematic node positions, names and floors.
- `parish/graph.ts`: explicit passages, closures and access restrictions.
- `parish/destinations.ts`: eight user-selectable public arrivals.
- `parish/markers.ts`: stable 17-image compiler order, placement and per-marker facing.
- `parish/config.ts`: assembled building/checkpoint configuration.
- `parish/generateMarkers.mjs`: reproducible SVG and print-pack generator.
- `parish/assets/`: current marker images and compiled target file.
- `index.ts`: registry pairing each map with its own marker assets.

Run the marker generator with `--check` to verify the printable pack matches the
SVG artwork. When marker artwork changes, recompile the matching `targets.mind`;
never load the house target file for the parish. Validate recognition on a
physical phone after changing marker assets.

Facing is the user's direction DURING SCANNING, clockwise from the drawing's top:
0 up, 90 right, 180 down, 270 left. It is not measured compass heading.
The old universal face-top instruction no longer applies to parish markers.
Each scan calibrates the arrow from the marker's configured facing. Place and
scan every marker from the direction shown on its placement map. The arrow then
rotates automatically relative to that confirmed direction; phone rotation
after the marker leaves view is not tracked.
The marker-attached label follows image tracking, not world/floor tracking.
