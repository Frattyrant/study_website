const http = require("node:http");
const net = require("node:net");

const FIRST_PORT = 3000;
const LAST_PORT = 3010;
const SITE_MARKER = 'data-site-id="study-website"';

function probePort(port) {
  return new Promise((resolve) => {
    const request = http.get(
      {
        hostname: "localhost",
        port,
        path: "/",
        timeout: 500,
      },
      (response) => {
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          if (body.length < 250_000) body += chunk;
        });
        response.on("end", () => {
          resolve(body.includes(SITE_MARKER) ? port : null);
        });
      },
    );

    request.on("timeout", () => {
      request.destroy();
      resolve(null);
    });
    request.on("error", () => resolve(null));
  });
}

async function findExistingServer() {
  const ports = Array.from(
    { length: LAST_PORT - FIRST_PORT + 1 },
    (_, index) => FIRST_PORT + index,
  );
  const matches = await Promise.all(ports.map(probePort));
  return matches.find((port) => port !== null) ?? null;
}

function portIsFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "::");
  });
}

async function findAvailablePort() {
  for (let port = FIRST_PORT; port <= LAST_PORT; port += 1) {
    if (await portIsFree(port)) return port;
  }
  return null;
}

async function main() {
  const existingPort = await findExistingServer();
  if (existingPort !== null) {
    console.log(`Study website is already running at http://localhost:${existingPort}`);
    return;
  }

  const availablePort = await findAvailablePort();
  if (availablePort === null) {
    throw new Error(`No available development port between ${FIRST_PORT} and ${LAST_PORT}.`);
  }
  if (availablePort !== FIRST_PORT) {
    console.warn(`Port ${FIRST_PORT} is in use, starting study website on ${availablePort}.`);
  }

  const nextBin = require.resolve("next/dist/bin/next");
  process.argv = [process.execPath, nextBin, "dev", "-p", String(availablePort)];
  require(nextBin);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
