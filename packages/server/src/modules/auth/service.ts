import { Request, Response } from "express";
import { generateAccessToken, generateRefreshToken } from "../../middlewares/jsonwebtoken";
import { NODE_ENV, WEB_URL } from "../../utils/enviroments";
import { v4 as uuidv4 } from "uuid";
import { emailService } from "../notification/nodemailer";

export default class AuthService {
  public register = async (req: Request, res: Response): Promise<any> => {
    try {
      const { name, email } = req.body;

      const accessToken = generateAccessToken("");
      const refreshToken = generateRefreshToken("");

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: "strict"
      });

      const userPayload = {
        id: uuidv4(),
        email
      };

      // Send an email and generate password
      await emailService.sendHtmlEmail({
        to: email,
        subject: "Welcome to Our Service",
        html: `
      <h1>Welcome ${name}!</h1>
      <p>Thank you for joining our service.</p>
      <a href="${WEB_URL}/welcome/${accessToken}">Click here to verify your email</a>
      <p>We're excited to have you on board!</p>
      `
      });

      return res.status(201).json({ success: true, user: userPayload });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || "Error creating account" });
    }
  };
}
