import type { Hex } from "viem";

export async function generateProfileHash(data: any): Promise<Hex> {
  const socialsData = data.socials || data.socialLinks || {};
  const github = (socialsData.github || data.github || "").trim();
  const linkedin = (socialsData.linkedin || data.linkedin || "").trim();
  const portfolio = (socialsData.portfolio || data.portfolio || "").trim();

  const canonical = {
    username: (data.username || "").trim().toLowerCase(),
    fullName: (data.fullName || "").trim(),
    university: (data.university || "").trim(),
    department: (data.department || "").trim(),
    graduationYear: String(data.graduationYear || "").trim(),
    bio: (data.bio || "").trim(),
    skills: [...(data.skills || [])].sort(),
    achievements: (data.achievements || []).map((a: any) => ({
      title: (a.title || "").trim(),
      issuer: (a.issuer || "").trim(),
      date: (a.date || "").trim(),
    })),
    projects: (data.projects || []).map((p: any) => ({
      title: (p.title || "").trim(),
      description: (p.description || "").trim(),
      tags: [...(p.tags || [])].sort(),
    })),
    socials: {
      github,
      linkedin,
      portfolio,
    },
  };

  const json = JSON.stringify(canonical);
  const encoded = new TextEncoder().encode(json);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = new Uint8Array(hashBuffer);
  const hex = Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `0x${hex}` as Hex;
}

export async function verifyProfileIntegrity(
  profileData: any,
  expectedHash: Hex
): Promise<boolean> {
  try {
    const computed = await generateProfileHash(profileData);
    return computed.toLowerCase() === expectedHash.toLowerCase();
  } catch (err) {
    console.error("Verification failed:", err);
    return false;
  }
}

export async function uploadProfileToIPFS(
  walletAddress: string,
  data: any,
  signature: string,
  timestamp: number
): Promise<{ cid: string; hash: Hex }> {
  const response = await fetch("/api/ipfs/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-signature": signature,
      "x-timestamp": timestamp.toString(),
    },
    body: JSON.stringify({ walletAddress, profile: data }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || "Failed to upload profile to IPFS");
  }

  return response.json();
}

export async function fetchProfileFromIPFS(
  identifier: string
): Promise<{ profile: any; cid: string; walletAddress?: string }> {
  let cid = "";
  let walletAddress: string | undefined;

  // 1. Check if identifier is a wallet address (starts with 0x)
  if (identifier.startsWith("0x") && identifier.length === 42) {
    const res = await fetch(`/api/ipfs/resolve-wallet?walletAddress=${identifier.toLowerCase()}`);
    if (!res.ok) {
      throw new Error(`Profile not found for wallet: ${identifier}`);
    }
    const data = await res.json();
    cid = data.cid;
    walletAddress = identifier;
  }
  // 2. Check if identifier is a CID (typically Qm... or ba...)
  else if (identifier.match(/^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[a-z0-9]{55})$/)) {
    cid = identifier;
  }
  // 3. Otherwise, treat as username
  else {
    const res = await fetch(`/api/ipfs/resolve-username?username=${identifier.toLowerCase()}`);
    if (!res.ok) {
      throw new Error(`Profile not found for username: ${identifier}`);
    }
    const data = await res.json();
    cid = data.cid;
    walletAddress = data.walletAddress;
  }

  if (!cid) {
    throw new Error("Could not resolve CID for profile");
  }

  const fetchRes = await fetch(`/api/ipfs/cat?cid=${cid}`);
  if (!fetchRes.ok) {
    throw new Error("Failed to fetch JSON content from IPFS");
  }

  const profile = await fetchRes.json();
  return { profile, cid, walletAddress };
}
