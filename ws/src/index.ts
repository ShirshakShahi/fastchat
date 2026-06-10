import http from "http";
import { WebSocketServer } from "ws";
import chalk from "chalk";
import { log } from "./utils/log.ts";
import { handleSocket } from "./handlers/socket.ts";
import type { Client } from "./types/types.ts";

const PORT = Number(process.env.PORT) || 8080;
const MAX_PAYLOAD = 16 * 1024;
const HEARTBEAT_MS = 30_000;

const server = http.createServer((req, res) => {
  if (req.url === "/healthcheck") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", clients: wss.clients.size }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server, maxPayload: MAX_PAYLOAD });

const heartbeat = setInterval(() => {
  wss.clients.forEach((client) => {
    const c = client as Client;
    if (c.isAlive === false) {
      c.terminate();
      return;
    }
    c.isAlive = false;
    c.ping();
  });
}, HEARTBEAT_MS);

wss.on("close", () => clearInterval(heartbeat));
wss.on("connection", handleSocket);

server.listen(PORT, () => {
  log.server(`listening on ${chalk.bold(`http://localhost:${PORT}`)}`);
});
