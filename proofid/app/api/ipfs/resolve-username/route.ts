import { NextResponse } from "next/server";
import { rateLimit } from "@/utils/rate-limit";
import { validateZod, usernameSchema } from "@/utils/validation";

export async function GET(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { success, limit, remaining, resetTime } = await rateLimit(`ipfs-resolve-username-${ip}`, "read");
    const rlHeaders = {
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "Retry-After": Math.max(0, Math.ceil((resetTime - Date.now()) / 1000)).toString(),
    };

    if (!success) {
      return new NextResponse("Too many requests", { status: 429, headers: rlHeaders });
    }

    const { searchParams } = new URL(request.url);
    const rawUsername = searchParams.get("username");

    if (!rawUsername) {
      return new NextResponse("Missing username parameter", { status: 400, headers: rlHeaders });
    }

    let username: string;
    try {
      username = validateZod(usernameSchema, rawUsername);
    } catch (err: any) {
      return new NextResponse(err.message, { status: 400, headers: rlHeaders });
    }

    const pinataJwt = process.env.PINATA_JWT;
    if (!pinataJwt) {
      const { readMockDb } = await import("@/lib/ipfs/mock-helper");
      const db = readMockDb();
      const match = db.find((x) => x.username.toLowerCase() === username.toLowerCase());
      if (!match) {
        return new NextResponse("Profile not found for username", { status: 404, headers: rlHeaders });
      }
      return NextResponse.json({
        cid: match.cid,
        walletAddress: match.walletAddress,
      }, { headers: rlHeaders });
    }

    // Query Pinata list API
    const query = `status=pinned&metadata[keyvalues]={"username":{"value":"${username.toLowerCase()}","op":"eq"}}`;
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
      return new NextResponse("Profile not found for username", { status: 404, headers: rlHeaders });
    }

    // Get the latest pin
    const pin = data.rows[0];
    const cid = pin.ipfs_pin_hash;
    const walletAddress = pin.metadata?.keyvalues?.walletAddress || "";

    return NextResponse.json({
      cid,
      walletAddress,
    }, { headers: rlHeaders });
  } catch (error: any) {
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
