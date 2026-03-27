"use client";

import { useRef, useState } from 'react';
import { X, Lock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';

/**
 * PinPromptModal - Prompt for PIN to authorize sensitive actions
 * 
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Close modal callback
 * @param {function} onSuccess - Callback when PIN is verified (receives pin value)
 * @param {string} action - Description of action requiring PIN (e.g., "withdraw funds")
 * @param {boolean} requireSetup - If true and no PIN exists, show setup flow
 */
export default function PinPromptModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  action = "this action",
  requireSetup = true 
}) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputsRef = useRef([]);
  const digits = Array.from({ length: 4 }, (_, i) => pin?.[i] || "");

  const handleOtpChange = (index, raw) => {
    if (loading) return;
    const onlyDigits = (raw || '').replace(/\D/g, '');
    if (!onlyDigits) {
      const next = digits.slice();
      next[index] = '';
      setPin(next.join(''));
      return;
    }

    const chars = onlyDigits.slice(0, 4 - index).split('');
    const next = digits.slice();
    chars.forEach((ch, offset) => {
      next[index + offset] = ch;
    });
    setPin(next.join(''));

    const nextIndex = Math.min(index + chars.length, 3);
    inputsRef.current[nextIndex]?.focus?.();
  };

  const handleOtpKeyDown = (index, e) => {
    if (loading) return;
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = digits.slice();
        next[index] = '';
        setPin(next.join(''));
        return;
      }
      if (index > 0) {
        inputsRef.current[index - 1]?.focus?.();
        const next = digits.slice();
        next[index - 1] = '';
        setPin(next.join(''));
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) inputsRef.current[index - 1]?.focus?.();
    if (e.key === 'ArrowRight' && index < 3) inputsRef.current[index + 1]?.focus?.();
  };

  const handleOtpPaste = (e) => {
    if (loading) return;
    const text = e.clipboardData?.getData('text') || '';
    const onlyDigits = text.replace(/\D/g, '').slice(0, 4);
    if (!onlyDigits) return;
    e.preventDefault();
    setPin(onlyDigits);
    inputsRef.current[Math.min(onlyDigits.length - 1, 3)]?.focus?.();
  };

  const email = useAuthStore((s) => s.user?.email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Session expired. Please log in again.');
      return;
    }

    // Enforce exactly 4 digits
    if (!pin || pin.length !== 4) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    setLoading(true);

    try {
      // Verify PIN with backend API - using capitalized keys (Email, Pin)
      const response = await api.post('/verify-pin/', { 
        Email: email, 
        Pin: pin 
      });
      
      // Accept success if status is 2xx and isn't explicitly marked invalid
      if (response.data?.is_valid !== false) {
        toast.success('PIN verified');
        onSuccess(pin);
        handleClose();
      } else {
        setError('Incorrect PIN. Please try again.');
      }
    } catch (err) {
      const errorData = err?.response?.data;
      const errorMsg = errorData?.error || errorData?.Message || errorData?.message || errorData?.detail;
      
      if (errorMsg && (errorMsg.toLowerCase().includes('invalid') || errorMsg.toLowerCase().includes('incorrect'))) {
        setError('Incorrect PIN. Please try again.');
      } else {
        setError(errorMsg || 'Failed to verify PIN. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPin = async () => {
    setLoading(true);
    try {
      if (!email) {
        toast.error('Unable to detect your email. Please re-login.');
        return;
      }

      await api.post('/forgot-pin/', { Email: email });
      toast.success('PIN reset link sent to your email');
      handleClose();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPin('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  // PIN verification modal - Backend handles all verification
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-sm bg-[#0A0A0A] border border-white/10 rounded-xl p-5 shadow-2xl"
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-rose-500/10 rounded-lg">
            <Lock className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Enter PIN</h2>
            <p className="text-[10px] text-gray-500">To {action}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg">
              <p className="text-xs text-rose-200">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-center gap-2" onPaste={handleOtpPaste}>
            {digits.map((d, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={d}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                autoFocus={index === 0}
                className="w-12 h-12 bg-white/5 border border-white/10 rounded-lg text-white text-center text-xl tracking-widest focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || pin.length !== 4}
              className="flex-1 px-3 py-2 bg-rose-600 hover:bg-rose-700 rounded-lg text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Confirm'}
            </button>
          </div>

          <button
            type="button"
            onClick={handleForgotPin}
            disabled={loading}
            className="w-full text-xs text-rose-500 hover:text-rose-400 font-medium transition-colors pt-1"
          >
            Forgot PIN?
          </button>
        </form>
      </motion.div>
    </div>
  );
}
