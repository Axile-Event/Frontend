"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import api from "@/lib/axios";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import {
	hasPinSet,
	storePinLocally,
	verifyPinLocally,
} from "@/lib/pinPrompt";

const PROTECTED_PATHS = new Set([
	"/dashboard/org",
	"/dashboard/org/profile",
	"/dashboard/org/settings",
	"/dashboard/org/payout",
]);

export default function PinGate({ children }) {
	const pathname = usePathname();
	const email = useAuthStore((s) => s.user?.email);

	const [ready, setReady] = useState(false);
	const [hasPin, setHasPin] = useState(false);

	const [open, setOpen] = useState(false);
	const [mode, setMode] = useState("none"); // 'set' | 'enter' | 'none'

	const [pin, setPin] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	const isProtectedRoute = useMemo(() => {
		if (!pathname) return false;
		return PROTECTED_PATHS.has(pathname);
	}, [pathname]);

	const isOverviewRoute = pathname === "/dashboard/org";

	useEffect(() => {
		// Hydrate client-only state (local/session storage)
		setHasPin(hasPinSet());
		setReady(true);
	}, []);

	useEffect(() => {
		if (!ready) return;

		setPin("");
		setError("");

		if (!isProtectedRoute) {
			setOpen(false);
			setMode("none");
			return;
		}

		if (!hasPin) {
			// No PIN set yet: keep prompting on every access to protected pages.
			setOpen(true);
			setMode("set");
			return;
		}

		// PIN is set: require PIN entry on protected pages.
		setOpen(true);
		setMode("enter");
	}, [ready, isProtectedRoute, isOverviewRoute, hasPin, pathname]);

	const close = () => {
		setOpen(false);
		setMode("none");
		setPin("");
		setError("");
	};

	const handleSetPin = async () => {
		setError("");
		if (!email) {
			setError("Unable to detect your email. Please re-login.");
			return;
		}
		if (!pin || pin.trim().length !== 4) {
			setError("PIN must be exactly 4 digits.");
			return;
		}

		setSubmitting(true);
		try {
			try {
				await api.post("/pin/", { Email: email, pin });
			} catch (apiErr) {
				const emailErr = apiErr?.response?.data?.Email?.[0];
				const msg = apiErr?.response?.data?.Message || emailErr || apiErr?.message;
				const alreadyExists =
					typeof emailErr === "string" && emailErr.toLowerCase().includes("already exists");

				// If the backend says a PIN already exists for this email,
				// don't block the user: just proceed with local storage so the UI can continue.
				if (!alreadyExists) {
					throw apiErr;
				}
				toast.success("PIN already exists for this account");
			}

			await storePinLocally(pin);
			setHasPin(true);
			toast.success("PIN set successfully");
			close();
		} catch (err) {
			const msg =
				err?.response?.data?.Message ||
				err?.response?.data?.error ||
				"Failed to set PIN";
			setError(msg);
		} finally {
			setSubmitting(false);
		}
	};

	const handleCancelLater = () => {
		close();
	};

	const handleVerifyPin = async () => {
		setError("");
		if (!pin || pin.trim().length !== 4) {
			setError("Enter your 4-digit PIN to continue.");
			return;
		}

		setSubmitting(true);
		try {
			const ok = await verifyPinLocally(pin);
			if (!ok) {
				setError("Incorrect PIN. Access denied.");
				return;
			}
			close();
		} finally {
			setSubmitting(false);
		}
	};

	const handleForgotPin = async () => {
		setError("");
		if (!email) {
			setError("Unable to detect your email. Please re-login.");
			return;
		}
		setSubmitting(true);
		try {
			await api.post("/forgot-pin/", { Email: email });
			toast.success("PIN reset link sent to your email");
		} catch (err) {
			const msg =
				err?.response?.data?.Message ||
				err?.response?.data?.error ||
				"Failed to send PIN reset link";
			toast.error(msg);
		} finally {
			setSubmitting(false);
		}
	};

	const blockUntilReady = isProtectedRoute && !ready;
	const showModal = blockUntilReady || (ready && open && (mode === "set" || mode === "enter"));

	const pinInputsRef = useRef([]);
	const pinDigits = Array.from({ length: 4 }, (_, i) => pin?.[i] || "");

	const setPinAtIndex = (index, nextDigit) => {
		const next = pinDigits.slice();
		next[index] = nextDigit;
		setPin(next.join(""));
	};

	const handleOtpChange = (index, raw) => {
		if (submitting) return;
		const onlyDigits = (raw || "").replace(/\D/g, "");
		if (!onlyDigits) {
			setPinAtIndex(index, "");
			return;
		}

		const chars = onlyDigits.slice(0, 4 - index).split("");
		const next = pinDigits.slice();
		chars.forEach((ch, offset) => {
			next[index + offset] = ch;
		});
		setPin(next.join(""));

		const nextIndex = Math.min(index + chars.length, 3);
		pinInputsRef.current[nextIndex]?.focus?.();
	};

	const handleOtpKeyDown = (index, e) => {
		if (submitting) return;
		if (e.key === "Backspace") {
			if (pinDigits[index]) {
				setPinAtIndex(index, "");
				return;
			}
			if (index > 0) {
				pinInputsRef.current[index - 1]?.focus?.();
				setPinAtIndex(index - 1, "");
			}
		}
		if (e.key === "ArrowLeft" && index > 0) pinInputsRef.current[index - 1]?.focus?.();
		if (e.key === "ArrowRight" && index < 3) pinInputsRef.current[index + 1]?.focus?.();
	};

	const handleOtpPaste = (e) => {
		if (submitting) return;
		const text = e.clipboardData?.getData("text") || "";
		const onlyDigits = text.replace(/\D/g, "").slice(0, 4);
		if (!onlyDigits) return;
		e.preventDefault();
		setPin(onlyDigits);
		pinInputsRef.current[Math.min(onlyDigits.length - 1, 3)]?.focus?.();
	};

	return (
		<div className="relative">
			<div
				className={
					showModal
						? `blur-sm pointer-events-none select-none${blockUntilReady ? " opacity-0" : ""}`
						: ""
				}
			>
				{children}
			</div>

			{showModal && (
				<div className="fixed inset-0 z-60 flex items-center justify-center">
					<div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

					<div className="relative w-[92%] max-w-md rounded-2xl border border-white/10 bg-black p-6 shadow-xl">
						{blockUntilReady ? (
							<div className="flex items-center justify-center py-6">
								<Loader2 className="w-6 h-6 animate-spin text-white" />
							</div>
						) : mode === "set" ? (
							<>
								<h2 className="text-base font-bold text-white">
									Set a PIN to protect your sensitive information (Overview, Profile, Settings, and Wallet/Payout).
								</h2>
								<p className="text-xs text-gray-400 mt-2">
									You can skip this for now and continue without PIN protection.
								</p>

								<div className="mt-5 space-y-2">
									<label className="text-xs font-bold text-gray-500">PIN</label>
									<div className="flex items-center gap-2 justify-center" onPaste={handleOtpPaste}>
										{pinDigits.map((d, index) => (
											<input
												key={index}
												ref={(el) => {
													pinInputsRef.current[index] = el;
												}}
												type="password"
												inputMode="numeric"
												autoComplete="one-time-code"
												pattern="[0-9]*"
												maxLength={1}
												value={d}
												disabled={submitting}
												onChange={(e) => handleOtpChange(index, e.target.value)}
												onKeyDown={(e) => handleOtpKeyDown(index, e)}
												className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl text-white text-center text-lg tracking-widest focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all"
											/>
										))}
									</div>
									{error && <p className="text-xs text-rose-500 font-bold">{error}</p>}
								</div>

								<div className="mt-6 flex items-center justify-end gap-3">
									<button
										type="button"
										onClick={handleCancelLater}
										disabled={submitting}
										className="text-xs font-bold text-gray-400 hover:text-white transition-colors disabled:opacity-50"
									>
										Cancel / Later
									</button>

									<button
										type="button"
										onClick={handleSetPin}
										disabled={submitting}
										className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-lg shadow-rose-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
										Set PIN
									</button>
								</div>
							</>
						) : (
							<>
								<h2 className="text-base font-bold text-white">Enter your PIN to continue.</h2>
								<p className="text-xs text-gray-400 mt-2">
									This page contains sensitive information.
								</p>

								<div className="mt-5 space-y-2">
									<label className="text-xs font-bold text-gray-500">PIN</label>
									<div className="flex items-center gap-2 justify-center" onPaste={handleOtpPaste}>
										{pinDigits.map((d, index) => (
											<input
												key={index}
												ref={(el) => {
													pinInputsRef.current[index] = el;
												}}
												type="password"
												inputMode="numeric"
												autoComplete="one-time-code"
												pattern="[0-9]*"
												maxLength={1}
												value={d}
												disabled={submitting}
												onChange={(e) => handleOtpChange(index, e.target.value)}
												onKeyDown={(e) => handleOtpKeyDown(index, e)}
												className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl text-white text-center text-lg tracking-widest focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all"
											/>
										))}
									</div>
									{error && <p className="text-xs text-rose-500 font-bold">{error}</p>}
								</div>

								<div className="mt-4 flex items-center justify-between">
									<button
										type="button"
										onClick={handleForgotPin}
										disabled={submitting}
										className="text-xs font-bold text-rose-500 hover:text-rose-400 transition-colors disabled:opacity-50"
									>
										Forgot PIN?
									</button>

									<button
										type="button"
										onClick={handleVerifyPin}
										disabled={submitting}
										className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-lg shadow-rose-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
										Continue
									</button>
								</div>
							</>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

