import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";

export function BigType() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <div className="rule mb-8" />
      <div className="flex flex-col items-center gap-6 text-center">
        <p className="max-w-xl text-lg text-ink-soft">
          Stop wrangling group chats. Start a space, hold the door, and keep the
          conversation yours.
        </p>
        <Link
          to="/app"
          className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-medium text-paper transition-all duration-200 hover:bg-accent active:scale-[0.98]"
        >
          Open the app
          <ArrowUpRight
            size={18}
            className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </div>
    </section>
  );
}
