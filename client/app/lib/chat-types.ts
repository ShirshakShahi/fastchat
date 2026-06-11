export interface Message {
  id:string;
  userId: string;
  name: string;
  content: string;
  reactions?: Record<string, string[]>;
  timestamp?: string;
  system?: boolean;
}

export interface User {
  userId: string;
  name: string;
  isAdmin?: boolean;
}

export interface JoinRequest extends Omit<User, "isAdmin">{}

export type JoinState =
  | "connecting"
  | "pending"
  | "joined"
  | "rejected"
  | "kicked";

export type ConnectionStatus = "connecting" | "connected" | "offline";
