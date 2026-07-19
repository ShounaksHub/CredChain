import { ActivityItem, StudentProfile } from "@/types";

export const student: StudentProfile = {
  name: "Alex Johnson",
  username: "alexjohnson",
  university: "National Forensic Sciences University",
  department: "B.Tech Computer Science — Cybersecurity",
  graduationYear: "2026",
  bio: "Cybersecurity undergrad building at the intersection of digital forensics and applied ML. Currently exploring anomaly detection pipelines and on-chain credentialing.",
  avatarInitials: "AJ",
  location: "Guwahati, India",
  verified: true,
  walletAddress: "0x7c4a9f2e1b3d8c6a5f0e2d1b9c8a7f6e5d4c3b2a",
  profileCompletion: 82,
  skills: [
    { name: "React", level: "Advanced" },
    { name: "Blockchain", level: "Proficient" },
    { name: "Python", level: "Advanced" },
    { name: "Cyber Security", level: "Advanced" },
    { name: "Digital Forensics", level: "Proficient" },
    { name: "Machine Learning", level: "Proficient" },
    { name: "SQL", level: "Advanced" },
    { name: "Network Security", level: "Learning" },
  ],
  projects: [
    {
      id: "proj-1",
      title: "Blockchain Voting",
      description:
        "A tamper-evident campus election system using a permissioned ledger to record and verify votes.",
      tags: ["Solidity", "React", "Ethers.js"],
      status: "Live",
    },
    {
      id: "proj-2",
      title: "AI Resume Analyzer",
      description:
        "NLP pipeline that scores resumes against job descriptions and suggests targeted edits.",
      tags: ["Python", "NLP", "Scikit-learn"],
      status: "In Progress",
    },
    {
      id: "proj-3",
      title: "Attendance DApp",
      description:
        "Smart-contract-backed attendance ledger with QR check-in for lab sessions.",
      tags: ["Solidity", "Next.js", "IPFS"],
      status: "Archived",
    },
  ],
  achievements: [
    {
      id: "ach-1",
      title: "Google Cloud Study Jam",
      issuer: "Google Developer Groups",
      date: "Mar 2026",
      verified: true,
    },
    {
      id: "ach-2",
      title: "Hackathon Winner — CyberSprint",
      issuer: "NFSU Cyber Mitra Club",
      date: "Jan 2026",
      verified: true,
    },
    {
      id: "ach-3",
      title: "GFG Campus Ambassador",
      issuer: "GeeksforGeeks",
      date: "Aug 2025",
      verified: true,
    },
    {
      id: "ach-4",
      title: "AICCSA Reviewer Recognition",
      issuer: "IEEE AICCSA",
      date: "Nov 2025",
      verified: false,
    },
  ],
  socials: [
    { platform: "GitHub", url: "https://github.com/alexjohnson", handle: "@alexjohnson" },
    { platform: "LinkedIn", url: "https://linkedin.com/in/alexjohnson", handle: "alexjohnson" },
    { platform: "Portfolio", url: "https://alexjohnson.dev", handle: "alexjohnson.dev" },
    { platform: "Twitter", url: "https://x.com/alexjohnson", handle: "@alexjohnson" },
  ],
  stats: {
    credentials: 12,
    endorsements: 34,
    profileViews: 1284,
    verifications: 9,
  },
};

export const recentActivity: ActivityItem[] = [
  {
    id: "act-1",
    label: "Credential verified",
    detail: "\"Hackathon Winner — CyberSprint\" confirmed on-chain",
    timestamp: "2h ago",
    kind: "verification",
  },
  {
    id: "act-2",
    label: "Project added",
    detail: "Attendance DApp linked to your profile",
    timestamp: "1d ago",
    kind: "project",
  },
  {
    id: "act-3",
    label: "Profile updated",
    detail: "Bio and skills section refreshed",
    timestamp: "3d ago",
    kind: "profile",
  },
  {
    id: "act-4",
    label: "New endorsement",
    detail: "Priya Nair endorsed your Cyber Security skill",
    timestamp: "5d ago",
    kind: "credential",
  },
  {
    id: "act-5",
    label: "Credential issued",
    detail: "\"Google Cloud Study Jam\" added to wallet",
    timestamp: "1w ago",
    kind: "credential",
  },
];

export const verificationRecord = {
  walletAddress: "0x7c4a9f2e1b3d8c6a5f0e2d1b9c8a7f6e5d4c3b2a",
  transactionHash:
    "0x9f1c2e4b7a3d5f8e0c1b4a6d9e2f5c8b1a4d7e0f3c6b9a2d5e8f1c4b7a0d3e6f",
  network: "Polygon (Amoy Testnet)",
  blockNumber: "48,213,907",
  issuedAt: "2026-06-02 14:31 UTC",
  status: "Verified" as const,
};
