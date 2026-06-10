"use client";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { buildMeta } from "../lib/seo";
import { useRoomSocket } from "../hooks/useRoomSocket";
import { RoomHeader } from "../components/chat/RoomHeader";
import { Sidebar } from "../components/chat/Sidebar";
import { ChatPanel } from "../components/chat/ChatPanel";
import { NamePrompt } from "../components/chat/NamePrompt";
import {
  ConnectingBody,
  PendingBody,
  StatusScreen,
  TerminalBody,
} from "../components/chat/StatusScreen";

const NAME_KEY = "fastchat:name";

export function meta({ location }: { location: { pathname: string } }) {
  return buildMeta({
    path: location.pathname,
    noindex: true,
    description:
      "You've been invited to a private FastChat space. Pick a name, knock, and the admin will let you in.",
  });
}

export default function ChatRoom() {
  const params = useParams();
  const navigate = useNavigate();

  const [ready, setReady] = useState(false);
  const [askName, setAskName] = useState(false);
  const room = useRoomSocket(params.code, ready);

  const [input, setInput] = useState("");
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    const hasName = Boolean((localStorage.getItem(NAME_KEY) ?? "").trim());
    if (hasName) setReady(true);
    else setAskName(true);
  }, []);

  function chooseName(name: string) {
    const clean = name.trim();
    if (clean) localStorage.setItem(NAME_KEY, clean);
    else localStorage.removeItem(NAME_KEY);
    setAskName(false);
    setReady(true);
  }

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
      {!ready && (
        <StatusScreen code={params.code}>
          {askName ? <NamePrompt onContinue={chooseName} /> : <ConnectingBody />}
        </StatusScreen>
      )}

      {ready && room.joinState === "connecting" && (
        <StatusScreen code={params.code}>
          <ConnectingBody />
        </StatusScreen>
      )}

      {ready && room.joinState === "pending" && (
        <StatusScreen code={params.code}>
          <PendingBody />
        </StatusScreen>
      )}

      {ready && (room.joinState === "rejected" || room.joinState === "kicked") && (
        <StatusScreen code={params.code}>
          <TerminalBody
            state={room.joinState}
            onLeave={() => navigate("/app", { replace: true })}
          />
        </StatusScreen>
      )}

      {ready && room.joinState === "joined" && (
        <main className="relative min-h-dvh p-3 sm:p-4">
          <div className="mx-auto flex h-[calc(100dvh-1.5rem)] max-w-6xl flex-col gap-3 sm:h-[calc(100dvh-2rem)]">
            <RoomHeader
              code={params.code ?? ""}
              online={room.users.length}
              status={room.connectionStatus}
              pendingCount={room.requests.length}
              onOpenMembers={() => setShowMembers(true)}
              onLeave={leave}
            />

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-[260px_1fr]">
              <Sidebar
                users={room.users}
                requests={room.requests}
                adminId={room.adminId}
                isAdmin={room.isAdmin}
                selfId={room.selfId}
                open={showMembers}
                onClose={() => setShowMembers(false)}
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
