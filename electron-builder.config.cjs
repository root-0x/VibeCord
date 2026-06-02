const { execSync } = require("child_process");
const { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync, cpSync, renameSync, rmSync } = require("fs");
const { createHash } = require("crypto");
const { join } = require("path");

// ─── Configuration de Build VibeCord ─────────────────────────────────────────

function killVibeCord() {
    const releaseDir = join(__dirname, "release", "vibecord-dist");
    const releaseExe = join(releaseDir, "Discord.exe");

    try {
        execSync(
            `powershell -NoProfile -Command "Get-Process Discord -ErrorAction SilentlyContinue | Where-Object { $_.Path -eq '${releaseExe.replace(/'/g, "''")}'} | Stop-Process -Force"`,
            { stdio: "ignore", shell: true }
        );
    } catch (_) { }

    const resDir = join(releaseDir, "resources");
    for (const name of ["app.asar", "_app.asar"]) {
        const p = join(resDir, name);
        if (!existsSync(p)) continue;
        try { rmSync(p, { recursive: true, force: true }); } catch (_) { }
    }
}

function findDiscordApp() {
    const base = join(process.env.LOCALAPPDATA, "Discord");
    let best = null, bestVer = [0, 0, 0];
    try {
        for (const e of readdirSync(base)) {
            const m = e.match(/^app-(\d+)\.(\d+)\.(\d+)$/);
            if (!m) continue;
            const v = [+m[1], +m[2], +m[3]];
            if (v[0] > bestVer[0] || v[1] > bestVer[1] || v[2] > bestVer[2]) { bestVer = v; best = join(base, e); }
        }
    } catch { }
    if (!best) throw new Error("Discord introuvable. Assurez-vous que Discord est installé.");
    return best;
}

function buildEquicord() {
    console.log("[build] Compilation de VibeCord...");
    execSync("node --require=./scripts/suppressExperimentalWarnings.js scripts/build/build.mjs --standalone", { stdio: "inherit" });
}

function buildVibeCordFromDiscord(discordApp) {
    const discordRes = join(discordApp, "resources");
    const outDir = join(__dirname, "release", "vibecord-dist");

    if (existsSync(outDir)) {
        try { rmSync(outDir, { recursive: true, force: true }); } catch (e) { }
    }

    console.log("[vibecord] Copie des binaires Discord...");
    mkdirSync(outDir, { recursive: true });

    for (const f of readdirSync(discordApp)) {
        if (f === "resources" || f === "modules") continue;
        const src = join(discordApp, f);
        const dst = join(outDir, f);
        try { cpSync(src, dst, { recursive: true }); } catch (e) { }
    }

    const outModules = join(outDir, "modules");
    mkdirSync(outModules, { recursive: true });

    const discordModules = join(discordApp, "modules");
    if (existsSync(discordModules)) {
        for (const mod of readdirSync(discordModules)) {
            const src = join(discordModules, mod);
            if (!statSync(src).isDirectory()) continue;
            const dst = join(outModules, mod);
            try { cpSync(src, dst, { recursive: true }); } catch (e) { }
        }
    }

    const outRes = join(outDir, "resources");
    mkdirSync(outRes, { recursive: true });

    const buildInfoSrc = join(discordRes, "build_info.json");
    if (existsSync(buildInfoSrc)) {
        const buildInfo = JSON.parse(readFileSync(buildInfoSrc, "utf8"));
        buildInfo.newUpdater = false;
        buildInfo.localModulesRoot = "modules";
        writeFileSync(join(outRes, "build_info.json"), JSON.stringify(buildInfo, null, 2));
    }

    const bootstrapSrc = join(discordRes, "bootstrap");
    const bootstrapDst = join(outRes, "bootstrap");
    if (existsSync(bootstrapSrc)) {
        mkdirSync(bootstrapDst, { recursive: true });
        cpSync(bootstrapSrc, bootstrapDst, { recursive: true });
    }

    console.log("[vibecord] Préparation de _app.asar...");
    let appAsarSrc = join(discordRes, "_app.asar");
    if (!existsSync(appAsarSrc)) appAsarSrc = join(discordRes, "app.asar");
    
    if (existsSync(appAsarSrc)) {
        cpSync(appAsarSrc, join(outRes, "_app.asar"), { recursive: statSync(appAsarSrc).isDirectory() });
    }

    const outAppAsar = join(outRes, "app.asar");
    mkdirSync(outAppAsar, { recursive: true });
    writeFileSync(join(outAppAsar, "package.json"), JSON.stringify({ name: "discord", main: "index.js" }, null, 2));
    writeFileSync(join(outAppAsar, "index.js"), `
"use strict";
const path = require("path");
const fs = require("fs");
const { app } = require("electron");

app.setPath("userData", path.join(app.getPath("appData"), "VibeCord"));
app.setAppUserModelId("com.squirrel.Discord.Discord");

const bundledModulesPath = path.join(path.dirname(process.execPath), "modules");
require(path.join(__dirname, "..", "app", "dist", "desktop", "patcher.js"));
`);

    const outApp = join(outRes, "app");
    mkdirSync(outApp, { recursive: true });
    writeFileSync(join(outApp, "package.json"), JSON.stringify({ name: "vibecord", main: "index.js", version: "1.18.0" }, null, 2));
    writeFileSync(join(outApp, "index.js"), `
"use strict";
const path = require("path");
const { app } = require("electron");

app.setPath("userData", path.join(app.getPath("appData"), "VibeCord"));
app.setAppUserModelId("com.squirrel.Discord.Discord");

require(path.join(__dirname, "dist", "desktop", "patcher.js"));
`);

    const outDist = join(outApp, "dist", "desktop");
    mkdirSync(outDist, { recursive: true });
    const equicordDist = join(__dirname, "dist", "desktop");

    for (const f of ["patcher.js", "renderer.js", "renderer.css", "renderer.js.LEGAL.txt"]) {
        if (existsSync(join(equicordDist, f))) cpSync(join(equicordDist, f), join(outDist, f));
    }

    const vibecordPreload = join(__dirname, "vibecord-preload.js");
    if (existsSync(vibecordPreload)) {
        cpSync(vibecordPreload, join(outDist, "preload.js"));
    }

    // FFmpeg et YT-DLP (cherche dans le dossier local ou PATH)
    const binDir = join(__dirname, "static", "bin");
    for (const bin of ["ffmpeg.exe", "yt-dlp.exe"]) {
        const localBin = join(binDir, bin);
        if (existsSync(localBin)) cpSync(localBin, join(outDir, bin));
    }

    const discordExe = join(outDir, "Discord.exe");
    const injectScript = join(__dirname, "inject-discord.ps1");
    if (existsSync(injectScript)) cpSync(injectScript, join(outDir, "inject-discord.ps1"));

    const iconSrc = join(__dirname, "vibecord.ico");
    if (existsSync(iconSrc)) {
        cpSync(iconSrc, join(outDir, "app.ico"));
        // Rcedit pour le branding
        try {
            const rcedit = join(__dirname, "node_modules", ".bin", "rcedit.cmd");
            if (existsSync(rcedit)) {
                execSync(`"${rcedit}" "${discordExe}" --set-icon "${iconSrc}" --set-version-string "ProductName" "VibeCord" --set-version-string "FileDescription" "VibeCord"`, { stdio: "ignore" });
            }
        } catch (e) { }
    }

    console.log(`[vibecord] Build terminé -> ${outDir}`);
}

function obfuscateDesktop() {
    // Obfuscation légère pour la protection intellectuelle de base sans casser les perfs
    const obfArgs = ["--compact", "true", "--simplify", "true", "--string-array", "true"];
    const files = ["patcher.js", "preload.js", "renderer.js"];
    for (const f of files) {
        const fp = join(__dirname, "dist", "desktop", f);
        if (!existsSync(fp)) continue;
        try { execSync(`npx javascript-obfuscator "${fp}" --output "${fp}" ${obfArgs.join(" ")}`, { stdio: "ignore" }); } catch (e) { }
    }
}

// ─── Execution du build ───────────────────────────────────────────────────────

killVibeCord();
const discord = findDiscordApp();
buildEquicord();
// obfuscateDesktop(); // Optionnel pour l'open source
buildVibeCordFromDiscord(discord);

module.exports = {
    appId: "com.vibecord.app",
    productName: "VibeCord",
    copyright: "Copyright 2026 VibeCord",
    extraMetadata: { main: "index.js" },
    asar: false,
    files: ["index.js", "dist/desktop/**/*", "!**/*.map", "!**/*.ts"],
    directories: { output: "release", buildResources: "desktop/assets" },
    win: {
        target: [{ target: "dir", arch: ["x64"] }],
        icon: "vibecord.ico",
        requestedExecutionLevel: "asInvoker"
    }
};
