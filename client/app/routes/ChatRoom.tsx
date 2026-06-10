"use client";

import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRoomSocket } from "../hooks/useRoomSocket";
import { RoomHeader } from "../components/chat/RoomHeader";
import { Sidebar } from "../components/chat/Sidebar";
import { ChatPanel } from "../components/chat/ChatPanel";
import {
  ConnectingBody,
  PendingBody,
  StatusScreen,
  TerminalBody,
} from "../components/chat/StatusScreen";

export default function ChatRoom() {
  const params = useParams();
  const navigate = useNavigate();
  const room = useRoomSocket(params.code);

  const [input, setInput] = useState("");

  function handleChange(v: string) {
    setInput(v);
    room.setTyping(v.trim().length > 0);
  }

  function handleSend() {
    const content = input.trim();
    if (!content) return;
    room.sendMessage(content);
    setInput("");
    room.setTyping(false);
  }

  function leave() {
    room.leave();
    navigate("/app", { replace: true });
  }

  return (
    <>
      {room.joinState === "connecting" && (
        <StatusScreen code={params.code}>
          <ConnectingBody />
        </StatusScreen>
      )}

      {room.joinState === "pending" && (
        <StatusScreen code={params.code}>
          <PendingBody />
        </StatusScreen>
      )}

      {(room.joinState === "rejected" || room.joinState === "kicked") && (
        <StatusScreen code={params.code}>
          <TerminalBody
            state={room.joinState}
            onLeave={() => navigate("/app", { replace: true })}
          />
        </StatusScreen>
      )}

      {room.joinState === "joined" && (
        <main className="relative min-h-screen px-4 py-4 sm:px-6 sm:py-5">
          <div className="mx-auto flex h-[calc(100vh-2rem)] max-w-6xl flex-col gap-3">
            <RoomHeader
              code={params.code ?? ""}
              online={room.users.length}
              status={room.connectionStatus}
              onLeave={leave}
            />

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-[260px_1fr]">
              <Sidebar
                users={room.users}
                requests={room.requests}
                adminId={room.adminId}
                isAdmin={room.isAdmin}
                selfId={room.selfId}
                onApprove={room.approve}
                onReject={room.reject}
                onKick={room.kick}
              />

              <ChatPanel
                messages={room.messages}
                selfId={room.selfId}
                typingUsers={room.typingUsers}
                value={input}
                onChange={handleChange}
                onSend={handleSend}
                disabled={room.connectionStatus !== "connected"}
              />
            </div>
          </div>
        </main>
      )}

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        theme="light"
      />
    </>
  );
}
