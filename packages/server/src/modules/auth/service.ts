import { Request, Response } from "express";
import { generateAccessToken, generateRefreshToken } from "../../middlewares/jsonwebtoken";
import { NODE_ENV, WEB_URL } from "../../utils/enviroments";
import { v4 as uuidv4 } from "uuid";
import { emailService } from "../notification/nodemailer";
import { dbGet, dbRun } from "../../utils/databaseHelpers";

type IUser = {
  id: string
  email: string
  passkey: string
  subscribed: number,
  subsribed_at: null |string,
  created_at: string
}


export default class AuthService {
  public register = async (req: Request, res: Response): Promise<any> => {
    try {
      const { name, email } = req.body;

      const userPayload = {
        id: uuidv4(),
        email
      };

      const passkey = "test2";
      const hashedPasskey = passkey;

      await dbRun(
        `INSERT INTO users (
                id, email, passkey, subscribed
              ) VALUES (?, ?, ?, ?)`,
        [userPayload.id, userPayload.email, hashedPasskey, false]
      );

      // Send an email and generate password
      await emailService.sendHtmlEmail({
        to: email,
        subject: "Welcome to Our Service",
        html: `
      <h1>Welcome ${name}!</h1>
      <p>Thank you for joining our service.</p>
      <ul>
        <li>Pass Key: ${passkey}</li>
      </ul>
      <p>We're excited to have you on board!</p>
      `
      });

      return res.status(201).json({ success: true, user: userPayload });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || "Error creating account" });
    }
  };

  public login = async (req: Request, res: Response): Promise<any> => {
    try {
      const { password, email } = req.body;

      const userData = await dbGet("SELECT * FROM users WHERE email = ?", [email]) as IUser | undefined;

      if(!userData){
        return res.status(400).json({ success: false, error: "Invalid credentials" });
      }
      if(password !== userData.passkey){
        return res.status(400).json({ success: false, error: "Invalid credentials" });
      }

      const accessToken = generateAccessToken(userData.id);
      // const refreshToken = generateRefreshToken("");

      // res.cookie("refreshToken", refreshToken, {
      //   httpOnly: true,
      //   secure: NODE_ENV === "production",
      //   sameSite: "strict"
      // });
      
     const { passkey, ...publicData } = userData;

      const userPayload = {
        accessToken,
        ...publicData
      };

      return res.status(201).json({ success: true, user: userPayload });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || "Login Error" });
    }
  };
}
