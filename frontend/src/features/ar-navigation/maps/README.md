# Navigation map profiles

Set `ACTIVE_MAP` in `activeMap.ts` to `"parish"` or `"house"` and rebuild.
This switches QR validation, staff QR printing, checkpoints and destinations.
The Android-only experience is QR scanning followed by WebXR, not MindAR.
See [WebXR setup and calibration](../WEBXR.md) for device requirements and field checks.

The `layout.ts`, `graph.ts`, `destinations.ts` and `markers.ts` files preserve the
current-use map. Existing target indices identify which nodes have physical QR
checkpoints; the old compiled target files are no longer used at runtime.
Staff print replacement QR codes under Navigation Markers. Printouts include
the placement description and scan-facing direction clockwise from plan north.

Basement is floor 1 and Ground Floor is floor 2. Front stairs are bidirectional;
altar stairs remain staff-only. A fresh QR scan is required after changing floors.
Bell Tower and Comfort Room AR paths remain unavailable until calibrated.

Plan-based rendering scale is configured in `services/qrNavigation.ts`. Checkpoint
positions and line clearance must be verified on site. Legacy image artwork,
generators and compiled assets remain as reference only; do not print those for
the new scanner.
