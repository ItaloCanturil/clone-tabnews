const { spawn } = require('node:child_process');

spawn("next dev", {stdio: "inherit", shell: true});

function stopContainers() {
  console.log("\n 🔴 Desligando containers");

  spawn("npm run services:stop", {
    detached: true,
    shell: true,
    windowsHide: true,
    stdio: "ignore"
  })
}

process.on("SIGINT", stopContainers);
process.on("SIGTERM", stopContainers);