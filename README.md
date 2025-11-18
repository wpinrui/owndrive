# OwnDrive Desktop Guide

OwnDrive is a self-hosted alternative to OneDrive: you keep full control of your files by connecting the Electron desktop client to **your** Firebase project (Firestore + Storage). This guide walks you through the entire process—from Firebase setup to packaging the desktop app for Windows, macOS, or Linux.

---

## What you get

- Desktop app built with Electron + Vite + React.
- Drag-and-drop uploads to Firebase Storage with automatic deduping/versioning.
- Real-time file list via Firestore (star files, multi-select, keyboard shortcuts).
- Cross-platform packaging using `electron-builder`.

---

## Prerequisites

- Node.js 20+ and npm 10+ (check with `node -v`, `npm -v`).
- Git (to clone and keep the repo updated).
- Firebase account with permissions to create a project.
- (Optional) macOS for building signed macOS artifacts.

---

## 1. Firebase project setup

1. **Create a project**
   - Go to [console.firebase.google.com](https://console.firebase.google.com/), click *Add project*.
   - Give it a name such as `owndrive` and disable Google Analytics (optional).

2. **Add a web app**
   - In *Project settings → General*, click *Add app → Web*.
   - Copy the **Web API Key** and **Project ID**—you’ll need them for `.env`.

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

## 2. Configure environment variables

OwnDrive reads Firebase credentials from `.env`. You can create it manually from `.env.example` or use the helper scripts.

### Option A – Guided scripts

> Run from the repository root (`C:\path\to\owndrive` or `~/Documents/owndrive`).

- **macOS/Linux/Git Bash**

  ```bash
  chmod +x scripts/setup-env.sh
  ./scripts/setup-env.sh
  ```

- **Windows Command Prompt / PowerShell**

  ```bat
  scripts\setup-env.bat
  ```

The script prompts for:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
```

### Option B – Manual edit

Copy `.env.example` to `.env` and fill in the values yourself.

> Whenever you change `.env`, restart `npm run dev` so Electron reloads the config.

---

## 3. Install dependencies

```bash
npm install
```

This installs the Vite frontend, Electron runtime, and builder tooling.

---

## 4. Develop & test

| Command | Purpose |
| --- | --- |
| `npm run dev` | Starts Vite + Electron together. The desktop app opens automatically with hot reload (renderer) and hot restart (main/preload). |
| `npm run dev:web` | Runs the React app in the browser only—useful for quick UI tweaks. |
| `npm run build` | Type-checks and builds the renderer (no Electron). |
| `npm run lint` | ESLint/TypeScript validation (fix existing warnings before shipping). |

> During development the app connects to your live Firebase project, so files you upload are stored immediately.

---

## 5. Package & install the desktop app

1. **Build everything**

   ```bash
   npm run package
   ```

2. **Find artifacts**
   - Output lives in `release/`.
   - Windows: `.exe` installer + `.zip`
   - macOS: `.dmg` + `.zip`
   - Linux: `.AppImage` + `.tar.gz`

3. **Platform-specific builds**
   - Only build for your OS: `npm run package -- --mac`, `--win`, or `--linux`.
   - Codesigning/notarization is up to you (Electron Builder supports it if you provide certificates).

4. **Install**
   - Run the generated installer on your machine.
   - On first run, sign into Firebase (if your rules require auth) and verify uploads.

---

## 6. Branding & icons

- The source PNG lives at `resources/owndrive-icon.png`.
- Regenerate all platform formats with `npm run icons` (the `package` script calls this automatically).
- Generated assets are gitignored—run `npm run icons` at least once before `npm run dev` if you want the custom icon locally.
- Generated assets land in `resources/icons/` and are bundled automatically via Electron Builder’s `extraResources` config.
- Feel free to swap in your own artwork—just replace `owndrive-icon.png` and rerun `npm run icons`.
- Database icon created by [Freepik](https://www.freepik.com/) via [Flaticon](https://www.flaticon.com/free-icon/database_138932).

---

## 7. Using OwnDrive

- **Upload files**: Click *Upload* (or drag files onto the window) and they’ll sync to Firebase Storage. Existing names are versioned using timestamps so you never overwrite accidental older copies.
- **Star important files**: Use the star icon per row or enable “Starred first” toggle for sorting.
- **Keyboard/selection**: Shift-click or Ctrl/Cmd-click to select multiple files, then delete or download in batches.
- **Real-time updates**: Firestore subscriptions keep the list in sync across multiple desktops if you’re sharing the Firebase project.
- **Deletion safeguards**: Starred files are protected from deletion in `useFileActions`—remove the star before deleting if needed.

---

## 8. Updating Firebase or environment

- Add new keys to `.env.example` + `.env` (and re-run the setup script) when you expand the app.
- If you rotate your Firebase API key, regenerate it in the console and re-run the env script.
- Keep `.env` out of version control (`.gitignore` already handles this).

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Electron window shows “Missing Firebase configuration” | Check `.env`; ensure `npm run dev` was restarted after editing. |
| Uploads fail with permission errors | Review Firebase Storage/Firestore rules; ensure your auth state matches the rule requirements. |
| `The process "####" not found` when starting dev server | Stop all running Electron instances, delete `dist-electron`, and rerun `npm run dev`. |
| Packaging fails on macOS/Linux | Ensure you’re running on the target OS or pass the appropriate `--mac/--win/--linux` flag. Some targets require platform-specific host machines. |

---

## Next steps & customization

- Wire Firebase Authentication and update rules to require signed-in users.
- Add more preload APIs (clipboard, context menu, auto-launch) inside `electron/preload.ts` and `electron/main.ts`.
- Expand CI to run `npm run lint`, `npm run build`, and `npm run package`.

Enjoy running OwnDrive entirely on your own stack! Let me know if you’d like scripted Firebase provisioning or deployment automation next.
