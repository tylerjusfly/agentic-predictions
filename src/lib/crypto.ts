import crypto from "crypto";

export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString("hex"); // unique per user
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");

  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, hash: string): boolean {
  const hashVerify = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");

  return hash === hashVerify;
}
