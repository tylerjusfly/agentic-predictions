// app/settings/actions.ts
"use server";

import { hashPassword } from "@/lib/crypto";
import prisma from "@/lib/prisma";


export async function changePassword(userId: string, newPassword: string) {
  try {
    const hashed = hashPassword(newPassword);

    await prisma.users.update({
      where: { id: userId },
      data: { passkey: hashed.hash, salt: hashed.salt },
    });
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update password" };
  }
}
