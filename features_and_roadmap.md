# ProofID MVP: Feature Assessment, Deficiencies & Roadmap

This document provides a comprehensive technical overview of the current implementation stage of the ProofID Web3 Student Identity MVP.

---

## 1. Current Project Stage
The project is in the **MVP (Minimum Viable Product) / Proof of Concept** stage. It successfully combines:
- **On-chain anchor registry** (via Smart Contracts on Polygon Amoy).
- **Off-chain data persistence** (currently cached locally in browser storage).
- **Web3-enabled React frontend** (Next.js app Router, Tailwind CSS, shadcn/ui components, wagmi/viem integration).

---

## 2. Core Features (What is Implemented & Working)

### A. Smart Contract Layer (`ProofIDRegistry.sol`)
- **Profile Anchoring:** Allows wallets to create a profile by writing their immutable identity anchors (`fullName` and `university`) along with mutable attributes (`department`, `graduationYear`) and a 32-byte `profileHash` (SHA-256) of the off-chain data on-chain.
- **Single-Profile Constraint:** Ensures each wallet can only register one profile ever.
- **Admin-level Verifications:** Only the owner of the registry contract (e.g., a university admin key or automated verification service) can toggle `isVerified` on or off for student profiles.
- **Audit Events:** Standard Solidity events emitted on profile creation, updates, and verification changes.

### B. Web3 Provider & Wallet Connection Layer
- **Seamless Wallet Connection:** Directly hooks into injected browser wallets (like MetaMask) via Wagmi and Viem.
- **Smart Hydration:** Implements client-side checks inside `WalletProvider` to prevent React hydration errors during Web3 connection state restoration.
- **Target Chain Enforcement:** Bounded strictly to the **Polygon Amoy Testnet** (`80002`).

### C. Public & Private Profile Routing
- **Creation Flow (`/create-profile`):** Form validation, automatic formatting, SHA-256 hashing of profile fields, and triggering a write transaction to the smart contract.
- **Dashboard View (`/dashboard`):** Summarizes current student stats, on-chain state, verification status, and lists projects and achievements.
- **Public Profiles (`/u/[username]`):** Publicly accessible pages showing student credentials, social links, and the on-chain SHA-256 profile hash for verification checking.
- **On-Chain Verification Page (`/verify`):** Pulls blockchain records live to show creation timestamp, wallet address, profile hash, and target contract address.

---

## 3. Areas Lacking & Deficiencies (What Needs to be Fixed/Implemented)

### A. Decentralized & Relational Off-chain Storage (High Priority)
- **The Issue:** Full profile data (bio, projects, achievements, social handles) is currently saved **only in the user's local browser `localStorage`** (`services/profile-cache.ts`).
- **The Impact:** If a user clears their browser cache or accesses their profile from another device/browser:
  - Their public URL (`/u/[username]`) will return **"Profile Not Found"** or appear blank to third parties, even though the wallet's on-chain profile exists.
  - The student will not see their projects or achievements on their own dashboard.
- **The Fix Required:** Integrate a decentralized storage network (such as **IPFS**, **Arweave**, or **ceramic.network**) or a secure database backend. The on-chain `profileHash` should match the hash of the file hosted on this network.

### B. Decentralized Username Resolution
- **The Issue:** The `resolveUsernameToWallet` lookup index mapping is stored in local browser storage.
- **The Impact:** External recruiters or visitors navigating to `proofid.app/u/shounak` will fail to resolve the username to a wallet address unless they are using the exact browser/device where the user created the profile.
- **The Fix Required:** Add a username registration mapping to the smart contract (e.g., `mapping(string => address) private _usernames`), or query events off-chain via an indexing service (such as **The Graph** or a custom indexing node).

### C. Admin Verification Interface
- **The Issue:** Although the smart contract contains `verifyStudent()` and `removeVerification()` methods restricted to the owner, there is no frontend admin portal or UI dashboard for universities to verify student profiles.
- **The Impact:** Toggling the verification badge currently requires manually executing contract writes via Etherscan/Amoy Explorer or scripting hardhat tasks.
- **The Fix Required:** Build a secure `/admin` dashboard that lists profiles requesting verification and permits authorized university wallets to call `verifyStudent`.

### D. Gas Fee/UX Barriers
- **The Issue:** Students must pay gas fees (in native POL) to call `createProfile()` or `updateProfile()`.
- **The Impact:** Creates a high friction entry barrier for students who do not own gas tokens.
- **The Fix Required:** Implement a meta-transaction relayer (e.g., **ERC-2771** with OpenGSN or Biconomy) to allow gasless profile creation where universities or ProofID sponsors pay the gas.

---

## 4. Summary of Code Improvements Completed
- **MetaMask Connection Fix:** Switched from `metaMask()` SDK connector to standard `injected({ target: "metaMask" })` to prevent silent connection dropouts and auto-reject errors on `localhost`.
- **Peer Dependency Resolution:** Added missing `@metamask/connect-evm` to local package dependencies.
- **Hydration Syncing:** Resolved the React `Hydrate` context warning by deferring state readings until after mounting inside `WalletProvider`.
