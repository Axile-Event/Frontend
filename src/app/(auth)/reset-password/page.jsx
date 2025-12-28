"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from "../../../lib/axios";
import { Mail, Lock, Loader2, ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import BackgroundCarousel from "../../../components/BackgroundCarousel";
import Logo from "@/components/Logo";

const ResetPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // const email = searchParams.get('email');
    const [email, setEmail] = useState(null); 

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: verify OTP, 2: set new password


  useEffect(() => { // 🔹 CHANGED: handle email + redirect in one place
    const e = searchParams.get('email');
    if (!e && !loading) {
      router.replace('/forgot-password');
    } else {
      setEmail(e);
    }
  }, [searchParams, loading, router]);


  const shortPassword = newPassword.length > 0 && newPassword.length < 8;
  const passwordMismatch = confirmPassword.length > 0 && confirmPassword !== newPassword;

  const isOtpValid = otp.length === 6 && /^\d+$/.test(otp);
  const isPasswordFormValid = newPassword.length >= 8 && confirmPassword === newPassword;

  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Verifying OTP...');

    try {
      const res = await api.post('/password-reset/verify/', {
        email: email,
        otp: otp,
      });

      toast.success(res.data.message || 'OTP verified successfully.', { id: toastId });
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid or expired OTP.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Resetting password...');

    try {
      // console.log('Resetting password with:', { email, otp: parseInt(otp), new_password: newPassword, confirm_password: confirmPassword });
      const res = await api.post('/password-reset/confirm/', {
        email: email,
        otp: otp,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      console.log('Password reset response:', res);

      toast.success(res.data.message || 'Password reset successful.', { id: toastId });
      router.push('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to reset password.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return null; // Redirecting...
  }

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
            {step === 1 ? 'Verify OTP' : 'Set New Password'}
          </h1>

          <p className="text-gray-400 text-center mb-8">
            {step === 1
              ? 'Enter the 6-digit OTP sent to your email.'
              : 'Enter your new password.'
            }
          </p>

          {step === 1 ? (
            <form onSubmit={verifyOtp} className="space-y-4">
              <div>
                <label className="block text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">
                  OTP Code
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl py-3.5 pl-12 pr-4 text-white hover:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 dark:placeholder:text-gray-600"
                    maxLength={6}
                  />
                </div>
                {!isOtpValid && otp.length > 0 && (
                  <p className="text-red-500 text-xs mt-1">
                    Please enter a valid 6-digit OTP.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !isOtpValid}
                className={`w-full mx-auto bg-rose-600 ${isOtpValid ? 'hover:bg-rose-700' : ''} text-[#FFFFFF] font-semibold py-4 rounded-full mt-6 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (<><Loader2 className="animate-spin mr-2" />Verifying...</>) : 'Verify OTP'}
                {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
              </button>
            </form>
          ) : (
            <form onSubmit={resetPassword} className="space-y-4">
              <div>
                <label className="block text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl py-3.5 pl-12 pr-12 text-white hover:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 dark:placeholder:text-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {shortPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    Password must be at least 8 characters long.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl py-3.5 pl-12 pr-12 text-white hover:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 dark:placeholder:text-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {passwordMismatch && (
                  <p className="text-red-500 text-xs mt-1">
                    Passwords do not match.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !isPasswordFormValid}
                className={`w-full mx-auto bg-rose-600 ${isPasswordFormValid ? 'hover:bg-rose-700' : ''} text-[#FFFFFF] font-semibold py-4 rounded-full mt-6 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (<><Loader2 className="animate-spin mr-2" />Resetting...</>) : 'Reset Password'}
                {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
              </button>
            </form>
          )}

          {/* Back button */}
          <div className="text-center mt-6">
            <button
              onClick={() => step === 1 ? router.push('/forgot-password') : setStep(1)}
              className="text-gray-400 hover:text-white text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {step === 1 ? 'Back to Forgot Password' : 'Back to OTP Verification'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
