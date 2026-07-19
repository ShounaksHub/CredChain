"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  FolderGit2,
  Award,
  ShieldCheck,
  Settings,
  LogOut,
  Fingerprint,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { WalletStatusCard } from "@/components/web3/wallet-status-card";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { useWallet } from "@/hooks/use-wallet";
import { useProfile } from "@/hooks/contracts/use-profile";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile/edit", label: "Profile", icon: User },
  { href: "/dashboard#projects", label: "Projects", icon: FolderGit2 },
  { href: "/dashboard#achievements", label: "Achievements", icon: Award },
  { href: "/verify", label: "Verification", icon: ShieldCheck },
  { href: "/dashboard#settings", label: "Settings", icon: Settings },
];

export function Sidebar({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { disconnectWallet, walletAddress } = useWallet();
  const { profile, offChainData: offChain, isLoading } = useProfile();

  useEffect(() => {
    setMounted(true);
  }, []);

  const showSkeleton = !mounted || isLoading;

  const displayName = profile?.fullName ?? offChain?.fullName ?? "Student";
  const displayDepartment = profile?.department ?? offChain?.department ?? "";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      className={cn(
        "glass flex h-full w-64 shrink-0 flex-col border-r border-border-subtle bg-surface/30 px-4 py-6 backdrop-blur-xl",
        className
      )}
    >
      <Link href="/" className="flex items-center gap-2 px-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/20">
          <Fingerprint className="h-4.5 w-4.5" />
        </span>
        <span className="font-display text-[15px] font-semibold tracking-wide">CredChain</span>
      </Link>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const active = pathname === item.href.split("#")[0];
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
                active
                  ? "text-primary-2"
                  : "text-muted hover:text-foreground"
              )}
            >
              {active && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute inset-0 rounded-xl bg-primary/15 border border-primary/20"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              {!active && (
                <div className="absolute inset-0 rounded-xl bg-white/[0.04] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              )}
              <Icon className="relative z-10 h-4.5 w-4.5" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={disconnectWallet}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-white/[0.04] hover:text-foreground"
      >
        <LogOut className="h-4.5 w-4.5" />
        Disconnect
      </button>

      <div className="mt-4">
        <WalletStatusCard />
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-xl border border-border-subtle bg-white/[0.02] p-3">
        {showSkeleton ? (
          <>
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          </>
        ) : (
          <>
            <Avatar className="h-9 w-9">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-foreground">
                {displayName}
              </p>
              <p className="truncate text-[11px] text-muted">
                {displayDepartment}
              </p>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
