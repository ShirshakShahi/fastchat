import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, DoorOpen, SmilePlus } from "lucide-react";
import type { JoinRequest, Message, User } from "../../lib/chat-types";
import { getColor, reactions } from "../../constants/reactions";

const reactionIcon = Object.fromEntries(reactions.map((r) => [r.id, r.emoji]));

const LONG_PRESS_MS = 500;

function formatTime(ts?: string) {
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function typingLabel(users: JoinRequest[]) {
  if (users.length === 0) return "";
  if (users.length === 1) return `${users[0].name} is typing`;
  if (users.length === 2)
    return `${users[0].name} and ${users[1].name} are typing`;
  return "Several people are typing";
}

export function ChatPanel({
  messages,
  selfId,
  users,
  typingUsers,
  value,
  onChange,
  onSend,
  onReact,
  disabled,
}: {
  messages: Message[];
  selfId: string;
  users: User[];
  typingUsers: JoinRequest[];
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onReact: (messageId: string, reaction: string) => void;
  disabled: boolean;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  function reactorNames(userIds: string[]): string {
    return userIds
      .map((id) =>
        id === selfId
          ? "You"
          : (users.find((u) => u.userId === id)?.name ?? "someone"),
      )
      .sort((x, y) => (x === "You" ? -1 : y === "You" ? 1 : 0))
      .join(", ");
  }

  const [showReactions, setShowReactions] = useState<Record<string, boolean>>({});

  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function startLongPress(messageId: string) {
    longPressRef.current = setTimeout(() => {
      setShowReactions((p) => ({ ...p, [messageId]: true }));
    }, LONG_PRESS_MS);
  }

  function cancelLongPress() {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-card">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-paper-2 text-muted">
              <DoorOpen size={20} />
            </span>
            <p className="font-display text-lg text-ink">It's quiet in here</p>
            <p className="text-sm text-muted">
              Say something to get things going.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {messages.map((m) => {
              if (m.system) {
                return (
                  <div key={m.id} className="flex justify-center py-1">
                    <span className="rounded-full bg-paper-2 px-3 py-1 text-xs text-muted">
                      {m.content}
                    </span>
                  </div>
                );
              }
              const mine = m.userId === selfId;
              return (
                <div
                  key={m.id}
                  className={`flex items-center group ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    onTouchStart={mine ? undefined : () => startLongPress(m.id)}
                    onTouchEnd={mine ? undefined : cancelLongPress}
                    onTouchMove={mine ? undefined : cancelLongPress}
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2 max-sm:select-none ${
                      mine
                        ? "rounded-br-md bg-ink text-paper"
                        : "rounded-bl-md bg-paper-2 text-ink"
                    }`}
                  >
                    {!mine && (
                      <p className="mb-0.5 text-[11px] font-semibold text-accent">
                        {m.name}
                      </p>
                    )}
                    <p className="wrap-break-word leading-relaxed">
                      {m.content}
                    </p>
                    {m.timestamp && (
                      <p
                        className={`mt-1 text-[10px] tabular-nums ${
                          mine ? "text-paper/50" : "text-muted"
                        }`}
                      >
                        {formatTime(m.timestamp)}
                      </p>
                    )}
                    {m.reactions && Object.keys(m.reactions).length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {Object.entries(m.reactions).map(([rid, userIds]) => {
                          const Icon = reactionIcon[rid];
                          const reacted = userIds.includes(selfId);
                          return (
                            <button
                              key={rid}
                              type="button"
                              onClick={() => onReact(m.id, rid)}
                              aria-label={`${rid} — ${reactorNames(userIds)}`}
                              className={`group/chip relative flex cursor-pointer items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] tabular-nums transition-colors ${
                                mine
                                  ? reacted
                                    ? "bg-paper text-ink"
                                    : "bg-paper/20 text-paper hover:bg-paper/30"
                                  : reacted
                                    ? "bg-accent-soft text-accent-ink"
                                    : "border border-line bg-card text-ink-soft hover:bg-paper-2"
                              }`}
                            >
                              {Icon ? (
                                <Icon size={12} className={getColor(rid)} />
                              ) : (
                                rid
                              )}
                              {userIds.length}
                              <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2 py-1 text-[10px] font-medium text-paper opacity-0 shadow-lg transition-opacity duration-150 group-hover/chip:opacity-100">
                                {reactorNames(userIds)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {!mine && (
                    <div className="relative ml-2">
                      <SmilePlus
                        className={`size-5 cursor-pointer text-muted hover:text-accent ${
                          showReactions[m.id]
                            ? "block"
                            : "hidden group-hover:block"
                        }`}
                        onClick={() => {
                          setShowReactions((p) => ({
                            ...p,
                            [m.id]: !p[m.id],
                          }));
                        }}
                      />
                      {showReactions[m.id] && (
                        <div className="absolute bottom-full left-1/2 z-10 mb-1.5 flex -translate-x-1/2 gap-0.5 rounded-full border border-line bg-card p-1 shadow-[0_8px_24px_-8px_rgba(26,25,22,0.35)]">
                          {reactions.map(({ id, emoji: Icon }) => (
                            <button
                              key={id}
                              type="button"
                              title={id}
                              onClick={() => {
                                onReact(m.id, id);
                                setShowReactions((p) => ({
                                  ...p,
                                  [m.id]: false,
                                }));
                              }}
                              className="grid size-7 cursor-pointer place-items-center rounded-full transition-colors hover:bg-paper-2"
                            >
                              <Icon size={15} className={getColor(id)} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <div className="relative border-t border-line p-3 sm:p-4">
        <div
          className={`pointer-events-none absolute -top-6 left-4 flex items-center gap-1.5 text-xs text-muted transition-opacity duration-200 ${
            typingUsers.length > 0 ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-1 animate-bounce rounded-full bg-accent"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </span>
          {typingLabel(typingUsers)}
        </div>

        <div className="flex items-end gap-2">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSend()}
            placeholder="Type a message…"
            className="h-12 flex-1 rounded-xl border border-line-strong bg-paper px-4 text-ink outline-none transition-all duration-200 placeholder:text-muted focus:border-accent focus:bg-card focus:ring-4 focus:ring-accent/10"
          />
          <button
            onClick={onSend}
            disabled={disabled}
            className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent text-paper transition-all duration-200 hover:bg-accent-ink active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowUpRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
