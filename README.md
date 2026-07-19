<div align="center">
  <h1>🛡️ ProofID (CredChain)</h1>
  <p><strong>Identity built for how students actually work. Less paperwork, more proof.</strong></p>
  <p>
    <a href="#about">About</a> •
    <a href="#key-features">Key Features</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#roadmap">Roadmap</a>
  </p>
</div>

---

## 📖 About

**ProofID** (internal project name: *CredChain*) is a decentralized, user-owned, and verifiable credential platform tailored for students. It allows students to consolidate their degrees, skills, and projects into a single shareable profile backed by blockchain technology (**Polygon Amoy**), making every achievement tamper-evident and instantly verifiable.

Students own their records. Institutions verify them. Anyone can trust them.

## ✨ Key Features

- **🛡️ Verifiable by Design:** Every credential is independently checkable on-chain.
- **🔗 One Link, Every Credential:** A single profile that carries degrees, projects, and achievements.
- **🌐 Portable:** Your identity isn't locked to one university portal or job board.
- **📄 Tamper-Evident History:** Cryptographic hashes (`SHA-256`) ensure what you show is exactly what you earned.
- **👛 Web3 Wallet Ready:** Built to connect seamlessly with MetaMask on the Polygon Amoy Testnet.

## 🏗️ Architecture

ProofID is a monorepo consisting of two main parts:

### 1. Frontend (`/proofid`)
A modern, responsive Next.js application that provides the user interface for students, verifiers, and admins.
- **Framework:** Next.js (React 19) + App Router
- **Styling:** Tailwind CSS + Radix UI + Framer Motion
- **Web3 Integration:** `wagmi` + `viem` (Targeting MetaMask)
- **Data Persistence:** Currently utilizes browser cache, with IPFS integration on the roadmap for decentralized JSON profile anchoring.

### 2. Smart Contracts (`/proofid-contracts/proofid-contracts`)
A minimal, gas-conscious Hardhat project containing the on-chain registry (`ProofIDRegistry.sol`).
- **Network:** Polygon Amoy Testnet (Chain ID: `80002`)
- **Storage:** Only the `bytes32 profileHash` (SHA-256 of off-chain data) and core identity anchors (`fullName`, `university`) are stored on-chain.
- **Roles:** The student (wallet owner) manages profile updates; the institution (contract owner) handles verification toggles.

## 🚀 Getting Started

To run this project locally, you will need **Node.js** (v18+) and **npm/yarn/pnpm**.

### 1. Clone the repository
```bash
git clone https://github.com/ShounaksHub/CredChain.git
cd CredChain
```

### 2. Run the Frontend
```bash
cd proofid
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 3. Deploy the Smart Contracts (Optional)
If you want to deploy your own instance of the registry to Polygon Amoy:
```bash
cd proofid-contracts/proofid-contracts
npm install
cp .env.example .env
# Fill in your PRIVATE_KEY, RPC_URL, and POLYGONSCAN_API_KEY in .env

# Compile the contracts
npm run compile

# Run tests
npm test

# Deploy
npx hardhat ignition deploy ignition/modules/ProofIDRegistry.ts --network polygonAmoy
```

## 🛣️ Roadmap

- **Phase 1:** Core UI/UX design and Next.js routing **(Completed)**
- **Phase 2:** Web3 Wallet Integration and Profile Hash verification logic **(Current Stage)**
- **Phase 3:** IPFS integration for fully decentralized off-chain profile storage.
- **Phase 4:** Live smart contract deployments and dynamic interactions from the frontend.
- **Phase 5:** Admin portal for universities to seamlessly verify student records.
- **Phase 6:** Gasless transactions (meta-transactions) for frictionless student onboarding.

---
<div align="center">
  <i>Built for the future of decentralized education and identity.</i>
</div>
