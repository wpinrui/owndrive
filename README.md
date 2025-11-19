# OwnDrive

A self-hosted alternative to OneDrive with desktop and Android clients. Keep full control of your files by connecting to **your** Firebase project (Firestore + Storage).

## 📁 Repository Structure

This is a monorepo containing both the desktop and Android applications:

```
OwnDrive/
├── desktop/          # Electron desktop app (Windows, macOS, Linux)
├── android/          # Android mobile app
├── .gitignore
└── README.md         # This file
```

## 🚀 Getting Started

### Desktop App

The desktop client is built with Electron, React, TypeScript, and Vite.

**Prerequisites:**
- Node.js 18+ and npm

**Setup:**
```bash
cd desktop
npm install
```

**Development:**
```bash
npm run dev          # Start dev server with Electron
npm run dev:web      # Start dev server in browser
```

**Build:**
```bash
npm run build        # Build for production
npm run package      # Build and package for distribution
```

For detailed setup instructions, see [`desktop/README.md`](desktop/README.md).

### Android App

The Android app is built with Kotlin, Jetpack Compose, and Firebase.

**Prerequisites:**
- Android Studio
- JDK 11+
- Android SDK 33+

**Setup:**
1. Open the project in Android Studio
2. Sync Gradle files
3. Configure your Firebase project (see Android app documentation)

**Build:**
```bash
./gradlew assembleDebug    # Build debug APK
./gradlew assembleRelease  # Build release APK
```

## 🔧 Development

### Working with Both Apps

Since both apps connect to the same Firebase backend, you can:
- Develop and test features across platforms
- Share Firebase configuration between apps
- Maintain consistent functionality across desktop and mobile

### Firebase Setup

Both apps require Firebase configuration:
- **Firestore**: For metadata and file information
- **Storage**: For actual file storage

See the desktop app README for detailed Firebase setup instructions.

## 📦 Building for Distribution

### Desktop
```bash
cd desktop
npm run package
```
Outputs will be in `desktop/release/` for your target platform.

### Android
Use Android Studio's Build > Generate Signed Bundle/APK or:
```bash
./gradlew bundleRelease  # For Play Store (AAB)
./gradlew assembleRelease # For direct APK distribution
```

## 🤝 Contributing

This is a monorepo, so when contributing:
- Desktop changes go in `desktop/`
- Android changes go in `android/`
- Shared documentation or configuration goes in the root

## 📄 License

[Add your license here]

## 🔗 Links

- Desktop app documentation: [`desktop/README.md`](desktop/README.md)
- Firebase setup guide: See desktop README

