export interface Skill {
  name: string;
  level?: "Learning" | "Proficient" | "Advanced";
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  link?: string;
  status: "Live" | "In Progress" | "Archived";
}

export interface Achievement {
  id: string;
  title: string;
  issuer: string;
  date: string;
  verified: boolean;
}

export interface SocialLink {
  platform: "GitHub" | "LinkedIn" | "Portfolio" | "Twitter";
  url: string;
  handle: string;
}

export interface ActivityItem {
  id: string;
  label: string;
  detail: string;
  timestamp: string;
  kind: "credential" | "profile" | "verification" | "project";
}

export interface StudentProfile {
  name: string;
  username: string;
  university: string;
  department: string;
  graduationYear: string;
  bio: string;
  avatarInitials: string;
  location: string;
  verified: boolean;
  walletAddress: string;
  profileCompletion: number;
  skills: Skill[];
  projects: Project[];
  achievements: Achievement[];
  socials: SocialLink[];
  stats: {
    credentials: number;
    endorsements: number;
    profileViews: number;
    verifications: number;
  };
}
