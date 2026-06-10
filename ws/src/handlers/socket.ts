import type { IncomingMessage } from "http";
import url from "url";
import { log } from "../utils/log.js";
import { send } from "../utils/send.js";
import { publicUser } from "../utils/publicUser.js";
import { routeMessage } from "./router.js";
import RoomManager from "../managers/RoomManager.js";
import type { Client, User } from "../types/types.js";

export function handleSocket(ws: Client, req: IncomingMessage): void {
  log.conn("new connection");

  ws.isAlive = true;
  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("error", (error) => {
    log.error("socket error:", error);
  });

  const parsedUrl = url.parse(req.url!, true);

  const roomId = parsedUrl.query.roomId as string;
  const userId = parsedUrl.query.userId as string;
  const name =
    (parsedUrl.query.name as string)?.trim() ||
    `Guest-${Math.floor(Math.random() * 1000000)}`;

  if (!roomId || !userId) {
    send(ws, {
      type: "error",
      payload: { message: "roomId and userId are required" },
    });
    ws.close(4001, "Missing roomId or userId");
    return;
  }

  const roomManager = RoomManager.getInstance();
  const user: User = {
    ws,
    userId,
    name,
    joinedAt: new Date(),
    lastActivity: new Date(),
  };

  if (!roomManager.hasRoom(roomId)) {
    roomManager.createRoom(roomId, userId);
    const added = roomManager.addUser(roomId, user);

    if (!added) {
      send(ws, { type: "error", payload: { message: "Failed to join room" } });
      ws.close(4002, "Room error");
      return;
    }

    send(ws, {
      type: "joined",
      payload: {
        message: "Room created — you are the admin",
        selfId: userId,
        adminId: userId,
        isAdmin: true,
        users: roomManager
          .getRoomUsers(roomId)
          .map((u) => publicUser(roomManager, roomId, u)),
      },
    });
  } else {
    roomManager.addPending(roomId, user);

    send(ws, {
      type: "pending-approval",
      payload: {
        message: "Waiting for the room admin to let you in",
        selfId: userId,
      },
    });

    const room = roomManager.getRoom(roomId);
    const admin = room ? roomManager.getUser(room.ownerId) : undefined;

    if (admin) {
      send(admin.ws, {
        type: "send-room-join-request",
        payload: { userId, name },
      });
    }
  }

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString());
      routeMessage(message, roomId, userId, ws);
    } catch (error) {
      log.error("failed to parse message:", error);
      send(ws, { type: "error", payload: { message: "Invalid JSON" } });
    }
  });

  ws.on("close", () => {
    log.conn(`${userId} disconnected`);

    const wasPending = roomManager.getPending(roomId, userId);
    if (wasPending) {
      const room = roomManager.getRoom(roomId);
      const admin = room ? roomManager.getUser(room.ownerId) : undefined;
      roomManager.removePending(roomId, userId);

      if (admin) {
        send(admin.ws, {
          type: "join-request-cancelled",
          payload: { userId },
        });
      }
      return;
    }

    const result = roomManager.removeUser(userId);
    if (result) {
      roomManager.broadcast(result.roomId, {
        type: "user-left",
        payload: { userId, name },
      });

      if (result.newOwnerId) {
        const newAdmin = roomManager.getUser(result.newOwnerId);
        roomManager.broadcast(result.roomId, {
          type: "admin-changed",
          payload: {
            userId: result.newOwnerId,
            name: newAdmin?.name,
          },
        });
      }
    }
  });
}
