"use client";
// Force rebuild login page

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Loader2, User, Sparkles, Eye, EyeOff, Check, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../../lib/axios'
import useAuthStore from '../../../store/authStore'
import { Button } from '../../../components/ui/button'
import Logo from '@/components/Logo'
import { getErrorMessage } from '@/lib/utils'
import BackgroundCarousel from '@/components/BackgroundCarousel'
import { useGoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [role, setRole] = useState("Student");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isValidEmail, setIsValidEmail] = useState(false);

  useEffect(() => {
    setIsValidEmail(validateEmail(formData.email));
  }, [formData.email]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const endpoint = role === "Student" ? "/student/google-signup/" : "/organizer/google-signup/";
        const res = await api.post(endpoint, {
          token: tokenResponse.access_token,
        });
        const { user_id, email, access, refresh, is_new_user } = res.data;
        // Construct role based on the endpoint we just hit if not returned (though login usually returns it)
        // But api docs say success response checks 'is_new_user', let's check what login() needs.
        // The store expects (user, access, refresh, role).
        // Let's use the role state we used to make the request, as Google signup implies that role.
        login({ ...res.data }, access, refresh, role);
        toast.success("Login successful!");
        router.push("/dashboard");
      } catch (err) {
        console.error("Google login error:", err);
        toast.error(err.response?.data?.error || "Google login failed");
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast.error("Google login failed");
      setLoading(false);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const toastId = toast.loading('Logging in...')

    try {
      const response = await api.post('/login/', formData)
      const { user_id, email, access, refresh, role: responseRole } = response.data
      
      let userRole = responseRole;
      if (!userRole && access) {
        const decoded = parseJwt(access);
        // Check for common role claims
        userRole = decoded?.role || decoded?.user_type;
        
        // If still not found, check specific boolean flags if they exist
        if (!userRole && decoded?.is_organizer) {
            userRole = 'organizer';
        }
      }

      // Fallback: Check email domain if role is still not determined
      if (!userRole) {
          if (email.endsWith('@student.oauife.edu.ng')) {
              userRole = 'student';
          } else {
              // Default to organizer if not a student email 
              // (since organizers can have generic emails like Gmail, Yahoo, etc.)
              userRole = 'organizer';
          }
      }

      login({ ...response.data }, access, refresh, userRole)
      toast.success('Login successful! Redirecting...', { id: toastId })
      router.push('/dashboard')
    } catch (err) {
      console.error("Login error:", err);
      const message = err.response?.data?.error || "Invalid email or password";
      setError(message);
      toast.error(message, { id: toastId });
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
               {/* <div className="relative z-10 w-[40%] flex items-center justify-center">
                 <img
                   alt="Center Image"
                   src='/assets/image 2 (1).png'
                 />
               </div> */}
             </div>
      {/* Right Side - Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-8 md:py-12 lg:px-16 xl:px-24 overflow-y-auto"
      >
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6 md:mb-8">
            <Logo
              href="/"
              textColor="white"
              textSize="text-2xl md:text-3xl"
              iconSize="h-6 w-6 md:h-8 md:w-8"
            />
          </div>

          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 text-center">
            Welcome Back
          </h1>

          <p className="text-sm md:text-base text-gray-400 mb-6 md:mb-8 text-center">
            Sign in to get your tickets
          </p>

           {/* Role Switch */}
          <div className="flex gap-2 mb-6 md:mb-8">
            <button
              onClick={() => setRole("Student")}
           className={`flex-1 py-2 md:py-3 px-4 md:px-6 rounded-full font-semibold text-sm md:text-base transition-all duration-200 ${
                role === "Student"
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "border-gray-600 border text-gray-300 hover:border-gray-500"
              }`}
              >
              Student  
            </button>

            <button
              onClick={() => setRole("Organizer")}
              className={`flex-1 py-2 md:py-3 px-4 md:px-6 rounded-full font-semibold text-sm md:text-base transition-all duration-200 ${
                role === "Organizer"
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "border-gray-600 border text-gray-300 hover:border-gray-500"
              }`}
            >
              Organizer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-white/80 text-xs font-semibold uppercase tracking-wide mb-2"
              >
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                  <Mail className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="radar@gmail.com"
                  className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl py-3 md:py-3.5 pl-10 md:pl-12 pr-4 text-sm md:text-base text-white hover:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 dark:placeholder:text-gray-600"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {isValidEmail && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                    <Check className="h-3 w-3 md:h-4 md:w-4" />
                  </div>
                )}
              </div>
            </div>
            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-white/80 text-xs font-semibold uppercase tracking-wide"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                  <Lock className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl py-3 md:py-3.5 pl-10 md:pl-12 pr-10 md:pr-12 text-sm md:text-base text-white hover:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 dark:placeholder:text-gray-600"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 md:h-5 md:w-5" />
                  ) : (
                    <Eye className="h-4 w-4 md:h-5 md:w-5" />
                  )}
                </button>
              </div>
            </div>
            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-10 md:h-12 rounded-xl text-sm md:text-base font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/20 transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 md:mt-8 flex flex-col space-y-3 md:space-y-4">
            <div className="text-xs md:text-sm text-center text-gray-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-rose-400 hover:text-rose-300 hover:underline transition-colors"
              >
                Create an account
              </Link>
            </div>

            {role === "Organizer" && (
              <>
                {/* Divider */}
                <div className="relative flex items-center justify-center w-full">
                  <div className="grow border-t border-gray-800"></div>
                  <span className="mx-4 text-[10px] md:text-xs text-gray-500 font-medium">
                    OR
                  </span>
                  <div className="grow border-t border-gray-800"></div>
                </div>

                {/* Social Login Option */}
                <Button
                  variant="outline"
                  onClick={() => handleGoogleLogin()}
                  className="w-full h-10 md:h-12 rounded-xl border-gray-800 bg-zinc-900 hover:bg-zinc-800 text-gray-300 transition-all duration-200"
                >
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-4 w-4 md:h-5 md:w-5 flex items-center justify-center">
                      <img
                        src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                        alt="Google"
                      />
                    </div>
                    <span className="text-sm md:text-base">Continue with Google</span>
                  </div>
                </Button>
              </>
            )}

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
