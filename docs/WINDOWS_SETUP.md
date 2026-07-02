# Building on Windows, step by step (no Mac, no fees)

Everything here is free. You'll install the toolchain once (§1–§4), then daily
development is just §5. Total first-time setup: about 1–2 hours, mostly
downloads.

## 1. Install Node.js

1. Go to <https://nodejs.org> and install the **LTS** version (22.x) with the
   default options.
2. Open **PowerShell** and verify:
   ```powershell
   node --version   # v22.x
   npm --version
   ```

## 2. Install Android Studio (free — this replaces Xcode for Android)

1. Download from <https://developer.android.com/studio> and install with
   default options ("Standard" setup). This brings the Android SDK, an
   emulator, and the build tools.
2. Open Android Studio → **More Actions → SDK Manager** and confirm these are
   checked (install if not):
   - **SDK Platforms**: Android 15 (API 35) — or whatever the top stable is
   - **SDK Tools**: Android SDK Build-Tools, Android SDK Platform-Tools,
     Android Emulator, **NDK (Side by side)**, **CMake**
3. Set environment variables so the build can find the SDK. In PowerShell:
   ```powershell
   [Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
   [Environment]::SetEnvironmentVariable("Path", "$([Environment]::GetEnvironmentVariable('Path','User'));$env:LOCALAPPDATA\Android\Sdk\platform-tools", "User")
   ```
   Close and reopen PowerShell, then check: `adb --version`.

## 3. Install JDK 17

Android builds need Java 17 (not newer).

1. Download **Eclipse Temurin 17 (LTS)** from <https://adoptium.net> (MSI,
   x64). During install, enable "Set JAVA_HOME variable".
2. Verify in a fresh PowerShell: `java -version` → `openjdk 17...`.

## 4. Install Git and clone the repo

1. <https://git-scm.com/download/win>, default options.
2. Keep the path short (Android builds + Windows 260-char path limit):
   ```powershell
   cd C:\
   mkdir dev; cd dev
   git clone https://github.com/austingraph/mobilemurdertour.git
   cd mobilemurdertour
   npm install
   ```

## 5. Run the app

### Option A — your actual phone via USB (recommended; GPS is real)

1. On the phone: Settings → About phone → tap **Build number** 7 times
   (enables Developer options) → Developer options → enable **USB
   debugging**.
2. Plug in via USB, accept the "Allow USB debugging?" prompt.
3. Confirm it's seen: `adb devices` (should list one device).
4. Build and install (first time takes 10–20 min; later runs are fast):
   ```powershell
   npx expo run:android
   ```
   This generates the native Android project, compiles it with Gradle, installs
   the app, and starts the Metro dev server. Edit any `.ts`/`.tsx` file and the
   app reloads instantly — you only rebuild when you add native dependencies.

### Option B — the emulator (no phone at hand)

1. Android Studio → **More Actions → Virtual Device Manager** → Create device
   (e.g. Pixel 8, latest system image) → ▶ to boot it.
2. `npx expo run:android` — it installs into the running emulator.
3. **Fake GPS for tour testing:** in the emulator's `⋯` (Extended controls) →
   **Location**, paste a stop's lat/lng from `src/data/tour.ts` (e.g.
   `30.2706, -97.7534` for the Mollie Smith site) → **Set location**. You can
   also import a GPX route and "play" it to simulate walking the whole tour —
   the geofences will fire in sequence on your desk.

> Note: Expo Go (the QR-code preview app) does **not** work for this project —
> MapLibre is a custom native module, so use `npx expo run:android` (a
> "development build"), not `npx expo start` alone.

## 6. Day-to-day loop

```powershell
npx expo run:android    # once per session (or `npx expo start` if already installed)
# edit code → auto-reloads
node scripts/export-tour.js   # after editing src/data/tour.ts, then commit web/content/tour.json
```

## 7. Building a shareable APK (still free)

```powershell
cd android
.\gradlew assembleRelease
# output: android\app\build\outputs\apk\release\app-release.apk
```

Send that file to anyone with an Android phone (they enable "install unknown
apps" once). The default build is signed with a debug keystore — fine for
friends/testing. For Play Store distribution you'd generate your own keystore
(`keytool -genkeypair ...`, documented in the RN docs) and pay Google's
one-time $25.

## 8. Troubleshooting the usual suspects

| Symptom | Fix |
| --- | --- |
| `JAVA_HOME is set to an invalid directory` | Reinstall Temurin 17 with the JAVA_HOME option, reopen PowerShell |
| `SDK location not found` | Check `ANDROID_HOME` (§2.3); or create `android/local.properties` with `sdk.dir=C:\\Users\\YOU\\AppData\\Local\\Android\\Sdk` |
| Build fails with path errors | Move repo to `C:\dev\`, run `git config core.longpaths true` |
| Phone not in `adb devices` | Change USB mode from "Charging" to "File transfer"; reaccept the debugging prompt |
| Map is blank | Phone/emulator has no internet, or the style URL is unreachable — see `MAP_STYLE_URL` in `src/config.ts` |
| Location never arrives in emulator | Extended controls → Location → Set location; also check the app got the permission prompt |
| Changed `app.json` or added a native package and things act stale | `npx expo prebuild --clean` then `npx expo run:android` |

## 9. When you get Mac access later

Nothing to redo: `npm install`, `npx expo run:ios`, grant location/camera
permissions (the strings are already configured in `app.json`). The free tier
of Apple's tooling lets you run on your own iPhone; the $99/yr program is only
for App Store distribution.
