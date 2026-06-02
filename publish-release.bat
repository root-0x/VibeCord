@echo off
:: ─── VibeCord — Publier une nouvelle release sur GitHub ───────────────────────
:: Usage : publish-release.bat 1.0.1 "Description des changements"
:: Necessite : pnpm, node, curl (inclus dans Windows 10+)
::
:: Auth : token GitHub dans %USERPROFILE%\.github_token  (une seule ligne)
::        Creer le fichier : echo votre_token > %USERPROFILE%\.github_token
::        Generer un token : https://github.com/settings/tokens (scope: repo)

setlocal EnableDelayedExpansion

set "VERSION=%~1"
set "NOTES=%~2"

if "%VERSION%"=="" (
    echo [ERREUR] Usage: publish-release.bat VERSION "Notes de version"
    echo Exemple : publish-release.bat 1.0.1 "Correction bug audio"
    pause
    exit /b 1
)

if "%NOTES%"=="" set NOTES=VibeCord %VERSION%

:: ── Config GitHub ──────────────────────────────────────────────────────────────
set GITHUB_REPO=root-0x/VibeCord
set GITHUB_API=https://api.github.com

:: ── Lecture du token ──────────────────────────────────────────────────────────
set TOKEN_FILE=%USERPROFILE%\.github_token
if not exist "%TOKEN_FILE%" (
    echo [ERREUR] Fichier token introuvable : %TOKEN_FILE%
    echo Creez-le avec : echo votre_token_github ^> "%%USERPROFILE%%\.github_token"
    echo Generez un token sur : https://github.com/settings/tokens
    pause
    exit /b 1
)

set /p GITHUB_TOKEN=<"%TOKEN_FILE%"
set "GITHUB_TOKEN=%GITHUB_TOKEN: =%"

if "%GITHUB_TOKEN%"=="" (
    echo [ERREUR] Le fichier %TOKEN_FILE% est vide.
    pause
    exit /b 1
)

:: ── Chemins ───────────────────────────────────────────────────────────────────
set DIST_DIR=dist\desktop
set OUT_DIR=release\installer
set DIST_ZIP=%OUT_DIR%\vibecord-dist.zip
set INSTALLER_EXE=%OUT_DIR%\VibeCord-Installer.exe

echo.
echo  ╔═══════════════════════════════════════════════════╗
echo  ║    VIBECORD — Publication release v%VERSION%
echo  ╚═══════════════════════════════════════════════════╝
echo.

:: ── 1. Mise à jour version dans package.json ──────────────────────────────────
echo  [1/7] Mise a jour de la version vers %VERSION%...
node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json','utf8'));p.version='%VERSION%';fs.writeFileSync('package.json',JSON.stringify(p,null,4)+'\n','utf8');"
echo  [1/7] Version mise a jour.

:: ── 2. Commit + Push sur GitHub ───────────────────────────────────────────────
echo.
echo  [2/7] Commit et push sur GitHub...
git add .
git diff --quiet --cached
if errorlevel 1 (
    git commit -m "release: v%VERSION% - %NOTES%"
) else (
    echo  Aucun changement a committer.
)
git push origin main
if errorlevel 1 (
    echo [ERREUR] Impossible de push sur GitHub.
    pause
    exit /b 1
)
echo  [2/7] Code source synchronise avec GitHub.

:: ── 3. Build JS ───────────────────────────────────────────────────────────────
echo.
echo  [3/7] Build en cours...
taskkill /F /IM Discord.exe /T >nul 2>&1
call pnpm buildDesktop
if errorlevel 1 ( echo [ERREUR] pnpm buildDesktop echoue. & pause & exit /b 1 )
call pnpm buildStandalone
if errorlevel 1 ( echo [ERREUR] pnpm buildStandalone echoue. & pause & exit /b 1 )
echo  [3/7] Build termine.

:: ── 4. Build installeur ───────────────────────────────────────────────────────
echo.
echo  [4/7] Build de VibeCord-Installer.exe...
if not exist "%OUT_DIR%" mkdir "%OUT_DIR%"
call build-installer.bat
if not exist "%INSTALLER_EXE%" (
    echo [ERREUR] VibeCord-Installer.exe introuvable.
    pause
    exit /b 1
)
echo  [4/7] Installeur cree.

:: ── 5. Creer vibecord-dist.zip ────────────────────────────────────────────────
echo.
echo  [5/7] Creation de vibecord-dist.zip...
if not exist "%DIST_DIR%\patcher.js" (
    echo [ERREUR] dist\desktop\patcher.js introuvable.
    pause
    exit /b 1
)
if exist "%DIST_ZIP%" del /F /Q "%DIST_ZIP%"
del /s /q "%DIST_DIR%\*.map" >nul 2>&1
del /s /q "%DIST_DIR%\*.LEGAL.txt" >nul 2>&1
powershell -NoProfile -Command "Compress-Archive -Path '%DIST_DIR%\*' -DestinationPath '%DIST_ZIP%' -Force"
if not exist "%DIST_ZIP%" (
    echo [ERREUR] Impossible de creer vibecord-dist.zip
    pause
    exit /b 1
)
for %%F in ("%DIST_ZIP%") do echo  [5/7] vibecord-dist.zip cree (%%~zF octets)

:: ── 6. Creer la release GitHub ────────────────────────────────────────────────
echo.
echo  [6/7] Creation de la release v%VERSION% sur GitHub...

curl -s -X POST "%GITHUB_API%/repos/%GITHUB_REPO%/releases" ^
    -H "Authorization: token %GITHUB_TOKEN%" ^
    -H "Content-Type: application/json" ^
    -d "{\"tag_name\":\"v%VERSION%\",\"name\":\"VibeCord v%VERSION%\",\"body\":\"%NOTES%\",\"draft\":false,\"prerelease\":false}" ^
    -o "%OUT_DIR%\release_response.json"

for /f "usebackq tokens=*" %%i in (`powershell -NoProfile -Command "(Get-Content '%OUT_DIR%\release_response.json' | ConvertFrom-Json).id"`) do set RELEASE_ID=%%i

if "%RELEASE_ID%"=="" (
    echo [ERREUR] Impossible de recuperer l'ID de la release.
    type "%OUT_DIR%\release_response.json"
    pause
    exit /b 1
)
echo  Release creee (ID: %RELEASE_ID%)

:: ── 7. Upload des assets ──────────────────────────────────────────────────────
echo.
echo  [7/7] Upload des fichiers...

echo  Upload VibeCord-Installer.exe...
curl -s -X POST "https://uploads.github.com/repos/%GITHUB_REPO%/releases/%RELEASE_ID%/assets?name=VibeCord-Installer.exe" ^
    -H "Authorization: token %GITHUB_TOKEN%" ^
    -H "Content-Type: application/octet-stream" ^
    --data-binary "@%INSTALLER_EXE%" >nul

echo  Upload vibecord-dist.zip...
curl -s -X POST "https://uploads.github.com/repos/%GITHUB_REPO%/releases/%RELEASE_ID%/assets?name=vibecord-dist.zip" ^
    -H "Authorization: token %GITHUB_TOKEN%" ^
    -H "Content-Type: application/zip" ^
    --data-binary "@%DIST_ZIP%" >nul

del /F /Q "%OUT_DIR%\release_response.json" >nul 2>&1

echo.
echo  ╔══════════════════════════════════════════════════════════════════╗
echo  ║  VibeCord v%VERSION% publie avec succes sur GitHub !
echo  ║
echo  ║  URL : https://github.com/%GITHUB_REPO%/releases/tag/v%VERSION%
echo  ║
echo  ║  Fichiers publies :
echo  ║    VibeCord-Installer.exe   — installeur GUI
echo  ║    vibecord-dist.zip        — fichiers JS pour l'injection
echo  ╚══════════════════════════════════════════════════════════════════╝
echo.
pause
