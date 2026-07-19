"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Fingerprint, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 text-center">
      <div className="grid-pattern pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative flex flex-col items-center"
      >
        <motion.div
          animate={{ rotate: [0, 6, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="holo-border glass flex h-24 w-24 items-center justify-center rounded-2xl text-primary-2"
        >
          <Fingerprint className="h-10 w-10" />
        </motion.div>

        <h1 className="mt-8 font-display text-6xl font-semibold tracking-tight sm:text-7xl">
          <span className="text-gradient">404</span>
        </h1>
        <p className="mt-3 font-display text-lg font-medium text-foreground">
          This credential doesn&apos;t exist.
        </p>
        <p className="mt-2 max-w-sm text-sm text-muted">
          The page you&apos;re looking for may have moved, or the link you followed is out of date.
        </p>

        <Button asChild size="lg" className="mt-8">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
