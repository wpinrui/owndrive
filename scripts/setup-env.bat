@echo off
setlocal ENABLEDELAYEDEXPANSION

set ROOT_DIR=%~dp0..
set ENV_FILE=%ROOT_DIR%\.env
set EXAMPLE_FILE=%ROOT_DIR%\.env.example

echo OwnDrive environment setup
echo This script will create or update %ENV_FILE%
echo.

if exist "%ENV_FILE%" (
  set /p OVERWRITE=".env already exists. Overwrite? [y/N] "
  if /I not "!OVERWRITE!"=="Y" if /I not "!OVERWRITE!"=="Yes" (
    echo Aborting without changes.
    goto :EOF
  )
)

set /p FIREBASE_API_KEY="Firebase Web API Key: "
set /p FIREBASE_PROJECT_ID="Firebase Project ID: "
set /p FIREBASE_STORAGE_BUCKET="Firebase Storage Bucket (e.g. %FIREBASE_PROJECT_ID%.appspot.com): "

(
  echo VITE_FIREBASE_API_KEY=!FIREBASE_API_KEY!
  echo VITE_FIREBASE_PROJECT_ID=!FIREBASE_PROJECT_ID!
  echo VITE_FIREBASE_STORAGE_BUCKET=!FIREBASE_STORAGE_BUCKET!
) > "%ENV_FILE%"

echo Wrote %ENV_FILE%

if exist "%EXAMPLE_FILE%" (
  echo .env.example already present.
) else (
  (
    echo VITE_FIREBASE_API_KEY=your-api-key
    echo VITE_FIREBASE_PROJECT_ID=your-project-id
    echo VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
  ) > "%EXAMPLE_FILE%"
  echo Created %EXAMPLE_FILE%
)

echo Done! Restart Vite/Electron if they are running.

endlocal

