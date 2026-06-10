import { useState } from "react";
import { ArrowUpRight, UserRound } from "lucide-react";

export function NamePrompt({
  onContinue,
}: {
  onContinue: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const clean = name.trim();

  return (
    <div>
      <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-line bg-card text-ink-soft">
        <UserRound size={22} />
      </span>
      <h1 className="mt-5 font-display text-3xl font-light">Join this room</h1>
      <p className="mt-2 text-ink-soft">
        Pick a name people will see — or hop in as a guest.
      </p>

      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && clean && onContinue(clean)}
        maxLength={24}
        placeholder="Your display name"
        className="mt-6 h-12 w-full rounded-xl border border-line-strong bg-paper px-4 text-ink outline-none transition-all duration-200 placeholder:text-muted focus:border-accent focus:bg-card focus:ring-4 focus:ring-accent/10"
      />

      <button
        type="button"
        onClick={() => onContinue(clean)}
        disabled={!clean}
        className="group mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 font-medium text-paper transition-all duration-200 hover:bg-accent-ink active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Join the room
        <ArrowUpRight
          size={17}
          className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </button>

      <button
        type="button"
        onClick={() => onContinue("")}
        className="mt-2.5 inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-line-strong bg-card px-6 py-3 font-medium text-ink-soft transition-all duration-200 hover:bg-paper-2 hover:text-ink active:scale-[0.98]"
      >
        Continue as guest
      </button>
    </div>
  );
}
