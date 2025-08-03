import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { submitPinForCard } from "@/src/api/payment";

const PinVerification = ({ reference, setStep }: { reference: string; setStep: (step: number) => void }) => {
  const [formData, setFormData] = useState({ pin: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ pin: e.target.value });
    setError("");
  };

  const handleStepTwo = async () => {
    if (!/^\d+$/.test(formData.pin)) {
      setError("PIN must contain only numbers");
      return;
    }

    if (formData.pin.length !== 4) {
      setError("PIN must be exactly 4 digits");
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitPinForCard({ pin: formData.pin, reference });

      if (res?.success === true) {
        setStep(3);
      } else {
        setError("Invalid PIN or server error");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 mb-8 shadow-xl border border-white/20">

      <h1 className="my-4">₦1000 payment with ref {reference}</h1>

      <div className="space-y-4">
        <Input
          type="text"
          name="pin"
          placeholder="Enter Pin"
          value={formData.pin}
          onChange={handleChange}
          maxLength={4}
          required
          className={`p-2 border rounded focus:outline-none focus:ring-1 ${
            error ? "border-red-500 focus:ring-red-50" : "border-gray-300"
          }`}
        />

        <span className={`text-xs text-red-500 h-4 block transition-all duration-200 ${error ? "opacity-100" : "opacity-0"}`}>
          {error || "placeholder"}
        </span>

        <Button
          size="lg"
          onClick={handleStepTwo}
          disabled={submitting}
          className="w-full rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          {submitting ? "Processing..." : "Confirm Pin"}
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default PinVerification;
