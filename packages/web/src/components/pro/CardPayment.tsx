import React, { useState } from "react";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { Input } from "../ui/input"; // assuming this exists
// import { payWithCard } from "@/lib/api"; // adjust path
import { cn, extractMonthYear, isCardExpired } from "@/src/lib/utils";
import { payWithCard } from "@/src/api/payment";

const isValidExpiry = (value: string) => {
  const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  return regex.test(value);
};

const CardPayment = ({ setReference, setStep }: { setReference: (ref: string) => void; setStep: (step: number) => void }) => {
  const [formData, setFormData] = useState({
    email: "",
    number: "",
    expiry_month: "",
    cvv: ""
  });

  const [errors, setErrors] = useState({
    email: "",
    number: "",
    expiry_month: "",
    cvv: ""
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleStepOne = async () => {
    const newErrors: any = {};

    if (!formData.email || !formData.email.includes("@")) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.number || formData.number.length < 12) {
      newErrors.number = "Please enter a valid card number";
    }
    if (!isValidExpiry(formData.expiry_month)) {
      newErrors.expiry_month = "Format must be MM/YYYY";
    }

    if (isCardExpired(formData.expiry_month)) {
      newErrors.expiry_month = "Invalid card date";
    }

    if (!formData.cvv || formData.cvv.length < 3) {
      newErrors.cvv = "Enter valid CVV";
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      const result = extractMonthYear(formData.expiry_month);
      const payLoad = {
        email: formData.email,
        card: {
          number: formData.number,
          expiry_month: result.month,
          expiry_year: result.year,
          cvv: formData.cvv
        }
      };

      const res = await payWithCard(payLoad);
      if (res?.reference) {
        setReference(res.reference);

        res.message === "success" ? setStep(4) : setStep(2);
      } else {
        alert("Payment is down at the moment, Please message support.");
      }
    } catch (err) {
      //   console.error(err);
      alert("Payment is down at the moment, Please message support.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 mb-8 shadow-xl border border-white/20 text-left">
      <div className="space-y-4">
        {/* Email */}
        <div className="flex flex-col gap-1 font-sans">
          <label className="text-sm text-gray-800">Your email address</label>
          <Input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className={cn(
              "p-2 border rounded focus:outline-none focus:ring-1",
              errors.email ? "border-red-500 focus:ring-red-50" : "border-gray-300"
            )}
          />
          {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
        </div>

        {/* Card Number */}
        <div className="flex flex-col gap-1 font-sans">
          <label className="text-sm text-gray-800">Card number</label>
          <Input
            type="text"
            name="number"
            placeholder="Card Number"
            value={formData.number}
            onChange={handleChange}
            required
            className={cn(
              "p-2 border rounded focus:outline-none focus:ring-1",
              errors.number ? "border-red-500 focus:ring-red-50" : "border-gray-300"
            )}
          />
          {errors.number && <span className="text-xs text-red-500">{errors.number}</span>}
        </div>

        {/* Expiry and CVV */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 font-sans w-1/2">
            <label className="text-sm text-gray-800">Expires</label>
            <Input
              type="text"
              name="expiry_month"
              placeholder="MM/YYYY"
              value={formData.expiry_month}
              onChange={handleChange}
              required
              className={cn(
                "p-2 border rounded focus:outline-none focus:ring-1",
                errors.expiry_month ? "border-red-500 focus:ring-red-50" : "border-gray-300"
              )}
            />
            {errors.expiry_month && <span className="text-xs text-red-500">{errors.expiry_month}</span>}
          </div>

          <div className="flex flex-col gap-1 font-sans w-1/2">
            <label className="text-sm text-gray-800">CVV</label>
            <Input
              type="text"
              name="cvv"
              placeholder="CVV"
              value={formData.cvv}
              onChange={handleChange}
              required
              className={cn(
                "p-2 border rounded focus:outline-none focus:ring-1",
                errors.cvv ? "border-red-500 focus:ring-red-50" : "border-gray-300"
              )}
            />
            {errors.cvv && <span className="text-xs text-red-500">{errors.cvv}</span>}
          </div>
        </div>

        {/* Submit */}
        <Button
          size="lg"
          onClick={handleStepOne}
          disabled={submitting}
          className="w-full rounded-full transition-all duration-300 mt-2 transform hover:scale-105 shadow-lg"
        >
          {submitting ? "Processing..." : "Pay Now"}
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default CardPayment;
