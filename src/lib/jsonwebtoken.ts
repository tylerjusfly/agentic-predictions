import jwt from "jsonwebtoken";

import { ACCESS_TOKEN_EXPIRY, JWT_ACCESS_TOKEN, JWT_REFRESH_TOKEN, REFRESH_TOKEN_EXPIRY } from "./constants";

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_ACCESS_TOKEN, { expiresIn: ACCESS_TOKEN_EXPIRY, subject: 'accessApi' });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_REFRESH_TOKEN , { expiresIn: REFRESH_TOKEN_EXPIRY, subject: 'refreshToken' });
};
