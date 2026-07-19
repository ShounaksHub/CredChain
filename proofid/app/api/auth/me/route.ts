import { NextResponse } from "next/server";
import { verifySignature, generateAuthMessage, isTimestampValid } from "@/utils/auth";
import { rateLimit } from "@/utils/rate-limit";

export async function GET(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { success } = rateLimit(`auth-me-${ip}`, 20, 60000);
    
    if (!success) {
      return new NextResponse("Too many requests", { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("wallet");
    
    // In a real SIWE flow, we'd check session here.
    // For this stateless MVP, we'll just check if the provided wallet address matches the admin address.
    // NOTE: This endpoint ONLY tells the UI if a given string matches the admin wallet. 
    // It DOES NOT authenticate the user for protected actions. 
    // Protected API routes still require a cryptographic signature.
    
    if (!walletAddress) {
      return new NextResponse("Missing wallet address", { status: 400 });
    }

    const adminWallet = process.env.ADMIN_WALLET?.toLowerCase();
    
    if (!adminWallet) {
      return NextResponse.json({ isAdmin: false, error: "Admin wallet not configured on server" });
    }

    const isAdmin = walletAddress.toLowerCase() === adminWallet;
    
    return NextResponse.json({ isAdmin });
  } catch (error: any) {
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
