import { NextResponse } from "next/server";
import { verifySignature, generateAuthMessage, isTimestampValid } from "@/utils/auth";
import { rateLimit } from "@/utils/rate-limit";
import { validateZod, walletAddressSchema, signatureSchema, timestampSchema } from "@/utils/validation";

/**
 * GET /api/admin/students
 *
 * Returns all pinned profiles from Pinata, ordered by most recent first.
 * Each entry contains wallet address, username, and the IPFS profile data.
 * This is a server-side route — PINATA_JWT never reaches the client.
 */
export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { success, limit, remaining, resetTime } = await rateLimit(`admin-students-${ip}`, "auth");

  const rlHeaders = {
    "X-RateLimit-Limit": String(limit ?? 100),
    "X-RateLimit-Remaining": String(remaining ?? 0),
    "Retry-After": String(Math.max(0, Math.ceil(((resetTime ?? Date.now()) - Date.now()) / 1000))),
  };

  if (!success) return new NextResponse("Too many requests", { status: 429, headers: rlHeaders });

  const rawWallet = request.headers.get("x-wallet-address");
  const rawSignature = request.headers.get("x-signature");
  const rawTimestamp = request.headers.get("x-timestamp");

  if (!rawWallet || !rawSignature || !rawTimestamp) {
    return new NextResponse("Unauthorized: Missing auth headers", { status: 401, headers: rlHeaders });
  }

  let walletAddress: string;
  let signature: string;
  let timestamp: number;

  try {
    walletAddress = validateZod(walletAddressSchema, rawWallet);
    signature = validateZod(signatureSchema, rawSignature);
    timestamp = validateZod(timestampSchema, rawTimestamp);
  } catch (err: any) {
    return new NextResponse(`Unauthorized: ${err.message}`, { status: 401, headers: rlHeaders });
  }
  if (!isTimestampValid(timestamp)) {
    return new NextResponse("Unauthorized: Request expired", { status: 401, headers: rlHeaders });
  }

  const adminWallet = process.env.ADMIN_WALLET?.toLowerCase();
  if (!adminWallet || walletAddress.toLowerCase() !== adminWallet) {
    return new NextResponse("Forbidden: Not an admin", { status: 403, headers: rlHeaders });
  }

  const message = generateAuthMessage(walletAddress, timestamp);
  const isValid = await verifySignature(walletAddress, message, signature);

  if (!isValid) {
    return new NextResponse("Unauthorized: Invalid signature", { status: 401, headers: rlHeaders });
  }
  const pinataJwt = process.env.PINATA_JWT;
  if (!pinataJwt) {
    const { readMockDb } = await import("@/lib/ipfs/mock-helper");
    const db = readMockDb();
    const students = db.map((x) => ({
      cid: x.cid,
      walletAddress: x.walletAddress,
      username: x.username,
      pinnedAt: x.pinnedAt,
    }));
    return NextResponse.json({ students }, { headers: rlHeaders });
  }

  try {
    // Fetch all pinned items (page size 1000 to get all users)
    const res = await fetch(
      "https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=1000",
      {
        headers: { Authorization: `Bearer ${pinataJwt}` },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return new NextResponse(`Pinata error: ${text}`, { status: res.status });
    }

    const data = await res.json();
    const rows: any[] = data.rows ?? [];

    // Filter pins that have a walletAddress keyvalue (i.e. are profile pins)
    const profilePins = rows.filter(
      (row) => row.metadata?.keyvalues?.walletAddress
    );

    // For each pin, collect the metadata we need for the table
    const students = profilePins.map((pin) => {
      const kv = pin.metadata?.keyvalues ?? {};
      return {
        cid: pin.ipfs_pin_hash as string,
        walletAddress: (kv.walletAddress ?? "") as string,
        username: (kv.username ?? "") as string,
        pinnedAt: pin.date_pinned as string,
      };
    });

    return NextResponse.json({ students }, { headers: rlHeaders });
  } catch (err: any) {
    console.error("[admin/students] Error:", err);
    return new NextResponse(err.message || "Internal Server Error", {
      status: 500,
      headers: rlHeaders
    });
  }
}
