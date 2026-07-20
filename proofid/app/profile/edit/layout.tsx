import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Profile — CredChain",
  description: "Update your CredChain student profile. Changes are hashed and anchored on the Polygon Amoy blockchain.",
};

export default function EditProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
