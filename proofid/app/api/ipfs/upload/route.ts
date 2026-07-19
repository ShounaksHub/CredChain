import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { walletAddress, profile } = await request.json();

    if (!walletAddress || !profile) {
      return new NextResponse("Missing walletAddress or profile", { status: 400 });
    }

    const pinataJwt = process.env.PINATA_JWT;
    if (!pinataJwt) {
      // Fallback to local mock database
      const { saveMockProfile } = await import("@/lib/ipfs/mock-helper");
      const cid = saveMockProfile(walletAddress, profile);
      return NextResponse.json({ cid });
    }

    // Prepare JSON body for pinning
    const body = {
      pinataContent: profile,
      pinataMetadata: {
        name: `credchain-profile-${walletAddress.toLowerCase()}`,
        keyvalues: {
          username: profile.username.toLowerCase(),
          walletAddress: walletAddress.toLowerCase(),
        },
      },
    };

    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${pinataJwt}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return new NextResponse(`Pinata upload failed: ${errorText}`, { status: res.status });
    }

    const result = await res.json();
    return NextResponse.json({
      cid: result.IpfsHash,
    });
  } catch (error: any) {
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
