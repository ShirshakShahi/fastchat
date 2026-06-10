import { Navbar } from "../components/landing/Navbar";
import { Hero } from "../components/landing/Hero";
import { Features } from "../components/landing/Features";
import { BigType } from "../components/landing/BigType";
import { Footer } from "../components/landing/Footer";
import { buildMeta } from "../lib/seo";

export function meta() {
  return buildMeta({
    description:
      "Create a real-time chat space in one click. You're the admin: approve who comes in, remove who shouldn't be there. No accounts, no sign-up — just share a code.",
  });
}

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Navbar />
      <Hero />
      <Features />
      <BigType />
      <Footer />
    </main>
  );
}
