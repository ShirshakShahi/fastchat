import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import type {
  ConnectionStatus,
  JoinRequest,
  JoinState,
  Message,
  User,
} from "../lib/chat-types";

const WS_BASE = "wss://fastchat-v0wk.onrender.com";
const NAME_KEY = "fastchat:name";
const TOKEN_KEY = "fastchat:token";

export interface RoomSocket {
  joinState: JoinState;
  connectionStatus: ConnectionStatus;
  selfId: string;
  adminId: string | null;
  isAdmin: boolean;
  users: User[];
  messages: Message[];
  requests: JoinRequest[];
  typingUsers: JoinRequest[];
  sendMessage: (content: string) => void;
  setTyping: (active: boolean) => void;
  approve: (userId: string) => void;
  reject: (userId: string) => void;
  kick: (userId: string) => void;
  leave: () => void;
}

function pushSystem(
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  content: string,
) {
  setMessages((prev) => [
    ...prev,
    { userId: "__system__", name: "", content, system: true },
  ]);
}

export function useRoomSocket(
  code: string | undefined,
  enabled: boolean = true,
): RoomSocket {
  const socketRef = useRef<WebSocket | null>(null);
  const userIdRef = useRef("");
  const reasonRef = useRef("");

  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [joinState, setJoinState] = useState<JoinState>("connecting");
  const [typingUsers, setTypingUsers] = useState<JoinRequest[]>([]);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");

  const typingSentRef = useRef(false);
  const typingIdleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const typingTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const isAdmin = adminId !== null && adminId === userIdRef.current;

  useEffect(() => {
    if (!enabled) return;

    const name = (localStorage.getItem(NAME_KEY) ?? "").trim();
    const token = sessionStorage.getItem(TOKEN_KEY) ?? "";

    const qs = new URLSearchParams({ roomId: code ?? "" });
    if (name) qs.set("name", name);
    if (token) qs.set("token", token);

    const socket = new WebSocket(`${WS_BASE}?${qs.toString()}`);
    socketRef.current = socket;

    socket.onopen = () => setConnectionStatus("connected");

    socket.onerror = () => {
      setConnectionStatus("offline");
      toast.error("Unable to reach the server");
    };

    socket.onclose = (event) => {
      setConnectionStatus("offline");
      if (reasonRef.current) return;
      if (!event.wasClean) toast.error("Connection lost");
    };

    socket.onmessage = (event) => {
      let data: any;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      switch (data.type) {
        case "error":
          toast.error(data.payload.message);
          break;

        case "session":
          userIdRef.current = data.payload.userId;
          sessionStorage.setItem(TOKEN_KEY, data.payload.token);
          break;

        case "pending-approval":
          setJoinState("pending");
          break;

        case "joined":
          setJoinState("joined");
          setUsers(data.payload.users ?? []);
          setMessages(data.payload.messages)
          setAdminId(data.payload.adminId ?? null);
          toast.success(data.payload.message);
          break;

        case "send-room-join-request":
          setRequests((prev) =>
            prev.some((r) => r.userId === data.payload.userId)
              ? prev
              : [...prev, data.payload],
          );
          toast.info(`${data.payload.name} wants to join`);
          break;

        case "join-request-cancelled":
          setRequests((prev) =>
            prev.filter((r) => r.userId !== data.payload.userId),
          );
          break;

        case "join-rejected":
          reasonRef.current = "rejected";
          setJoinState("rejected");
          break;

        case "kicked":
          reasonRef.current = "kicked";
          setJoinState("kicked");
          break;

        case "new-user":
          setUsers((prev) =>
            prev.some((u) => u.userId === data.payload.userId)
              ? prev
              : [...prev, data.payload],
          );
          setRequests((prev) =>
            prev.filter((r) => r.userId !== data.payload.userId),
          );
          pushSystem(setMessages, `${data.payload.name} joined`);
          break;

        case "user-left":
          setUsers((prev) =>
            prev.filter((u) => u.userId !== data.payload.userId),
          );
          pushSystem(setMessages, `${data.payload.name} left`);
          break;

        case "admin-changed":
          setAdminId(data.payload.userId);
          setUsers((prev) =>
            prev.map((u) => ({
              ...u,
              isAdmin: u.userId === data.payload.userId,
            })),
          );
          if (data.payload.userId === userIdRef.current) {
            toast.success("You're the admin now");
          } else {
            pushSystem(setMessages, `${data.payload.name} is now the admin`);
          }
          break;

        case "message-received":
          setMessages((prev) => [
            ...prev,
            {
              userId: data.payload.userId,
              name: data.payload.name,
              content: data.payload.content,
              timestamp: data.payload.timestamp,
            },
          ]);
          break;

        case "user-typing":
          handleTypingSignal(data.payload);
          break;
      }
    };

    return () => {
      socket.close();
      if (typingIdleRef.current) clearTimeout(typingIdleRef.current);
      typingTimersRef.current.forEach(clearTimeout);
      typingTimersRef.current.clear();
    };
  }, [code, enabled]);

  function emit(type: string, payload?: any) {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ type, payload }));
  }

  function startTyping() {
    if (!typingSentRef.current) {
      emit("typing", { isTyping: true });
      typingSentRef.current = true;
    }
    if (typingIdleRef.current) clearTimeout(typingIdleRef.current);
    typingIdleRef.current = setTimeout(stopTyping, 1800);
  }

  function stopTyping() {
    if (typingIdleRef.current) {
      clearTimeout(typingIdleRef.current);
      typingIdleRef.current = null;
    }
    if (typingSentRef.current) {
      emit("typing", { isTyping: false });
      typingSentRef.current = false;
    }
  }

  function handleTypingSignal(p: {
    userId: string;
    name: string;
    isTyping: boolean;
  }) {
    const timers = typingTimersRef.current;
    const existing = timers.get(p.userId);
    if (existing) clearTimeout(existing);

    if (!p.isTyping) {
      timers.delete(p.userId);
      setTypingUsers((prev) => prev.filter((u) => u.userId !== p.userId));
      return;
    }

    timers.set(
      p.userId,
      setTimeout(() => {
        timers.delete(p.userId);
        setTypingUsers((prev) => prev.filter((u) => u.userId !== p.userId));
      }, 4000),
    );

    setTypingUsers((prev) =>
      prev.some((u) => u.userId === p.userId)
        ? prev
        : [...prev, { userId: p.userId, name: p.name }],
    );
  }

  return {
    joinState,
    connectionStatus,
    selfId: userIdRef.current,
    adminId,
    isAdmin,
    users,
    messages,
    requests,
    typingUsers,
    sendMessage: (content) => emit("send-message", { content }),
    setTyping: (active) => (active ? startTyping() : stopTyping()),
    approve: (userId) => emit("approve-join-request", { userId }),
    reject: (userId) => emit("reject-join-request", { userId }),
    kick: (userId) => emit("kick-user", { userId }),
    leave: () => socketRef.current?.close(),
  };
}
