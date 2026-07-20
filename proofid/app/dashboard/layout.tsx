import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — CredChain",
  description: "View your on-chain student identity, credentials, and profile activity on CredChain.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
