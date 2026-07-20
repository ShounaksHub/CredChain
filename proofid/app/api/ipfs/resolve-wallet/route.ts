import { NextResponse } from "next/server";
import { rateLimit } from "@/utils/rate-limit";
import { validateZod, walletAddressSchema } from "@/utils/validation";

export async function GET(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { success, limit, remaining, resetTime } = await rateLimit(`ipfs-resolve-wallet-${ip}`, "read");
    const rlHeaders = {
      "X-RateLimit-Limit": String(limit ?? 100),
      "X-RateLimit-Remaining": String(remaining ?? 0),
      "Retry-After": String(Math.max(0, Math.ceil(((resetTime ?? Date.now()) - Date.now()) / 1000))),
    };

    if (!success) {
      return new NextResponse("Too many requests", { status: 429, headers: rlHeaders });
    }

    const { searchParams } = new URL(request.url);
    const rawWallet = searchParams.get("walletAddress");

    if (!rawWallet) {
      return new NextResponse("Missing walletAddress parameter", { status: 400, headers: rlHeaders });
    }

    let walletAddress: string;
    try {
      walletAddress = validateZod(walletAddressSchema, rawWallet);
    } catch (err: any) {
      return new NextResponse(err.message, { status: 400, headers: rlHeaders });
    }

    const pinataJwt = process.env.PINATA_JWT;
    if (!pinataJwt) {
      const { readMockDb } = await import("@/lib/ipfs/mock-helper");
      const db = readMockDb();
      const match = db.find((x) => x.walletAddress.toLowerCase() === walletAddress.toLowerCase());
      if (!match) {
        return new NextResponse("Profile not found for wallet", { status: 404, headers: rlHeaders });
      }
      return NextResponse.json({
        cid: match.cid,
        username: match.username,
      }, { headers: rlHeaders });
    }

    // Query Pinata list API
    const query = `status=pinned&metadata[keyvalues]={"walletAddress":{"value":"${walletAddress.toLowerCase()}","op":"eq"}}`;
    const res = await fetch(`https://api.pinata.cloud/data/pinList?${query}`, {
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
      },
    });

    if (!res.ok) {
      return new NextResponse("Failed to query Pinata", { status: res.status, headers: rlHeaders });
    }

    const data = await res.json();
    if (!data.rows || data.rows.length === 0) {
      return new NextResponse("Profile not found for wallet", { status: 404, headers: rlHeaders });
    }

    // Get the latest pin
    const pin = data.rows[0];
    const cid = pin.ipfs_pin_hash;
    const username = pin.metadata?.keyvalues?.username || "";

    return NextResponse.json({
      cid,
      username,
    }, { headers: rlHeaders });
  } catch (error: any) {
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
