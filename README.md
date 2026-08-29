# NovaNotes Android V1

This project wraps the supplied NovaNotes HTML/CSS/JS frontend in a native Android
container using Capacitor.

## Source preserved

The original frontend files are in `www/`:
- index.html
- script.js
- style.css

No redesign was applied to those files.

## Android identity

- App name: NovaNotes
- Package ID: com.brightcell.novanotes
- Version: 1.0.0

## Build

The included GitHub Actions workflow builds a debug APK automatically.

1. Upload this project to a GitHub repository.
2. Push to `main`, or run the workflow manually from Actions.
3. Download the `NovaNotes-debug-apk` artifact.
4. Host the APK at an HTTPS URL.
5. Put that URL into NovaMarket's `APK / Download URL` field.

Capacitor 8.5.0 is pinned for reproducible setup.
