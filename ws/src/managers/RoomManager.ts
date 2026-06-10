import chalk from "chalk";
import type { WebSocket } from "ws";
import { log } from "../utils/log.ts";
import type { Room, User } from "../types/types.ts";
import { send } from "../utils/send.ts";

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

  createRoom(roomId: string, ownerId: string, maxUsers: number = 10): Room {
    if (this.rooms.has(roomId)) {
      throw new Error(`Room ${roomId} already exists`);
    }

    const room: Room = {
      id: roomId,
      userIds: new Set(),
      pending: new Map(),
      createdAt: new Date(),
      maxUsers,
      ownerId,
    };

    this.rooms.set(roomId, room);
    log.room(`created ${chalk.bold(roomId)} (owner ${ownerId})`);
    return room;
  }

  hasRoom(roomId: string): boolean {
    return this.rooms.has(roomId);
  }

  addUser(roomId: string, user: User): boolean {
    try {
      const room = this.rooms.get(roomId);
      if (!room) return false;

      if (room.userIds.size >= room.maxUsers) {
        log.warn(`room ${roomId} is full`);
        return false;
      }

      if (this.userMap.has(user.userId)) {
        log.warn(`${user.userId} already connected, dropping old socket`);
        this.removeUser(user.userId);
      }

      this.userMap.set(user.userId, user);
      this.userToRoomMap.set(user.userId, roomId);
      this.wsToUserMap.set(user.ws, user.userId);
      room.userIds.add(user.userId);

      log.user(`${user.name} joined ${chalk.bold(roomId)}`);
      return true;
    } catch (error) {
      log.error("failed to add user:", error);
      return false;
    }
  }

  removeUser(
    userId: string,
  ): { roomId: string; newOwnerId?: string | undefined } | null {
    try {
      const roomId = this.userToRoomMap.get(userId);
      const user = this.userMap.get(userId);

      if (!roomId || !user) {
        return null;
      }

      const room = this.rooms.get(roomId);
      if (!room) return null;

      this.userMap.delete(userId);
      this.userToRoomMap.delete(userId);
      this.wsToUserMap.delete(user.ws);
      room.userIds.delete(userId);

      log.user(`${userId} left ${chalk.bold(roomId)}`);

      let newOwnerId: string | undefined;

      if (room.ownerId === userId && room.userIds.size > 0) {
        newOwnerId = room.userIds.values().next().value as string;
        room.ownerId = newOwnerId;
        log.room(`admin of ${roomId} reassigned to ${newOwnerId}`);
      }

      if (room.userIds.size === 0 && room.pending.size === 0) {
        this.rooms.delete(roomId);
        log.room(chalk.dim(`deleted empty room ${roomId}`));
      }

      return { roomId, newOwnerId };
    } catch (error) {
      log.error("failed to remove user:", error);
      return null;
    }
  }

  addPending(roomId: string, user: User): void {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.pending.set(user.userId, user);
    log.wait(`${user.name} waiting to join ${chalk.bold(roomId)}`);
  }

  getPending(roomId: string, userId: string): User | undefined {
    return this.rooms.get(roomId)?.pending.get(userId);
  }

  removePending(roomId: string, userId: string): User | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    const user = room.pending.get(userId);
    room.pending.delete(userId);

    if (room.userIds.size === 0 && room.pending.size === 0) {
      this.rooms.delete(roomId);
      log.room(chalk.dim(`deleted empty room ${roomId}`));
    }

    return user;
  }

  getUser(userId: string): User | undefined {
    return this.userMap.get(userId);
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  isAdmin(roomId: string, userId: string): boolean {
    return this.rooms.get(roomId)?.ownerId === userId;
  }

  getRoomUsers(roomId: string): User[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    return Array.from(room.userIds)
      .map((userId) => this.userMap.get(userId)!)
      .filter((user) => user !== undefined);
  }

  broadcast(roomId: string, message: any, excludedUserId?: string): void {
    const users = this.getRoomUsers(roomId);

    users.forEach((user) => {
      if (!excludedUserId || excludedUserId !== user.userId) {
        send(user.ws, message);
      }
    });
  }
}

export default RoomManager;
