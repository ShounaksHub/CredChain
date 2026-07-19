"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSignMessage } from "wagmi";
import {
  ShieldCheck,
  ShieldOff,
  Clock,
  Users,
  Search,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChevronRight,
  Fingerprint,
  AlertTriangle,
  User,
  Building2,
  BookOpen,
  Calendar,
  Wallet,
  Hash,
  TrendingUp,
  Eye,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/hooks/use-wallet";
import { useProfile } from "@/hooks/contracts/use-profile";
import { useAdminActions } from "@/hooks/contracts/use-admin-actions";
import { cn } from "@/lib/utils";
import { formatAddress } from "@/utils/web3";
import { PROOFID_REGISTRY_ADDRESS } from "@/lib/contracts/config";

// ── Types ──────────────────────────────────────────────────────────────

interface StudentEntry {
  cid: string;
  walletAddress: string;
  username: string;
  pinnedAt: string;
  // filled after fetching IPFS content:
  fullName?: string;
  university?: string;
  department?: string;
  graduationYear?: string;
  // filled after reading on-chain:
  isVerified?: boolean | null;
  profileMissing?: boolean;
}

type Tab = "overview" | "pending" | "verified" | "rejected" | "search";

// ── Admin wallet guard ────────────────────────────────────────────────

// Removed hardcoded ADMIN_WALLET

// ── Helpers ───────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

// ── Sub-components ────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  active,
  onClick,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, translateY: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-2xl border p-5 transition-all duration-200",
        active
          ? "border-primary/40 bg-primary/10"
          : "border-border-subtle bg-surface/60 hover:border-white/20 hover:bg-surface"
      )}
    >
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 font-display text-3xl font-bold text-foreground">
        {value}
      </p>
      <p className="mt-0.5 text-sm text-muted">{label}</p>
    </motion.div>
  );
}

// ── Action modal ──────────────────────────────────────────────────────

function ActionModal({
  student,
  action,
  onClose,
  onSuccess,
}: {
  student: StudentEntry;
  action: "verify" | "remove";
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { verifyStudent, removeVerification, isPending, isConfirmed, writeError, reset } =
    useAdminActions();

  // Close on success after a short delay
  useEffect(() => {
    if (isConfirmed) {
      const t = setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [isConfirmed, onSuccess, onClose]);

  const handleAction = () => {
    if (action === "verify") {
      verifyStudent(student.walletAddress as `0x${string}`);
    } else {
      removeVerification(student.walletAddress as `0x${string}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={!isPending ? onClose : undefined}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md rounded-2xl border border-border-subtle bg-surface shadow-2xl"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                action === "verify"
                  ? "bg-verified/15 text-verified"
                  : "bg-red-500/15 text-red-400"
              )}
            >
              {action === "verify" ? (
                <ShieldCheck className="h-5 w-5" />
              ) : (
                <ShieldOff className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 className="font-display text-base font-semibold">
                {action === "verify" ? "Verify Student" : "Remove Verification"}
              </h3>
              <p className="text-xs text-muted">
                This will broadcast a transaction via MetaMask
              </p>
            </div>
          </div>

          {/* Student info */}
          <div className="rounded-xl border border-border-subtle bg-white/[0.02] p-4 space-y-2 text-sm mb-5">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-muted" />
              <span className="text-muted">Name:</span>
              <span className="font-medium">{student.fullName || "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted">@{student.username || "unknown"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="h-3.5 w-3.5 text-muted" />
              <span className="font-data text-xs text-primary-2">
                {student.walletAddress}
              </span>
            </div>
          </div>

          {/* Status */}
          <AnimatePresence mode="wait">
            {isConfirmed ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-xl border border-verified/30 bg-verified/10 px-4 py-3 text-sm text-verified mb-5"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Transaction confirmed! Closing…
              </motion.div>
            ) : writeError ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 mb-5"
              >
                <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="break-all">
                  {writeError.message?.slice(0, 120) || "Transaction failed"}
                </span>
              </motion.div>
            ) : isPending ? (
              <motion.div
                key="pending"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary-2 mb-5"
              >
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                Waiting for MetaMask confirmation…
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant={action === "verify" ? "default" : "destructive"}
              className="flex-1"
              onClick={handleAction}
              disabled={isPending || isConfirmed}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : action === "verify" ? (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Verify
                </>
              ) : (
                <>
                  <ShieldOff className="h-4 w-4" />
                  Remove
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Student row ───────────────────────────────────────────────────────

function StudentRow({
  student,
  index,
  onVerify,
  onRemove,
  onRefreshSingle,
}: {
  student: StudentEntry;
  index: number;
  onVerify: (s: StudentEntry) => void;
  onRemove: (s: StudentEntry) => void;
  onRefreshSingle: (walletAddress: string) => void;
}) {
  const contractAddress = PROOFID_REGISTRY_ADDRESS;
  const explorerBase = "https://amoy.polygonscan.com";

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="border-b border-border-subtle last:border-0 hover:bg-white/[0.02] transition-colors"
    >
      {/* Username */}
      <td className="px-4 py-4 text-sm">
        <div className="font-medium text-foreground">
          {student.username ? (
            <Link
              href={`/u/${student.username}`}
              className="hover:text-primary-2 transition-colors"
            >
              @{student.username}
            </Link>
          ) : (
            <span className="text-muted">—</span>
          )}
        </div>
      </td>

      {/* Full name */}
      <td className="px-4 py-4 text-sm">
        <span className="font-medium">{student.fullName || "—"}</span>
      </td>

      {/* Wallet */}
      <td className="px-4 py-4 text-sm">
        <a
          href={`${explorerBase}/address/${student.walletAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 font-data text-xs text-primary-2 hover:text-accent transition-colors"
        >
          {formatAddress(student.walletAddress as `0x${string}`)}
          <ExternalLink className="h-3 w-3" />
        </a>
      </td>

      {/* University */}
      <td className="px-4 py-4 text-sm text-muted">
        {student.university || "—"}
      </td>

      {/* Department */}
      <td className="px-4 py-4 text-sm text-muted">
        {student.department || "—"}
      </td>

      {/* Date */}
      <td className="px-4 py-4 text-sm text-muted">
        {fmtDate(student.pinnedAt)}
      </td>

      {/* Status */}
      <td className="px-4 py-4">
        {student.isVerified === null || student.isVerified === undefined ? (
          <Badge variant="muted">Unknown</Badge>
        ) : student.isVerified ? (
          <Badge variant="verified">
            <ShieldCheck className="h-3 w-3" />
            Verified
          </Badge>
        ) : (
          <Badge variant="warn">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          {/* View Profile */}
          {student.username && (
            <Button size="sm" variant="ghost" asChild className="h-8 px-2.5">
              <Link href={`/u/${student.username}`}>
                <Eye className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}

          {/* View on Blockchain */}
          <Button
            size="sm"
            variant="ghost"
            asChild
            className="h-8 px-2.5"
            title="View on blockchain"
          >
            <a
              href={`${explorerBase}/address/${student.walletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>

          {/* Verify */}
          {student.isVerified !== true && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 text-verified border-verified/30 hover:bg-verified/10"
              onClick={() => onVerify(student)}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Verify
            </Button>
          )}

          {/* Remove */}
          {student.isVerified === true && (
            <Button
              size="sm"
              variant="destructive"
              className="h-8 px-3"
              onClick={() => onRemove(student)}
            >
              <ShieldOff className="h-3.5 w-3.5" />
              Remove
            </Button>
          )}
        </div>
      </td>
    </motion.tr>
  );
}

// ── Main admin page ───────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const { isConnected, walletAddress } = useWallet();

  const { signMessageAsync } = useSignMessage();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    if (!walletAddress) {
      setIsCheckingAdmin(false);
      return;
    }
    setIsCheckingAdmin(true);
    fetch(`/api/auth/me?wallet=${walletAddress}`)
      .then((res) => res.json())
      .then((data) => {
        setIsAdmin(data.isAdmin);
        setIsCheckingAdmin(false);
      })
      .catch(() => {
        setIsAdmin(false);
        setIsCheckingAdmin(false);
      });
  }, [walletAddress]);

  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [students, setStudents] = useState<StudentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalStudent, setModalStudent] = useState<StudentEntry | null>(null);
  const [modalAction, setModalAction] = useState<"verify" | "remove">("verify");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auth guard
  useEffect(() => {
    if (!mounted || isCheckingAdmin) return;
    if (!isConnected) {
      router.push("/");
      return;
    }
    if (!isAdmin) {
      router.push("/unauthorized");
    }
  }, [mounted, isConnected, isAdmin, isCheckingAdmin, router]);

  // ── Fetch all students from Pinata ──
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!walletAddress) throw new Error("Wallet not connected");

      const timestamp = Date.now();
      const message = `Login to CredChain\nWallet: ${walletAddress.toLowerCase()}\nTimestamp: ${timestamp}`;
      const signature = await signMessageAsync({ message });

      const res = await fetch("/api/admin/students", {
        headers: {
          "x-wallet-address": walletAddress,
          "x-signature": signature,
          "x-timestamp": timestamp.toString(),
        },
        cache: "no-store",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to fetch students");
      }
      const { students: raw } = await res.json();

      // For each student, fetch off-chain profile + on-chain status in parallel
      const enriched: StudentEntry[] = await Promise.all(
        (raw as StudentEntry[]).map(async (s) => {
          let entry: StudentEntry = { ...s };

          // Fetch off-chain profile (IPFS)
          try {
            const ipfsRes = await fetch(`/api/ipfs/cat?cid=${s.cid}`);
            if (ipfsRes.ok) {
              const profile = await ipfsRes.json();
              entry.fullName = profile.fullName ?? profile.full_name ?? "";
              entry.university = profile.university ?? "";
              entry.department = profile.department ?? "";
              entry.graduationYear = profile.graduationYear ?? "";
            }
          } catch {
            // silently skip — data still shows from metadata
          }

          // Fetch on-chain verification status directly from contract
          // We do this via a raw RPC call to avoid react hook rules
          try {
            const chainRes = await fetch(
              `/api/admin/chain-status?wallet=${s.walletAddress}`,
              { cache: "no-store" }
            );
            if (chainRes.ok) {
              const { isVerified } = await chainRes.json();
              entry.isVerified = isVerified;
            }
          } catch {
            entry.isVerified = null;
          }

          return entry;
        })
      );

      setStudents(enriched);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchStudents();
    }
  }, [isAdmin, fetchStudents, refreshKey]);

  // ── Stats ──
  const stats = useMemo(() => {
    const total = students.length;
    const verified = students.filter((s) => s.isVerified === true).length;
    const pending = students.filter((s) => s.isVerified === false || s.isVerified === null).length;
    const rejected = 0; // Smart contract doesn't have a rejected state — pending = not verified
    return { total, verified, pending, rejected };
  }, [students]);

  // ── Filtering ──
  const filteredStudents = useMemo(() => {
    let list = students;

    // Tab filter
    if (tab === "pending") list = list.filter((s) => !s.isVerified);
    else if (tab === "verified") list = list.filter((s) => s.isVerified === true);
    else if (tab === "rejected") list = [];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.username?.toLowerCase().includes(q) ||
          s.walletAddress?.toLowerCase().includes(q) ||
          s.fullName?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [students, tab, searchQuery]);

  // ── Refresh single student on-chain status ──
  const handleRefreshSingle = useCallback(async (walletAddress: string) => {
    try {
      const chainRes = await fetch(
        `/api/admin/chain-status?wallet=${walletAddress}`,
        { cache: "no-store" }
      );
      if (chainRes.ok) {
        const { isVerified } = await chainRes.json();
        setStudents((prev) =>
          prev.map((s) =>
            s.walletAddress === walletAddress ? { ...s, isVerified } : s
          )
        );
      }
    } catch {
      // silent
    }
  }, []);

  const handleModalSuccess = useCallback(() => {
    if (modalStudent) {
      handleRefreshSingle(modalStudent.walletAddress);
    }
    setRefreshKey((k) => k + 1);
  }, [modalStudent, handleRefreshSingle]);

  if (!mounted || isCheckingAdmin || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-2" />
      </div>
    );
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "pending", label: "Pending", count: stats.pending },
    { id: "verified", label: "Verified", count: stats.verified },
    { id: "rejected", label: "Rejected", count: 0 },
    { id: "search", label: "Search" },
  ];

  const tableStudents =
    tab === "search" && !searchQuery.trim()
      ? []
      : filteredStudents;

  return (
    <>
      <DashboardShell>
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                    <ShieldCheck className="h-5 w-5 text-white" />
                  </div>
                  <h1 className="font-display text-2xl font-bold sm:text-3xl">
                    Admin Portal
                  </h1>
                  <Badge variant="accent" className="text-xs">
                    University Admin
                  </Badge>
                </div>
                <p className="text-sm text-muted mt-0.5">
                  Manage student identity verification on the CredChain network
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-border-subtle bg-white/[0.03] px-3 py-2 text-xs">
                  <Wallet className="h-3.5 w-3.5 text-primary-2" />
                  <span className="font-data text-muted">
                    {formatAddress(walletAddress as `0x${string}`)}
                  </span>
                  <Badge variant="verified" className="text-[10px] py-0 px-1.5">
                    Admin
                  </Badge>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRefreshKey((k) => k + 1)}
                  disabled={loading}
                  className="gap-2"
                >
                  <RefreshCw
                    className={cn("h-3.5 w-3.5", loading && "animate-spin")}
                  />
                  Refresh
                </Button>
              </div>
            </div>
          </motion.div>

          {/* ── Stats cards ── */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
            <StatCard
              label="Total Students"
              value={stats.total}
              icon={Users}
              color="bg-primary/15 text-primary-2"
              active={tab === "overview"}
              onClick={() => setTab("overview")}
            />
            <StatCard
              label="Pending"
              value={stats.pending}
              icon={Clock}
              color="bg-warn/15 text-warn"
              active={tab === "pending"}
              onClick={() => setTab("pending")}
            />
            <StatCard
              label="Verified"
              value={stats.verified}
              icon={ShieldCheck}
              color="bg-verified/15 text-verified"
              active={tab === "verified"}
              onClick={() => setTab("verified")}
            />
            <StatCard
              label="Rejected"
              value={stats.rejected}
              icon={ShieldOff}
              color="bg-red-500/15 text-red-400"
              active={tab === "rejected"}
              onClick={() => setTab("rejected")}
            />
          </div>

          {/* ── Tab navigation ── */}
          <div className="mb-6 flex items-center gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all",
                  tab === t.id
                    ? "bg-primary/10 text-primary-2"
                    : "text-muted hover:bg-white/[0.04] hover:text-foreground"
                )}
              >
                {t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      tab === t.id
                        ? "bg-primary/20 text-primary-2"
                        : "bg-white/10 text-muted"
                    )}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Search bar (visible on search tab or always) ── */}
          {(tab === "search" || tab === "overview") && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Search by username, wallet address, or name…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-border-subtle bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </motion.div>
          )}

          {/* ── Content ── */}
          {tab === "overview" && !searchQuery.trim() ? (
            /* Overview mode — show a summary + full table */
            <OverviewSection
              students={students}
              loading={loading}
              error={error}
              stats={stats}
              onVerify={(s) => { setModalStudent(s); setModalAction("verify"); }}
              onRemove={(s) => { setModalStudent(s); setModalAction("remove"); }}
              onRefreshSingle={handleRefreshSingle}
            />
          ) : tab === "rejected" ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <ShieldOff className="h-10 w-10 text-muted mb-4 opacity-40" />
                <p className="text-sm font-medium text-foreground">
                  No rejected students
                </p>
                <p className="mt-1 text-xs text-muted max-w-xs">
                  The smart contract does not have a formal "rejected" state.
                  Students with removed verification are listed under Pending.
                </p>
              </CardContent>
            </Card>
          ) : (
            <StudentTable
              students={tableStudents}
              loading={loading}
              error={error}
              tab={tab}
              searchQuery={searchQuery}
              onVerify={(s) => { setModalStudent(s); setModalAction("verify"); }}
              onRemove={(s) => { setModalStudent(s); setModalAction("remove"); }}
              onRefreshSingle={handleRefreshSingle}
            />
          )}
        </div>
      </DashboardShell>

      {/* ── Action Modal ── */}
      <AnimatePresence>
        {modalStudent && (
          <ActionModal
            student={modalStudent}
            action={modalAction}
            onClose={() => setModalStudent(null)}
            onSuccess={handleModalSuccess}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Overview Section ──────────────────────────────────────────────────

function OverviewSection({
  students,
  loading,
  error,
  stats,
  onVerify,
  onRemove,
  onRefreshSingle,
}: {
  students: StudentEntry[];
  loading: boolean;
  error: string | null;
  stats: { total: number; verified: number; pending: number; rejected: number };
  onVerify: (s: StudentEntry) => void;
  onRemove: (s: StudentEntry) => void;
  onRefreshSingle: (w: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Contract info card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Hash className="h-4 w-4 text-primary-2" />
            Contract Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border-subtle bg-white/[0.02] p-4 space-y-1">
              <p className="text-xs text-muted">Registry Contract</p>
              <a
                href={`https://amoy.polygonscan.com/address/${PROOFID_REGISTRY_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-data text-xs text-primary-2 hover:text-accent transition-colors break-all"
              >
                {PROOFID_REGISTRY_ADDRESS}
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>
            <div className="rounded-xl border border-border-subtle bg-white/[0.02] p-4 space-y-1">
              <p className="text-xs text-muted">Network</p>
              <p className="text-sm font-medium">Polygon Amoy Testnet</p>
            </div>
            <div className="rounded-xl border border-border-subtle bg-white/[0.02] p-4 space-y-1">
              <p className="text-xs text-muted">Verification Rate</p>
              <p className="text-2xl font-display font-bold text-verified">
                {stats.total > 0
                  ? Math.round((stats.verified / stats.total) * 100)
                  : 0}
                %
              </p>
            </div>
            <div className="rounded-xl border border-border-subtle bg-white/[0.02] p-4 space-y-1">
              <p className="text-xs text-muted">Pending Review</p>
              <p className="text-2xl font-display font-bold text-warn">
                {stats.pending}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent students table */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-primary-2" />
            All Students
          </CardTitle>
          <span className="text-xs text-muted">{students.length} total</span>
        </CardHeader>
        <CardContent className="p-0">
          <StudentTableContent
            students={students}
            loading={loading}
            error={error}
            onVerify={onVerify}
            onRemove={onRemove}
            onRefreshSingle={onRefreshSingle}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// ── Student Table (for non-overview tabs) ─────────────────────────────

function StudentTable({
  students,
  loading,
  error,
  tab,
  searchQuery,
  onVerify,
  onRemove,
  onRefreshSingle,
}: {
  students: StudentEntry[];
  loading: boolean;
  error: string | null;
  tab: Tab;
  searchQuery: string;
  onVerify: (s: StudentEntry) => void;
  onRemove: (s: StudentEntry) => void;
  onRefreshSingle: (w: string) => void;
}) {
  const tabLabel = tab === "search" ? `Search Results` : tab.charAt(0).toUpperCase() + tab.slice(1);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          {tab === "verified" && <ShieldCheck className="h-4 w-4 text-verified" />}
          {tab === "pending" && <Clock className="h-4 w-4 text-warn" />}
          {tab === "search" && <Search className="h-4 w-4 text-primary-2" />}
          {tabLabel} Students
        </CardTitle>
        <span className="text-xs text-muted">{students.length} results</span>
      </CardHeader>
      <CardContent className="p-0">
        {tab === "search" && !searchQuery.trim() ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="h-10 w-10 text-muted mb-4 opacity-40" />
            <p className="text-sm text-muted">
              Enter a username, wallet address, or name to search
            </p>
          </div>
        ) : (
          <StudentTableContent
            students={students}
            loading={loading}
            error={error}
            onVerify={onVerify}
            onRemove={onRemove}
            onRefreshSingle={onRefreshSingle}
          />
        )}
      </CardContent>
    </Card>
  );
}

// ── Table Content (shared) ────────────────────────────────────────────

function StudentTableContent({
  students,
  loading,
  error,
  onVerify,
  onRemove,
  onRefreshSingle,
}: {
  students: StudentEntry[];
  loading: boolean;
  error: string | null;
  onVerify: (s: StudentEntry) => void;
  onRemove: (s: StudentEntry) => void;
  onRefreshSingle: (w: string) => void;
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary-2 mb-3" />
        <p className="text-sm text-muted">Loading students from chain…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-6">
        <AlertTriangle className="h-10 w-10 text-warn mb-4 opacity-60" />
        <p className="text-sm font-medium text-foreground mb-1">Failed to load students</p>
        <p className="text-xs text-muted max-w-sm">{error}</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Users className="h-10 w-10 text-muted mb-4 opacity-40" />
        <p className="text-sm text-muted">No students found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border-subtle text-xs text-muted">
            <th className="px-4 py-3 font-medium">Username</th>
            <th className="px-4 py-3 font-medium">Full Name</th>
            <th className="px-4 py-3 font-medium">Wallet</th>
            <th className="px-4 py-3 font-medium">University</th>
            <th className="px-4 py-3 font-medium">Department</th>
            <th className="px-4 py-3 font-medium">Joined</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <StudentRow
              key={student.walletAddress}
              student={student}
              index={index}
              onVerify={onVerify}
              onRemove={onRemove}
              onRefreshSingle={onRefreshSingle}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
