"use client";

import { use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, Share2, ShieldCheck, Wallet, AlertCircle, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SkillBadge } from "@/components/shared/skill-badge";
import { ProjectCard } from "@/components/shared/project-card";
import { AchievementCard } from "@/components/shared/achievement-card";
import { SocialCard } from "@/components/shared/social-card";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { useResolveUsername } from "@/hooks/contracts/use-resolve-username";
import { useProfile } from "@/hooks/contracts/use-profile";
import { useWallet } from "@/hooks/use-wallet";
import { formatAddress } from "@/utils/web3";
import { toast } from "@/hooks/use-toast";
import type { Skill, SocialLink, Project, Achievement } from "@/types";

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const { walletAddress: viewerWallet } = useWallet();
  const { walletAddress: profileWallet, isLoading: resolving, isNotFound } =
    useResolveUsername(username);
  const {
    profile,
    offChainData: offChain,
    isLoading: loadingProfile,
    isProfileMissing,
    isHashVerified,
  } = useProfile(profileWallet ?? undefined);

  const isLoading = resolving || loadingProfile;
  const isOwner =
    viewerWallet &&
    profileWallet &&
    viewerWallet.toLowerCase() === profileWallet.toLowerCase();

  // ── Not found state ──
  if (!isLoading && (isNotFound || isProfileMissing || (!profile && !resolving))) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 flex-col items-center justify-center px-5 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h1 className="mt-6 font-display text-2xl font-semibold">
              Profile Not Found
            </h1>
            <p className="mt-2 max-w-sm text-sm text-muted">
              No profile exists for @{username}. The user may not have created
              their CredChain profile yet.
            </p>
            <Button asChild className="mt-6">
              <Link href="/">Back to Home</Link>
            </Button>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Fallback if IPFS fails ──
  if (!isLoading && profile && !offChain) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 flex-col items-center justify-center px-5 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h1 className="mt-6 font-display text-2xl font-semibold">
              Profile unavailable
            </h1>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Please try again later.
            </p>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-2" />
        </main>
        <Footer />
      </div>
    );
  }

  // ── Display values ──
  const displayName = profile?.fullName ?? offChain?.fullName ?? "Unknown";
  const displayDepartment = profile?.department ?? offChain?.department ?? "";
  const displayUniversity = profile?.university ?? offChain?.university ?? "";
  const displayBio = offChain?.bio ?? "";
  const isVerified = profile?.isVerified ?? false;
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Build typed arrays for existing components
  const skills: Skill[] = (offChain?.skills ?? []).map((name) => ({ name }));

  const projects: Project[] = (offChain?.projects ?? []).map((p, i) => ({
    id: `proj-${i}`,
    title: p.title,
    description: p.description,
    tags: p.tags,
    status: "Live" as const,
  }));

  const achievements: Achievement[] = (offChain?.achievements ?? []).map(
    (a, i) => ({
      id: `ach-${i}`,
      title: a.title,
      issuer: a.issuer,
      date: a.date,
      verified: isVerified,
    })
  );

  const socials: SocialLink[] = [];
  if (offChain?.socials?.github)
    socials.push({
      platform: "GitHub",
      url: offChain.socials.github,
      handle: offChain.socials.github.replace("https://github.com/", "@"),
    });
  if (offChain?.socials?.linkedin)
    socials.push({
      platform: "LinkedIn",
      url: offChain.socials.linkedin,
      handle: offChain.socials.linkedin
        .replace("https://linkedin.com/in/", "")
        .replace("https://www.linkedin.com/in/", ""),
    });
  if (offChain?.socials?.portfolio)
    socials.push({
      platform: "Portfolio",
      url: offChain.socials.portfolio,
      handle: offChain.socials.portfolio
        .replace("https://", "")
        .replace("http://", ""),
    });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="grid-pattern pointer-events-none absolute inset-x-0 top-16 h-72 [mask-image:linear-gradient(to_bottom,black,transparent)]" />

        <div className="relative mx-auto max-w-5xl px-5 py-12 sm:px-8">
          {/* ── Profile header ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="holo-border relative overflow-hidden">
              <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
              <CardContent className="relative flex flex-col gap-8 p-7 sm:p-9 md:flex-row md:items-start md:justify-between">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <Avatar className="h-24 w-24 border border-white/10 sm:h-28 sm:w-28">
                    <AvatarFallback className="text-3xl">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="font-display text-2xl font-semibold sm:text-3xl">
                        {displayName}
                      </h1>
                      {isVerified && (
                        <Badge variant="verified">
                          <ShieldCheck className="h-3.5 w-3.5" /> Verified
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-primary-2">@{username}</p>
                    <p className="mt-1 text-sm text-muted">{displayDepartment}</p>
                    <p className="text-sm text-muted">{displayUniversity}</p>
                    {profileWallet && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                        <Wallet className="h-3.5 w-3.5" />{" "}
                        {formatAddress(profileWallet)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3 sm:items-end">
                  {isOwner ? (
                    <Button size="sm" variant="secondary" asChild>
                      <Link href="/profile/edit">Edit Profile</Link>
                    </Button>
                  ) : (
                    <div className="rounded-lg border border-border-subtle bg-white/[0.02] px-3 py-2 text-xs text-muted">
                      This profile belongs to another wallet.
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      toast({
                        title: "Link copied!",
                        description: "Profile URL copied to clipboard.",
                      });
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                    Share Profile
                  </Button>
                </div>
              </CardContent>

              {displayBio && (
                <CardContent className="relative border-t border-border-subtle pt-6">
                  <p className="max-w-2xl text-sm leading-relaxed text-muted">
                    {displayBio}
                  </p>
                </CardContent>
              )}

              {/* Profile hash display */}
              {profile?.profileHash && (
                <CardContent className="relative border-t border-border-subtle pt-4 pb-5 flex flex-wrap items-center justify-between gap-4">
                  <p className="flex items-center gap-2 text-xs text-muted">
                    <span className="font-medium">Profile Hash:</span>
                    <span className="font-data break-all">
                      {profile.profileHash.slice(0, 18)}...
                      {profile.profileHash.slice(-12)}
                    </span>
                  </p>
                  {isHashVerified === true && (
                    <Badge variant="verified" className="text-xs bg-verified/15 text-verified border-verified/30">
                      Verified
                    </Badge>
                  )}
                  {isHashVerified === false && (
                    <Badge variant="warn" className="text-xs bg-destructive/15 text-destructive border-destructive/30">
                      Data Integrity Failed
                    </Badge>
                  )}
                </CardContent>
              )}
            </Card>
          </motion.div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-6 lg:col-span-2">
              {/* ── Skills ── */}
              {skills.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Skills</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <SkillBadge key={skill.name} skill={skill} />
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* ── Projects ── */}
              {projects.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Projects</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                      {projects.map((p) => (
                        <ProjectCard key={p.id} project={p} />
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* ── Achievements ── */}
              {achievements.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Achievements</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-2">
                      {achievements.map((a) => (
                        <AchievementCard key={a.id} achievement={a} />
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            <div className="flex flex-col gap-6">
              {/* ── Social Links ── */}
              {socials.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Social Links</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2.5">
                      {socials.map((s) => (
                        <SocialCard key={s.platform} social={s} />
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* ── Verification ── */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Verification</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <ShieldCheck
                        className={`h-4 w-4 ${
                          isVerified ? "text-verified" : "text-muted"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          isVerified ? "text-verified" : "text-muted"
                        }`}
                      >
                        {isVerified ? "Verified on-chain" : "Not yet verified"}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted">
                      {isVerified
                        ? "This credential has been verified by the contract owner."
                        : "This profile has not yet been verified by an authority."}
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-4 w-full"
                      asChild
                    >
                      <Link href="/verify">View Verification Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
