import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { polygonAmoy } from "viem/chains";
import { proofIdRegistryAbi, PROOFID_REGISTRY_ADDRESS } from "@/lib/contracts/config";
import { rateLimit } from "@/utils/rate-limit";
import { validateZod, walletAddressSchema } from "@/utils/validation";

/**
 * GET /api/admin/chain-status?wallet=0x...
 *
 * Reads the verification status of a student DIRECTLY from the smart contract.
 * Never uses cached values — always fetches fresh from chain via a public RPC.
 */
export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { success, limit, remaining, resetTime } = await rateLimit(`chain-status-${ip}`, "read");
  const rlHeaders = {
    "X-RateLimit-Limit": String(limit ?? 100),
    "X-RateLimit-Remaining": String(remaining ?? 0),
    "Retry-After": String(Math.max(0, Math.ceil(((resetTime ?? Date.now()) - Date.now()) / 1000))),
  };

  if (!success) {
    return new NextResponse("Too many requests", { status: 429, headers: rlHeaders });
  }

  const { searchParams } = new URL(request.url);
  const rawWallet = searchParams.get("wallet");

  if (!rawWallet) {
    return new NextResponse("Missing wallet address", { status: 400, headers: rlHeaders });
  }

  let wallet: string;
  try {
    wallet = validateZod(walletAddressSchema, rawWallet);
  } catch (err: any) {
    return new NextResponse(err.message, { status: 400, headers: rlHeaders });
  }

  // Bail out early if the contract address is still the placeholder
  if (PROOFID_REGISTRY_ADDRESS === "0xYOUR_DEPLOYED_CONTRACT_ADDRESS_HERE") {
    return NextResponse.json({ isVerified: null, error: "Contract not deployed" }, { headers: rlHeaders });
  }

  try {
    const client = createPublicClient({
      chain: polygonAmoy,
      transport: http(),
    });

    const result = await client.readContract({
      address: PROOFID_REGISTRY_ADDRESS,
      abi: proofIdRegistryAbi,
      functionName: "getProfile",
      args: [wallet as `0x${string}`],
    });

    // getProfile returns a tuple; index 8 is the `verified` bool
    const profileTuple = result as readonly [
      `0x${string}`, // wallet_
      string,        // fullName
      string,        // university
      string,        // department
      number,        // graduationYear
      `0x${string}`, // profileHash
      number,        // createdAt
      number,        // updatedAt
      boolean,       // verified
    ];

    return NextResponse.json({
      isVerified: profileTuple[8],
      walletAddress: profileTuple[0],
    }, { headers: rlHeaders });
  } catch (err: any) {
    const msg: string = err?.message ?? "";
    // ProfileDoesNotExist is a known revert — treat as "no profile"
    if (msg.toLowerCase().includes("profiledoesnotexist")) {
      return NextResponse.json({ isVerified: null, profileMissing: true }, { headers: rlHeaders });
    }
    console.error("[chain-status] Error:", err);
    return NextResponse.json(
      { isVerified: null, error: msg.slice(0, 200) },
      { status: 200, headers: rlHeaders } // return 200 so the client can handle gracefully
    );
  }
}
