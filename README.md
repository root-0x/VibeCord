<div align="center">
  <img src="https://VibeCord.ru/image.png" width="96" height="96" alt="VibeCord Logo">

# VibeCord

**A custom Discord client built for people who actually care about how Discord runs.**

[![Discord](https://img.shields.io/badge/Discord-Join%20us-5865F2?logo=discord\&logoColor=white)](https://discord.gg/VibeCord)
[![License](https://img.shields.io/badge/license-GPL%20v3-a855f7)](./LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows-3b82f6.svg?logo=windows\&logoColor=white)](https://git.VibeCord.ru/VibeCord/VibeCord)
[![Website](https://img.shields.io/badge/website-VibeCord.ru-5865F2?logo=googlechrome\&logoColor=white)](https://VibeCord.ru)

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

1. Download **`VibeCord-install.ps1`**
2. Right-click → **Run with PowerShell**
3. Follow the steps, restart Discord, done.

---

## Building from source

### Requirements

* Git
* Node.js (LTS)
* pnpm

```bash
npm install -g pnpm
```

### Clone & Build

```bash
git clone https://git.VibeCord.ru/VibeCord/VibeCord.git
cd VibeCord
pnpm install
pnpm build
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

## Repository

Source code:

https://git.VibeCord.ru/VibeCord/VibeCord

---

## Credits

VibeCord wouldn't exist without [Equicord](https://github.com/Equicord/Equicord) and [Vencord](https://github.com/Vendicated/Vencord). A huge chunk of what makes this work comes directly from their projects. We're fully aware of that and genuinely appreciate everything they've built — we're just taking it in a different direction. Big thanks to everyone who's contributed to both.

---

## Disclaimer

*VibeCord is not affiliated with Discord Inc. in any way.*

Using third-party clients is technically against Discord's Terms of Service. Use at your own risk.
