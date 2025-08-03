"use client";

import React, { useState } from "react";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import CardPayment from "@/src/components/pro/CardPayment";
import PinVerification from "@/src/components/pro/PinVerification";

export default function PaystackPro() {
  const [formData, setFormData] = useState({
    email: "",
    number: "",
    cvv: "",
    expiry_month: "",
    expiry_year: "",
    pin: "",
    otp: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1 = form, 2 = pin
  const [reference, setReference] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleStepOne = async () => {
    setSubmitting(true);
    try {
      console.log("Submitting payment data:", formData);

      // Simulate API success after 1s
      setTimeout(() => {
        setSubmitting(false);
        setStep(2); // go to next tab
      }, 1000);
    } catch (error) {
      console.error("Payment error", error);
      setSubmitting(false);
    }
  };

  const handleStepTwo = async () => {
    setSubmitting(true);
    try {
      console.log("Submitting payment data:", formData);

      // Simulate API success after 1s
      setTimeout(() => {
        setSubmitting(false);
        setStep(3); // go to next tab
      }, 1000);
    } catch (error) {
      console.error("Payment error", error);
      setSubmitting(false);
    }
  };

  const handleStepThree = async () => {
    setSubmitting(true);
    try {
      console.log("Submitting payment data:", formData);

      // Simulate API success after 1s
      setTimeout(() => {
        setSubmitting(false);
        setStep(4); // go to next tab
      }, 1000);
    } catch (error) {
      console.error("Payment error", error);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          {/* {step === 1 ? "Make a" : "Payment"}{" "} */}
          Subscribe To{" "}
          <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            {/* {step === 1 ? "Secure Payment" : "Successful!"} */}
            Pro
          </span>
        </h1>

        {step === 1 && <CardPayment setReference={setReference} setStep={setStep} />}

        {step === 2 && <PinVerification reference={reference} setStep={setStep} />}
        {step === 3 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 mb-8 shadow-xl border border-white/20">
            <div className="space-y-4">
              <Input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                value={formData.expiry_month}
                onChange={handleChange}
                required
              />

              <Button
                size="lg"
                onClick={handleStepThree}
                disabled={submitting}
                className="w-full rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {submitting ? "Processing..." : "Verify OTP"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 mb-8 shadow-xl border border-white/20">
            <div className="flex items-center justify-center mb-4 text-green-600">
              <CheckCircle className="w-8 h-8 mr-2" />
              <h2 className="text-2xl font-semibold">Payment Successful</h2>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed">
              Thank you! Your payment has been received successfully. You now have full access to the platform.
            </p>
          </div>
        )}

        {/* Dots */}
        <div className="mt-16 flex justify-center space-x-8 opacity-60">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>
      </div>

      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-red-200 to-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-72 h-72 bg-gradient-to-r from-orange-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>
    </div>
  );
}
