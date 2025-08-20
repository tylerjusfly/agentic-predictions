import { hashPassword } from "@/lib/crypto";
import prisma from "@/lib/prisma";
import { generatePassword } from "@/lib/utils";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// POST /api/users
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Some fields are missing, Try again." },
        { status: 400 }
      );
    }

      const passkey = generatePassword(10);
     
      const { salt, hash } = hashPassword(passkey);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const newUser = await prisma.users.create({
      data: {
        id: uuidv4(),
        email,
        reference: "",
        passkey: hash,
        salt,
        subsribed_at: ""
      }
    });

    // SEND EMAIL HERE

    return NextResponse.json(
      { success: true },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Email already exists, Give us a different one." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error, Try again later." },
      { status: 500 }
    );
  }
}
