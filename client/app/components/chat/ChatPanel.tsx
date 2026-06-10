import { useEffect, useRef } from "react";
import { ArrowUpRight, DoorOpen } from "lucide-react";
import type { JoinRequest, Message } from "../../lib/chat-types";

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
  typingUsers,
  value,
  onChange,
  onSend,
  disabled,
}: {
  messages: Message[];
  selfId: string;
  typingUsers: JoinRequest[];
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled: boolean;
}) {
  const endRef = useRef<HTMLDivElement>(null);

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
            {messages.map((m, i) => {
              if (m.system) {
                return (
                  <div key={i} className="flex justify-center py-1">
                    <span className="rounded-full bg-paper-2 px-3 py-1 text-xs text-muted">
                      {m.content}
                    </span>
                  </div>
                );
              }
              const mine = m.userId === selfId;
              return (
                <div
                  key={i}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2 ${
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
                    <p className="break-words leading-relaxed">{m.content}</p>
                    {m.timestamp && (
                      <p
                        className={`mt-1 text-[10px] tabular-nums ${
                          mine ? "text-paper/50" : "text-muted"
                        }`}
                      >
                        {formatTime(m.timestamp)}
                      </p>
                    )}
                  </div>
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
