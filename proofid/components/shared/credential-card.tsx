"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { QRPlaceholder } from "@/components/shared/qr-placeholder";
import { useProfile } from "@/hooks/contracts/use-profile";

/**
 * The signature element of ProofID: a physical-ID-card-styled credential
 * with a holographic edge that tilts subtly toward the cursor, echoing a
 * campus lanyard badge reimagined as a verifiable digital credential.
 */

export function CredentialCard() {
  const ref = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const { profile, isLoading } = useProfile();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setRotate({ x: py * -8, y: px * 10 });
  }

  function handleMouseLeave() {
    setRotate({ x: 0, y: 0 });
  }

  const name = profile?.fullName || "Your Name";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const university = profile?.university || "Your University";
  const graduationYear = profile?.graduationYear || "----";
  const department = profile?.department || "Department";
  const verified = profile?.isVerified ?? false;

  return (
    <div style={{ perspective: 1200 }}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ rotateX: rotate.x, rotateY: rotate.y }}
        transition={{ type: "spring", stiffness: 150, damping: 15 }}
        className="holo-border glass relative w-full max-w-sm overflow-hidden rounded-[1.25rem] p-6"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-accent/15 blur-3xl" />

        <div className="relative flex items-start justify-between">
          <div>
            <p className="font-display text-xs font-semibold tracking-[0.25em] text-primary-2">
              CREDCHAIN
            </p>
            <p className="mt-0.5 text-[11px] text-muted">Verifiable Student Credential</p>
          </div>
          <QRPlaceholder size={7} className="w-14" />
        </div>

        <div className="relative mt-6 flex items-center gap-4">
          <Avatar className="h-16 w-16 border border-white/10">
            <AvatarFallback className="text-lg">
              {mounted && isLoading ? <Loader2 className="h-4 w-4 animate-spin text-muted" /> : initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate font-display text-lg font-semibold">{name}</p>
              {verified && (
                <ShieldCheck className="h-4 w-4 shrink-0 text-verified" />
              )}
            </div>
            <p className="truncate text-xs text-muted">{university}</p>
          </div>
        </div>

        <div className="relative mt-6 grid grid-cols-2 gap-3 border-t border-border-subtle pt-4 font-data text-[11px]">
          <div>
            <p className="text-muted">Department</p>
            <p className="mt-0.5 truncate text-foreground">{department}</p>
          </div>
          <div>
            <p className="text-muted">Class of</p>
            <p className="mt-0.5 text-foreground">{graduationYear}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
