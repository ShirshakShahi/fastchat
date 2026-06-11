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
  messages: Map<string, Message>;
}

export interface Message {
  id: string;
  content: string;
  userId: string;
  name: string;
  timestamp: Date;
  reactions: Record<string, string[]>;
}

export type Client = WebSocket & { isAlive?: boolean };
