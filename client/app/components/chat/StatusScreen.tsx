import { Link } from "react-router";
import { ArrowUpRight, Loader2, ShieldAlert } from "lucide-react";

export function StatusScreen({
  code,
  children,
}: {
  code?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative grid min-h-screen place-items-center px-5">
      <div className="rise w-full max-w-md text-center">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2.5"
          aria-label="FastChat home"
        >
          <span className="grid size-9 place-items-center rounded-[10px] bg-ink text-paper">
            <span className="font-display text-lg font-semibold leading-none">
              f
            </span>
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">
            FastChat
          </span>
        </Link>
        {children}
        {code && (
          <p className="mt-8 font-mono text-xs text-muted">space / {code}</p>
        )}
      </div>
    </main>
  );
}

export function ConnectingBody() {
  return (
    <div>
      <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-line bg-card text-ink-soft">
        <Loader2 size={22} className="animate-spin" />
      </span>
      <h1 className="mt-5 font-display text-3xl font-light">Connecting…</h1>
      <p className="mt-2 text-ink-soft">Reaching the room.</p>
    </div>
  );
}

export function PendingBody() {
  return (
    <div>
      <span
        className="mx-auto grid size-16 place-items-center rounded-full bg-accent text-paper"
        style={{ animation: "pulse-ring 1.8s ease-out infinite" }}
      >
        <Loader2 size={24} className="animate-spin" />
      </span>
      <h1 className="mt-6 font-display text-3xl font-light">
        Knocking on the door
      </h1>
      <p className="mx-auto mt-3 max-w-xs leading-relaxed text-ink-soft">
        You're in the waiting room. The admin will let you in any moment now —
        hang tight.
      </p>
    </div>
  );
}

export function TerminalBody({
  state,
  onLeave,
}: {
  state: "rejected" | "kicked";
  onLeave: () => void;
}) {
  const copy =
    state === "kicked"
      ? {
          title: "You were removed",
          body: "The admin removed you from this room.",
        }
      : {
          title: "Not this time",
          body: "The admin declined your request to join.",
        };

  return (
    <div>
      <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-accent-soft text-accent-ink">
        <ShieldAlert size={26} />
      </span>
      <h1 className="mt-6 font-display text-3xl font-light">{copy.title}</h1>
      <p className="mx-auto mt-3 max-w-xs leading-relaxed text-ink-soft">
        {copy.body}
      </p>
      <button
        onClick={onLeave}
        className="mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-medium text-paper transition-all duration-200 hover:bg-accent active:scale-[0.98]"
      >
        Back to start
        <ArrowUpRight size={17} />
      </button>
    </div>
  );
}
