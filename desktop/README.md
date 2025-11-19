# OwnDrive Desktop App

OwnDrive is a self-hosted alternative to OneDrive that gives you full control of your files. The desktop app connects to **your** Firebase project (Firestore + Storage) to sync files across all your devices in real-time.

---

## What is OwnDrive?

OwnDrive is a file storage and sync solution that you host yourself using Firebase. Unlike cloud storage services where your data is stored on someone else's servers, OwnDrive lets you:

- **Keep full control**: Your files are stored in your own Firebase project
- **Drag-and-drop uploads**: Easily upload files with automatic deduplication and versioning
- **Real-time sync**: Files uploaded from mobile appear instantly on desktop and vice versa
- **Star important files**: Mark files for easy access and organization
- **Multi-select**: Select multiple files for batch operations
- **Keyboard shortcuts**: Efficient file management with keyboard navigation
- **Cross-platform**: Available for Windows, macOS, and Linux

---

## Getting Started

### Step 1: Set Up Firebase

Before using the desktop app, you need to set up a Firebase project. If you've already set up Firebase for the Android app, you can skip to Step 2.

1. **Create a Firebase project**
   - Go to [console.firebase.google.com](https://console.firebase.google.com/)
   - Click *Add project*
   - Give it a name (e.g., `owndrive`) and optionally disable Google Analytics

2. **Add a web app**
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

1. **Download the installer** for your platform:
   - **Windows**: Download the `.exe` installer
   - **macOS**: Download the `.dmg` file
   - **Linux**: Download the `.AppImage` or `.tar.gz` file

2. **Run the installer** and follow the installation prompts

3. **Launch the app** after installation

---

### Step 3: Configure Firebase in the App

1. **Open Settings** by clicking the settings button in the app
2. **Enter your Firebase credentials**:
   - **API Key**: Your Firebase Web API Key
   - **Project ID**: Your Firebase Project ID
   - **Storage Bucket**: Your Firebase Storage Bucket (e.g., `your-project-id.appspot.com`)
3. **Click Save** to store the configuration

The app will automatically reconnect to Firebase when you save the settings. No restart required!

> **Note**: The app will show an error if Firebase settings are not configured. Configure them in Settings before using the app.

---

## Using OwnDrive

### Uploading Files

- **Upload button**: Click the *Upload* button to select files from your computer
- **Drag and drop**: Simply drag files from your file manager and drop them onto the OwnDrive window
- **Automatic versioning**: If a file with the same name already exists, OwnDrive will automatically create a versioned copy (with a timestamp) so you never lose files

### Managing Files

- **Star important files**: Click the star icon next to any file to mark it as important. Starred files can be sorted to the top using the "Starred first" toggle
- **Select multiple files**: 
  - **Shift-click**: Select a range of files
  - **Ctrl/Cmd-click**: Select individual files
- **Keyboard shortcuts**: Use keyboard navigation for efficient file management
- **Delete files**: Select files and use the delete action (note: starred files are protected from deletion—remove the star first if needed)

### Real-Time Sync

- The app uses Firestore real-time subscriptions to keep the file list synchronized
- Changes made from the mobile app or other devices will appear automatically
- No manual refresh needed—the list updates in real-time

---

## Updating Firebase Configuration

To update your Firebase credentials:

1. Open the Settings dialog
2. Modify the Firebase Configuration section
3. If you rotate your Firebase API key, regenerate it in the Firebase console and update it in the app settings
4. Changes take effect immediately after saving—no restart required

---

## Troubleshooting

| Problem | Solution |
| --- | --- |
| App shows "Missing Firebase configuration" | Open Settings and configure your Firebase credentials (API Key, Project ID, and Storage Bucket) |
| Uploads fail with permission errors | Review Firebase Storage/Firestore rules; ensure your auth state matches the rule requirements |
| File list not updating | Check your internet connection and verify your Firestore Security Rules allow read access |

---

## Compatibility with Mobile App

The desktop app works seamlessly with the Android app:

- **Shared Firebase backend**: Both apps connect to the same Firebase project
- **Real-time sync**: Files uploaded from mobile appear instantly on desktop and vice versa
- **Consistent functionality**: Core features (file listing, starring, real-time updates) work the same across platforms
- **Same security model**: Both apps use the same Firebase Security Rules

Enjoy running OwnDrive entirely on your own stack across all your devices!

---

## For Developers

This section provides a brief overview for developers who want to understand or contribute to the desktop app.

### Technology Stack

- **Electron**: Cross-platform desktop application framework
- **React**: UI library for building the interface
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **Firebase**: Firestore for real-time data and Storage for file hosting

### Project Structure

```
desktop/
├── electron/              # Electron main process and preload scripts
│   ├── main.ts           # Main Electron process
│   └── preload.ts        # Preload script for secure IPC
├── src/                   # React application
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── contexts/         # React contexts
│   └── styling/          # SCSS stylesheets
├── resources/            # App icons and resources
└── package.json          # Dependencies and scripts
```

### Key Features

- Drag-and-drop file uploads with automatic deduplication
- Real-time file list via Firestore subscriptions
- Local settings storage
- Multi-file selection and batch operations
- Keyboard shortcuts for efficient navigation
- Cross-platform packaging with electron-builder

### Future Enhancements

Potential features for future development:
- Firebase Authentication integration
- Additional preload APIs (clipboard, context menu, auto-launch)
- Enhanced file metadata and organization
- File sharing capabilities
