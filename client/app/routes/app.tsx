import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { ArrowUpRight, Plus, LogIn, Dices, ShieldCheck } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { buildMeta } from "../lib/seo";

export function meta() {
  return buildMeta({
    path: "/app",
    description:
      "Pick a display name, then spin up a fresh room or join one with a code. Whoever creates the room holds the keys.",
  });
}

const NAME_KEY = "fastchat:name";

const ADJECTIVES = [
  "indigo",
  "amber",
  "velvet",
  "quiet",
  "rapid",
  "lunar",
  "copper",
  "feral",
];
const NOUNS = ["otter", "ember", "comet", "harbor", "fox", "willow", "delta", "raven"];

function randomCode() {
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  const suffix = Math.random().toString(16).slice(2, 6);
  return `${pick(ADJECTIVES)}-${pick(NOUNS)}-${suffix}`;
}

export default function AppEntry() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  useEffect(() => {
    setName(localStorage.getItem(NAME_KEY) ?? "");
  }, []);

  const persistName = () => {
    const clean = name.trim();
    if (clean) localStorage.setItem(NAME_KEY, clean);
    return clean;
  };

  const createSpace = () => {
    persistName();
    navigate(`/space/${randomCode()}`);
  };

  const joinSpace = () => {
    const code = roomCode.trim().toLowerCase().replace(/\s+/g, "-");
    if (!code) {
      toast.error("Enter a room code to join");
      return;
    }
    persistName();
    navigate(`/space/${code}`);
  };

  return (
    <main className="relative min-h-screen px-5 py-6 sm:px-8">
      <header className="mx-auto flex max-w-5xl items-center justify-between">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-[10px] bg-ink text-paper transition-transform duration-300 group-hover:-rotate-6">
            <span className="font-display text-lg font-semibold leading-none">
              f
            </span>
          </span>
          <span className="font-display text-[1.35rem] font-semibold tracking-tight">
            FastChat
          </span>
        </Link>
        <Link
          to="/"
          className="rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-card hover:text-ink"
        >
          Back home
        </Link>
      </header>

      <section className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-10 lg:mt-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        {/* Left: intro + name */}
        <div className="rise">
          <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-card/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
            <ShieldCheck size={13} className="text-accent" />
            You'll be the admin
          </span>

          <h1 className="mt-6 font-display text-5xl font-light leading-[0.98] tracking-[-0.02em] sm:text-6xl">
            Pick a name,
            <br />
            <span className="italic text-accent">open the door.</span>
          </h1>

          <p className="mt-6 max-w-sm leading-relaxed text-ink-soft">
            Create a fresh space or drop into one with a code. Whoever makes the
            room holds the keys.
          </p>

          <label className="mt-9 block">
            <span className="mb-2 block text-sm font-medium text-ink-soft">
              Display name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              placeholder="e.g. gg.cipot"
              className="h-13 w-full rounded-2xl border border-line-strong bg-card px-4 text-ink outline-none transition-all duration-200 placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/10"
            />
            <span className="mt-2 block text-xs text-muted">
              Leave blank to chat as a guest.
            </span>
          </label>
        </div>

        {/* Right: create / join cards */}
        <div
          className="rise flex flex-col gap-4"
          style={{ animationDelay: "0.1s" }}
        >
          {/* Create */}
          <div className="rounded-[26px] border border-line bg-card p-6 shadow-[0_24px_60px_-40px_rgba(26,25,22,0.4)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-accent text-paper">
                  <Plus size={18} />
                </span>
                <div>
                  <h2 className="font-display text-xl font-medium">
                    Create a space
                  </h2>
                  <p className="text-sm text-muted">Fresh room, you in charge</p>
                </div>
              </div>
            </div>
            <button
              onClick={createSpace}
              className="group mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink cursor-pointer px-4 py-3.5 font-medium text-paper transition-all duration-200 hover:bg-accent active:scale-[0.985]"
            >
              <Dices size={17} />
              Generate room &amp; enter
              <ArrowUpRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </button>
          </div>

          {/* Join */}
          <div className="rounded-[26px] border border-line bg-card p-6 shadow-[0_24px_60px_-40px_rgba(26,25,22,0.4)]">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-paper-2 text-ink">
                <LogIn size={18} />
              </span>
              <div>
                <h2 className="font-display text-xl font-medium">
                  Join with a code
                </h2>
                <p className="text-sm text-muted">
                  You'll wait for the admin's ok
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && joinSpace()}
                placeholder="indigo-otter-9f2c"
                className="h-12 flex-1 rounded-2xl border border-line-strong bg-paper px-4 font-mono text-sm text-ink outline-none transition-all duration-200 placeholder:text-muted focus:border-accent focus:bg-card focus:ring-4 focus:ring-accent/10"
              />
              <button
                onClick={joinSpace}
                className="rounded-2xl border border-line-strong bg-card px-6 py-3 font-medium text-ink transition-all duration-200 hover:bg-paper-2 active:scale-[0.985] cursor-pointer"
              >
                Join
              </button>
            </div>
          </div>

          <p className="px-1 text-center text-xs text-muted">
            Rooms live in memory and vanish when everyone leaves.
          </p>
        </div>
      </section>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        theme="light"
      />
    </main>
  );
}
