import { verifyPassword } from "@/lib/crypto";
import { generateAccessToken } from "@/lib/jsonwebtoken";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find user 
    const userExist = await prisma.users.findFirst({
        where: {email}
    })

    if(!userExist){
        return NextResponse.json({ error: "Incorrect user credentials" }, { status: 404 });
    }

    // check if password is same
    const isVerified = verifyPassword(password, userExist.salt, userExist.passkey)

    if(!isVerified){
        return NextResponse.json({ error: "Incorrect user credentials" }, { status: 404 });
    }

    const accessToken = generateAccessToken(userExist.id);
    const { passkey, salt, ...publicData } = userExist;

      const userPayload = {
        accessToken,
        ...publicData
      };

    // if pass , send success
    return NextResponse.json(
        { user: userPayload, success: true },
        { status: 200 }
      );

  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
