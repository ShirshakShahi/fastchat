export interface Message {
  userId: string;
  name: string;
  content: string;
  timestamp?: string;
  system?: boolean;
}

export interface User {
  userId: string;
  name: string;
  isAdmin?: boolean;
}

export interface JoinRequest {
  userId: string;
  name: string;
}

export type JoinState =
  | "connecting"
  | "pending"
  | "joined"
  | "rejected"
  | "kicked";

export type ConnectionStatus = "connecting" | "connected" | "offline";
