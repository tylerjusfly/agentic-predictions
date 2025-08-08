import dotenv from "dotenv";
dotenv.config();

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY
export const GEMINI_MODEL = process.env.GEMINI_MODEL
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY
export const JWT_ACCESS_TOKEN = '12e04c5fb9eb4e3cfae1ec00126f3fb7'
export const JWT_REFRESH_TOKEN = 'fab55130eac8572ccff0cce913144f5d'
export const REFRESH_TOKEN_EXPIRY = '1W'
export const ACCESS_TOKEN_EXPIRY = '1H'
export const NODE_ENV =  process.env.NODE_ENV
export const WEB_URL =  process.env.WEB_URL

export const SMTP_USER = process.env.SMTP_USER
export const SMTP_HOST = process.env.SMTP_HOST
export const SMTP_SECURE = process.env.SMTP_SECURE
export const SMTP_PASS = process.env.SMTP_PASS

export const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY