import Link from "next/link";
import { Fingerprint, Github, Linkedin, X as XIcon } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border-subtle">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white">
                <Fingerprint className="h-4.5 w-4.5" />
              </span>
              <span className="font-display text-[15px] font-semibold">CredChain</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              A portable, verifiable identity for students — built for the
              credentials you actually earn.
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Product</p>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li><a href="#features" className="hover:text-foreground">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-foreground">How it works</a></li>
              <li><Link href="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
              <li><Link href="/verify" className="hover:text-foreground">Verification</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Connect</p>
            <div className="mt-4 flex gap-3">
              {[Github, Linkedin, XIcon].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-muted transition-colors hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border-subtle pt-6 text-xs text-muted sm:flex-row">
          <p>© 2026 CredChain. Made by Shounak and Afiza.</p>
          <p>Built for students, verified on-chain.</p>
        </div>
      </div>
    </footer>
  );
}
