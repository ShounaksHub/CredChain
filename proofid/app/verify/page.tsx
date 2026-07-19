"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Hash,
  Layers,
  Network,
  ShieldCheck,
  ShieldOff,
  Wallet,
  Loader2,
  FileCode2,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { VerificationCard } from "@/components/shared/verification-card";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { useVerification } from "@/hooks/contracts/use-verification";
import { useWallet } from "@/hooks/use-wallet";
import { PROOFID_REGISTRY_ADDRESS } from "@/lib/contracts/config";

export default function VerifyPage() {
  const { isConnected } = useWallet();
  const { verification, isLoading, isProfileMissing } = useVerification();

  const isVerified = verification?.isVerified ?? false;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center text-center"
          >
            {isLoading ? (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.05]">
                <Loader2 className="h-8 w-8 animate-spin text-muted" />
              </div>
            ) : (
              <motion.div
                animate={{
                  boxShadow: isVerified
                    ? [
                        "0 0 0 0 rgba(52,211,153,0.35)",
                        "0 0 0 14px rgba(52,211,153,0)",
                      ]
                    : [
                        "0 0 0 0 rgba(255,255,255,0.1)",
                        "0 0 0 14px rgba(255,255,255,0)",
                      ],
                }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className={`flex h-16 w-16 items-center justify-center rounded-full ${
                  isVerified
                    ? "bg-verified/10 text-verified"
                    : "bg-white/[0.05] text-muted"
                }`}
              >
                {isVerified ? (
                  <ShieldCheck className="h-8 w-8" />
                ) : (
                  <ShieldOff className="h-8 w-8" />
                )}
              </motion.div>
            )}

            <h1 className="mt-6 font-display text-2xl font-semibold sm:text-3xl">
              {isLoading
                ? "Checking Verification..."
                : isProfileMissing
                  ? "No Profile Found"
                  : isVerified
                    ? "Credential Verified"
                    : "Not Yet Verified"}
            </h1>
            <p className="mt-2 max-w-md text-sm text-muted">
              {isLoading
                ? "Reading verification status from the blockchain..."
                : isProfileMissing
                  ? "Connect your wallet and create a profile first."
                  : isVerified
                    ? `This record for ${verification?.walletAddress ? verification.walletAddress.slice(0, 6) + "..." + verification.walletAddress.slice(-4) : "this wallet"} has been verified on-chain.`
                    : "This profile exists on-chain but has not been verified by an authority yet."}
            </p>
          </motion.div>

          {/* ── Verification details ── */}
          {!isProfileMissing && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-10"
            >
              <Card className="overflow-hidden">
                <div
                  className={`flex items-center justify-between gap-3 border-b border-border-subtle px-6 py-4 ${
                    isVerified
                      ? "bg-verified/[0.06]"
                      : "bg-white/[0.02]"
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 text-sm font-medium ${
                      isVerified ? "text-verified" : "text-muted"
                    }`}
                  >
                    {isVerified ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <ShieldOff className="h-4 w-4" />
                    )}
                    Status: {isVerified ? "Verified" : "Not Verified"}
                  </div>
                  {verification?.createdAt && (
                    <span className="font-data text-xs text-muted">
                      Created {verification.createdAt}
                    </span>
                  )}
                </div>
                <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </>
                  ) : verification ? (
                    <>
                      <VerificationCard
                        icon={Wallet}
                        label="Wallet Address"
                        value={verification.walletAddress}
                        mono
                      />
                      <VerificationCard
                        icon={Hash}
                        label="Profile Hash"
                        value={verification.profileHash}
                        mono
                      />
                      <VerificationCard
                        icon={Network}
                        label="Network"
                        value={verification.network}
                      />
                      <VerificationCard
                        icon={FileCode2}
                        label="Contract Address"
                        value={PROOFID_REGISTRY_ADDRESS}
                        mono
                      />
                    </>
                  ) : null}
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 text-center text-xs text-muted"
          >
            {isConnected
              ? "Verification data is read live from the Polygon Amoy blockchain."
              : "Connect your wallet to see your verification status."}
          </motion.p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
