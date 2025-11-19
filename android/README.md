# OwnDrive Android Guide

OwnDrive is a self-hosted alternative to OneDrive: you keep full control of your files by connecting the Android mobile client to **your** Firebase project (Firestore + Storage). This guide walks you through the entire process—from Firebase setup to building and installing the Android app.

---

## What you get

- Android app built with Kotlin, Jetpack Compose, and Material Design 3.
- Real-time file list via Firestore subscriptions.
- Star files for easy access and organization.
- Firebase configuration through in-app settings.
- Cross-platform compatibility with the desktop app (same Firebase backend).

---

## Prerequisites

- Android Studio Hedgehog (2023.1.1) or later.
- JDK 11 or later.
- Android SDK 33+ (API level 33+).
- Firebase account with permissions to create a project.
- Android device or emulator running API 33+.

---

## 1. Firebase project setup

The Android app uses the same Firebase project as the desktop app. If you've already set up Firebase for the desktop app, you can skip to step 2. Otherwise, follow these steps:

1. **Create a project**
   - Go to [console.firebase.google.com](https://console.firebase.google.com/), click *Add project*.
   - Give it a name such as `owndrive` and disable Google Analytics (optional).

2. **Add an Android app**
   - In *Project settings → General*, click *Add app → Android*.
   - Enter package name: `com.wpinrui.owndrive`
   - Download `google-services.json` and place it in `android/app/` (if using Firebase SDK auto-configuration).
   - Note: The app uses manual Firebase configuration, so the JSON file is optional.

3. **Enable Firestore**
   - Open *Build → Firestore Database → Create database*.
   - Start in **production mode** (recommended) or **test mode** for local testing.
   - Choose the closest region for latency; remember it for Storage later.

4. **Enable Cloud Storage**
   - Open *Build → Storage → Get started*.
   - Pick the same region you used for Firestore if possible.
   - Note the default bucket name (`<project-id>.appspot.com`).

5. **Security rules (minimum viable example)**
   - Adjust to match your authentication story. During prototyping you can allow open access, but tighten later.

   ```js
   // Firestore: match your collection naming
   service cloud.firestore {
     match /databases/{database}/documents {
       match /files/{fileId} {
         allow read, write: if request.auth != null; // require login
       }
     }
   }
   ```

   ```js
   // Storage
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

   > For unauthenticated personal use, temporarily replace `request.auth != null` with `true`, but **never** deploy that to production.

---

## 2. Configure Firebase credentials

OwnDrive stores Firebase credentials in the app settings (stored locally using SharedPreferences). You can configure them directly in the app:

1. **Launch the app** (after building and installing).
2. **Open Settings** by tapping the settings icon in the top-right corner.
3. **Enter your Firebase credentials**:
   - **API Key**: Your Firebase Web API Key (found in Project settings → General → Your apps → Web app)
   - **Project ID**: Your Firebase Project ID
   - **Storage Bucket**: Your Firebase Storage Bucket (e.g., `your-project-id.appspot.com`)
4. **Tap Save** to store the configuration.

The credentials are stored locally in the app and will persist across sessions. **You'll need to restart the app** for the new Firebase configuration to take full effect.

> **Note**: The app will show an error on first launch if Firebase settings are not configured. Configure them in Settings before using the app.

---

## 3. Install dependencies

1. **Open the project in Android Studio**
   - Open Android Studio and select "Open an Existing Project".
   - Navigate to the `android/` directory and open it.

2. **Sync Gradle files**
   - Android Studio should automatically sync Gradle files when you open the project.
   - If not, click "Sync Now" or go to *File → Sync Project with Gradle Files*.

3. **Wait for dependencies to download**
   - Android Studio will download all required dependencies (Firebase, Jetpack Compose, etc.).

---

## 4. Develop & test

### Running the app

1. **Connect a device or start an emulator**
   - Connect an Android device via USB with USB debugging enabled, or
   - Start an Android Virtual Device (AVD) from Android Studio.

2. **Run the app**
   - Click the "Run" button (green play icon) in Android Studio, or
   - Press `Shift + F10` (Windows/Linux) or `Ctrl + R` (macOS), or
   - Run from terminal: `./gradlew installDebug`

3. **Configure Firebase**
   - On first launch, open Settings and configure your Firebase credentials.
   - Restart the app after saving settings.

### Development workflow

- **Hot reload**: Jetpack Compose supports hot reload during development. Changes to UI code will reflect immediately.
- **Logcat**: Use Android Studio's Logcat to view app logs and debug issues.
- **Build variants**: Use `assembleDebug` for development builds, `assembleRelease` for production.

---

## 5. Build & install the Android app

### Debug build

```bash
./gradlew assembleDebug
```

The APK will be generated at: `android/app/build/outputs/apk/debug/app-debug.apk`

Install it on a connected device:
```bash
./gradlew installDebug
```

### Release build

For production distribution:

1. **Generate a signed APK or AAB**
   - In Android Studio: *Build → Generate Signed Bundle / APK*
   - Choose APK or Android App Bundle (AAB) for Play Store
   - Create or select a keystore
   - Follow the signing wizard

2. **Or use Gradle** (after configuring signing in `build.gradle.kts`):
   ```bash
   ./gradlew assembleRelease  # For APK
   ./gradlew bundleRelease     # For AAB (Play Store)
   ```

The release APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

---

## 6. Using OwnDrive

### Viewing files

- **File list**: The main screen displays all files from your Firebase Storage, synced in real-time via Firestore.
- **File information**: Each file shows its name and size.
- **Starred files**: Files marked with a star (⭐) are highlighted for easy identification.

### Settings

- **Access settings**: Tap the settings icon (⚙️) in the top-right corner.
- **Configure Firebase**: Enter your Firebase API Key, Project ID, and Storage Bucket.
- **Save changes**: Tap "Save" to store your configuration. Restart the app for changes to take effect.

### Real-time sync

- The app uses Firestore real-time listeners to keep the file list synchronized.
- Changes made from the desktop app or other devices will appear automatically.
- No manual refresh needed—the list updates in real-time.

---

## 7. Branding & icons

- The app icon uses the same source image as the desktop app: `desktop/resources/owndrive-icon.png`.
- The icon is configured as an Android adaptive icon with:
  - **Foreground**: The OwnDrive icon (database + cloud symbol)
  - **Background**: White background
- Icon resources are located in `android/src/main/res/drawable/` and `android/src/main/res/mipmap-*/`.
- **Icon attribution**: Database icon created by [Freepik](https://www.freepik.com/) via [Flaticon](https://www.flaticon.com/free-icon/database_138932).

To update the icon:
1. Replace `android/src/main/res/drawable/owndrive_icon.png` with your new icon (1024x1024px recommended).
2. Rebuild the app to see the new icon.

---

## 8. Updating Firebase configuration

- To update your Firebase credentials, open the Settings screen and modify the Firebase Configuration section.
- If you rotate your Firebase API key, regenerate it in the Firebase console and update it in the app settings.
- **Important**: After saving new settings, restart the app for the new Firebase configuration to take effect.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| App crashes on launch with "Firebase settings not configured" | Open Settings and configure your Firebase credentials (API Key, Project ID, and Storage Bucket) before using the app. |
| File list is empty | Verify your Firebase Security Rules allow read access. Check that Firestore has a `files` collection. |
| Real-time updates not working | Ensure your Firestore Security Rules allow read access. Check your internet connection. |
| Build fails with "SDK not found" | Install the required Android SDK (API 33+) via Android Studio's SDK Manager. |
| Gradle sync fails | Check your internet connection. Try "Invalidate Caches / Restart" in Android Studio. |
| App shows "Error listening to files" | Verify your Firebase credentials are correct and your Firestore Security Rules allow read access. |

---

## Project structure

```
android/
├── src/
│   ├── main/
│   │   ├── java/com/wpinrui/owndrive/
│   │   │   ├── MainActivity.kt          # Main activity and app entry point
│   │   │   ├── FirebaseConfig.kt        # Firebase initialization
│   │   │   ├── SettingsManager.kt       # Local settings storage
│   │   │   ├── FileMeta.kt              # File metadata data class
│   │   │   └── ui/
│   │   │       ├── FileListScreen.kt    # Main file list UI
│   │   │       ├── SettingsScreen.kt    # Settings UI
│   │   │       └── theme/                # Material Design 3 theme
│   │   ├── res/                          # Resources (icons, strings, themes)
│   │   └── AndroidManifest.xml          # App manifest
│   └── test/                             # Unit tests
├── build.gradle.kts                      # App-level build configuration
└── proguard-rules.pro                    # ProGuard rules for release builds
```

---

## Next steps & customization

- Add file upload functionality (similar to desktop app's drag-and-drop).
- Add file download and deletion capabilities.
- Implement file sorting and filtering options.
- Add Firebase Authentication for secure access.
- Expand file metadata display (last modified date, upload date).
- Add pull-to-refresh gesture.
- Implement file sharing capabilities.

---

## Compatibility with desktop app

The Android app is designed to work seamlessly with the desktop app:

- **Shared Firebase backend**: Both apps connect to the same Firebase project.
- **Real-time sync**: Files uploaded from desktop appear instantly on mobile and vice versa.
- **Consistent functionality**: Core features (file listing, starring, real-time updates) work the same across platforms.
- **Same security model**: Both apps use the same Firebase Security Rules.

Enjoy running OwnDrive entirely on your own stack across all your devices!

