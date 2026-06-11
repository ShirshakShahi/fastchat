import { Angry, Heart, HeartCrack, Laugh, PartyPopper } from "lucide-react";

export const reactions = [
  { id: "haha", emoji: Laugh, color: "text-amber-500" },
  { id: "sad", emoji: HeartCrack, color: "text-sky-500" },
  { id: "party", emoji: PartyPopper, color: "text-fuchsia-500" },
  { id: "like", emoji: Heart, color: "text-rose-500" },
  { id: "angry", emoji: Angry, color: "text-red-600" },
];

export function getColor(id: string): string {
  return reactions.find((r) => r.id === id)?.color ?? "text-ink-soft";
}
