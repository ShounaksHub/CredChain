import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Credential — CredChain",
  description: "Check the on-chain verification status of your CredChain student credential on the Polygon Amoy blockchain.",
};

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
