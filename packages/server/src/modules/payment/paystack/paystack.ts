import axios from "axios";
import { Request, Response } from "express";
import { PAYSTACK_SECRET_KEY } from "../../../utils/enviroments";

const PAYSTACK_BASE_URL = "https://api.paystack.co/charge";
const headers = {
  Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
};

// In-memory transaction store for demo (use a real DB in production)
interface Transaction {
  email: string;
  amount: number;
  status: string;
}
const transactions: { [reference: string]: Transaction } = {};

export default class PaystackAPIService {
  // Initial charge
  public InitialCharge = async (req: Request, res: Response): Promise<any> => {
    const { email, amount, card } = req.body;

    try {
      const response = await axios.post(PAYSTACK_BASE_URL, { email, amount: amount * 100, card }, { headers });

      const chargeData = response.data.data;
      const ref = chargeData.reference;

      transactions[ref] = { email, amount, status: chargeData.status };

      console.log(chargeData);

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

  public SubmitPin = async (req: Request, res: Response): Promise<any> => {
    try {
      const { reference, pin } = req.body;

      const response = await axios.post(`${PAYSTACK_BASE_URL}/submit_pin`, { reference, pin }, { headers });

      const chargeData = response.data.data;
      transactions[reference].status = chargeData.status;

      return res.json({
        success: chargeData.status === "success",
        message: chargeData.display_text || chargeData.status
      });

    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.response?.data || error.message
      });
    }
  };

    public SubmitOTP = async (req: Request, res: Response): Promise<any> => {
    try {
      const { reference, otp } = req.body;

      const response = await axios.post(`${PAYSTACK_BASE_URL}/submit_otp`, { reference, otp }, { headers });

      const chargeData = response.data.data;
      transactions[reference].status = chargeData.status;

      return res.json({
        success: chargeData.status === "success",
        message: chargeData.display_text || chargeData.status
      });

    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.response?.data || error.message
      });
    }
  };
}
