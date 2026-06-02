<div align="center">
  <img src="https://raw.githubusercontent.com/root-0x/VibeCord/main/static/icon.png" width="96" height="96" alt="VibeCord Logo">

# VibeCord

**A custom Discord client built for people who actually care about how Discord runs.**

[![Discord](https://img.shields.io/badge/Discord-Join%20us-dc2626?logo=discord&logoColor=white)](https://discord.gg/vibecordfr)
[![License](https://img.shields.io/badge/license-GPL%20v3-dc2626)](./LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows-dc2626.svg?logo=windows&logoColor=white)](https://github.com/root-0x/VibeCord)
[![GitHub](https://img.shields.io/badge/GitHub-root--0x%2FVibeCord-dc2626?logo=github&logoColor=white)](https://github.com/root-0x/VibeCord)

---

</div>

VibeCord is a fork of Equicord, which itself builds on top of Vencord. We stripped out the obfuscation, cleaned things up, added our own improvements, and kept what works. No bloat, no nonsense.

---

## What's in it

* **Faster startup** — no obfuscation means the client loads noticeably quicker and sits lighter on your CPU and RAM.
* **Auto-updates** — checks for updates in the background on launch and applies them silently.
* **Plugin support** — compatible with the existing plugin ecosystem. Install community plugins straight from Git links.
* **Better audio** — hardware-optimized voice modules for cleaner, louder audio out of the box.
* **Custom styling** — smoother UI, custom icons, and various quality-of-life improvements.

---

## Installation (Windows)

1. Download the latest **`VibeCord-Installer.exe`** from [Releases](https://github.com/root-0x/VibeCord/releases/latest)
2. Run it and follow the steps
3. Restart Discord, done.

---

## Building from source

### Requirements

* Git
* Node.js 18+
* pnpm

```bash
npm install -g pnpm
```

### Clone & Build

```bash
git clone https://github.com/root-0x/VibeCord.git
cd VibeCord
pnpm install
pnpm buildDesktop
pnpm buildStandalone
```

### Inject into Discord

```bash
pnpm inject
```

### Restore stock Discord

```bash
pnpm uninject
```

---

## Releasing an update

1. Build the dist files:
```bash
pnpm buildDesktop
pnpm buildStandalone
```

2. Zip the contents of `dist/desktop/` into `vibecord-dist.zip`

3. Create a new GitHub release:
   - Go to [Releases](https://github.com/root-0x/VibeCord/releases/new)
   - Tag: `vX.X.X`
   - Upload `vibecord-dist.zip` as an asset
   - Publish

The installer and auto-updater will automatically pick up the new release.

---

## Repository

Source code: https://github.com/root-0x/VibeCord

---

## Credits

VibeCord wouldn't exist without [Equicord](https://github.com/Equicord/Equicord) and [Vencord](https://github.com/Vendicated/Vencord). A huge chunk of what makes this work comes directly from their projects. We're fully aware of that and genuinely appreciate everything they've built — we're just taking it in a different direction.

---

## Disclaimer

*VibeCord is not affiliated with Discord Inc. in any way.*

Using third-party clients is technically against Discord's Terms of Service. Use at your own risk.
