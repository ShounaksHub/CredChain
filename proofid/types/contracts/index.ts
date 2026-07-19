import type { Hex } from "viem";

// ── On-chain profile (maps to getProfile() return) ────────────────────

export interface OnChainProfile {
  walletAddress: `0x${string}`;
  fullName: string;
  university: string;
  department: string;
  graduationYear: number;
  profileHash: Hex;
  createdAt: number; // unix timestamp
  updatedAt: number; // unix timestamp
  isVerified: boolean;
}

// ── Off-chain profile data (stored in localStorage, hashed on-chain) ──

export interface OffChainProfileData {
  username: string;
  fullName: string;
  university: string;
  department: string;
  graduationYear: string;
  bio: string;
  skills: string[];
  achievements: OffChainAchievement[];
  projects: OffChainProject[];
  socials: OffChainSocials;
}

export interface OffChainAchievement {
  title: string;
  issuer: string;
  date: string;
}

export interface OffChainProject {
  title: string;
  description: string;
  tags: string[];
}

export interface OffChainSocials {
  github: string;
  linkedin: string;
  portfolio: string;
}

// ── Combined profile (on-chain + off-chain merged for display) ────────

export interface FullProfile {
  onChain: OnChainProfile;
  offChain: OffChainProfileData;
}

// ── Form data for creating / updating a profile ───────────────────────

export interface ProfileFormData {
  username: string;
  fullName: string;
  university: string;
  department: string;
  graduationYear: string;
  bio: string;
  skills: string[];
  achievements: OffChainAchievement[];
  projects: OffChainProject[];
  github: string;
  linkedin: string;
  portfolio: string;
}

// ── Verification info shown on the /verify page ───────────────────────

export interface VerificationInfo {
  walletAddress: `0x${string}`;
  transactionHash: Hex;
  network: string;
  blockNumber: string;
  createdAt: string; // formatted date
  isVerified: boolean;
  contractAddress: `0x${string}`;
  profileHash: Hex;
}
