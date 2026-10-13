# Android QR / WebXR navigation

The active experience is QR identification followed by immersive WebXR AR.
No MindAR runtime or compiled image targets are used. Android Chrome,
Google Play Services for AR, HTTPS, native QR BarcodeDetector, local-floor,
hit-test and DOM overlay support are required. Unsupported browsers get an error.

## Workflow

1. Staff print the active map's QR codes from Navigation Markers.
2. Scan a QR in the site's camera. Its payload must match an active checkpoint.
3. Select a destination. The scanner releases the camera.
4. Stand at the checkpoint's designated public-side standing point, facing
   the QR in its documented plan direction. Start AR and tilt toward the floor
   without turning sideways. Confirm alignment to place the route.
5. The rendered line remains in XR world space as the camera moves. It is not
   a screen overlay. QR decoding does not automatically recover marker pose.
6. Cross-floor lines stop at the public stair landing. End AR and scan again on
   the next floor. Scan at the destination to confirm arrival. Tracking loss or
   a reference-space reset hides the line and requires alignment again at the QR.

## Coordinate provenance and limits

`qrNavigation.ts` retains existing current-use route connectivity and fits the
parish schematic envelope to the architectural plan's main grid (25 m across,
approximately 26.9 m longitudinally). This is a plan-based estimate, not surveyed
checkpoint placement. The historical basement room labels differ from the current
use diagram; do not substitute those room labels into visitor destinations.
House coordinates retain their existing metre-like scale and need an on-site check.

This does not prove every route vertex follows the physical corridor. Before public
use, verify each segment/turn against the building, correct metricPoints or replace
its scaling with per-node measured coordinates, and mark the exact standing points.
Bell Tower, Comfort Room and outside ramp start paths are blocked until measured.
The line does not avoid obstacles, infer floor changes, or assert arrival from
camera movement. No distance readout or automatic turn/arrival estimation is used.

Switch house/parish using ACTIVE_MAP in maps/activeMap.ts. QR payloads are versioned
and map-specific; old MindAR prints/photos cannot be scanned as navigation QRs.
Legacy marker artwork and pure image-projection tests remain for reference only.

## Device acceptance checks (require real Android hardware)

- Permission denial, missing AR services, unsupported browser, unknown/wrong-map QR.
- QR camera stops before XR; browser Back and Scan QR release the XR camera.
- Floor acquisition, each cardinal QR facing, rotate/walk without line sliding.
- Permission cancellation, tracking loss, background/foreground, reference resets.
- Both floor transitions, doorway standing offsets, destination confirmation.
- Validate QR print contrast and every floor line on site before visitor use.
