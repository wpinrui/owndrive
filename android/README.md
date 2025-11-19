# OwnDrive Android App

OwnDrive is a self-hosted alternative to OneDrive that gives you full control of your files. The Android app connects to **your** Firebase project (Firestore + Storage) to sync files across all your devices in real-time.

---

## What is OwnDrive?

OwnDrive is a file storage and sync solution that you host yourself using Firebase. Unlike cloud storage services where your data is stored on someone else's servers, OwnDrive lets you:

- **Keep full control**: Your files are stored in your own Firebase project
- **Real-time sync**: Files uploaded from desktop appear instantly on mobile and vice versa
- **Star important files**: Mark files for easy access and organization
- **Cross-platform**: Works seamlessly with the desktop app (Windows, macOS, Linux)

---

## Getting Started

### Step 1: Set Up Firebase

Before using the Android app, you need to set up a Firebase project. If you've already set up Firebase for the desktop app, you can skip to Step 2.

1. **Create a Firebase project**
   - Go to [console.firebase.google.com](https://console.firebase.google.com/)
   - Click *Add project*
   - Give it a name (e.g., `owndrive`) and optionally disable Google Analytics

2. **Add a web app** (for getting your credentials)
   - In *Project settings → General*, click *Add app → Web*
   - Copy the **Web API Key** and **Project ID**—you'll need these for the app settings

3. **Enable Firestore**
   - Open *Build → Firestore Database → Create database*
   - Start in **production mode** (recommended) or **test mode** for local testing
   - Choose the closest region for best performance

4. **Enable Cloud Storage**
   - Open *Build → Storage → Get started*
   - Pick the same region you used for Firestore if possible
   - Note the default bucket name (usually `<project-id>.appspot.com`)

5. **Set up Security Rules**
   - These rules control who can access your files
   - For personal use without authentication, you can temporarily use open access (but **never** deploy this to production if your Firebase is publicly accessible)

   **Firestore rules:**
   ```js
   service cloud.firestore {
     match /databases/{database}/documents {
       match /files/{fileId} {
         allow read, write: if request.auth != null; // requires login
         // For unauthenticated personal use: allow read, write: if true;
       }
     }
   }
   ```

   **Storage rules:**
   ```js
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if request.auth != null;
         // For unauthenticated personal use: allow read, write: if true;
       }
     }
   }
   ```

---

### Step 2: Install the App

1. Download the OwnDrive APK file
2. On your Android device, enable "Install from unknown sources" in your device settings
3. Open the APK file and follow the installation prompts

---

### Step 3: Configure Firebase in the App

1. **Launch the app** after installation
2. **Open Settings** by tapping the settings icon (⚙️) in the top-right corner
3. **Enter your Firebase credentials**:
   - **API Key**: Your Firebase Web API Key (found in Project settings → General → Your apps → Web app)
   - **Project ID**: Your Firebase Project ID
   - **Storage Bucket**: Your Firebase Storage Bucket (e.g., `your-project-id.appspot.com`)
4. **Tap Save** to store the configuration
5. **Restart the app** for the new Firebase configuration to take effect

> **Note**: The app will show an error on first launch if Firebase settings are not configured. Configure them in Settings before using the app.

---

## Using OwnDrive

### Viewing Files

- **File list**: The main screen displays all files from your Firebase Storage, synced in real-time via Firestore
- **File information**: Each file shows its name and size
- **Starred files**: Files marked with a star (⭐) are highlighted for easy identification

### Settings

- **Access settings**: Tap the settings icon (⚙️) in the top-right corner
- **Configure Firebase**: Enter your Firebase API Key, Project ID, and Storage Bucket
- **Save changes**: Tap "Save" to store your configuration. Restart the app for changes to take effect

### Real-Time Sync

- The app uses Firestore real-time listeners to keep the file list synchronized
- Changes made from the desktop app or other devices will appear automatically
- No manual refresh needed—the list updates in real-time

---

## Updating Firebase Configuration

To update your Firebase credentials:

1. Open the Settings screen
2. Modify the Firebase Configuration section
3. If you rotate your Firebase API key, regenerate it in the Firebase console and update it in the app settings
4. **Important**: After saving new settings, restart the app for the new Firebase configuration to take effect

---

## Troubleshooting

| Problem | Solution |
| --- | --- |
| App crashes on launch with "Firebase settings not configured" | Open Settings and configure your Firebase credentials (API Key, Project ID, and Storage Bucket) before using the app |
| File list is empty | Verify your Firebase Security Rules allow read access. Check that Firestore has a `files` collection |
| Real-time updates not working | Ensure your Firestore Security Rules allow read access. Check your internet connection |
| App shows "Error listening to files" | Verify your Firebase credentials are correct and your Firestore Security Rules allow read access |

---

## Compatibility with Desktop App

The Android app works seamlessly with the desktop app:

- **Shared Firebase backend**: Both apps connect to the same Firebase project
- **Real-time sync**: Files uploaded from desktop appear instantly on mobile and vice versa
- **Consistent functionality**: Core features (file listing, starring, real-time updates) work the same across platforms
- **Same security model**: Both apps use the same Firebase Security Rules

Enjoy running OwnDrive entirely on your own stack across all your devices!

---

## For Developers

This section provides a brief overview for developers who want to understand or contribute to the Android app.

### Technology Stack

- **Kotlin**: Modern Android development language
- **Jetpack Compose**: Declarative UI framework
- **Material Design 3**: Modern Android design system
- **Firebase**: Firestore for real-time data and Storage for file hosting

### Project Structure

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

### Key Features

- Real-time file list via Firestore subscriptions
- Local settings storage using SharedPreferences
- Manual Firebase configuration (no `google-services.json` required)
- Material Design 3 theming

### Future Enhancements

Potential features for future development:
- File upload functionality
- File download and deletion capabilities
- File sorting and filtering options
- Firebase Authentication integration
- Expanded file metadata display
- Pull-to-refresh gesture
- File sharing capabilities
