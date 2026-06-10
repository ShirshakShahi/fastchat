import { Link } from "react-router";

export function Brand({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`group flex items-center gap-2.5 ${className}`}>
      <span className="grid size-8 place-items-center rounded-[10px] bg-ink text-paper transition-transform duration-300 group-hover:-rotate-6">
        <span className="font-display text-lg font-semibold leading-none">
          f
        </span>
      </span>
      <span className="font-display text-[1.35rem] font-semibold tracking-tight text-ink">
        FastChat
      </span>
    </Link>
  );
}
