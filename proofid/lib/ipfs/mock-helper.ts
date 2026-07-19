import fs from "fs";
import path from "path";

export interface MockProfileEntry {
  cid: string;
  walletAddress: string;
  username: string;
  pinnedAt: string;
  profile: any;
}

const DB_PATH = path.join(process.cwd(), "lib", "ipfs", "mock-db.json");

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

export function readMockDb(): MockProfileEntry[] {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return [];
    }
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading mock DB:", e);
    return [];
  }
}

export function writeMockDb(data: MockProfileEntry[]) {
  try {
    ensureDirectoryExistence(DB_PATH);
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing mock DB:", e);
  }
}

export function saveMockProfile(walletAddress: string, profile: any): string {
  const db = readMockDb();
  const cleanWallet = walletAddress.toLowerCase();
  const username = (profile.username || "").toLowerCase();
  
  // Generate a mock CID using a simple hash prefix
  const cid = `QmMockIPFSGatewayHash${Math.abs(
    cleanWallet.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  )}${Date.now().toString().slice(-4)}`;

  const newEntry: MockProfileEntry = {
    cid,
    walletAddress: cleanWallet,
    username,
    pinnedAt: new Date().toISOString(),
    profile,
  };

  // Remove old entry for same wallet if exists
  const filtered = db.filter((x) => x.walletAddress !== cleanWallet && x.username !== username);
  filtered.push(newEntry);
  writeMockDb(filtered);

  return cid;
}
