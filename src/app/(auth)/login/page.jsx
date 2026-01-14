"use client";
// Force rebuild login page

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  Check,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../lib/axios";
import useAuthStore from "../../../store/authStore";
import { Button } from "../../../components/ui/button";
import Logo from "@/components/Logo";
import BackgroundCarousel from "@/components/BackgroundCarousel";
import { useGoogleLogin } from "@react-oauth/google";

/* ----------------------------------------
   Safe redirect helper (CRITICAL)
---------------------------------------- */
const getSafeCallbackUrl = (url) => {
  if (typeof url === "string" && url.startsWith("/") && !url.startsWith("//")) {
    console.log("url from callback", url)
    return url;
  }
  return null;
};

const LoginContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const safeCallbackUrl = getSafeCallbackUrl(callbackUrl);

  const login = useAuthStore((state) => state.login);

  /* ----------------------------------------
     State
  ---------------------------------------- */
  const [role, setRole] = useState("student");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(false);

  /* ----------------------------------------
     Effects
  ---------------------------------------- */
  useEffect(() => {
    setIsValidEmail(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email));
  }, [formData.email]);

  /* ----------------------------------------
     Helpers
  ---------------------------------------- */
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  /* ----------------------------------------
     Google Login
  ---------------------------------------- */
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const endpoint =
          role === "student"
            ? "/student/google-signup/"
            : "/organizer/google-signup/";

        const res = await api.post(endpoint, {
          token: tokenResponse.access_token,
        });

        const { user_id, email, access, refresh } = res.data;

        login({ user_id, email }, access, refresh, role);

        toast.success("Login successful!");
        router.push(safeCallbackUrl ?? "/dashboard");
      } catch (err) {
        console.error("Google login error:", err);
        toast.error(err?.response?.data?.error || "Google login failed");
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast.error("Google login failed");
      setLoading(false);
    },
  });

  /* ----------------------------------------
     Normal Login
  ---------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const toastId = toast.loading("Logging in...");

    try {
      const response = await api.post("/login/", formData);
      const { email, access, refresh, role: responseRole } = response.data;

      let userRole = responseRole;

      if (!userRole && access) {
        const decoded = parseJwt(access);
        userRole =
          decoded?.role ||
          decoded?.user_type ||
          (decoded?.is_organizer ? "organizer" : undefined);
      }

      if (!userRole) {
        userRole = email.endsWith("@student.oauife.edu.ng")
          ? "student"
          : "organizer";
      }

      login(response.data, access, refresh, userRole);

      toast.success("Login successful!", { id: toastId });
      router.push(safeCallbackUrl ?? "/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      const message =
        err?.response?.data?.error || "Invalid email or password";
      setError(message);
      toast.error(message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------------
     UI
  ---------------------------------------- */
  return (
    <div className="min-h-screen w-full flex bg-[#0A0A14]">
      {/* Left Image */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <BackgroundCarousel
          images={["/IMG (1).jpg", "/ticket image (1).jpeg"]}
          interval={5000}
        />
      </div>

      {/* Right Side */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full lg:w-1/2 flex items-center justify-center px-6"
      >
        <div className="w-full max-w-md">
          <div className="hidden lg:flex justify-center mb-6">
            <Logo href="/" textColor="white" />
          </div>

          <h1 className="text-3xl font-bold text-white text-center mb-2">
            Welcome Back
          </h1>

          <p className="text-gray-400 text-center mb-6">
            Sign in to get your tickets
          </p>

          {/* Role Switch */}
          <div className="flex gap-2 mb-6">
            {["student", "organizer"].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2 rounded-full font-semibold ${
                  role === r
                    ? "bg-rose-600 text-white"
                    : "border border-gray-600 text-gray-300"
                }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-white/80 text-xs font-semibold uppercase">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 py-3 rounded-xl bg-transparent border border-gray-700 text-white"
                  required
                />
                {isValidEmail && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-white/80 text-xs font-semibold uppercase">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-transparent border border-gray-700 text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <Button disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              href={
                safeCallbackUrl
                  ? `/signup?callbackUrl=${encodeURIComponent(
                      safeCallbackUrl
                    )}`
                  : "/signup"
              }
              className="text-rose-400 font-semibold"
            >
              Create an account
            </Link>
          </div>

          {role === "organizer" && (
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => handleGoogleLogin()}
            >
              Continue with Google
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const LoginPage = () => (
  <Suspense
    fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A14]">
        <Loader2 className="animate-spin text-rose-600" />
      </div>
    }
  >
    <LoginContent />
  </Suspense>
);

export default LoginPage;
