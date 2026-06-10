# FastChat

Real-time chat rooms you control: create a space, share the code, approve who gets in.

>  **Fully in-memory.** No database. Rooms live in RAM, are created on first connect, and vanish when the last person leaves. A restart wipes everything.

> The web client is in progress — this README covers the WebSocket server.

## Features

- **Ephemeral rooms** — in-memory, auto-created, auto-deleted when empty.
- **Room admin** — the creator owns it; ownership auto-transfers if they leave.
- **Join approval** — newcomers wait until the admin lets them in.
- **Kick** — the admin can remove anyone.
- **Signed identity** — per-user guest JWT, survives reconnects. No login, no DB.
- **Typing indicators** — relayed, never stored.
- **Heartbeat** — ping/pong drops dead sockets.
- **Payload guard** — oversized frames rejected at the protocol layer.
- **Pure WebSocket** — no HTTP; room + token ride on the connection URL.

## Run

**Stack:** Node 24+ · [`ws`](https://github.com/websockets/ws) · TypeScript (native, no build) · `chalk`

```bash
cd ws
npm install
npm run dev        # node --watch src/index.ts
```

Listens on `ws://localhost:8080` (`PORT` to override). Also: `npm start`, `npm run typecheck`.

## Connecting

```
ws://localhost:8080?roomId=<room>&token=<jwt?>&name=<name?>
```

Only `roomId` is required. The server resolves identity from `token` (or mints one) and replies with a `session` message holding your `userId` + a refreshed token — store it and send it back to keep the same identity. First in a room becomes admin; others wait for approval.

## Message protocol

Every message is `{ type, payload }`.

**Client → server**

| Type | Who | Payload |
| --- | --- | --- |
| `send-message` | member | `{ content }` |
| `typing` | member | `{ isTyping }` |
| `approve-join-request` / `reject-join-request` / `kick-user` | admin | `{ userId }` |
| `get-room-info` / `get-users` | member | — |

**Server → client**

| Type | Sent to | Meaning |
| --- | --- | --- |
| `session` | connector | assigned `userId` + token (first, every connect) |
| `joined` | joiner | accepted; `adminId`, `isAdmin`, `users` |
| `pending-approval` | joiner | waiting for the admin |
| `join-rejected` / `kicked` | joiner / member | denied or removed (socket closes) |
| `send-room-join-request` | admin | someone is waiting |
| `join-request-cancelled` | admin | a waiting user left |
| `new-user` / `user-left` | room | membership change |
| `user-typing` / `message-received` | room | typing signal / chat message |
| `admin-changed` | room | ownership transferred |
| `room-info` / `users-list` | requester | replies to `get-*` |
| `error` | one client | something was rejected |

## Structure

```
ws/src
├── index.ts          bootstrap: server, heartbeat, wiring
├── types/            User, Room, Client
├── utils/            send · log · publicUser · token
├── managers/         RoomManager — all in-memory state
└── handlers/
    ├── socket.ts     per-connection lifecycle
    └── router.ts     dispatch by message type
```

## Notes

- In-memory & single-instance — scaling across processes needs a shared bus (e.g. Redis pub/sub).
- Identity is a signed guest token, not an account. Set `JWT_SECRET` in production.
