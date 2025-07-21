import { verifyAccount } from "@/src/api/auth";
import React from "react";
import { Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

type Props = {
  params: Promise<{ tokenID: string }>;
};

const verifuUserEmailWithToken = async (token: string) => {
  try {
    const data = await verifyAccount(token);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: "verification failed, Support will reach out you." };
  }
};

export default async function Welcome({ params }: Props) {
  const tokenID = (await params).tokenID;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">

        {/* Welcome message */}
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Welcome to{' '}
          <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            Agentic Predictions
          </span>
        </h1>

        {/* Email verification confirmation */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 mb-8 shadow-xl border border-white/20">
          <div className="flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-red-500 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-800">Email Verified Successfully!</h2>
          </div>
          <p className="text-gray-600 text-lg leading-relaxed">
            Your email has been successfully verified. You now have full access to all platform features and can start exploring everything we have to offer.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="primary-btn rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Check Predictions
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="border-2 border-red-200 text-red-600 hover:bg-red-50 font-semibold px-8 py-3 rounded-full transition-all duration-300"
          >
            Learn More
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="mt-16 flex justify-center space-x-8 opacity-60">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-red-200 to-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-gradient-to-r from-orange-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
    </div>
  );
}
