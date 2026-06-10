/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { safeStorage } from "electron";
import { request } from "https";

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9175 Chrome/128.0.6613.186 Electron/32.2.7 Safari/537.36";
const X_SUPER_PROPERTIES = "eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiRGlzY29yZCBDbGllbnQiLCJyZWxlYXNlX2NoYW5uZWwiOiJzdGFibGUiLCJjbGllbnRfdmVyc2lvbiI6IjEuMC45MTc1IiwiaGFzX2NsaWVudF9tb2RzIjpmYWxzZX0=";

// Verification token
export async function checkToken(_: any, token: string): Promise<{ valid: boolean; user?: any; error?: string; }> {
    return new Promise(resolve => {
        const req = request({
            hostname: "discord.com",
            path: "/api/v9/users/@me",
            method: "GET",
            headers: {
                "Authorization": token,
                "User-Agent": USER_AGENT,
                "Content-Type": "application/json",
                "X-Super-Properties": X_SUPER_PROPERTIES,
                "X-Discord-Locale": "en-US",
                "X-Debug-Options": "bugReporterEnabled",
                "Accept": "*/*",
                "Accept-Language": "en-US,en;q=0.9",
                "Connection": "keep-alive",
            }
        }, res => {
            let data = "";
            res.on("data", (chunk: Buffer) => { data += chunk.toString(); });
            res.on("end", () => {
                console.log(`[TokenImporter] Status ${res.statusCode} for token ${token.slice(0, 15)}...`);
                if (res.statusCode === 200) {
                    try { resolve({ valid: true, user: JSON.parse(data) }); }
                    catch { resolve({ valid: false, error: "parse_error" }); }
                } else if (res.statusCode === 401 || res.statusCode === 403) {
                    // Token vraiment invalid/révoqué
                    resolve({ valid: false, error: "unauthorized" });
                } else if (res.statusCode === 429) {
                    // Rate limited — pas invalid, juste throttlé
                    resolve({ valid: false, error: "rate_limited" });
                } else {
                    resolve({ valid: false, error: `http_${res.statusCode}` });
                }
            });
        });
        req.on("error", (e: any) => {
            console.error("[TokenImporter] req error:", e?.message);
            resolve({ valid: false, error: "network_error" });
        });
        req.setTimeout(15000, () => {
            req.destroy();
            console.warn("[TokenImporter] timeout for token", token.slice(0, 15));
            resolve({ valid: false, error: "timeout" });
        });
        req.end();
    });
}

// Encryption du token (appele depuis le renderer)
export async function encryptToken(_: any, token: string): Promise<string | null> {
    try {
        if (!safeStorage.isEncryptionAvailable()) return null;
        const encrypted = safeStorage.encryptString(token);
        return "dQw4w9WgXcQ:" + encrypted.toString("base64");
    } catch {
        return null;
    }
}


