import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { Brand } from "./Brand";

export function Navbar() {
  return (
    <header className="relative z-20 px-5 pt-5 sm:px-8">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <Brand />

        <div className="flex items-center gap-1">
          <a
            href="#features"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink sm:block"
          >
            Features
          </a>
          <Link
            to="/app"
            className="group ml-1 inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-all duration-200 hover:bg-accent active:scale-[0.97]"
          >
            Open app
            <ArrowUpRight
              size={15}
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>
      </nav>
    </header>
  );
}
