import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import type { ProofIDRegistry } from "../typechain";

describe("ProofIDRegistry", () => {
  const VALID_NAME = "Alex Johnson";
  const VALID_UNIVERSITY = "National Forensic Sciences University";
  const VALID_DEPARTMENT = "Computer Science — Cybersecurity";
  const VALID_GRAD_YEAR = 2026;
  const VALID_HASH = ethers.sha256(ethers.toUtf8Bytes("profile-v1"));
  const UPDATED_HASH = ethers.sha256(ethers.toUtf8Bytes("profile-v2"));

  async function deployFixture() {
    const [owner, student, otherStudent, stranger] = await ethers.getSigners();

    const ProofIDRegistryFactory = await ethers.getContractFactory("ProofIDRegistry");
    const registry = (await ProofIDRegistryFactory.deploy(owner.address)) as unknown as ProofIDRegistry;
    await registry.waitForDeployment();

    return { registry, owner, student, otherStudent, stranger };
  }

  async function createdProfileFixture() {
    const base = await deployFixture();
    const { registry, student } = base;

    await registry
      .connect(student)
      .createProfile(VALID_NAME, VALID_UNIVERSITY, VALID_DEPARTMENT, VALID_GRAD_YEAR, VALID_HASH);

    return base;
  }

  describe("Deployment", () => {
    it("sets the deployer-specified address as owner", async () => {
      const { registry, owner } = await loadFixture(deployFixture);
      expect(await registry.owner()).to.equal(owner.address);
    });

    it("starts with zero total profiles", async () => {
      const { registry } = await loadFixture(deployFixture);
      expect(await registry.totalProfiles()).to.equal(0n);
    });
  });

  describe("createProfile", () => {
    it("creates a profile with the expected fields", async () => {
      const { registry, student } = await loadFixture(deployFixture);

      await registry
        .connect(student)
        .createProfile(VALID_NAME, VALID_UNIVERSITY, VALID_DEPARTMENT, VALID_GRAD_YEAR, VALID_HASH);

      const profile = await registry.getProfile(student.address);
      expect(profile.wallet_).to.equal(student.address);
      expect(profile.fullName).to.equal(VALID_NAME);
      expect(profile.university).to.equal(VALID_UNIVERSITY);
      expect(profile.department).to.equal(VALID_DEPARTMENT);
      expect(profile.graduationYear).to.equal(VALID_GRAD_YEAR);
      expect(profile.profileHash).to.equal(VALID_HASH);
      expect(profile.verified).to.equal(false);
      expect(profile.createdAt).to.equal(profile.updatedAt);
    });

    it("increments totalProfiles", async () => {
      const { registry, student, otherStudent } = await loadFixture(deployFixture);

      await registry
        .connect(student)
        .createProfile(VALID_NAME, VALID_UNIVERSITY, VALID_DEPARTMENT, VALID_GRAD_YEAR, VALID_HASH);
      expect(await registry.totalProfiles()).to.equal(1n);

      await registry
        .connect(otherStudent)
        .createProfile("Priya Nair", VALID_UNIVERSITY, VALID_DEPARTMENT, VALID_GRAD_YEAR, VALID_HASH);
      expect(await registry.totalProfiles()).to.equal(2n);
    });

    it("emits ProfileCreated", async () => {
      const { registry, student } = await loadFixture(deployFixture);

      await expect(
        registry
          .connect(student)
          .createProfile(VALID_NAME, VALID_UNIVERSITY, VALID_DEPARTMENT, VALID_GRAD_YEAR, VALID_HASH)
      )
        .to.emit(registry, "ProfileCreated")
        .withArgs(student.address, VALID_NAME, VALID_UNIVERSITY, VALID_HASH, anyValue);
    });

    it("reverts on duplicate profile creation", async () => {
      const { registry, student } = await loadFixture(createdProfileFixture);

      await expect(
        registry
          .connect(student)
          .createProfile(VALID_NAME, VALID_UNIVERSITY, VALID_DEPARTMENT, VALID_GRAD_YEAR, VALID_HASH)
      )
        .to.be.revertedWithCustomError(registry, "ProfileAlreadyExists")
        .withArgs(student.address);
    });

    it("reverts on empty full name", async () => {
      const { registry, student } = await loadFixture(deployFixture);
      await expect(
        registry.connect(student).createProfile("", VALID_UNIVERSITY, VALID_DEPARTMENT, VALID_GRAD_YEAR, VALID_HASH)
      ).to.be.revertedWithCustomError(registry, "EmptyName");
    });

    it("reverts on empty university", async () => {
      const { registry, student } = await loadFixture(deployFixture);
      await expect(
        registry.connect(student).createProfile(VALID_NAME, "", VALID_DEPARTMENT, VALID_GRAD_YEAR, VALID_HASH)
      ).to.be.revertedWithCustomError(registry, "EmptyUniversity");
    });

    it("reverts on empty department", async () => {
      const { registry, student } = await loadFixture(deployFixture);
      await expect(
        registry.connect(student).createProfile(VALID_NAME, VALID_UNIVERSITY, "", VALID_GRAD_YEAR, VALID_HASH)
      ).to.be.revertedWithCustomError(registry, "EmptyDepartment");
    });

    it("reverts on graduation year below the minimum", async () => {
      const { registry, student } = await loadFixture(deployFixture);
      await expect(
        registry.connect(student).createProfile(VALID_NAME, VALID_UNIVERSITY, VALID_DEPARTMENT, 1999, VALID_HASH)
      )
        .to.be.revertedWithCustomError(registry, "InvalidGraduationYear")
        .withArgs(1999);
    });

    it("reverts on graduation year above the maximum", async () => {
      const { registry, student } = await loadFixture(deployFixture);
      await expect(
        registry.connect(student).createProfile(VALID_NAME, VALID_UNIVERSITY, VALID_DEPARTMENT, 2101, VALID_HASH)
      )
        .to.be.revertedWithCustomError(registry, "InvalidGraduationYear")
        .withArgs(2101);
    });

    it("reverts on a zero profile hash", async () => {
      const { registry, student } = await loadFixture(deployFixture);
      await expect(
        registry
          .connect(student)
          .createProfile(VALID_NAME, VALID_UNIVERSITY, VALID_DEPARTMENT, VALID_GRAD_YEAR, ethers.ZeroHash)
      ).to.be.revertedWithCustomError(registry, "InvalidProfileHash");
    });

    it("allows the minimum and maximum boundary graduation years", async () => {
      const { registry, student, otherStudent } = await loadFixture(deployFixture);

      await expect(
        registry.connect(student).createProfile(VALID_NAME, VALID_UNIVERSITY, VALID_DEPARTMENT, 2000, VALID_HASH)
      ).to.not.be.reverted;

      await expect(
        registry
          .connect(otherStudent)
          .createProfile(VALID_NAME, VALID_UNIVERSITY, VALID_DEPARTMENT, 2100, VALID_HASH)
      ).to.not.be.reverted;
    });
  });

  describe("updateProfile", () => {
    it("updates profileHash, department and graduationYear", async () => {
      const { registry, student } = await loadFixture(createdProfileFixture);

      await registry.connect(student).updateProfile(UPDATED_HASH, "Data Science", 2027);

      const profile = await registry.getProfile(student.address);
      expect(profile.profileHash).to.equal(UPDATED_HASH);
      expect(profile.department).to.equal("Data Science");
      expect(profile.graduationYear).to.equal(2027);
      // fullName / university are immutable post-creation
      expect(profile.fullName).to.equal(VALID_NAME);
      expect(profile.university).to.equal(VALID_UNIVERSITY);
    });

    it("bumps updatedAt without changing createdAt", async () => {
      const { registry, student } = await loadFixture(createdProfileFixture);

      const before = await registry.getProfile(student.address);

      await ethers.provider.send("evm_increaseTime", [60]);
      await ethers.provider.send("evm_mine", []);

      await registry.connect(student).updateProfile(UPDATED_HASH, "Data Science", 2027);
      const after = await registry.getProfile(student.address);

      expect(after.createdAt).to.equal(before.createdAt);
      expect(after.updatedAt).to.be.greaterThan(before.updatedAt);
    });

    it("emits ProfileUpdated", async () => {
      const { registry, student } = await loadFixture(createdProfileFixture);

      await expect(registry.connect(student).updateProfile(UPDATED_HASH, "Data Science", 2027))
        .to.emit(registry, "ProfileUpdated")
        .withArgs(student.address, UPDATED_HASH, "Data Science", 2027, anyValue);
    });

    it("reverts when the caller has no profile", async () => {
      const { registry, stranger } = await loadFixture(createdProfileFixture);

      await expect(registry.connect(stranger).updateProfile(UPDATED_HASH, "Data Science", 2027))
        .to.be.revertedWithCustomError(registry, "ProfileDoesNotExist")
        .withArgs(stranger.address);
    });

    it("reverts on unauthorized update — one student cannot update another's profile", async () => {
      const { registry, student, otherStudent } = await loadFixture(createdProfileFixture);

      // otherStudent has no profile of their own yet, so this correctly
      // reverts with ProfileDoesNotExist rather than allowing them to
      // reach into `student`'s profile — there is no wallet parameter to
      // spoof in the first place, msg.sender is always the acting wallet.
      await expect(registry.connect(otherStudent).updateProfile(UPDATED_HASH, "Data Science", 2027))
        .to.be.revertedWithCustomError(registry, "ProfileDoesNotExist")
        .withArgs(otherStudent.address);

      const profile = await registry.getProfile(student.address);
      expect(profile.department).to.equal(VALID_DEPARTMENT);
    });

    it("reverts on empty department", async () => {
      const { registry, student } = await loadFixture(createdProfileFixture);
      await expect(
        registry.connect(student).updateProfile(UPDATED_HASH, "", 2027)
      ).to.be.revertedWithCustomError(registry, "EmptyDepartment");
    });

    it("reverts on invalid graduation year", async () => {
      const { registry, student } = await loadFixture(createdProfileFixture);
      await expect(
        registry.connect(student).updateProfile(UPDATED_HASH, "Data Science", 1800)
      )
        .to.be.revertedWithCustomError(registry, "InvalidGraduationYear")
        .withArgs(1800);
    });

    it("reverts on a zero profile hash", async () => {
      const { registry, student } = await loadFixture(createdProfileFixture);
      await expect(
        registry.connect(student).updateProfile(ethers.ZeroHash, "Data Science", 2027)
      ).to.be.revertedWithCustomError(registry, "InvalidProfileHash");
    });
  });

  describe("verifyStudent / removeVerification", () => {
    it("allows the owner to verify a student", async () => {
      const { registry, owner, student } = await loadFixture(createdProfileFixture);

      await expect(registry.connect(owner).verifyStudent(student.address))
        .to.emit(registry, "StudentVerified")
        .withArgs(student.address, owner.address, anyValue);

      const profile = await registry.getProfile(student.address);
      expect(profile.verified).to.equal(true);
    });

    it("reverts when a non-owner tries to verify", async () => {
      const { registry, student, stranger } = await loadFixture(createdProfileFixture);

      await expect(registry.connect(stranger).verifyStudent(student.address)).to.be.revertedWithCustomError(
        registry,
        "OwnableUnauthorizedAccount"
      );
    });

    it("reverts verifying a wallet with no profile", async () => {
      const { registry, owner, stranger } = await loadFixture(createdProfileFixture);

      await expect(registry.connect(owner).verifyStudent(stranger.address))
        .to.be.revertedWithCustomError(registry, "ProfileDoesNotExist")
        .withArgs(stranger.address);
    });

    it("allows the owner to remove verification", async () => {
      const { registry, owner, student } = await loadFixture(createdProfileFixture);

      await registry.connect(owner).verifyStudent(student.address);
      await expect(registry.connect(owner).removeVerification(student.address))
        .to.emit(registry, "VerificationRemoved")
        .withArgs(student.address, owner.address, anyValue);

      const profile = await registry.getProfile(student.address);
      expect(profile.verified).to.equal(false);
    });

    it("reverts when a non-owner tries to remove verification", async () => {
      const { registry, student, stranger } = await loadFixture(createdProfileFixture);

      await expect(
        registry.connect(stranger).removeVerification(student.address)
      ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
    });

    it("reverts removing verification for a wallet with no profile", async () => {
      const { registry, owner, stranger } = await loadFixture(createdProfileFixture);

      await expect(registry.connect(owner).removeVerification(stranger.address))
        .to.be.revertedWithCustomError(registry, "ProfileDoesNotExist")
        .withArgs(stranger.address);
    });

    it("is idempotent-safe: verifying twice keeps verified true", async () => {
      const { registry, owner, student } = await loadFixture(createdProfileFixture);

      await registry.connect(owner).verifyStudent(student.address);
      await registry.connect(owner).verifyStudent(student.address);

      const profile = await registry.getProfile(student.address);
      expect(profile.verified).to.equal(true);
    });
  });

  describe("profileExists / getProfileHash", () => {
    it("profileExists returns false for an unregistered wallet", async () => {
      const { registry, stranger } = await loadFixture(createdProfileFixture);
      expect(await registry.profileExists(stranger.address)).to.equal(false);
    });

    it("profileExists returns true after creation", async () => {
      const { registry, student } = await loadFixture(createdProfileFixture);
      expect(await registry.profileExists(student.address)).to.equal(true);
    });

    it("getProfileHash returns the stored SHA-256 hash", async () => {
      const { registry, student } = await loadFixture(createdProfileFixture);
      expect(await registry.getProfileHash(student.address)).to.equal(VALID_HASH);
    });

    it("getProfileHash reflects updates", async () => {
      const { registry, student } = await loadFixture(createdProfileFixture);
      await registry.connect(student).updateProfile(UPDATED_HASH, "Data Science", 2027);
      expect(await registry.getProfileHash(student.address)).to.equal(UPDATED_HASH);
    });

    it("getProfileHash reverts for a wallet with no profile", async () => {
      const { registry, stranger } = await loadFixture(createdProfileFixture);
      await expect(registry.getProfileHash(stranger.address))
        .to.be.revertedWithCustomError(registry, "ProfileDoesNotExist")
        .withArgs(stranger.address);
    });
  });

  describe("getProfile", () => {
    it("reverts for a wallet with no profile", async () => {
      const { registry, stranger } = await loadFixture(createdProfileFixture);
      await expect(registry.getProfile(stranger.address))
        .to.be.revertedWithCustomError(registry, "ProfileDoesNotExist")
        .withArgs(stranger.address);
    });

    it("is callable by anyone, not just the profile owner", async () => {
      const { registry, student, stranger } = await loadFixture(createdProfileFixture);
      const profile = await registry.connect(stranger).getProfile(student.address);
      expect(profile.fullName).to.equal(VALID_NAME);
    });
  });

  describe("Edge cases", () => {
    it("supports many independent profiles without cross-contamination", async () => {
      const { registry, student, otherStudent, stranger } = await loadFixture(deployFixture);

      await registry
        .connect(student)
        .createProfile("Student One", VALID_UNIVERSITY, VALID_DEPARTMENT, 2026, VALID_HASH);
      await registry
        .connect(otherStudent)
        .createProfile("Student Two", "Other University", "Data Science", 2027, UPDATED_HASH);
      await registry
        .connect(stranger)
        .createProfile("Student Three", "Third University", "AI", 2028, ethers.sha256(ethers.toUtf8Bytes("p3")));

      expect((await registry.getProfile(student.address)).fullName).to.equal("Student One");
      expect((await registry.getProfile(otherStudent.address)).fullName).to.equal("Student Two");
      expect((await registry.getProfile(stranger.address)).fullName).to.equal("Student Three");
      expect(await registry.totalProfiles()).to.equal(3n);
    });

    it("does not allow re-creating a profile even after verification changes", async () => {
      const { registry, owner, student } = await loadFixture(createdProfileFixture);
      await registry.connect(owner).verifyStudent(student.address);

      await expect(
        registry
          .connect(student)
          .createProfile(VALID_NAME, VALID_UNIVERSITY, VALID_DEPARTMENT, VALID_GRAD_YEAR, VALID_HASH)
      ).to.be.revertedWithCustomError(registry, "ProfileAlreadyExists");
    });

    it("keeps verification status through profile updates", async () => {
      const { registry, owner, student } = await loadFixture(createdProfileFixture);
      await registry.connect(owner).verifyStudent(student.address);

      await registry.connect(student).updateProfile(UPDATED_HASH, "Data Science", 2027);

      const profile = await registry.getProfile(student.address);
      expect(profile.verified).to.equal(true);
    });
  });
});
