"use strict";
const { spawn } = require("child_process");
const path = require("path");

const appDir = path.join(__dirname, "..");
const nextBin = path.join(appDir, "node_modules", "next", "dist", "bin", "next");

// Turbopack dev server exits when stdin is not a TTY (e.g. when stdio was ["pipe", ...]).
// Use stdio: "inherit" so the child gets the same TTY as this process and stays running.
// Extra Node memory in case exit is OOM-related (Next.js Turbopack discussion #73025).
const env = { ...process.env };
const extra = " --max-old-space-size=4096";
env.NODE_OPTIONS = (process.env.NODE_OPTIONS || "").trim() + extra;

const child = spawn(process.execPath, [nextBin, "dev"], {
  stdio: "inherit",
  cwd: appDir,
  env,
});

child.on("exit", (code, signal) => {
  process.exit(code != null ? code : signal ? 1 : 0);
});
