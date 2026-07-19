import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cid = searchParams.get("cid");

    if (!cid) {
      return new NextResponse("Missing cid parameter", { status: 400 });
    }

    if (cid.startsWith("QmMockIPFSGatewayHash")) {
      const { readMockDb } = await import("@/lib/ipfs/mock-helper");
      const db = readMockDb();
      const match = db.find((x) => x.cid === cid);
      if (match) {
        return NextResponse.json(match.profile);
      }
      return new NextResponse("Mock profile not found", { status: 404 });
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
          return NextResponse.json(data);
        }
      } catch (err) {
        lastError = err;
      }
    }

    return new NextResponse(`Failed to fetch from gateways: ${lastError?.toString()}`, { status: 502 });
  } catch (error: any) {
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
