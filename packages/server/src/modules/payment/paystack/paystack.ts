import axios from "axios";
import { NextFunction, Request, Response } from "express";
import { PAYSTACK_SECRET_KEY } from "../../../utils/enviroments";
import { dbGet, dbRun } from "../../../utils/databaseHelpers";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";

const PAYSTACK_BASE_URL = "https://api.paystack.co/charge";
const headers = {
  Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
};

interface Transaction {
  id: string;
  email: string;
  amount: number;
  status: string;
  reference: string;
  payment_month: string;
  created_at: string;
}

export default class PaystackAPIService {
  // Initial charge
  public InitialCharge = async (req: Request, res: Response): Promise<any> => {
    try {
      const { email, card } = req.body;
      const response = await axios.post(PAYSTACK_BASE_URL, { email, amount: 1000 * 100, card }, { headers });

      const chargeData = response.data.data;
      const ref = chargeData.reference;
      const transactionStatus = chargeData.status as string;

      const now = moment();
      const currentMonth = now.format("YYYY-MM");
      const TID = uuidv4();

      await dbRun(
        `INSERT INTO transactions (
                id, email, amount, status, reference, payment_month
              ) VALUES (?, ?, ?, ?, ?, ?)`,
        [TID, email, 1000, transactionStatus, ref, currentMonth]
      );

      return res.json({
        success: true,
        message: chargeData.display_text || chargeData.status,
        reference: ref,
        next_action: chargeData.next_action || "submit_pin or submit_otp maybe"
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.response?.data || error.message
      });
    }
  };

  public SubmitPin = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { reference, pin } = req.body;

      // Find Ref
      const TransactData = (await dbGet("SELECT * FROM transactions WHERE reference = ?", [reference])) as
        | Transaction
        | undefined;

      if (!TransactData) {
        return res.status(400).json({
          success: false,
          error: "Transaction error, Please message support with reference ID."
        });
      }

      const response = await axios.post(`${PAYSTACK_BASE_URL}/submit_pin`, { reference, pin }, { headers });

      const chargeData = response.data.data;

      const transactionStatus = chargeData.status;

      await dbRun(
        `UPDATE transactions
             SET status = ?
             WHERE id = ?`,
        [transactionStatus, TransactData.id]
      );

      if (transactionStatus !== "success") {
        return res.json({
          success: true,
          message: chargeData.display_text || chargeData.status
        });
      }

      req.body.email = TransactData.email;
      req.body.reference = TransactData.reference;
      req.body.subsribed_at = TransactData.payment_month;
      req.body.status = chargeData.status;

      next();
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.response?.data || error.message
      });
    }
  };

  public SubmitOTP = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { reference, otp } = req.body;

      const TransactData = (await dbGet("SELECT * FROM transactions WHERE reference = ?", [reference])) as
        | Transaction
        | undefined;

      if (!TransactData) {
        return res.status(400).json({
          success: false,
          error: "Transaction error, Please message support with reference ID."
        });
      }

      const response = await axios.post(`${PAYSTACK_BASE_URL}/submit_otp`, { reference, otp }, { headers });

      const chargeData = response.data.data;
      const transactionStatus = chargeData.status;

      await dbRun(
        `UPDATE transactions
             SET status = ?
             WHERE id = ?`,
        [transactionStatus, TransactData.id]
      );

      if (transactionStatus !== "success") {
        return res.json({
          success: true,
          message: chargeData.display_text || chargeData.status
        });
      }

      req.body.email = TransactData.email;
      req.body.reference = TransactData.reference;
      req.body.subsribed_at = TransactData.payment_month;
      req.body.status = chargeData.status;

      next();
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.response?.data || error.message
      });
    }
  };
}
