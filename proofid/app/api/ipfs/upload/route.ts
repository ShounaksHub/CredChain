import { NextResponse } from "next/server";
import { verifySignature, generateAuthMessage, isTimestampValid } from "@/utils/auth";
import { rateLimit } from "@/utils/rate-limit";
import { validateZod, walletAddressSchema, signatureSchema, timestampSchema, profileSchema } from "@/utils/validation";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    
    const bodyText = await request.text();
    if (bodyText.length > 50000) {
      return new NextResponse("Payload too large", { status: 413 });
    }
    
    let parsedBody;
    try {
      parsedBody = JSON.parse(bodyText);
    } catch (err) {
      return new NextResponse("Invalid JSON payload", { status: 400 });
    }

    let walletAddress: string;
    let profile: any;
    try {
      walletAddress = validateZod(walletAddressSchema, parsedBody.walletAddress);
      profile = validateZod(profileSchema, parsedBody.profile);
    } catch (err: any) {
      return new NextResponse(err.message, { status: 400 });
    }

    const { success, limit, remaining, resetTime } = await rateLimit(`ipfs-upload-${ip}-${walletAddress || "unknown"}`, "write");
    
    const rlHeaders = {
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "Retry-After": Math.max(0, Math.ceil((resetTime - Date.now()) / 1000)).toString(),
    };

    if (!success) return new NextResponse("Too many requests", { status: 429, headers: rlHeaders });

    const rawSignature = request.headers.get("x-signature");
    const rawTimestampStr = request.headers.get("x-timestamp");

    if (!rawSignature || !rawTimestampStr) {
      return new NextResponse("Unauthorized: Missing auth headers", { status: 401, headers: rlHeaders });
    }

    let signature: string;
    let timestamp: number;

    try {
      signature = validateZod(signatureSchema, rawSignature);
      timestamp = validateZod(timestampSchema, rawTimestampStr);
    } catch (err: any) {
      return new NextResponse(`Unauthorized: ${err.message}`, { status: 401, headers: rlHeaders });
    }

    if (!isTimestampValid(timestamp)) {
      return new NextResponse("Unauthorized: Request expired", { status: 401, headers: rlHeaders });
    }

    const message = generateAuthMessage(walletAddress, timestamp);
    const isValid = await verifySignature(walletAddress, message, signature);

    if (!isValid) {
      return new NextResponse("Unauthorized: Invalid signature", { status: 401, headers: rlHeaders });
    }

    const pinataJwt = process.env.PINATA_JWT;
    if (!pinataJwt) {
      // Fallback to local mock database
      const { saveMockProfile } = await import("@/lib/ipfs/mock-helper");
      const cid = saveMockProfile(walletAddress, profile);
      return NextResponse.json({ cid }, { headers: rlHeaders });
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
      return new NextResponse(`Pinata upload failed: ${errorText}`, { status: res.status, headers: rlHeaders });
    }

    const result = await res.json();
    return NextResponse.json({
      cid: result.IpfsHash,
    }, { headers: rlHeaders });
  } catch (error: any) {
    return new NextResponse(error.message || "Internal Server Error", { status: 500 }); // Do not include headers if parsing failed before rlHeaders was defined
  }
}
