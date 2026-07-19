import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("walletAddress");

    if (!walletAddress) {
      return new NextResponse("Missing walletAddress parameter", { status: 400 });
    }

    const pinataJwt = process.env.PINATA_JWT;
    if (!pinataJwt) {
      const { readMockDb } = await import("@/lib/ipfs/mock-helper");
      const db = readMockDb();
      const match = db.find((x) => x.walletAddress.toLowerCase() === walletAddress.toLowerCase());
      if (!match) {
        return new NextResponse("Profile not found for wallet", { status: 404 });
      }
      return NextResponse.json({
        cid: match.cid,
        username: match.username,
      });
    }

    // Query Pinata list API
    const query = `status=pinned&metadata[keyvalues]={"walletAddress":{"value":"${walletAddress.toLowerCase()}","op":"eq"}}`;
    const res = await fetch(`https://api.pinata.cloud/data/pinList?${query}`, {
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
      },
    });

    if (!res.ok) {
      return new NextResponse("Failed to query Pinata", { status: res.status });
    }

    const data = await res.json();
    if (!data.rows || data.rows.length === 0) {
      return new NextResponse("Profile not found for wallet", { status: 404 });
    }

    // Get the latest pin
    const pin = data.rows[0];
    const cid = pin.ipfs_pin_hash;
    const username = pin.metadata?.keyvalues?.username || "";

    return NextResponse.json({
      cid,
      username,
    });
  } catch (error: any) {
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
