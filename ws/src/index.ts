import { WebSocketServer } from "ws";
import chalk from "chalk";
import { log } from "./utils/log.ts";
import { handleSocket } from "./handlers/socket.ts";
import type { Client } from "./types/types.ts";

const PORT = Number(process.env.PORT) || 8080;
const MAX_PAYLOAD = 16 * 1024;
const HEARTBEAT_MS = 30_000;

const wss = new WebSocketServer({ port: PORT, maxPayload: MAX_PAYLOAD });

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

log.server(`listening on ${chalk.bold(`ws://localhost:${PORT}`)}`);
