import { spawn } from "node:child_process";
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
} from "node:fs";
import { EOL, tmpdir } from "node:os";
import path from "node:path";

export const isWindows = process.platform === "win32";

export function commandName(base) {
  return isWindows ? `${base}.cmd` : base;
}

export function ensureLogsDir() {
  const dir = path.resolve("logs");
  try {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    // Test write access
    const testFile = path.join(dir, ".write-test");
    writeFileSync(testFile, "");
    unlinkSync(testFile);
    return dir;
  } catch {
    // Fallback to /tmp when project dir is not writable (macOS sandbox)
    const fallback = "/tmp/porta-logs";
    try {
      if (!existsSync(fallback)) {
        mkdirSync(fallback, { recursive: true });
      }
      console.warn(`⚠️  logs/ not writable, using ${fallback}`);
      return fallback;
    } catch {
      // Total fallback — return null, callers should handle
      console.warn("⚠️  Cannot create log directory. Output goes to console.");
      return null;
    }
  }
}

function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

export function loadEnvFile(filePath = ".env") {
  const absPath = path.resolve(filePath);
  if (!existsSync(absPath)) return;

  const contents = readFileSync(absPath, "utf-8");
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separator = line.indexOf("=");
    if (separator < 1) continue;

    const key = line.slice(0, separator).trim();
    let value = unquote(line.slice(separator + 1).trim());
    // Strip inline comments (# not inside quotes)
    const hashIdx = value.indexOf("#");
    if (hashIdx > 0) {
      value = value.slice(0, hashIdx).trim();
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

export function spawnLoggedProcess(
  label,
  command,
  args,
  logFile,
  extraEnv = {},
) {
  const shellCmd = [command, ...args].join(" ");

  // If no log file (sandbox), pipe directly to console
  if (!logFile) {
    const child = spawn(shellCmd, [], {
      env: { ...process.env, ...extraEnv },
      stdio: "inherit",
      windowsHide: true,
      shell: true,
    });
    child.on("error", (err) => {
      console.error(`[${label}] failed to start: ${err.message}`);
    });
    return { child, logStream: { end: (cb) => cb?.() } };
  }

  const child = spawn(shellCmd, [], {
    env: { ...process.env, ...extraEnv },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
    shell: true,
  });
  const logStream = createWriteStream(logFile, { flags: "a" });

  if (child.stdout) {
    child.stdout.pipe(logStream);
  }
  if (child.stderr) {
    child.stderr.pipe(logStream);
  }

  child.on("error", (err) => {
    logStream.write(`[${label}] failed to start: ${err.message}${EOL}`);
  });

  return { child, logStream };
}

export async function terminateChild(child) {
  if (!child.pid || child.exitCode !== null) return;

  if (isWindows) {
    await new Promise((resolve) => {
      const killer = spawn(`taskkill /pid ${child.pid} /t /f`, [], {
        stdio: "ignore",
        windowsHide: true,
        shell: true,
      });
      killer.on("error", resolve);
      killer.on("exit", resolve);
    });
    return;
  }

  child.kill("SIGTERM");
}

export function waitForExit(child) {
  return new Promise((resolve) => {
    child.once("exit", (code, signal) => resolve({ code, signal }));
  });
}
