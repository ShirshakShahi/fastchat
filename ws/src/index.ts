import http from "http";
import type { WebSocket } from "ws";
import { WebSocketServer } from "ws";
import url from "url";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

interface User {
  ws: WebSocket;
  userId: string;
  name: string;
  joinedAt: Date;
  lastActivity: Date;
}

interface Room {
  id: string;
  userIds: Set<string>;
  createdAt: Date;
  maxUsers: number;
  ownerId?: string;
}

class RoomManager {
  private rooms = new Map<string, Room>();
  private userMap = new Map<string, User>();
  private userToRoomMap = new Map<string, string>();
  private wsToUserMap = new Map<WebSocket, string>();
  private static instance: RoomManager;

  static getInstance(): RoomManager {
    if (!this.instance) {
      this.instance = new RoomManager();
    }
    return this.instance;
  }

  createRoom(roomId: string, maxUsers: number = 10, ownerId?: string): Room {
    if (this.rooms.has(roomId)) {
      throw new Error(`Room ${roomId} already exists`);
    }

    const room: Room = {
      id: roomId,
      userIds: new Set(),
      createdAt: new Date(),
      maxUsers,
      ownerId,
    } as Room;

    this.rooms.set(roomId, room);
    console.log(`[ROOM] Created room ${roomId}`);
    return room;
  }

  addUser(roomId: string, user: User): boolean {
    try {
      let room = this.rooms.get(roomId);

      if (!room) {
        // Auto-create room if doesn't exist
        room = this.createRoom(roomId);
      }

      if (room.userIds.size >= room.maxUsers) {
        console.warn(`[ROOM] Room ${roomId} is full`);
        return false;
      }

      if (this.userMap.has(user.userId)) {
        console.warn(
          `[USER] User ${user.userId} already exists, removing old connection`,
        );
        this.removeUser(user.userId);
      }

      this.userMap.set(user.userId, user);
      this.userToRoomMap.set(user.userId, roomId);
      this.wsToUserMap.set(user.ws, user.userId);
      room.userIds.add(user.userId);

      console.log(`[USER] User ${user.userId} joined room ${roomId}`);
      return true;
    } catch (error) {
      console.error("[ERROR] Failed to add user:", error);
      return false;
    }
  }

  removeUser(userId: string): boolean {
    try {
      const roomId = this.userToRoomMap.get(userId);
      const user = this.userMap.get(userId);

      if (!roomId || !user) {
        return false;
      }

      const room = this.rooms.get(roomId);
      if (!room) return false;

      this.userMap.delete(userId);
      this.userToRoomMap.delete(userId);
      this.wsToUserMap.delete(user.ws);
      room.userIds.delete(userId);

      console.log(`[USER] User ${userId} left room ${roomId}`);

      // Clean up empty rooms
      if (room.userIds.size === 0) {
        this.rooms.delete(roomId);
        console.log(`[ROOM] Deleted empty room ${roomId}`);
      }

      return true;
    } catch (error) {
      console.error("[ERROR] Failed to remove user:", error);
      return false;
    }
  }

  getUserRoom(userId: string): string | undefined {
    return this.userToRoomMap.get(userId);
  }

  getUser(userId: string): User | undefined {
    return this.userMap.get(userId);
  }

  getUserFromWebSocket(ws: WebSocket): string | undefined {
    return this.wsToUserMap.get(ws);
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  getRoomUsers(roomId: string): User[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    return Array.from(room.userIds)
      .map((userId) => this.userMap.get(userId)!)
      .filter((user) => user !== undefined);
  }

  async broadcast(
    roomId: string,
    message: any,
    excludedUserId?: string,
  ): Promise<void> {
    const users = this.getRoomUsers(roomId);

    users.forEach((user) => {
      if (!excludedUserId || excludedUserId !== user.userId) {
        if (user.ws.readyState === user.ws.OPEN) {
          user.ws.send(JSON.stringify(message));
        }
      }
    });
  }

  getStats() {
    return {
      totalRooms: this.rooms.size,
      totalUsers: this.userMap.size,
      averageUsersPerRoom:
        this.rooms.size > 0
          ? (this.userMap.size / this.rooms.size).toFixed(2)
          : 0,
    };
  }
}

function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function send(ws: WebSocket, message: any): void {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function handleMessage(
  message: any,
  roomId: string,
  userId: string,
  ws: WebSocket,
): void {
  const roomManager = RoomManager.getInstance();

  switch (message.type) {
    case "send-message":
      const user = roomManager.getUser(userId);
      if (!user) return;

      user.lastActivity = new Date();

      roomManager.broadcast(roomId, {
        type: "message-received",
        payload: {
          content: message.payload.content,
          userId: userId,
          name: user.name,
          timestamp: new Date(),
        },
      });
      break;

    case "get-room-info":
      const room = roomManager.getRoom(roomId);
      send(ws, {
        type: "room-info",
        payload: {
          totalUsers: room?.userIds.size ?? 0,
          maxUsers: room?.maxUsers ?? 0,
          createdAt: room?.createdAt,
        },
      });
      break;

    case "get-users":
      const roomUsers = roomManager.getRoomUsers(roomId);
      send(ws, {
        type: "users-list",
        payload: {
          users: roomUsers.map((u) => ({
            userId: u.userId,
            name: u.name,
            joinedAt: u.joinedAt,
          })),
        },
      });
      break;
  }
}

const server = http.createServer();
const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  console.log("[CONNECTION] New WebSocket connection");

  ws.on("error", (error) => {
    console.error("[ERROR] WebSocket error:", error);
  });

  const parsedUrl = url.parse(req.url!, true);

  const roomId = parsedUrl.query.roomId as string;
  const userId = parsedUrl.query.userId as string;
  const name = `Guest-${Math.floor(Math.random() * 1000000)}`;

  const roomManager = RoomManager.getInstance();
  const user: User = {
    ws,
    userId,
    name,
    joinedAt: new Date(),
    lastActivity: new Date(),
  };

  const added = roomManager.addUser(roomId, user);
  if (!added) {
    send(ws, {
      type: "error",
      payload: { message: "Failed to join room" },
    });
    ws.close(4002, "Room full or error");
    return;
  }

  send(ws, {
    type: "joined",
    payload: {
      message: "Successfully joined room",
      users: roomManager
        .getRoomUsers(roomId)
        .map((u) => ({ userId: u.userId, name: u.name })),
    },
  });

  roomManager.broadcast(
    roomId,
    {
      type: "new-user",
      payload: {
        userId: userId,
        name: name,
      },
    },
    userId,
  );

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString());
      handleMessage(message, roomId, userId, ws);
    } catch (error) {
      console.error("[ERROR] Failed to parse message:", error);
      send(ws, {
        type: "error",
        payload: { message: "Invalid JSON" },
      });
    }
  });

  ws.on("close", () => {
    console.log(`[DISCONNECT] User ${userId} disconnected`);

    const removed = roomManager.removeUser(userId);
    if (removed) {
      roomManager.broadcast(roomId, {
        type: "user-left",
        payload: {
          userId: userId,
          name: name,
        },
      });
    }
  });
});

server.on("request", (req, res) => {
  if (req.url === "/health") {
    const roomManager = RoomManager.getInstance();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(roomManager.getStats()));
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`[SERVER] WebSocket server listening on port ${PORT}`);
});
