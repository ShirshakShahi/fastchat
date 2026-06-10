import { useMemo } from "react";
import { Check, Crown, ShieldAlert, UserMinus, X } from "lucide-react";
import type { JoinRequest, User } from "../../lib/chat-types";

export function Sidebar({
  users,
  requests,
  adminId,
  isAdmin,
  selfId,
  onApprove,
  onReject,
  onKick,
}: {
  users: User[];
  requests: JoinRequest[];
  adminId: string | null;
  isAdmin: boolean;
  selfId: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onKick: (id: string) => void;
}) {
  const sorted = useMemo(
    () =>
      [...users].sort((a, b) => {
        if (a.userId === adminId) return -1;
        if (b.userId === adminId) return 1;
        return 0;
      }),
    [users, adminId],
  );

  return (
    <aside className="hidden min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-card md:flex">
      {isAdmin && requests.length > 0 && (
        <div className="border-b border-line bg-accent-soft/40 p-3">
          <p className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-accent-ink">
            <ShieldAlert size={13} />
            Waiting ({requests.length})
          </p>
          <div className="space-y-1.5">
            {requests.map((r) => (
              <div
                key={r.userId}
                className="flex items-center justify-between gap-2 rounded-xl bg-card px-2.5 py-2"
              >
                <span className="truncate text-sm font-medium text-ink">
                  {r.name}
                </span>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    onClick={() => onApprove(r.userId)}
                    title="Approve"
                    className="grid size-7 place-items-center rounded-lg bg-online/15 text-online transition-colors hover:bg-online hover:text-white"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => onReject(r.userId)}
                    title="Decline"
                    className="grid size-7 place-items-center rounded-lg bg-accent/12 text-accent transition-colors hover:bg-accent hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="font-display text-lg font-medium text-ink">Members</h2>
        <span className="font-mono text-xs text-muted">{users.length}</span>
      </div>

      <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-2">
        {sorted.map((user) => {
          const admin = user.userId === adminId;
          const me = user.userId === selfId;
          return (
            <div
              key={user.userId}
              className="group flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-colors hover:bg-paper-2"
            >
              <span className="relative grid size-8 shrink-0 place-items-center rounded-lg bg-ink text-xs font-semibold text-paper">
                {(user.name || "G").slice(0, 1).toUpperCase()}
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card bg-online" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-sm font-medium text-ink">
                  <span className="truncate">{user.name}</span>
                  {me && <span className="text-xs text-muted">(you)</span>}
                </p>
              </div>

              {admin ? (
                <span
                  title="Admin"
                  className="flex items-center gap-1 rounded-md bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-ink"
                >
                  <Crown size={11} />
                  Admin
                </span>
              ) : (
                isAdmin && (
                  <button
                    onClick={() => onKick(user.userId)}
                    title={`Remove ${user.name}`}
                    className="grid size-7 place-items-center rounded-lg text-muted opacity-0 transition-all hover:bg-accent/12 hover:text-accent group-hover:opacity-100"
                  >
                    <UserMinus size={14} />
                  </button>
                )
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t border-line px-4 py-3">
        <p className="text-[11px] leading-relaxed text-muted">
          {isAdmin
            ? "You're the admin — approve newcomers and remove anyone."
            : "The admin approves who joins this room."}
        </p>
      </div>
    </aside>
  );
}
