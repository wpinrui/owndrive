# OwnDrive

A self-hosted alternative to OneDrive that gives you full control of your files. OwnDrive connects to **your** Firebase project (Firestore + Storage) to sync files across desktop and mobile devices in real-time.

---

## What is OwnDrive?

OwnDrive is a file storage and sync solution that you host yourself using Firebase. Unlike cloud storage services where your data is stored on someone else's servers, OwnDrive lets you:

- **Keep full control**: Your files are stored in your own Firebase project
- **Real-time sync**: Files uploaded from one device appear instantly on all your other devices
- **Cross-platform**: Available for Windows, macOS, Linux (desktop) and Android (mobile)
- **Star important files**: Mark files for easy access and organization
- **No vendor lock-in**: Your data stays in your Firebase project, not on a third-party server

---

## Quick Start

### 1. Set Up Firebase

OwnDrive requires a Firebase project to store your files. You'll need to:

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Enable Cloud Storage
4. Configure Security Rules

**Detailed setup instructions:**
- See the [Desktop App README](desktop/README.md) for step-by-step Firebase setup
- The same Firebase project works for both desktop and mobile apps

> **Note**: Setting up Firebase is the only technical step required. Once configured, using OwnDrive is straightforward!

### 2. Install the Apps

**Desktop App:**
- Download the installer for your platform (Windows `.exe`, macOS `.dmg`, or Linux `.AppImage`)
- Run the installer and launch the app
- See [Desktop App README](desktop/README.md) for detailed instructions

**Android App:**
- Download the APK file
- Enable "Install from unknown sources" on your Android device
- Install the APK
- See [Android App README](android/README.md) for detailed instructions

### 3. Configure Firebase in the Apps

Both apps store Firebase credentials locally in their settings:

1. Open the app's Settings
2. Enter your Firebase credentials:
   - **API Key**: Your Firebase Web API Key
   - **Project ID**: Your Firebase Project ID
   - **Storage Bucket**: Your Firebase Storage Bucket (e.g., `your-project-id.appspot.com`)
3. Save the configuration

That's it! Your apps are now connected to your Firebase project and ready to sync files.

---

## How It Works

OwnDrive uses Firebase as the backend:

- **Firestore**: Stores file metadata (names, sizes, star status) and enables real-time synchronization
- **Cloud Storage**: Stores the actual files

When you upload a file:
1. The file is uploaded to Firebase Storage
2. File metadata is added to Firestore
3. All connected devices receive real-time updates and can see the new file

When you star a file or make other changes:
1. The change is saved to Firestore
2. All connected devices update automatically

---

## Features

### Desktop App
- Drag-and-drop file uploads
- Automatic file versioning (prevents accidental overwrites)
- Multi-file selection and batch operations
- Keyboard shortcuts for efficient navigation
- Real-time file list updates

### Android App
- View all files from your Firebase Storage
- Star files for easy access
- Real-time file list synchronization
- Simple, intuitive interface

### Both Apps
- Real-time sync across all devices
- Star important files
- Same Firebase backend
- Consistent functionality across platforms

---

## Repository Structure

This repository contains both the desktop and Android applications:

```
OwnDrive/
├── desktop/          # Electron desktop app (Windows, macOS, Linux)
├── android/          # Android mobile app
└── README.md         # This file
```

---

## Documentation

- **[Desktop App Guide](desktop/README.md)**: Complete guide for the desktop app, including Firebase setup, installation, and usage
- **[Android App Guide](android/README.md)**: Complete guide for the Android app, including Firebase setup, installation, and usage

Both guides include:
- Step-by-step Firebase setup instructions
- Installation instructions
- Usage guides
- Troubleshooting tips
- Developer overviews (for those interested in the technical details)

---

## Troubleshooting

**Common issues:**

- **"Firebase settings not configured"**: Open Settings in the app and enter your Firebase credentials
- **File list is empty**: Verify your Firebase Security Rules allow read access
- **Real-time updates not working**: Check your internet connection and Firestore Security Rules
- **Uploads fail**: Review Firebase Storage rules and ensure they allow write access

For more detailed troubleshooting, see the app-specific README files:
- [Desktop App Troubleshooting](desktop/README.md#troubleshooting)
- [Android App Troubleshooting](android/README.md#troubleshooting)

---

## Privacy & Security

- **Your data, your control**: All files are stored in your Firebase project, not on OwnDrive servers
- **Self-hosted**: You manage your Firebase project and security rules
- **No tracking**: OwnDrive doesn't collect or track any user data
- **Open source**: You can review the code to verify what the apps do

**Important**: Make sure to configure Firebase Security Rules appropriately for your use case. The default rules in the setup guides are examples—adjust them based on your security requirements.

---

## Support

For issues, questions, or contributions:
- Check the app-specific README files for detailed guides
- Review the troubleshooting sections
- Ensure your Firebase project is set up correctly

---

