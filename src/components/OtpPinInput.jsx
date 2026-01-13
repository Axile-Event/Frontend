"use client";

import { useRef } from "react";

export default function OtpPinInput({
  label,
  value,
  onChange,
  disabled = false,
  autoFocus = false,
}) {
  const inputsRef = useRef([]);
  const digits = Array.from({ length: 4 }, (_, i) => value?.[i] || "");

  const setAtIndex = (index, nextDigit) => {
    const next = digits.slice();
    next[index] = nextDigit;
    onChange(next.join(""));
  };

  const handleChange = (index, raw) => {
    if (disabled) return;
    const onlyDigits = (raw || "").replace(/\D/g, "");
    if (!onlyDigits) {
      setAtIndex(index, "");
      return;
    }

    // If user typed/pasted multiple digits into one box, distribute them.
    const chars = onlyDigits.slice(0, 4 - index).split("");
    const next = digits.slice();
    chars.forEach((ch, offset) => {
      next[index + offset] = ch;
    });
    onChange(next.join(""));

    const nextIndex = Math.min(index + chars.length, 3);
    inputsRef.current[nextIndex]?.focus?.();
  };

  const handleKeyDown = (index, e) => {
    if (disabled) return;

    if (e.key === "Backspace") {
      if (digits[index]) {
        setAtIndex(index, "");
        return;
      }
      if (index > 0) {
        inputsRef.current[index - 1]?.focus?.();
        setAtIndex(index - 1, "");
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus?.();
    }
    if (e.key === "ArrowRight" && index < 3) {
      inputsRef.current[index + 1]?.focus?.();
    }
  };

  const handlePaste = (e) => {
    if (disabled) return;
    const text = e.clipboardData?.getData("text") || "";
    const onlyDigits = text.replace(/\D/g, "").slice(0, 4);
    if (!onlyDigits) return;

    e.preventDefault();
    const chars = onlyDigits.split("");
    const next = digits.slice();
    for (let i = 0; i < 4; i++) next[i] = chars[i] || "";
    onChange(next.join(""));

    inputsRef.current[Math.min(chars.length - 1, 3)]?.focus?.();
  };

  return (
    <div className="space-y-1.5">
      <div className="mx-auto w-fit space-y-1.5">
        <label className="text-xs font-bold text-gray-500 flex items-center gap-2 pl-1">
          {label}
        </label>

        <div className="flex items-center gap-2" onPaste={handlePaste}>
          {digits.map((d, index) => (
            <input
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={1}
              value={d}
              disabled={disabled}
              autoFocus={autoFocus && index === 0}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 bg-white/2 border border-white/5 rounded-xl text-white text-center text-lg tracking-widest focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all duration-200"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
