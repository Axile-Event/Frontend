"use client";

import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from "../../../lib/axios";
import { Mail, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import BackgroundCarousel from "../../../components/BackgroundCarousel";
import Logo from "@/components/Logo";

const ForgotPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const invalidEmail = email.length > 0 && !validateEmail(email);

  const isFormValid = email.trim() && validateEmail(email);

  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Sending reset OTP...');

    try {
      const res = await api.post('/password-reset/request/', {
        email: email,
      });

      toast.success(res.data.message || 'OTP sent to your email.', { id: toastId });
      router.push(`/reset-password?email=${email}`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send reset OTP.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#0A0A14]">
      {/* Left Image */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden group">
        <BackgroundCarousel
          images={['/IMG (1).jpg', '/ticket image (1).jpeg']}
          interval={5000}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 lg:px-16 xl:px-24 overflow-y-auto">
        <div className="w-full max-w-md">
            <div className="flex justify-center mb-6 md:mb-8">
            <Logo
            href= "/" textColor="white"
            textSize="text-2xl md:text-3xl" iconSize="h-6 w-6 md:h-8 md:w-8" />
          </div>

          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            Reset Password
          </h1>

          <p className="text-gray-400 text-center mb-8">
            Enter your email address and we'll send you an OTP to reset your password.
          </p>

          <form onSubmit={submitForm} className="space-y-4">
            <div>
              <label className="block text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl py-3.5 pl-12 pr-4 text-white hover:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 dark:placeholder:text-gray-600"
                />
              </div>
              {invalidEmail && (
                <p className="text-red-500 text-xs mt-1">
                  Please enter a valid email address.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className={`w-full mx-auto bg-rose-600 ${isFormValid ? 'hover:bg-rose-700' : ''} text-[#FFFFFF] font-semibold py-4 rounded-full mt-6 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (<><Loader2 className="animate-spin mr-2" />Sending OTP...</>) : 'Send Reset OTP'}
              {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
            </button>
          </form>

          {/* Back to login */}
          <div className="text-center mt-6">
            <Link href="/login" className="text-gray-400 hover:text-white text-sm flex items-center justify-center gap-2 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
