# SLRP AR website integration

The landing-page section `/#slrp-ar` distributes `SLRP.apk`; the previous
`/slrp-ar` URL redirects to that section. Signed-in parishioners use the
protected `/ar-navigation` page within their dashboard layout. Both share
the same download content. The website no longer starts
a WebXR camera or navigation session. The retired browser navigation sources,
map data, image targets, and tests have been removed.

Staff Settings → Navigation Markers prints the six original PNG files in
`parishqrmarkers/`. These are not regenerated from the old web map registry.
Replace these images together with the APK if Unity's QR identifiers change.

Vite copies the imported APK into the production build with a content hash.
Deploy the full frontend build, including that approximately 42 MiB asset.
Replacing the source APK and rebuilding updates the download link.

The download UI requires Android and a user acknowledgement of ARCore support.
This is not a native compatibility check. The Unity app must check AR availability,
Google Play Services for AR installation and camera permission at runtime.
The supplied archive includes arm64-v8a libraries only. Unity source is not
included here; native runtime checks and physical route accuracy have not been
verified by the website integration. Test installation and all six printed codes
on a supported Android phone before publishing.
