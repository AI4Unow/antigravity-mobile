/**
 * Tailscale dev script
 * 
 * Sets PORTA_HOST to Tailscale IP, prints access info + QR code,
 * optionally starts tailscale serve for HTTPS, then launches dev.mjs.
 */

import { execSync } from "node:child_process";
import { loadEnvFile } from "./common.mjs";

loadEnvFile();

// ── Resolve Tailscale IP if PORTA_HOST not set ──

let host = process.env.PORTA_HOST;
if (!host || host === "127.0.0.1") {
  try {
    host = execSync("tailscale ip -4", { encoding: "utf-8" }).trim();
    process.env.PORTA_HOST = host;
    console.log(`🔗 Tailscale IP detected: ${host}`);
  } catch {
    console.warn("⚠️  Could not detect Tailscale IP. Using 127.0.0.1 (local only).");
    host = "127.0.0.1";
  }
}

const port = process.env.PORTA_PORT ?? "3170";

// ── Print access info + QR code ──

function printQR(url) {
  try {
    execSync(`command -v qrencode`, { stdio: "ignore" });
    execSync(`qrencode -t ANSIUTF8 "${url}"`, { stdio: "inherit" });
  } catch {
    // qrencode not available — skip silently
  }
}

const localUrl = `http://${host}:${port}`;
console.log(`\n📱 Access Porta from your phone:`);
console.log(`   ${localUrl}\n`);
printQR(localUrl);

// ── Optionally start tailscale serve for HTTPS ──

const tsHostname = process.env.PORTA_TAILSCALE_HOSTNAME?.trim();
if (tsHostname) {
  try {
    execSync(
      `tailscale serve --bg --https=443 http://localhost:${port}`,
      { stdio: "inherit" },
    );
    const httpsUrl = `https://${tsHostname}`;
    console.log(`🔒 HTTPS available at: ${httpsUrl}`);
    printQR(httpsUrl);
  } catch (err) {
    console.warn(`⚠️  tailscale serve failed: ${err.message}`);
    console.warn("   HTTPS not available. PWA install may not work.");
  }
}

// ── Cleanup tailscale serve on exit ──

if (tsHostname) {
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
      try {
        execSync("tailscale serve --https=443 off", { stdio: "ignore" });
      } catch {
        // ignore
      }
    });
  }
}

// ── Launch dev.mjs (inherits env with PORTA_HOST set) ──

await import("./dev.mjs");
