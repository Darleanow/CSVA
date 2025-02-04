import { NextRequest } from "next/server";
import { auth } from "firebase-admin";

export async function validateToken(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split("Bearer ")[1];
    if (!token) throw new Error("No token provided");

    const decodedToken = await auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("Token validation error:", error);
    return null;
  }
}
