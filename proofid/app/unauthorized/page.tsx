"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldOff, ArrowLeft, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";

export default function UnauthorizedPage() {
  const { walletAddress } = useWallet();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 text-center">
      {/* Background grid */}
      <div className="grid-pattern pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent)]" />

      {/* Red glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative flex flex-col items-center"
      >
        {/* Icon */}
        <motion.div
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-24 w-24 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400"
        >
          <ShieldOff className="h-10 w-10" />
        </motion.div>

        <h1 className="mt-8 font-display text-5xl font-semibold tracking-tight sm:text-6xl">
          <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
            Access Denied
          </span>
        </h1>

        <p className="mt-4 font-display text-lg font-medium text-foreground">
          Administrator privileges required.
        </p>
        <p className="mt-2 max-w-sm text-sm text-muted">
          The Admin Verification Portal is restricted to the designated
          university administrator wallet only.
        </p>

        {/* Current wallet info */}
        {walletAddress && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm max-w-md w-full"
          >
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-red-400 shrink-0" />
              <span className="text-muted">Connected Wallet:</span>
            </div>
            
            <div className="flex items-center gap-2 bg-black/40 rounded-lg p-2 border border-border-subtle w-full select-all font-mono text-xs text-red-300 break-all text-center justify-between">
              <span className="flex-1 font-data text-center select-all">{walletAddress}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(walletAddress);
                  alert("Wallet address copied to clipboard!");
                }}
                className="ml-2 p-1 hover:bg-white/10 rounded transition-colors text-muted hover:text-red-300"
                title="Copy Address"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 7v12a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-8a2 2 0 00-2 2zM8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h2" />
                </svg>
              </button>
            </div>

            <div className="text-[11px] text-muted-foreground mt-1 border-t border-red-500/10 pt-2 w-full text-left">
              <p className="font-semibold text-foreground/80 mb-1">To enable Admin access:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Copy the address above.</li>
                <li>Open <code className="bg-white/5 px-1 rounded">.env.local</code> in your project.</li>
                <li>Set <code className="bg-white/5 px-1 rounded text-red-300">ADMIN_WALLET={walletAddress}</code>.</li>
              </ol>
            </div>
          </motion.div>
        )}

        <div className="mt-8 flex gap-3">
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">My Dashboard</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
