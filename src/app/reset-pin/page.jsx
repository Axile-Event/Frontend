"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { Mail, Loader2, ArrowLeft, ShieldAlert } from "lucide-react";
import OtpPinInput from "@/components/OtpPinInput";

const ResetPinContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get email and otp from URL parameters (sent from the reset link in email)
    const emailParam = searchParams.get("email");
    const otpParam = searchParams.get("otp");

    if (emailParam) {
      setEmail(emailParam);
    }
    if (otpParam) {
      setOtp(otpParam);
    }
  }, [searchParams]);

  const isFormValid = email.trim() !== "" && newPin.length === 4 && confirmPin === newPin;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (newPin.length !== 4) {
      toast.error("PIN must be exactly 4 digits");
      return;
    }

    if (newPin !== confirmPin) {
      toast.error("PINs do not match");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Resetting PIN...");

    try {
      const res = await api.post("/change-pin/", {
        Email: email,
        Pin: newPin,
        ConfirmPin: confirmPin,
        ...(otp && { otp: otp }), // Include otp if available for verification
      });

      toast.success(res.data.Message || res.data.message || "PIN reset successfully!", { id: toastId });
      
      // Redirect back to organizer dashboard
      setTimeout(() => {
        router.push("/dashboard/org");
      }, 1500);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Failed to reset PIN. Please try again.";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="bg-[#0F1419] border border-white/5 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h1 className="text-lg font-bold text-white">Reset PIN</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-white/70 text-xs font-semibold mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={loading}
                  required
                  className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg py-2.5 pl-10 pr-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all disabled:opacity-50"
                />
              </div>
              {otp && (
                <p className="text-green-500 text-[10px] mt-1.5 font-semibold">
                  ✓ Verified from email
                </p>
              )}
            </div>

            {/* New PIN */}
            <OtpPinInput
              label="New PIN"
              value={newPin}
              onChange={setNewPin}
              disabled={loading}
              autoFocus={true}
            />

            {/* Confirm PIN */}
            <OtpPinInput
              label="Confirm PIN"
              value={confirmPin}
              onChange={setConfirmPin}
              disabled={loading}
            />

            {confirmPin.length === 4 && confirmPin !== newPin && (
              <p className="text-rose-500 text-xs font-semibold">PINs do not match</p>
            )}

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-rose-600 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Resetting...
                </>
              ) : (
                <>
                  Reset PIN
                </>
              )}
            </button>
          </form>

          {/* Back to dashboard */}
          <div className="text-center mt-4">
            <Link
              href="/dashboard/org"
              className="text-gray-500 hover:text-gray-400 text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ResetPin = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B0F19] flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-rose-500" /></div>}>
      <ResetPinContent />
    </Suspense>
  );
};

export default ResetPin;
