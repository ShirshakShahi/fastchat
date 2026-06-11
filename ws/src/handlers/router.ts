import type { WebSocket } from "ws";
import RoomManager from "../managers/RoomManager.ts";
import { send } from "../utils/send.ts";
import { publicUser } from "../utils/publicUser.ts";

const ALLOWED_REACTIONS = ["haha", "sad", "party", "like", "angry"];

export function routeMessage(
  message: any,
  roomId: string,
  userId: string,
  ws: WebSocket,
): void {
  const roomManager = RoomManager.getInstance();

  switch (message.type) {
    case "send-message": {
      const user = roomManager.getUser(userId);
      const room = roomManager.getRoom(roomId);
      if (!user || !room) return;

      const content = message.payload?.content;
      if (
        typeof content !== "string" ||
        !content.trim() ||
        content.length > 2000
      ) {
        return;
      }

      user.lastActivity = new Date();

      const newMessage = {
        id: crypto.randomUUID(),
        content,
        userId,
        name: user.name,
        timestamp: new Date(),
        reactions: {},
      };

      room.messages.set(newMessage.id, newMessage);
      if (room.messages.size > 200) {
        room.messages.delete(room.messages.keys().next().value!);
      }

      roomManager.broadcast(roomId, {
        type: "message-received",
        payload: newMessage,
      });
      break;
    }

    case "send-reaction": {
      const user = roomManager.getUser(userId);
      const room = roomManager.getRoom(roomId);
      if (!user || !room) return;

      const messageId = message.payload?.messageId;
      const reaction = message.payload?.reaction;
      if (typeof messageId !== "string" || !ALLOWED_REACTIONS.includes(reaction)) {
        return;
      }

      const target = room.messages.get(messageId);
      if (!target) return;

      const reactedBy = (target.reactions[reaction] ??= []);
      const existing = reactedBy.indexOf(userId);
      const op = existing === -1 ? "added" : "removed";

      if (existing === -1) reactedBy.push(userId);
      else reactedBy.splice(existing, 1);
      if (reactedBy.length === 0) delete target.reactions[reaction];

      roomManager.broadcast(roomId, {
        type: "reaction-updated",
        payload: { messageId, reaction, userId, op },
      });
      break;
    }

    case "typing": {
      const user = roomManager.getUser(userId);
      if (!user) return;

      roomManager.broadcast(
        roomId,
        {
          type: "user-typing",
          payload: {
            userId,
            name: user.name,
            isTyping: Boolean(message.payload?.isTyping),
          },
        },
        userId,
      );
      break;
    }

    case "approve-join-request": {
      if (!roomManager.isAdmin(roomId, userId)) {
        send(ws, {
          type: "error",
          payload: { message: "Only the room admin can approve members" },
        });
        return;
      }

      const targetId = message.payload?.userId as string;
      const pendingUser = roomManager.removePending(roomId, targetId);
      if (!pendingUser) return;

      const added = roomManager.addUser(roomId, pendingUser);
      if (!added) {
        send(pendingUser.ws, {
          type: "join-rejected",
          payload: { message: "Room is full" },
        });
        pendingUser.ws.close(4003, "Room full");
        return;
      }

      const room = roomManager.getRoom(roomId);

      send(pendingUser.ws, {
        type: "joined",
        payload: {
          message: "You were accepted into the room",
          selfId: pendingUser.userId,
          adminId: room?.ownerId,
          isAdmin: false,
          users: roomManager
            .getRoomUsers(roomId)
            .map((u) => publicUser(roomManager, roomId, u)),
          messages: room ? [...room.messages.values()] : [],
        },
      });

      roomManager.broadcast(
        roomId,
        {
          type: "new-user",
          payload: {
            userId: pendingUser.userId,
            name: pendingUser.name,
            isAdmin: false,
          },
        },
        pendingUser.userId,
      );
      break;
    }

    case "reject-join-request": {
      if (!roomManager.isAdmin(roomId, userId)) {
        send(ws, {
          type: "error",
          payload: { message: "Only the room admin can reject members" },
        });
        return;
      }

      const targetId = message.payload?.userId as string;
      const pendingUser = roomManager.removePending(roomId, targetId);
      if (!pendingUser) return;

      send(pendingUser.ws, {
        type: "join-rejected",
        payload: { message: "The admin declined your request to join" },
      });
      pendingUser.ws.close(4004, "Join request rejected");
      break;
    }

    case "kick-user": {
      if (!roomManager.isAdmin(roomId, userId)) {
        send(ws, {
          type: "error",
          payload: { message: "Only the room admin can remove members" },
        });
        return;
      }

      const targetId = message.payload?.userId as string;
      if (targetId === userId) return;

      const target = roomManager.getUser(targetId);
      if (!target) return;

      const targetWs = target.ws;
      const targetName = target.name;

      const result = roomManager.removeUser(targetId);
      if (!result) return;

      send(targetWs, {
        type: "kicked",
        payload: { message: "You were removed from the room by the admin" },
      });
      targetWs.close(4005, "Kicked by admin");

      roomManager.broadcast(roomId, {
        type: "user-left",
        payload: { userId: targetId, name: targetName },
      });
      break;
    }

    case "get-room-info": {
      const room = roomManager.getRoom(roomId);
      send(ws, {
        type: "room-info",
        payload: {
          totalUsers: room?.userIds.size ?? 0,
          maxUsers: room?.maxUsers ?? 0,
          adminId: room?.ownerId,
          createdAt: room?.createdAt,
        },
      });
      break;
    }

    case "get-users": {
      const roomUsers = roomManager.getRoomUsers(roomId);
      send(ws, {
        type: "users-list",
        payload: {
          users: roomUsers.map((u) => publicUser(roomManager, roomId, u)),
        },
      });
      break;
    }
  }
}
