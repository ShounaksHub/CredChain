"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSignMessage } from "wagmi";
import {
  Plus,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Github,
  Globe,
  Linkedin,
  Fingerprint,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { toast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";
import { useNetwork } from "@/hooks/use-network";
import { useCreateProfile } from "@/hooks/contracts/use-create-profile";
import { useProfileExists } from "@/hooks/contracts/use-profile-exists";
import { generateProfileHash, uploadProfileToIPFS } from "@/lib/ipfs/client";
import { classifyContractError } from "@/utils/web3";
import type { ProfileFormData, OffChainProfileData } from "@/types/contracts";

export default function CreateProfilePage() {
  const router = useRouter();
  const { isConnected, walletAddress } = useWallet();
  const { isWrongNetwork } = useNetwork();
  const { exists, isLoading: checkingProfile } = useProfileExists();
  const {
    createProfile,
    isPending,
    isConfirming,
    isSuccess,
    txHash,
    writeError,
    reset,
  } = useCreateProfile();
  const { signMessageAsync } = useSignMessage();

  // ── Form state ──
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const [fullName, setFullName] = useState("");
  const [university, setUniversity] = useState("");
  const [department, setDepartment] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillDraft, setSkillDraft] = useState("");
  const [achievements, setAchievements] = useState([
    { title: "", issuer: "", date: "" },
  ]);
  const [projects, setProjects] = useState([
    { title: "", description: "", tags: [] as string[] },
  ]);
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  // Ref to hold the debounce timer so it is always cleaned up correctly
  const usernameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Mounted guard to prevent SSR hydration mismatches ──
  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Redirect logic (only after client hydration) ──
  useEffect(() => {
    if (!mounted) return;
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router, mounted]);

  useEffect(() => {
    if (!mounted) return;
    if (exists === true) {
      router.push("/dashboard");
    }
  }, [exists, router, mounted]);

  // ── On success → redirect ──
  useEffect(() => {
    if (isSuccess && walletAddress) {
      toast({
        title: "Profile Created Successfully! 🎉",
        description: "Your identity is now anchored on-chain.",
      });
      reset();
      setTimeout(() => router.push("/dashboard"), 1500);
    }
  }, [isSuccess, walletAddress, router, reset]);

  // ── On error → show toast ──
  useEffect(() => {
    if (writeError) {
      const { title, message } = classifyContractError(writeError);
      toast({ title, description: message });
      reset();
    }
  }, [writeError, reset]);

  // ── Username availability check (debounced via ref to prevent memory leaks) ──
  const checkUsername = useCallback(
    (value: string) => {
      const cleaned = value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
      setUsername(cleaned);

      // Clear any in-flight timer before scheduling a new one
      if (usernameTimerRef.current !== null) {
        clearTimeout(usernameTimerRef.current);
      }

      if (cleaned.length < 3) {
        setUsernameStatus("idle");
        return;
      }

      setUsernameStatus("checking");

      usernameTimerRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/ipfs/resolve-username?username=${cleaned}`);
          if (res.ok) {
            const data = await res.json();
            const isTaken =
              data.walletAddress &&
              data.walletAddress.toLowerCase() !== walletAddress?.toLowerCase();
            setUsernameStatus(isTaken ? "taken" : "available");
          } else {
            setUsernameStatus("available");
          }
        } catch {
          setUsernameStatus("available");
        }
      }, 300);
    },
    [walletAddress]
  );

  // Clean up the username timer on unmount
  useEffect(() => {
    return () => {
      if (usernameTimerRef.current !== null) {
        clearTimeout(usernameTimerRef.current);
      }
    };
  }, []);

  // ── Skill management ──
  function addSkill() {
    const value = skillDraft.trim();
    if (!value || skills.includes(value)) return;
    setSkills([...skills, value]);
    setSkillDraft("");
  }

  function removeSkill(name: string) {
    setSkills(skills.filter((s) => s !== name));
  }

  // ── Achievement management ──
  function addAchievement() {
    setAchievements([...achievements, { title: "", issuer: "", date: "" }]);
  }

  function updateAchievement(
    index: number,
    field: "title" | "issuer" | "date",
    value: string
  ) {
    const updated = [...achievements];
    updated[index] = { ...updated[index], [field]: value };
    setAchievements(updated);
  }

  function removeAchievement(index: number) {
    setAchievements(achievements.filter((_, i) => i !== index));
  }

  // ── Project management ──
  function addProject() {
    setProjects([
      ...projects,
      { title: "", description: "", tags: [] as string[] },
    ]);
  }

  function updateProject(
    index: number,
    field: "title" | "description" | "tags",
    value: string | string[]
  ) {
    const updated = [...projects];
    if (field === "tags" && typeof value === "string") {
      updated[index] = {
        ...updated[index],
        tags: value.split(",").map((t) => t.trim()).filter(Boolean),
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setProjects(updated);
  }

  function removeProject(index: number) {
    setProjects(projects.filter((_, i) => i !== index));
  }

  // ── Submit handler ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validation
    if (!username || username.length < 3) {
      toast({
        title: "Username required",
        description: "Choose a username with at least 3 characters.",
      });
      return;
    }
    if (usernameStatus === "taken") {
      toast({
        title: "Username already taken",
        description: "Choose another username.",
      });
      return;
    }
    if (!fullName.trim()) {
      toast({ title: "Name required", description: "Enter your full name." });
      return;
    }
    if (!university.trim()) {
      toast({
        title: "University required",
        description: "Enter your university.",
      });
      return;
    }
    if (!department.trim()) {
      toast({
        title: "Department required",
        description: "Enter your department.",
      });
      return;
    }
    const yearNum = parseInt(graduationYear, 10);
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      toast({
        title: "Invalid graduation year",
        description: "Enter a year between 2000 and 2100.",
      });
      return;
    }
    if (!walletAddress) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your MetaMask wallet first.",
      });
      return;
    }

    if (isWrongNetwork) {
      toast({
        title: "Wrong Network",
        description: "Please switch to Polygon Amoy to create your profile.",
      });
      return;
    }

    const offChainData: OffChainProfileData = {
      username: username.toLowerCase(),
      fullName,
      university,
      department,
      graduationYear,
      bio,
      skills,
      achievements: achievements.filter((a) => a.title.trim()),
      projects: projects.filter((p) => p.title.trim()),
      socials: { github, linkedin, portfolio },
    };

    setIsUploading(true);

    try {
      const timestamp = Date.now();
      const message = `Login to CredChain\nWallet: ${walletAddress.toLowerCase()}\nTimestamp: ${timestamp}`;
      const signature = await signMessageAsync({ message });

      const { cid } = await uploadProfileToIPFS(walletAddress, offChainData, signature, timestamp);
      const profileHash = await generateProfileHash(offChainData);

      setIsUploading(false);

      createProfile({
        fullName: fullName.trim(),
        university: university.trim(),
        department: department.trim(),
        graduationYear: yearNum,
        profileHash,
      });
    } catch (err: any) {
      setIsUploading(false);
      toast({
        title: "Upload Failed",
        description: err.message || "Failed to upload profile data to IPFS.",
      });
    }
  }

  const isSubmitting = isPending || isConfirming || isUploading;

  // ── Loading / guard ──
  if (!isConnected || checkingProfile) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-2" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white">
                <Fingerprint className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-semibold sm:text-3xl">
                  Create Your CredChain Profile
                </h1>
                <p className="mt-0.5 text-sm text-muted">
                  Build your on-chain student identity. This data will be hashed
                  and stored on Polygon Amoy.
                </p>
              </div>
            </div>
          </motion.div>

          {/* ── Transaction overlay ── */}
          {isSubmitting && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <Card className="border-primary/30 bg-primary/[0.06]">
                <CardContent className="flex items-center gap-4 p-5">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-2" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {isUploading
                        ? "Uploading Profile..."
                        : isPending
                        ? "Confirm in MetaMask..."
                        : "Processing transaction..."}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {isUploading
                        ? "Uploading your profile data to Pinata IPFS..."
                        : isPending
                        ? "Approve the transaction in your MetaMask wallet."
                        : "Waiting for on-chain confirmation. This may take a moment."}
                    </p>
                    {txHash && (
                      <p className="mt-1 font-data text-xs text-muted">
                        Tx: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6"
            >
              <Card className="border-verified/30 bg-verified/[0.06]">
                <CardContent className="flex items-center gap-4 p-5">
                  <CheckCircle2 className="h-6 w-6 text-verified" />
                  <div>
                    <p className="text-sm font-medium text-verified">
                      Profile Created Successfully! 🎉
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      Redirecting to your dashboard...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col gap-6"
          >
            {/* ── Username ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Username</CardTitle>
                  <CardDescription>
                    Choose a unique handle for your public profile URL.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="username">@handle</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                        @
                      </span>
                      <Input
                        id="username"
                        className="pl-7"
                        placeholder="shounak"
                        value={username}
                        onChange={(e) => checkUsername(e.target.value)}
                        disabled={isSubmitting}
                      />
                      {usernameStatus === "available" && (
                        <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-verified" />
                      )}
                      {usernameStatus === "taken" && (
                        <AlertCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive" />
                      )}
                      {usernameStatus === "checking" && (
                        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted" />
                      )}
                    </div>
                    {usernameStatus === "taken" && (
                      <p className="text-xs text-destructive">
                        Username already taken. Choose another.
                      </p>
                    )}
                    {usernameStatus === "available" && (
                      <p className="text-xs text-verified">
                        Username is available!
                      </p>
                    )}
                    {username && username.length < 3 && (
                      <p className="text-xs text-muted">
                        Minimum 3 characters.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Basic Information ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      placeholder="Alex Johnson"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="university">University *</Label>
                    <Input
                      id="university"
                      placeholder="National Forensic Sciences University"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Input
                      id="department"
                      placeholder="B.Tech Computer Science"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grad-year">Graduation Year *</Label>
                    <Input
                      id="grad-year"
                      type="number"
                      min={2000}
                      max={2100}
                      placeholder="2026"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself..."
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Skills ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                  <CardDescription>
                    Add the skills you want showcased.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="default" className="pr-1.5">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-1 rounded-full p-0.5 hover:bg-white/10"
                          aria-label={`Remove ${skill}`}
                          disabled={isSubmitting}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Input
                      placeholder="Add a skill, e.g. Rust"
                      value={skillDraft}
                      onChange={(e) => setSkillDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addSkill}
                      disabled={isSubmitting}
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Projects ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Projects</CardTitle>
                  <CardDescription>
                    Highlight the work you want employers to see.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projects.map((project, i) => (
                    <div
                      key={i}
                      className="relative grid gap-3 rounded-xl border border-border-subtle p-4 sm:grid-cols-2"
                    >
                      {projects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProject(i)}
                          className="absolute right-2 top-2 rounded-full p-1 text-muted hover:text-foreground"
                          disabled={isSubmitting}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={project.title}
                          onChange={(e) =>
                            updateProject(i, "title", e.target.value)
                          }
                          placeholder="Blockchain Voting"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tags (comma separated)</Label>
                        <Input
                          value={project.tags.join(", ")}
                          onChange={(e) =>
                            updateProject(i, "tags", e.target.value)
                          }
                          placeholder="Solidity, React"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label>Description</Label>
                        <Textarea
                          value={project.description}
                          onChange={(e) =>
                            updateProject(i, "description", e.target.value)
                          }
                          rows={2}
                          placeholder="A short description..."
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={addProject}
                    disabled={isSubmitting}
                  >
                    <Plus className="h-4 w-4" />
                    Add project
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Achievements ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.25 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                  <CardDescription>
                    Certifications, awards and recognitions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {achievements.map((achievement, i) => (
                    <div
                      key={i}
                      className="relative grid gap-3 rounded-xl border border-border-subtle p-4 sm:grid-cols-3"
                    >
                      {achievements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAchievement(i)}
                          className="absolute right-2 top-2 rounded-full p-1 text-muted hover:text-foreground"
                          disabled={isSubmitting}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={achievement.title}
                          onChange={(e) =>
                            updateAchievement(i, "title", e.target.value)
                          }
                          placeholder="Hackathon Winner"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Issuer</Label>
                        <Input
                          value={achievement.issuer}
                          onChange={(e) =>
                            updateAchievement(i, "issuer", e.target.value)
                          }
                          placeholder="Google"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                          value={achievement.date}
                          onChange={(e) =>
                            updateAchievement(i, "date", e.target.value)
                          }
                          placeholder="Mar 2026"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={addAchievement}
                    disabled={isSubmitting}
                  >
                    <Plus className="h-4 w-4" />
                    Add achievement
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Social Links ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Social Links</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="github">
                      <Github className="mr-1.5 inline h-3.5 w-3.5" />
                      GitHub
                    </Label>
                    <Input
                      id="github"
                      placeholder="https://github.com/username"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">
                      <Linkedin className="mr-1.5 inline h-3.5 w-3.5" />
                      LinkedIn
                    </Label>
                    <Input
                      id="linkedin"
                      placeholder="https://linkedin.com/in/username"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portfolio">
                      <Globe className="mr-1.5 inline h-3.5 w-3.5" />
                      Portfolio
                    </Label>
                    <Input
                      id="portfolio"
                      placeholder="https://yoursite.dev"
                      value={portfolio}
                      onChange={(e) => setPortfolio(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Submit bar ── */}
            <div className="sticky bottom-5 z-10 flex items-center justify-end gap-3 rounded-2xl border border-border-subtle bg-background/90 p-4 backdrop-blur-xl">
              <Button
                type="submit"
                disabled={isSubmitting || isSuccess || isWrongNetwork || usernameStatus === "taken"}
                className="min-w-[180px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Confirm in MetaMask...
                  </>
                ) : isConfirming ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing Transaction...
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Profile Created!
                  </>
                ) : (
                  "Create Profile"
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
