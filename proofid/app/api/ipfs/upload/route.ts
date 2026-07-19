import { NextResponse } from "next/server";
import { verifySignature, generateAuthMessage, isTimestampValid } from "@/utils/auth";
import { rateLimit } from "@/utils/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { success } = rateLimit(`ipfs-upload-${ip}`, 10, 60000);
    if (!success) return new NextResponse("Too many requests", { status: 429 });

    const signature = request.headers.get("x-signature");
    const timestampStr = request.headers.get("x-timestamp");

    if (!signature || !timestampStr) {
      return new NextResponse("Unauthorized: Missing auth headers", { status: 401 });
    }

    const timestamp = parseInt(timestampStr, 10);
    if (!isTimestampValid(timestamp)) {
      return new NextResponse("Unauthorized: Request expired", { status: 401 });
    }

    const bodyText = await request.text();
    if (bodyText.length > 50000) {
      return new NextResponse("Payload too large", { status: 413 });
    }
    const { walletAddress, profile } = JSON.parse(bodyText);

    if (!walletAddress || !profile) {
      return new NextResponse("Missing walletAddress or profile", { status: 400 });
    }

    const message = generateAuthMessage(walletAddress, timestamp);
    const isValid = await verifySignature(walletAddress, message, signature);

    if (!isValid) {
      return new NextResponse("Unauthorized: Invalid signature", { status: 401 });
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
