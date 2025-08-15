import { request } from "../lib/request";

type cardData = {
  email: string;
  card: { number: string; expiry_month: string; expiry_year: string; cvv: string };
};
type Ires = {
  reference: string;
  message: string;
};

type Pinres = {
  success: boolean;
  message: string
};

type PinProps = {
  reference: string;
  pin?: string;
  otp?: string
};

export const payWithCard = async (payload: cardData): Promise<Ires> => {
  return await request("v1/paystack/charge", "POST", payload);
};

export const submitPinForCard = async (payload: PinProps): Promise<Pinres> => {
  return await request("v1/paystack/request_pin", "POST", payload);
};

export const submitOtpForCard = async (payload: PinProps): Promise<Pinres> => {
  return await request("v1/paystack/request_otp", "POST", payload);
};
