import type { WebSocket } from "ws";

export function send(ws: WebSocket, message: any): void {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message));
  }
}
