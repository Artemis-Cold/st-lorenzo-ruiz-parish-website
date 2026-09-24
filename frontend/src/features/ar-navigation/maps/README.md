# Navigation map profiles

Set `ACTIVE_MAP` in `activeMap.ts` to `"parish"` or `"house"` and rebuild.
This switches the complete map, destinations, facing directions and marker assets
for navigation and staff printing together; there is no visitor map selector.
House test data stays in `house/`, parish data in `parish/`; do not rename or swap
directories. Camera navigation loads bundled targets automatically, without a
testing opt-in. Printing is under Staff → Navigation Markers. The staff page is
role-protected, but printable assets are static files, not confidential documents.

## Current parish configuration

The final user diagram supersedes earlier generated map illustrations.
There are **16 markers and 10 destinations**. Public stair landings (four) and
aisles (two) are checkpoints only. Placement and facing are in `parish/markers.ts`.
The shared **Comfort Room** approach replaces separate boys/girls arrival markers.
Choir Stand and Sacristy markers are at their public-side entrances beside the Altar.

The Basement Plan is floor 1; the Ground Floor Plan is floor 2. Front stairs are
two-way. Rear/altar stairs are staff-only and filtered before public route
selection. Ramps connect outside ground starts to upper public landings.
Bell Tower and Comfort Room access is THROUGH Multipurpose Hall and its right-side
walkway, not directly from a front stair landing. All coordinates/costs remain
schematic. No surveyed metre estimates or continuous walking tracking are claimed.

## Source files

- `house/layout.ts`, `house/graph.ts`, `house/destinations.ts`, `house/markers.ts`,
  `house/config.ts`: unchanged test-layout data. Old `data/` paths re-export these.
- `parish/layout.ts`: schematic node positions, names and floors.
- `parish/graph.ts`: explicit passages, closures and access restrictions.
- `parish/destinations.ts`: ten user-selectable public arrivals.
- `parish/markers.ts`: final 16-image compiler order, placement and per-marker facing.
- `parish/config.ts`: assembled building/checkpoint configuration.
- `parish/generateMarkers.mjs`: reproducible SVG and print-pack generator.
- `parish/assets/`: current marker images and compiled target file.
- `parish/assets-set1-archived/`: recoverable previous set, not used by the app.
- `index.ts`: registry pairing each map with its own marker assets.

Run the marker generator with `--check` to verify the printable pack matches the
SVG artwork. Compile changed artwork in the matching profile via **Prepare test
markers**; never load the house file for the parish. Validate on a physical
phone before enabling visitor navigation.

Facing is the user's direction DURING SCANNING, clockwise from the drawing's top:
0 up, 90 right, 180 down, 270 left. It is not measured compass heading.
The old universal face-top instruction no longer applies to parish markers.
Keep scanning orientation when reading the arrow; phone rotation is not tracked.
The marker-attached label follows image tracking, not world/floor tracking.
