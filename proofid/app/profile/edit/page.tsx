"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Camera,
  Github,
  Globe,
  Linkedin,
  Plus,
  X,
  X as XIcon,
  Loader2,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";
import { useNetwork } from "@/hooks/use-network";
import { useProfile } from "@/hooks/contracts/use-profile";
import { useUpdateProfile } from "@/hooks/contracts/use-update-profile";
import { generateProfileHash, uploadProfileToIPFS } from "@/lib/ipfs/client";
import { classifyContractError } from "@/utils/web3";
import type { ProfileFormData, OffChainProfileData } from "@/types/contracts";

export default function EditProfilePage() {
  const router = useRouter();
  const { isConnected, walletAddress } = useWallet();
  const { isWrongNetwork } = useNetwork();
  const { profile, offChainData, isLoading, refetch } = useProfile();
  const {
    updateProfile,
    isPending,
    isConfirming,
    isSuccess,
    txHash,
    writeError,
    reset,
  } = useUpdateProfile();

  // ── Form state ──
  const [fullName, setFullName] = useState("");
  const [university, setUniversity] = useState("");
  const [department, setDepartment] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillDraft, setSkillDraft] = useState("");
  const [achievements, setAchievements] = useState<
    { title: string; issuer: string; date: string }[]
  >([]);
  const [projects, setProjects] = useState<
    { title: string; description: string; tags: string[] }[]
  >([]);
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Redirect if not connected ──
  useEffect(() => {
    if (mounted && !isConnected) router.push("/");
  }, [isConnected, router, mounted]);

  // ── Populate form from on-chain + IPFS data ──
  useEffect(() => {
    if (initialized) return;

    if (profile) {
      setFullName(profile.fullName);
      setUniversity(profile.university);
      setDepartment(profile.department);
      setGraduationYear(String(profile.graduationYear));
    }

    if (offChainData) {
      setBio(offChainData.bio ?? "");
      setSkills(offChainData.skills ?? []);
      setAchievements(
        offChainData.achievements?.length
          ? offChainData.achievements
          : [{ title: "", issuer: "", date: "" }]
      );
      setProjects(
        offChainData.projects?.length
          ? offChainData.projects
          : [{ title: "", description: "", tags: [] }]
      );
      setGithub(offChainData.socials?.github ?? "");
      setLinkedin(offChainData.socials?.linkedin ?? "");
      setPortfolio(offChainData.socials?.portfolio ?? "");

      // If on-chain didn't load yet, fallback to offchain values
      if (!profile) {
        setFullName(offChainData.fullName ?? "");
        setUniversity(offChainData.university ?? "");
        setDepartment(offChainData.department ?? "");
        setGraduationYear(offChainData.graduationYear ?? "");
      }
    }

    if (profile && (offChainData || !isLoading)) {
      setInitialized(true);
    }
  }, [profile, offChainData, walletAddress, initialized, isLoading]);

  // ── Success handler ──
  useEffect(() => {
    if (isSuccess && walletAddress) {
      toast({
        title: "Profile Updated! ✨",
        description: "Your changes are now reflected on-chain.",
      });
      refetch();
    }
  }, [isSuccess, walletAddress, refetch]);

  // ── Error handler ──
  useEffect(() => {
    if (writeError) {
      const { title, message } = classifyContractError(writeError);
      toast({ title, description: message });
      reset();
    }
  }, [writeError, reset]);

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

  function updateAchievementField(
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

  function updateProjectField(
    index: number,
    field: "title" | "description" | "tags",
    value: string | string[]
  ) {
    const updated = [...projects];
    if (field === "tags" && typeof value === "string") {
      updated[index] = {
        ...updated[index],
        tags: value
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setProjects(updated);
  }

  function removeProject(index: number) {
    setProjects(projects.filter((_, i) => i !== index));
  }

  // ── Form submission status ──
  const [isUploading, setIsUploading] = useState(false);

  if (!mounted) return null;

  // ── Submit handler ──
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (!department.trim()) {
      toast({
        title: "Department required",
        description: "Department cannot be empty.",
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
        description: "Connect your MetaMask wallet first.",
      });
      return;
    }

    if (isWrongNetwork) {
      toast({
        title: "Wrong Network",
        description: "Please switch to Polygon Amoy to save your profile.",
      });
      return;
    }

    const username = offChainData?.username || "";

    const updatedOffChain: OffChainProfileData = {
      username,
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
      const { cid } = await uploadProfileToIPFS(walletAddress, updatedOffChain);
      const newHash = await generateProfileHash(updatedOffChain);

      setIsUploading(false);

      updateProfile({
        newProfileHash: newHash,
        newDepartment: department.trim(),
        newGraduationYear: yearNum,
      });
    } catch (err: any) {
      setIsUploading(false);
      toast({
        title: "Upload Failed",
        description: err.message || "Failed to upload updated profile data to IPFS.",
      });
    }
  }

  const isSubmitting = isPending || isConfirming || isUploading;

  // Compute avatar initials
  const initials = fullName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DashboardShell>
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold sm:text-3xl">
              Edit Profile
            </h1>
            <p className="mt-1 text-sm text-muted">
              This information appears on your public credential.
            </p>
          </div>
        </div>

        {/* ── Transaction status ── */}
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <Card className="border-primary/30 bg-primary/[0.06]">
              <CardContent className="flex items-center gap-4 p-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary-2" />
                <div>
                  <p className="text-sm font-medium">
                    {isUploading
                      ? "Uploading Profile..."
                      : isPending
                      ? "Confirm in MetaMask..."
                      : "Processing transaction..."}
                  </p>
                  {txHash && (
                    <p className="mt-0.5 font-data text-xs text-muted">
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
            className="mt-4"
          >
            <Card className="border-verified/30 bg-verified/[0.06]">
              <CardContent className="flex items-center gap-4 p-4">
                <CheckCircle2 className="h-5 w-5 text-verified" />
                <p className="text-sm font-medium text-verified">
                  Profile updated successfully!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <form onSubmit={handleSave} className="mt-8 flex flex-col gap-6">
          {/* ── Photo ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Photo</CardTitle>
                <CardDescription>
                  Shown on your card and public profile.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-5">
                <Avatar className="h-20 w-20 border border-white/10">
                  <AvatarFallback className="text-xl">
                    {isLoading ? "..." : initials || "?"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => toast({ title: "Coming Soon" })}
                >
                  <Camera className="h-4 w-4" />
                  Upload photo
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Basic Information ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Name and university are immutable on-chain identity anchors.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Enter your full name"
                  />
                  <p className="text-[11px] text-muted">
                    Update your display name
                  </p>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="university"
                    className="flex items-center gap-1.5"
                  >
                    University
                    <Lock className="h-3 w-3 text-muted" />
                  </Label>
                  <Input
                    id="university"
                    value={university}
                    disabled
                    className="opacity-60"
                    title="University is immutable after profile creation"
                  />
                  <p className="text-[11px] text-muted">
                    Locked after creation
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grad-year">Graduation Year</Label>
                  <Input
                    id="grad-year"
                    type="number"
                    min={2000}
                    max={2100}
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
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
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
                <CardDescription>
                  Add the skills you want verified.
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
            transition={{ duration: 0.35, delay: 0.15 }}
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
                          updateProjectField(i, "title", e.target.value)
                        }
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tags (comma separated)</Label>
                      <Input
                        value={project.tags.join(", ")}
                        onChange={(e) =>
                          updateProjectField(i, "tags", e.target.value)
                        }
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        value={project.description}
                        onChange={(e) =>
                          updateProjectField(i, "description", e.target.value)
                        }
                        rows={2}
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
            transition={{ duration: 0.35, delay: 0.2 }}
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
                          updateAchievementField(i, "title", e.target.value)
                        }
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Issuer</Label>
                      <Input
                        value={achievement.issuer}
                        onChange={(e) =>
                          updateAchievementField(i, "issuer", e.target.value)
                        }
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        value={achievement.date}
                        onChange={(e) =>
                          updateAchievementField(i, "date", e.target.value)
                        }
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
            transition={{ duration: 0.35, delay: 0.25 }}
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
            <Button type="button" variant="ghost" asChild>
              <Link href="/dashboard">Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isSuccess || isWrongNetwork}
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
                  Processing...
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Updated!
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
