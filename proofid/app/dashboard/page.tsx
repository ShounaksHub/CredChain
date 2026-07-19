"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Award,
  FolderGit2,
  ShieldCheck,
  Sparkles,
  Loader2,
  Wallet,
  Hash,
  CheckCircle2,
  XCircle,
  Globe,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WalletCard } from "@/components/dashboard/wallet-card";
import { ProjectCard } from "@/components/shared/project-card";
import { AchievementCard } from "@/components/shared/achievement-card";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { useWallet } from "@/hooks/use-wallet";
import { useProfile } from "@/hooks/contracts/use-profile";
import { useProfileExists } from "@/hooks/contracts/use-profile-exists";
import { cn } from "@/lib/utils";
import { formatAddress } from "@/utils/web3";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { isConnected, walletAddress } = useWallet();
  const { exists, isLoading: checkingExists } = useProfileExists();
  const { profile, offChainData: offChain, isLoading: loadingProfile, isHashVerified } = useProfile();

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Guards ──
  useEffect(() => {
    if (mounted && !isConnected) {
      router.push("/");
    }
  }, [isConnected, router, mounted]);

  useEffect(() => {
    if (mounted && !checkingExists && exists === false) {
      router.push("/create-profile");
    }
  }, [checkingExists, exists, router, mounted]);

  const isLoading = checkingExists || loadingProfile;

  if (!mounted) return null;

  // ── Compute display values ──
  const displayName = profile?.fullName ?? offChain?.fullName ?? "Student";
  const displayUsername = offChain?.username ?? "";
  const displayUniversity = profile?.university ?? offChain?.university ?? "";
  const displayDepartment = profile?.department ?? offChain?.department ?? "";
  const displayYear = profile?.graduationYear
    ? String(profile.graduationYear)
    : offChain?.graduationYear ?? "";
  const isVerified = profile?.isVerified ?? false;

  // Profile completion based on real data
  const completionChecks = [
    { label: "Basic Info", done: !!profile?.fullName },
    { label: "Skills", done: (offChain?.skills?.length ?? 0) > 0 },
    { label: "Achievements", done: (offChain?.achievements?.length ?? 0) > 0 },
    { label: "On-Chain", done: !!profile },
  ];
  const profileCompletion = Math.round(
    (completionChecks.filter((c) => c.done).length / completionChecks.length) *
      100
  );

  // Projects & achievements from localStorage
  const projects = (offChain?.projects ?? []).map((p, i) => ({
    id: `proj-${i}`,
    title: p.title,
    description: p.description,
    tags: p.tags,
    status: "Live" as const,
  }));

  const achievements = (offChain?.achievements ?? []).map((a, i) => ({
    id: `ach-${i}`,
    title: a.title,
    issuer: a.issuer,
    date: a.date,
    verified: isVerified,
  }));

  // Stat cards derived from real data
  const statCards = [
    {
      label: "Skills",
      value: offChain?.skills?.length ?? 0,
      icon: CheckCircle2,
    },
    { label: "Projects", value: projects.length, icon: FolderGit2 },
    { label: "Achievements", value: achievements.length, icon: Award },
    {
      label: "Verification",
      value: isVerified ? "Yes" : "No",
      icon: ShieldCheck,
    },
  ];

  if (!isConnected) return null;

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        {/* ── Welcome banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="relative overflow-hidden">
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
            <CardContent className="relative flex flex-col items-start justify-between gap-6 p-7 sm:flex-row sm:items-center">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-primary-2">
                  <Sparkles className="h-3.5 w-3.5" /> Welcome back
                </p>
                {isLoading ? (
                  <Skeleton className="mt-3 h-8 w-64" />
                ) : (
                  <>
                    <h1 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
                      {displayName.split(" ")[0]}, your identity is{" "}
                      {profileCompletion}% ready.
                    </h1>
                    {displayUsername && (
                      <p className="mt-1 text-sm text-primary-2">
                        @{displayUsername}
                      </p>
                    )}
                  </>
                )}
                <p className="mt-2 max-w-lg text-sm text-muted">
                  {profile
                    ? "Your profile is anchored on-chain. Update it anytime."
                    : "Finish your profile to make your credential fully shareable and verification-ready."}
                </p>
              </div>
              <Button asChild size="lg">
                <Link href="/profile/edit">
                  {profile ? "Edit Profile" : "Complete Profile"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* ── Stat cards ── */}
            <motion.div
              className="grid grid-cols-2 gap-4 sm:grid-cols-4"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              initial="hidden"
              animate="show"
            >
              {statCards.map((s, i) => (
                <motion.div
                  key={s.label}
                  variants={{
                    hidden: { opacity: 0, scale: 0.9, y: 15 },
                    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                  }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <Card className="p-4 h-full">
                    <s.icon className="h-4 w-4 text-primary-2" />
                    {isLoading ? (
                      <Skeleton className="mt-3 h-6 w-12" />
                    ) : (
                      <p className="mt-3 font-display text-xl font-semibold">
                        {typeof s.value === "number"
                          ? s.value.toLocaleString()
                          : s.value}
                      </p>
                    )}
                    <p className="text-xs text-muted">{s.label}</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* ── Profile Status ── */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {completionChecks.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center gap-2 rounded-lg border border-border-subtle bg-white/[0.02] px-3 py-2 text-xs"
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              item.done ? "bg-verified" : "bg-white/20"
                            )}
                          />
                          <span
                            className={
                              item.done ? "text-foreground" : "text-muted"
                            }
                          >
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* On-chain info */}
                    {profile && (
                      <div className="mt-4 grid gap-3 rounded-xl border border-border-subtle bg-white/[0.02] p-4 sm:grid-cols-2">
                        <div className="flex items-center gap-2 text-xs">
                          <Wallet className="h-3.5 w-3.5 text-primary-2" />
                          <span className="text-muted">Wallet:</span>
                          <span className="font-data text-foreground">
                            {formatAddress(walletAddress)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Globe className="h-3.5 w-3.5 text-primary-2" />
                          <span className="text-muted">Network:</span>
                          <span className="text-foreground">Polygon Amoy</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <ShieldCheck className="h-3.5 w-3.5 text-primary-2" />
                          <span className="text-muted">Verified:</span>
                          <Badge
                            variant={isVerified ? "verified" : "muted"}
                            className="text-[10px]"
                          >
                            {isVerified ? "Verified" : "Not Verified"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs flex-wrap">
                          <Hash className="h-3.5 w-3.5 text-primary-2" />
                          <span className="text-muted">Hash:</span>
                          <span className="font-data truncate text-foreground mr-1">
                            {profile.profileHash.slice(0, 10)}...
                            {profile.profileHash.slice(-6)}
                          </span>
                          {isHashVerified === true && (
                            <Badge variant="verified" className="text-[9px] bg-verified/15 text-verified border-verified/30 py-0 px-1.5">
                              Verified
                            </Badge>
                          )}
                          {isHashVerified === false && (
                            <Badge variant="warn" className="text-[9px] bg-destructive/15 text-destructive border-destructive/30 py-0 px-1.5">
                              Data Integrity Failed
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* ── Projects ── */}
            <Card id="projects">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2">
                  <FolderGit2 className="h-4.5 w-4.5 text-primary-2" />{" "}
                  Projects
                </CardTitle>
                <Link
                  href="/profile/edit"
                  className="text-xs text-primary-2 hover:underline"
                >
                  Manage
                </Link>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {isLoading ? (
                  <>
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </>
                ) : projects.length > 0 ? (
                  projects.map((p) => <ProjectCard key={p.id} project={p} />)
                ) : (
                  <p className="col-span-2 text-sm text-muted">
                    No projects yet. Add some in your profile.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* ── Achievements ── */}
            <Card id="achievements">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-4.5 w-4.5 text-primary-2" />{" "}
                  Achievements
                </CardTitle>
                <Link
                  href="/profile/edit"
                  className="text-xs text-primary-2 hover:underline"
                >
                  Manage
                </Link>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {isLoading ? (
                  <>
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </>
                ) : achievements.length > 0 ? (
                  achievements.map((a) => (
                    <AchievementCard key={a.id} achievement={a} />
                  ))
                ) : (
                  <p className="col-span-2 text-sm text-muted">
                    No achievements yet. Add some in your profile.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            <WalletCard />

            {/* ── Quick Links ── */}
            <Card id="settings">
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {displayUsername ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <Link href={`/u/${displayUsername}`}>
                      View Public Profile
                    </Link>
                  </Button>
                ) : (
                  <p className="text-sm text-muted">
                    Create a username to get your public profile link.
                  </p>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  asChild
                >
                  <Link href="/verify">View Verification</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
