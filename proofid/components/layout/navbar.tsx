"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, Github, Menu, X } from "lucide-react";
import { WalletMenu } from "@/components/web3/wallet-menu";
import { WrongNetworkBanner } from "@/components/web3/wrong-network-banner";
import { useWallet } from "@/hooks/use-wallet";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it Works" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { isConnected } = useWallet();

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white">
            <Fingerprint className="h-4.5 w-4.5" />
          </span>
          <span className="font-display text-[15px] font-semibold tracking-tight">
            CredChain
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
          <a
            href="https://github.com/ShounaksHub/CredChain"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        </div>

        <div className="hidden md:block">
          <WalletMenu />
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border-subtle md:hidden"
          >
            <div className="flex flex-col gap-4 px-5 py-5">
              {links.map((l) => (
                <a key={l.href} href={l.href} className="text-sm text-muted" onClick={() => setOpen(false)}>
                  {l.label}
                </a>
              ))}
              <WalletMenu />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isConnected && (
        <div className="mx-auto max-w-6xl px-5 pb-3 sm:px-8">
          <WrongNetworkBanner />
        </div>
      )}
    </header>
  );
}
