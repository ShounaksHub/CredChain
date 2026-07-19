"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { QRPlaceholder } from "@/components/shared/qr-placeholder";
import { student } from "@/lib/dummy-data";

/**
 * The signature element of ProofID: a physical-ID-card-styled credential
 * with a holographic edge that tilts subtly toward the cursor, echoing a
 * campus lanyard badge reimagined as a verifiable digital credential.
 */
export function CredentialCard() {
  const ref = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

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
            <AvatarFallback className="text-lg">{student.avatarInitials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate font-display text-lg font-semibold">{student.name}</p>
              {student.verified && (
                <ShieldCheck className="h-4 w-4 shrink-0 text-verified" />
              )}
            </div>
            <p className="truncate text-xs text-muted">{student.university}</p>
          </div>
        </div>

        <div className="relative mt-6 grid grid-cols-2 gap-3 border-t border-border-subtle pt-4 font-data text-[11px]">
          <div>
            <p className="text-muted">Department</p>
            <p className="mt-0.5 truncate text-foreground">Cybersecurity</p>
          </div>
          <div>
            <p className="text-muted">Class of</p>
            <p className="mt-0.5 text-foreground">{student.graduationYear}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
