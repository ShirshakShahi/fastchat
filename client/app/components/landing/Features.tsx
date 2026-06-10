import { KeyRound, ShieldCheck, UserMinus, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Instant spaces",
    body: "No accounts, no setup. Click create and you're in a live room with a shareable code.",
  },
  {
    icon: ShieldCheck,
    title: "Approve every join",
    body: "New people land in a waiting room. They only get in once you, the admin, say yes.",
  },
  {
    icon: UserMinus,
    title: "Remove anyone",
    body: "Someone derailing the conversation? Kick them out in a single tap, instantly.",
  },
  {
    icon: KeyRound,
    title: "Codes, not invites",
    body: "Each room is a memorable code. Pass it around — it's the only key you need.",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="relative z-10 mx-auto max-w-6xl scroll-mt-20 px-5 py-20 sm:px-8"
    >
      <div className="flex items-end justify-between gap-6">
        <h2 className="max-w-md font-display text-4xl font-light leading-tight tracking-tight text-ink sm:text-5xl">
          Built for people who run the room.
        </h2>
        <span className="hidden font-mono text-sm text-muted sm:block">
          (01—04)
        </span>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2">
        {FEATURES.map(({ icon: Icon, title, body }, i) => (
          <div
            key={title}
            className="group bg-card p-7 transition-colors duration-300 hover:bg-paper-2"
          >
            <div className="flex items-center justify-between">
              <span className="grid size-11 place-items-center rounded-xl bg-ink text-paper transition-colors duration-300 group-hover:bg-accent">
                <Icon size={18} strokeWidth={2} />
              </span>
              <span className="font-mono text-xs text-muted">0{i + 1}</span>
            </div>
            <h3 className="mt-5 font-display text-2xl font-medium text-ink">
              {title}
            </h3>
            <p className="mt-2 leading-relaxed text-ink-soft">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
