#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env"
EXAMPLE_FILE="${ROOT_DIR}/.env.example"

echo "OwnDrive environment setup"
echo "This script will create or update ${ENV_FILE}"
echo

if [[ -f "${ENV_FILE}" ]]; then
  read -r -p ".env already exists. Overwrite? [y/N] " OVERWRITE
  if [[ ! "${OVERWRITE,,}" =~ ^(y|yes)$ ]]; then
    echo "Aborting without changes."
    exit 0
  fi
fi

read -r -p "Firebase Web API Key: " FIREBASE_API_KEY
read -r -p "Firebase Project ID: " FIREBASE_PROJECT_ID
read -r -p "Firebase Storage Bucket (e.g. ${FIREBASE_PROJECT_ID}.appspot.com): " FIREBASE_STORAGE_BUCKET

cat > "${ENV_FILE}" <<EOF
VITE_FIREBASE_API_KEY=${FIREBASE_API_KEY}
VITE_FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
VITE_FIREBASE_STORAGE_BUCKET=${FIREBASE_STORAGE_BUCKET}
EOF

echo "Wrote ${ENV_FILE}"

if [[ -f "${EXAMPLE_FILE}" ]]; then
  echo ".env.example already present."
else
  cat > "${EXAMPLE_FILE}" <<'EOF'
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
EOF
  echo "Created ${EXAMPLE_FILE}"
fi

echo "Done! Restart Vite/Electron if they are running."

