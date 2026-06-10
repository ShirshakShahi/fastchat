import { type WebSocket } from "ws";

export interface User {
  ws: WebSocket;
  userId: string;
  name: string;
  joinedAt: Date;
  lastActivity: Date;
}

export interface Room {
  id: string;
  userIds: Set<string>;
  pending: Map<string, User>;
  createdAt: Date;
  maxUsers: number;
  ownerId: string;
}

export type Client = WebSocket & { isAlive?: boolean };
