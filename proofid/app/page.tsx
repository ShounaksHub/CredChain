"use client";

import {
  ShieldCheck,
  Share2,
  Link2,
  Fingerprint,
  FileCheck2,
  Wallet,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { FeatureCard } from "@/components/landing/feature-card";
import { SectionHeading } from "@/components/shared/section-heading";

const features = [
  {
    icon: ShieldCheck,
    title: "Verifiable by design",
    description:
      "Every credential is structured to be independently checked — no phone calls to a registrar required.",
  },
  {
    icon: Share2,
    title: "One link, every credential",
    description:
      "Share a single profile that carries your degrees, projects and achievements together.",
  },
  {
    icon: Link2,
    title: "Portable across platforms",
    description:
      "Your identity isn't locked to one university portal or job board — it travels with you.",
  },
  {
    icon: Fingerprint,
    title: "You hold the record",
    description: "Built to be owned by the student first, institutions second.",
  },
  {
    icon: FileCheck2,
    title: "Tamper-evident history",
    description:
      "Changes to your credentials are traceable, so what you show is what you earned.",
  },
  {
    icon: Wallet,
    title: "Wallet ready",
    description:
      "Structured to connect to a wallet and ledger when the blockchain layer ships.",
  },
];

const steps = [
  {
    title: "Build your profile",
    description:
      "Add your university, skills, projects and achievements to a single CredChain profile.",
  },
  {
    title: "Get credentials verified",
    description:
      "Achievements are checked and marked as verified, ready to be trusted at a glance.",
  },
  {
    title: "Share anywhere",
    description:
      "Send recruiters and collaborators one link — or a QR code — to your full credential.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />

        <section id="features" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <SectionHeading
            eyebrow="Why CredChain"
            title="Identity built for how students actually work"
            description="Less paperwork, more proof. CredChain packages what you've built into a credential that speaks for itself."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} index={i} />
            ))}
          </div>
        </section>

        <section id="how-it-works" className="border-t border-border-subtle">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
            <SectionHeading
              eyebrow="Process"
              title="From profile to verified proof"
              description="Three steps, in the order they actually happen for a student."
            />

            <div className="relative mt-14 grid gap-10 md:grid-cols-3">
              <div className="absolute left-0 right-0 top-6 hidden h-px bg-border-subtle md:block" />
              {steps.map((step, i) => (
                <div key={step.title} className="relative">
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-border-subtle bg-surface font-display text-sm font-semibold text-primary-2">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
