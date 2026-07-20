import { NextResponse } from "next/server";
import { rateLimit } from "@/utils/rate-limit";
import { validateZod, cidSchema } from "@/utils/validation";

export async function GET(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { success, limit, remaining, resetTime } = await rateLimit(`ipfs-cat-${ip}`, "read");
    const rlHeaders = {
      "X-RateLimit-Limit": String(limit ?? 100),
      "X-RateLimit-Remaining": String(remaining ?? 0),
      "Retry-After": String(Math.max(0, Math.ceil(((resetTime ?? Date.now()) - Date.now()) / 1000))),
    };

    if (!success) {
      return new NextResponse("Too many requests", { status: 429, headers: rlHeaders });
    }

    const { searchParams } = new URL(request.url);
    const rawCid = searchParams.get("cid");

    if (!rawCid) {
      return new NextResponse("Missing cid parameter", { status: 400, headers: rlHeaders });
    }

    let cid: string;
    try {
      cid = validateZod(cidSchema, rawCid);
    } catch (err: any) {
      return new NextResponse(err.message, { status: 400, headers: rlHeaders });
    }

    if (cid.startsWith("QmMockIPFSGatewayHash")) {
      const { readMockDb } = await import("@/lib/ipfs/mock-helper");
      const db = readMockDb();
      const match = db.find((x) => x.cid === cid);
      if (match) {
        return NextResponse.json(match.profile, { headers: rlHeaders });
      }
      return new NextResponse("Mock profile not found", { status: 404, headers: rlHeaders });
    }

    const gateways = [
      `https://ipfs.io/ipfs/${cid}`,
      `https://cloudflare-ipfs.com/ipfs/${cid}`,
      `https://gateway.pinata.cloud/ipfs/${cid}`,
    ];

    let lastError = null;
    for (const url of gateways) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data, { headers: rlHeaders });
        }
      } catch (err) {
        lastError = err;
      }
    }

    return new NextResponse(`Failed to fetch from gateways: ${lastError?.toString()}`, { status: 502, headers: rlHeaders });
  } catch (error: any) {
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
