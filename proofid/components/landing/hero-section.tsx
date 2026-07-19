"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@/components/web3/connect-button";
import { CredentialCard } from "@/components/shared/credential-card";
import { useWallet } from "@/hooks/use-wallet";
import { useProfileExists } from "@/hooks/contracts/use-profile-exists";
import Link from "next/link";

export function HeroSection() {
  const router = useRouter();
  const { isConnected } = useWallet();
  const { exists, isLoading } = useProfileExists();

  // After wallet connects, redirect based on profile existence
  useEffect(() => {
    if (isConnected && !isLoading && exists !== undefined) {
      if (exists) {
        router.push("/dashboard");
      } else {
        router.push("/create-profile");
      }
    }
  }, [isConnected, exists, isLoading, router]);

  return (
    <section className="relative overflow-hidden">
      <div className="grid-pattern pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:py-32">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs text-primary-2"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Decentralized Student Identity on Polygon Amoy
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
          >
            <span className="text-gradient">Own Your</span>
            <br />
            Student Identity
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-md text-base leading-relaxed text-muted"
          >
            CredChain turns your degrees, projects and achievements into a
            single portable credential — secure, shareable, and verified
            on-chain.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <ConnectButton size="lg" />
            <Button size="lg" variant="secondary" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex items-center gap-6 text-xs text-muted"
          >
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-verified" /> Secure
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-2" /> Shareable
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Blockchain Verified
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="flex justify-center lg:justify-end"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <CredentialCard />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
