import { type Abi } from "viem";

/**
 * Deployed ProofIDRegistry contract address on Polygon Amoy.
 *
 * ⚠️  Replace with your actual deployed address if different.
 *     Run `npm run deploy:amoy` from the contracts project to deploy.
 */
export const PROOFID_REGISTRY_ADDRESS =
  "0x724e3F47ecB973d10386e1cb82EF2EFc112D0C23" as `0x${string}`;

/**
 * ABI for ProofIDRegistry — extracted from the Hardhat compilation artifact.
 * Typed `as const` so viem can infer argument / return types automatically.
 */
export const proofIdRegistryAbi = [
  // ── Errors ──────────────────────────────────────────────────────────
  { inputs: [], name: "EmptyDepartment", type: "error" },
  { inputs: [], name: "EmptyName", type: "error" },
  { inputs: [], name: "EmptyUniversity", type: "error" },
  {
    inputs: [{ internalType: "uint16", name: "graduationYear", type: "uint16" }],
    name: "InvalidGraduationYear",
    type: "error",
  },
  { inputs: [], name: "InvalidProfileHash", type: "error" },
  {
    inputs: [
      { internalType: "address", name: "caller", type: "address" },
      { internalType: "address", name: "owner", type: "address" },
    ],
    name: "NotProfileOwner",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "wallet", type: "address" }],
    name: "ProfileAlreadyExists",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "wallet", type: "address" }],
    name: "ProfileDoesNotExist",
    type: "error",
  },

  // ── Events ──────────────────────────────────────────────────────────
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "previousOwner", type: "address" },
      { indexed: true, internalType: "address", name: "newOwner", type: "address" },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "wallet", type: "address" },
      { indexed: false, internalType: "string", name: "fullName", type: "string" },
      { indexed: false, internalType: "string", name: "university", type: "string" },
      { indexed: false, internalType: "bytes32", name: "profileHash", type: "bytes32" },
      { indexed: false, internalType: "uint40", name: "createdAt", type: "uint40" },
    ],
    name: "ProfileCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "wallet", type: "address" },
      { indexed: false, internalType: "bytes32", name: "profileHash", type: "bytes32" },
      { indexed: false, internalType: "string", name: "department", type: "string" },
      { indexed: false, internalType: "uint16", name: "graduationYear", type: "uint16" },
      { indexed: false, internalType: "uint40", name: "updatedAt", type: "uint40" },
    ],
    name: "ProfileUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "wallet", type: "address" },
      { indexed: true, internalType: "address", name: "verifier", type: "address" },
      { indexed: false, internalType: "uint40", name: "verifiedAt", type: "uint40" },
    ],
    name: "StudentVerified",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "wallet", type: "address" },
      { indexed: true, internalType: "address", name: "remover", type: "address" },
      { indexed: false, internalType: "uint40", name: "removedAt", type: "uint40" },
    ],
    name: "VerificationRemoved",
    type: "event",
  },

  // ── Read functions ──────────────────────────────────────────────────
  {
    inputs: [],
    name: "MAX_GRADUATION_YEAR",
    outputs: [{ internalType: "uint16", name: "", type: "uint16" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MIN_GRADUATION_YEAR",
    outputs: [{ internalType: "uint16", name: "", type: "uint16" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "wallet", type: "address" }],
    name: "getProfile",
    outputs: [
      { internalType: "address", name: "wallet_", type: "address" },
      { internalType: "string", name: "fullName", type: "string" },
      { internalType: "string", name: "university", type: "string" },
      { internalType: "string", name: "department", type: "string" },
      { internalType: "uint16", name: "graduationYear", type: "uint16" },
      { internalType: "bytes32", name: "profileHash", type: "bytes32" },
      { internalType: "uint40", name: "createdAt", type: "uint40" },
      { internalType: "uint40", name: "updatedAt", type: "uint40" },
      { internalType: "bool", name: "verified", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "wallet", type: "address" }],
    name: "getProfileHash",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "wallet", type: "address" }],
    name: "profileExists",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalProfiles",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },

  // ── Write functions ─────────────────────────────────────────────────
  {
    inputs: [
      { internalType: "string", name: "fullName", type: "string" },
      { internalType: "string", name: "university", type: "string" },
      { internalType: "string", name: "department", type: "string" },
      { internalType: "uint16", name: "graduationYear", type: "uint16" },
      { internalType: "bytes32", name: "profileHash", type: "bytes32" },
    ],
    name: "createProfile",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "wallet", type: "address" }],
    name: "removeVerification",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "newProfileHash", type: "bytes32" },
      { internalType: "string", name: "newDepartment", type: "string" },
      { internalType: "uint16", name: "newGraduationYear", type: "uint16" },
    ],
    name: "updateProfile",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "wallet", type: "address" }],
    name: "verifyStudent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const satisfies Abi;

/**
 * Reusable contract config object — pass this to wagmi's
 * useReadContract / useWriteContract to avoid repeating address + abi.
 */
export const proofIdRegistryConfig = {
  address: PROOFID_REGISTRY_ADDRESS,
  abi: proofIdRegistryAbi,
} as const;
