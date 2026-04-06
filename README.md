# FocusFlow Todo Android App

This folder contains an Android app version of the to-do list. It packages the existing HTML, CSS, and JavaScript inside a `WebView`, so the app works fully offline and keeps task data in WebView local storage on the device.

## What you need

- Android Studio with Android Gradle Plugin 9.1.0 support
- JDK 17
- Android SDK Platform 36 and Build Tools 36.0.0

## Open in Android Studio

1. Open the `android-app` folder in Android Studio.
2. Let Android Studio install any missing SDK components if it prompts you.
3. Pick an emulator or Android device.
4. Run the `app` configuration.

## Keep the Android assets in sync

If you update the root web files (`index.html`, `styles.css`, or `app.js`), run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\sync-android-assets.ps1
```

That copies the latest web files into `app/src/main/assets/www/`.

## Notes

- The current environment did not have Android Studio, the Android SDK, or Gradle installed, so this project could not be built here.
- The Android app uses `WebViewAssetLoader` and Android's built-in Kotlin support from the current Android Gradle Plugin line.
