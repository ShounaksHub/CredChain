import { NextResponse } from "next/server";
import { verifySignature, generateAuthMessage, isTimestampValid } from "@/utils/auth";
import { rateLimit } from "@/utils/rate-limit";
import { validateZod, walletAddressSchema } from "@/utils/validation";

export async function GET(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { success, limit, remaining, resetTime } = await rateLimit(`auth-me-${ip}`, "auth");
    
    const rlHeaders = {
      "X-RateLimit-Limit": String(limit ?? 100),
      "X-RateLimit-Remaining": String(remaining ?? 0),
      "Retry-After": String(Math.max(0, Math.ceil(((resetTime ?? Date.now()) - Date.now()) / 1000))),
    };

    if (!success) {
      return new NextResponse("Too many requests", { status: 429, headers: rlHeaders });
    }

    const { searchParams } = new URL(request.url);
    const rawWallet = searchParams.get("wallet");
    
    // In a real SIWE flow, we'd check session here.
    // For this stateless MVP, we'll just check if the provided wallet address matches the admin address.
    // NOTE: This endpoint ONLY tells the UI if a given string matches the admin wallet. 
    // It DOES NOT authenticate the user for protected actions. 
    // Protected API routes still require a cryptographic signature.
    
    if (!rawWallet) {
      return new NextResponse("Missing wallet address", { status: 400, headers: rlHeaders });
    }

    let walletAddress: string;
    try {
      walletAddress = validateZod(walletAddressSchema, rawWallet);
    } catch (err: any) {
      return new NextResponse(err.message, { status: 400, headers: rlHeaders });
    }

    const adminWallet = process.env.ADMIN_WALLET?.toLowerCase();
    
    if (!adminWallet) {
      return NextResponse.json(
        { isAdmin: false, error: "Admin wallet not configured on server" },
        { headers: rlHeaders }
      );
    }

    const isAdmin = walletAddress.toLowerCase() === adminWallet;
    
    return NextResponse.json({ isAdmin }, { headers: rlHeaders });
  } catch (error: any) {
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
