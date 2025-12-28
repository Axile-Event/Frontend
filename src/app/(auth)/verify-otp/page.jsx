"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../../../lib/axios";
import { Mail, Lock, Loader2, ArrowRight, CheckCircle, Clock } from "lucide-react";
import Logo from "@/components/Logo";
import { getErrorMessage } from "@/lib/utils";
import BackgroundCarousel from "../../../components/BackgroundCarousel";
import useAuthStore from "@/store/authStore";

const VerifyOTPContent = () => {
  const login = useAuthStore((state) => state.login);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const role = searchParams.get("role") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [isExpired, setIsExpired] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const otpCode = otp.join("");
  const isOtpComplete = otpCode.length === 6;

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();

    if (!isOtpComplete) {
      toast.error("Please enter all 6 digits");
      return;
    }

    if (isExpired) {
      toast.error("OTP has expired. Please request a new one.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Verifying OTP...');
    try {
      const res = await api.post("/verify-otp/", {
        email,
        otp: otpCode,
      });

     const { user_id, email: verifiedEmail, access, role } = res.data;
login({ user_id, email: verifiedEmail }, access, role);

toast.success("Email verified successfully! Redirecting...", { id: toastId });
router.push("/dashboard");

    } catch (err) {
      console.error("Verify OTP error:", err.response || err);
      const message = getErrorMessage(err);
      toast.error(message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    const toastId = toast.loading('Resending OTP...');
    try {
      // Try the common resend endpoint — adjust if your backend uses a different path
      await api.post("/resend-otp/", { email });
      setOtp(["", "", "", "", "", ""]);
      setTimeLeft(300);
      setIsExpired(false);
      toast.success("OTP resent to your email", { id: toastId });
    } catch (err) {
      console.error("Resend OTP error:", err);
      const message = getErrorMessage(err);
      toast.error(message, { id: toastId });
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen w-full flex bg-[#0A0A14]">
      {/* Left Image */}
     <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden group">
        <BackgroundCarousel
          images={['/IMG (1).jpg', '/ticket image (1).jpeg']}
          interval={5000}
        />
        {/* <div className="relative z-10 w-[40%] flex items-center justify-center">
          <img
            alt="Center Image"
            src='/assets/image 2 (1).png'
          />
        </div> */}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 lg:px-16 xl:px-24 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <Logo textSize="text-3xl" iconSize="h-8 w-8" />
          </div>

          <h1 className="text-4xl font-bold text-white mb-2 text-center">
            Verify Your Email
          </h1>
          <p className="text-base text-gray-400 mb-8 text-center">
            We've sent a 6-digit code to <span className="text-white font-semibold">{email}</span>.

          </p>

          <form onSubmit={handleVerifyOtp} className="space-y-6">
            {/* OTP Input Fields */}
            <div className="space-y-4">
              <label className="block text-white/80 text-xs font-semibold uppercase tracking-wide">
                Enter OTP Code
              </label>

              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg transition-all duration-200 ${
                      digit
                        ? "border-rose-500 bg-rose-500/10"
                        : "border-gray-700 bg-transparent hover:border-gray-600"
                    } text-white focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20`}
                  />
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span
                className={`text-sm font-semibold ${
                  isExpired ? "text-red-500" : timeLeft < 60 ? "text-yellow-500" : "text-gray-400"
                }`}>
                {isExpired ? "OTP Expired" : `Expires in ${formatTime(timeLeft)}`}
              </span>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || !isOtpComplete || isExpired}
              className={`w-full mx-auto bg-rose-600 ${
                isOtpComplete && !isExpired && !loading ? "hover:bg-rose-700" : ""
              } text-white font-semibold py-4 rounded-full mt-6 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed`}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Verify OTP
                </>
              )}
            </button>
          </form>

          {/* Resend OTP Section */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <p className="text-center text-gray-400 text-sm mb-4">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendOtp}
              disabled={resendLoading || !isExpired && timeLeft > 30}
              className="w-full py-3 px-4 border-2 border-gray-700 rounded-lg text-white font-semibold hover:border-rose-500/60 hover:bg-rose-500/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              {resendLoading ? (
                <>
                  <Loader2 className="animate-spin inline mr-2 h-4 w-4" />
                  Sending...
                </>
              ) : isExpired ? (
                "Resend OTP"
              ) : (
                "Resend OTP"
              )}
            </button>
          </div>

          {/* Back to Signup */}
          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">
              Want to use a different email?{" "}
              <Link
                href="/signup"
                className="text-[#FF3A66] hover:text-[#cf153e] font-semibold underline">
                Go back to signup
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const VerifyOTP = () => {
  return (
    <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center bg-[#0A0A14] text-white"><Loader2 className="animate-spin h-8 w-8" /></div>}>
      <VerifyOTPContent />
    </Suspense>
  );
};

export default VerifyOTP;
