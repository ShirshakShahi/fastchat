import { Link } from "react-router";
import { Brand } from "./Brand";

export function Footer() {
  return (
    <footer className="relative z-10 mx-auto max-w-6xl px-5 pb-10 pt-16 sm:px-8">
      <div className="rule mb-7" />
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <Brand />
        <p className="font-mono text-xs text-muted">
          © {new Date().getFullYear()} FastChat — talk fast, stay in control.
        </p>
        <div className="flex items-center gap-4 text-sm text-ink-soft">
          <a href="#features" className="transition-colors hover:text-ink">
            Features
          </a>
          <Link to="/app" className="transition-colors hover:text-ink">
            Launch
          </Link>
        </div>
      </div>
    </footer>
  );
}
