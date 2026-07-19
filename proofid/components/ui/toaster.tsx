"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-full max-w-sm flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="glass pointer-events-auto flex items-start gap-3 rounded-xl border border-border-subtle p-4 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.9)]"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary-2" />
            <div>
              <p className="text-sm font-medium text-foreground">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-xs text-muted">{t.description}</p>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
