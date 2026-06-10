import type RoomManager from "../managers/RoomManager.ts";
import type { User } from "../types/types.ts";

export function publicUser(roomManager: RoomManager, roomId: string, u: User) {
  return {
    userId: u.userId,
    name: u.name,
    joinedAt: u.joinedAt,
    isAdmin: roomManager.isAdmin(roomId, u.userId),
  };
}
