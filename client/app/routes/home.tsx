import { Navbar } from "../components/landing/Navbar";
import { Hero } from "../components/landing/Hero";
import { Features } from "../components/landing/Features";
import { BigType } from "../components/landing/BigType";
import { Footer } from "../components/landing/Footer";

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
