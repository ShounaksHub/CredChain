import { verifyMessage } from "viem";

export async function verifySignature(
  address: string,
  message: string,
  signature: string
): Promise<boolean> {
  try {
    const isValid = await verifyMessage({
      address: address as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });
    return isValid;
  } catch (error) {
    console.error("[auth] Signature verification failed:", error);
    return false;
  }
}

export function generateAuthMessage(walletAddress: string, timestamp: number): string {
  return `Login to CredChain\nWallet: ${walletAddress.toLowerCase()}\nTimestamp: ${timestamp}`;
}

export function isTimestampValid(timestamp: number, maxAgeMs = 5 * 60 * 1000): boolean {
  const now = Date.now();
  return now - timestamp <= maxAgeMs && timestamp <= now + 60000; // Allow 1 minute clock skew
}
