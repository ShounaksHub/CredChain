import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Profile — CredChain",
  description: "Build your verifiable on-chain student identity. Secure, shareable, blockchain-backed credentials.",
};

export default function CreateProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
