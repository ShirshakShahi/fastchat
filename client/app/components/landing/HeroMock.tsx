import { ArrowUpRight, Check, X } from "lucide-react";

export function HeroMock() {
  return (
    <div className="rise relative" style={{ animationDelay: "0.12s" }}>
      <div className="absolute -left-4 -top-6 z-20 w-60 rotate-[-3deg] rounded-2xl border border-line bg-card p-3.5 shadow-[0_20px_50px_-20px_rgba(26,25,22,0.35)] sm:-left-8">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          Wants to join
        </p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="font-medium text-ink">gg.cipot</span>
          <div className="flex gap-1.5">
            <span className="grid size-7 place-items-center rounded-lg bg-online/15 text-online">
              <Check size={14} />
            </span>
            <span className="grid size-7 place-items-center rounded-lg bg-accent/12 text-accent">
              <X size={14} />
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[26px] border border-line bg-card shadow-[0_30px_80px_-40px_rgba(26,25,22,0.45)]">
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-accent/70" />
            <span className="font-mono text-xs text-ink-soft">indigo-otter</span>
          </div>
          <span className="rounded-full bg-paper-2 px-2.5 py-1 text-[11px] font-medium text-ink-soft">
            4 online
          </span>
        </div>

        <div className="space-y-3.5 px-5 py-6">
          <Bubble side="left" name="Mara">
            where are we eating tonight?
          </Bubble>
          <Bubble side="right">tacos. non-negotiable 🌮</Bubble>
          <Bubble side="left" name="Theo">
            joined — i'm in, i'm starving 😄
          </Bubble>
        </div>

        <div className="flex items-center gap-2 border-t border-line px-4 py-3">
          <div className="h-10 flex-1 rounded-xl border border-line bg-paper px-3 text-sm leading-10 text-muted">
            Type a message…
          </div>
          <span className="grid size-10 place-items-center rounded-xl bg-ink text-paper">
            <ArrowUpRight size={16} />
          </span>
        </div>
      </div>
    </div>
  );
}

function Bubble({
  side,
  name,
  children,
}: {
  side: "left" | "right";
  name?: string;
  children: React.ReactNode;
}) {
  const mine = side === "right";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
          mine
            ? "rounded-br-md bg-ink text-paper"
            : "rounded-bl-md bg-paper-2 text-ink"
        }`}
      >
        {name && (
          <p className="mb-0.5 text-[11px] font-semibold text-accent">{name}</p>
        )}
        {children}
      </div>
    </div>
  );
}
