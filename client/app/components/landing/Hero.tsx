import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { HeroMock } from "./HeroMock";

export function Hero() {
  return (
    <section className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-5 pb-24 pt-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pt-24">
      <div className="rise">
        <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-card/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
          <span className="size-1.5 rounded-full bg-accent" />
          Real-time, no sign-up
        </span>

        <h1 className="mt-6 font-display text-[3.4rem] font-light leading-[0.95] tracking-[-0.02em] text-ink sm:text-7xl">
          Rooms you
          <br />
          actually
          <span className="relative ml-3 inline-block italic text-accent">
            control
            <svg
              viewBox="0 0 200 12"
              className="absolute -bottom-1 left-0 w-full text-accent/50"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M2 8C40 3 120 3 198 7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          .
        </h1>

        <p className="mt-7 max-w-md text-lg leading-relaxed text-ink-soft">
          Spin up a space in one click. You're the admin — approve who comes in,
          remove who shouldn't be there. Share a code and start talking.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link
            to="/app"
            className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 font-medium text-paper shadow-[0_8px_24px_-8px_rgba(224,70,29,0.6)] transition-all duration-200 hover:bg-accent-ink active:scale-[0.98]"
          >
            Create a space
            <ArrowUpRight
              size={18}
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
          <a
            href="#features"
            className="rounded-full border border-line-strong px-6 py-3.5 font-medium text-ink transition-colors hover:bg-card"
          >
            How it works
          </a>
        </div>

        <p className="mt-6 font-mono text-xs text-muted">
          fastchat.app/space/<span className="text-ink">indigo-otter-9f2c</span>
        </p>
      </div>

      <HeroMock />
    </section>
  );
}
