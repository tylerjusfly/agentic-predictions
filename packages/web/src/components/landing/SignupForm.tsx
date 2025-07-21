import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { createAccount } from "@/src/api/auth";

export default function SignUpForm() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  async function onSignup() {
    // setSubmitting(true);

    try {
      // Save to DB
      const resp = await createAccount({ fullname: formData.name, email: formData.email})

      if (resp.success) {
       
        // Notify user registeration is successful 
       console.log(resp)
      
      }
    } catch (e: any) {
      console.log(e, 'err');
      // setError(e.message || 'An error occurred');
      // setSubmitting(false);
    }
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="name-card"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full max-w-full mx-auto p-4"
          >
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Enter Your Fullname</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your text here..."
                  className="w-full"
                />
                <Button onClick={handleNext} className="w-full">
                  Next
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="email-card"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full max-w-full mx-auto p-4"
          >
            <Card className="w-full">
              <CardHeader>
                <CardTitle>What's your email?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email here..."
                  className="w-full"
                />
               
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(step - 1)} className="w-full">
                    Back
                  </Button>
                  <Button onClick={onSignup} disabled={!formData.email} className="w-full">
                    Submit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
