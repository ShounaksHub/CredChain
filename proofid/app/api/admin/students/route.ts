import { NextResponse } from "next/server";

/**
 * GET /api/admin/students
 *
 * Returns all pinned profiles from Pinata, ordered by most recent first.
 * Each entry contains wallet address, username, and the IPFS profile data.
 * This is a server-side route — PINATA_JWT never reaches the client.
 */
export async function GET() {
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
    return NextResponse.json({ students });
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

    return NextResponse.json({ students });
  } catch (err: any) {
    console.error("[admin/students] Error:", err);
    return new NextResponse(err.message || "Internal Server Error", {
      status: 500,
    });
  }
}
