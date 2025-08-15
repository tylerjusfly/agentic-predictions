/* eslint-disable @typescript-eslint/no-explicit-any */
import { hashPassword } from "@/lib/crypto";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// POST /api/users
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, reference, subsribed_at } = body;

    if (!email || !reference || !subsribed_at) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

      const passkey = "test2";
     
      const { salt, hash } = hashPassword(passkey);

  const newUser = await prisma.users.create({
      data: {
        id: uuidv4(),
        email,
        reference,
        passkey: hash,
        // salt,
        subsribed_at: subsribed_at
      }
    });

    // delete newUser?.passkey

    return NextResponse.json(
      { message: "User created successfully", user: newUser },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
