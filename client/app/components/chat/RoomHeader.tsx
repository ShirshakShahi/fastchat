import { useState } from "react";
import { Link } from "react-router";
import { Check, Copy, LogOut, Users } from "lucide-react";
import type { ConnectionStatus } from "../../lib/chat-types";

export function RoomHeader({
  code,
  online,
  status,
  pendingCount,
  onOpenMembers,
  onLeave,
}: {
  code: string;
  online: number;
  status: ConnectionStatus;
  pendingCount: number;
  onOpenMembers: () => void;
  onLeave: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function copyInvite() {
    navigator.clipboard?.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }

  return (
    <header className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-card px-4 py-3 sm:px-5">
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-ink text-paper"
        >
          <span className="font-display text-lg font-semibold leading-none">
            f
          </span>
        </Link>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
            Room
          </p>
          <button
            onClick={copyInvite}
            className="group flex items-center gap-1.5 font-mono text-sm font-medium text-ink"
            title="Copy invite link"
          >
            <span className="truncate">{code}</span>
            {copied ? (
              <Check size={13} className="text-online" />
            ) : (
              <Copy
                size={13}
                className="text-muted transition-colors group-hover:text-accent"
              />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenMembers}
          className="relative flex cursor-pointer items-center gap-1.5 rounded-full bg-paper-2 px-3 py-1.5 text-xs font-medium text-ink-soft md:hidden"
        >
          <Users size={13} />
          {online}
          {pendingCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-accent ring-2 ring-card" />
          )}
        </button>
        <span className="hidden items-center gap-1.5 rounded-full bg-paper-2 px-3 py-1.5 text-xs font-medium text-ink-soft md:flex">
          <Users size={13} />
          {online}
        </span>
        <StatusDot status={status} />
        <button
          onClick={onLeave}
          className="flex cursor-pointer items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent"
        >
          <LogOut size={13} />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>
    </header>
  );
}

function StatusDot({ status }: { status: ConnectionStatus }) {
  const map = {
    connected: { c: "bg-online", t: "Live" },
    connecting: { c: "bg-amber-500", t: "…" },
    offline: { c: "bg-accent", t: "Offline" },
  } as const;
  const s = map[status];
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-paper-2 px-3 py-1.5 text-xs font-medium text-ink-soft">
      <span className={`size-2 rounded-full ${s.c}`} />
      {s.t}
    </span>
  );
}
