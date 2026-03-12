import path from "node:path";
import {
  commandName,
  ensureLogsDir,
  spawnLoggedProcess,
  terminateChild,
  waitForExit,
} from "./common.mjs";

const logsDir = ensureLogsDir();

// Pass --host to vite when binding to non-loopback (Tailscale)
const host = process.env.PORTA_HOST || "127.0.0.1";
const isRemote = host !== "127.0.0.1" && host !== "localhost";
const webArgs = isRemote
  ? ["--filter", "@porta/web", "dev", "--", "--host"]
  : ["--filter", "@porta/web", "dev"];

const runners = [
  spawnLoggedProcess(
    "proxy",
    commandName("pnpm"),
    ["--filter", "@porta/proxy", "dev"],
    logsDir ? path.join(logsDir, "proxy.log") : null,
  ),
  spawnLoggedProcess(
    "web",
    commandName("pnpm"),
    webArgs,
    logsDir ? path.join(logsDir, "web.log") : null,
  ),
];

console.log(logsDir
  ? `✓ Porta dev — tail ${logsDir}/proxy.log and ${logsDir}/web.log`
  : "✓ Porta dev — output streaming to console"
);

let shuttingDown = false;

async function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  await Promise.all(runners.map(({ child }) => terminateChild(child)));
  await Promise.all(runners.map(({ logStream }) => new Promise((resolve) => {
    logStream.end(resolve);
  })));
  process.exit(code);
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    void shutdown(0);
  });
}

const exits = runners.map(async ({ child }, index) => ({
  index,
  ...(await waitForExit(child)),
}));

const firstExit = await Promise.race(exits);
if (!shuttingDown) {
  const label = firstExit.index === 0 ? "proxy" : "web";
  const code = typeof firstExit.code === "number" ? firstExit.code : 1;
  console.error(`${label} exited early`);
  await shutdown(code);
}
