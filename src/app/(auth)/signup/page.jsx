"use client";

import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from "../../../lib/axios";
import useAuthStore from "../../../store/authStore";
import { useGoogleLogin } from '@react-oauth/google';
import { Mail, Lock, User, Eye, EyeOff, UsersIcon, Loader2, ArrowRight, Phone } from "lucide-react";
import Logo from "@/components/Logo";
import BackgroundCarousel from "../../../components/BackgroundCarousel";
import axios from 'axios';

const SignUp = () => {
  const router = useRouter();
  const loginUser = useAuthStore((state) => state.login);

  const [role, setRole] = useState("Student");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [organisationName, setOrganisationName] = useState("");
  const [organiserEmail, setOrganiserEmail] = useState("");
  const [organiserPhone, setOrganiserPhone] = useState("");
  const [organiserPassword, setOrganiserPassword] = useState("");
  const [organiserConfirm, setOrganiserConfirm] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const invalidEmail = email.length > 0 && !validateEmail(email);
  const invalidOrganiserEmail = organiserEmail.length > 0 && !validateEmail(organiserEmail);

  const shortPassword = password.length > 0 && password.length < 6;
  const organiserShortPassword = organiserPassword.length > 0 && organiserPassword.length < 6;
  const organiserPasswordMismatch =
    organiserConfirm.length > 0 && organiserConfirm !== organiserPassword;

 
  const validatePhone = (phone) => {
    const phoneRegex = /^(\+234|234|0)(7\d|8\d|9\d)\d{8}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const invalidPhone = organiserPhone.length > 0 && !validatePhone(organiserPhone);

  const isFormValid = () => {
    if (role === "Student") {
      return (
        firstName.trim() &&
        lastName.trim() &&
        email.trim() &&
        password.length >= 6
      );
    } else {
      return (
        organisationName.trim() &&
        organiserEmail.trim() &&
        organiserPhone.trim() &&
        organiserPassword.length >= 6
      );
    }
  };


  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Creating account...');

    try {
      let payload;
      let endpoint = "/student/register/";
      if (role === "Student") {
        // Backend expects capitalized keys for student registration (see API docs)
        payload = {
          Firstname: firstName,
          Lastname: lastName,
          Email: email,
          Password: password,
        };
        endpoint = "/student/register/";
      } else {
        // Organizer endpoint and expected keys per API docs
        payload = {
          Organization_Name: organisationName,
          Email: organiserEmail,
          Password: organiserPassword,
          Phone: organiserPhone,
        };
        endpoint = "/organizer/register/";
      }

      // write a toast if the student put in a non .oauife.edu.ng email
      if (role === "Student" && !email.endsWith("@student.oauife.edu.ng")) {
        toast.error("Please use your valid student email address.", { id: toastId });
        setLoading(false);
        return;
      } else {
        toast.dismiss(toastId);
      }

      console.log("Submitting to", endpoint, "with payload", payload);
      const res = await api.post(endpoint, payload);

      // Both student and organizer now require OTP verification
      toast.success(res.data.message || 'OTP sent to email.', { id: toastId });
      if (role === "Student") {
        router.push(`/verify-otp?email=${email}&role=student`);
      } else {
        router.push(`/verify-otp?email=${organiserEmail}&role=organizer`);
      }

    } catch (err) {
      toast.error(err.response?.data?.error || "Signup failed.", { id: toastId });

    } finally {
      setLoading(false);
    }
  };




  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("Google OAuth Success. Token Response:", tokenResponse);
      setLoading(true);
      const toastId = toast.loading('Authenticating with Google...');
      try {
        // 1. Fetch User Info using the access token
        const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });

        const googleUser = userInfoResponse.data;
        console.log("Google User Info:", googleUser);
        const googleId = googleUser.sub; // 'sub' is the unique Google ID

        const endpoint = role === "Student" ? '/student/google-signup/' : '/organizer/google-signup/';
        console.log(`Sending request to: ${endpoint}`);
        
        // REVERTING: Sending access_token because the backend error "Wrong number of segments" 
        // indicates it wants a JWT. Access tokens from Google aren't JWTs, but ID Tokens are.
        // Since we can't easily get an ID Token with this custom UI, we send the access_token 
        // and hope the backend can validate it (or needs to be fixed to do so).
        // If the backend strictly requires an ID Token, we might need to use the standard Google Login button.
        const payloadToken = tokenResponse.access_token; 
        
        console.log("Payload:", { token: payloadToken }); 
        
        const res = await api.post(endpoint, {
          token: payloadToken,
        });

        console.log("Backend Response:", res.data);

        const { email, access, refresh, is_new_user } = res.data;
        // The backend likely returns the user role or we infer it from the context
        loginUser({ ...res.data }, access, refresh, role);

        if (is_new_user) {
          toast.success('Account Created Successfully', { id: toastId });
        } else {
          toast.success('Login Successful', { id: toastId });
        }
        router.push("/dashboard/org");
      } catch (err) {
        console.error('Google signup error object:', err);
        console.log('Error Response Data:', err.response?.data);
        console.log('Error Status:', err.response?.status);
        console.log('Error Headers:', err.response?.headers);
        
        toast.error(err.response?.data?.error || "Google signup failed", { id: toastId });
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast.error('Google signup failed');
      setLoading(false);
    },
  });

  const handleSocialLogin = (provider) => {
    if (provider === 'Google') {
      googleLogin();
    }
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
        className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-8 md:py-12 lg:px-16 xl:px-24 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6 md:mb-8">
            <Logo textSize="text-2xl md:text-3xl" iconSize="h-6 w-6 md:h-8 md:w-8" />
          </div>

          <h1 className="text-2xl md:text-4xl font-bold text-white mb-6 md:mb-8 text-center">

            Create Account
          </h1>

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

          <form onSubmit={submitForm} className="space-y-3 md:space-y-4">
            <div className="space-y-2 md:space-y-3">
              {role === "Student" && (
                <>
                  {/* FIRST NAME AND LAST NAME */}
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <div>
                      <label className="block text-white/80 text-[10px] md:text-xs font-semibold uppercase tracking-wide mb-1 md:mb-2">
                        First Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 h-4 w-4 md:h-5 md:w-5" />
                        <input
                          type="text"
                          id="firstName"
                          name='firstName'
                          placeholder="e.g. John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl py-3 md:py-3.5 pl-10 md:pl-12 pr-4 text-sm md:text-base text-white hover:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 dark:placeholder:text-gray-600"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-white/80 text-[10px] md:text-xs font-semibold uppercase tracking-wide mb-1 md:mb-2">
                        Last Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 h-4 w-4 md:h-5 md:w-5" />
                        <input
                          type="text"
                          id="lastName"
                          name='lastName'
                          placeholder="e.g. Christopher"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl py-3 md:py-3.5 pl-10 md:pl-12 pr-4 text-sm md:text-base text-white hover:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 dark:placeholder:text-gray-600"
                        />
                      </div>
                  </div>
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label className="block text-white/80 text-[10px] md:text-xs font-semibold uppercase tracking-wide mb-1 md:mb-2">
                      Student Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 h-4 w-4 md:h-5 md:w-5" />
                      <input
                        type="email"
                          id="email"
                        name="email"
                        placeholder="your.name@student.oauife.edu.ng"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl py-3 md:py-3.5 pl-10 md:pl-12 pr-4 text-sm md:text-base text-white hover:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 dark:placeholder:text-gray-600"
                      />
                    </div>
                    {invalidEmail && (
                      <p className="text-red-500 text-[10px] md:text-xs mt-1">
                        Please enter a valid student email address.
                      </p>
                    )}
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label className="block text-white/80 text-[10px] md:text-xs font-semibold uppercase tracking-wide mb-1 md:mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 h-4 w-4 md:h-5 md:w-5" />
                      <input
                        id="password"
                       name="password"
                        type={showPass ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl py-3 md:py-3.5 pl-10 md:pl-12 pr-10 md:pr-12 text-sm md:text-base text-white hover:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 dark:placeholder:text-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
                      >
                        {showPass ? <EyeOff className="h-4 w-4 md:h-5 md:w-5" /> : <Eye className="h-4 w-4 md:h-5 md:w-5" />}
                      </button>
                    </div>
                    {shortPassword && (
                      <p className="text-red-500 text-[10px] md:text-xs mt-1 animate-fade-in">
                        Password must be at least 6 characters long.
                      </p>
                    )}
                  </div>

                </>
              )}

              {/* --- ORGANIZER FORM --- */}
              {role === "Organizer" && (
                <>
                  {/* Organisation Name */}
                  <div>
                    <label className="block text-white/80 text-[10px] md:text-xs font-semibold uppercase tracking-wide mb-1 md:mb-2">
                      Organisation Name
                    </label>
                    <div className="relative">
                      <UsersIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 h-4 w-4 md:h-5 md:w-5" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Enter Organisation Name"
                        value={organisationName}
                        onChange={(e) => setOrganisationName(e.target.value)}
                        className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl py-3 md:py-3.5 pl-10 md:pl-12 pr-4 text-sm md:text-base text-white hover:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 dark:placeholder:text-gray-600"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-white/80 text-[10px] md:text-xs font-semibold uppercase tracking-wide mb-1 md:mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 h-4 w-4 md:h-5 md:w-5" />
                      <input
                        type="email"
                          id="email"
                         name="email"
                        placeholder="Enter organisation email"
                        value={organiserEmail}
                        onChange={(e) => setOrganiserEmail(e.target.value)}
                        className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl py-3 md:py-3.5 pl-10 md:pl-12 pr-4 text-sm md:text-base text-white hover:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 dark:placeholder:text-gray-600"
                      />
                    </div>
                    {invalidOrganiserEmail && (
                      <p className="text-red-500 text-[10px] md:text-xs mt-1">
                        Please enter a valid email address.
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-white/80 text-[10px] md:text-xs font-semibold uppercase tracking-wide mb-1 md:mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 h-4 w-4 md:h-5 md:w-5" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="+2348012345678"
                        value={organiserPhone}
                        onChange={(e) => setOrganiserPhone(e.target.value)}
                        className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl py-3 md:py-3.5 pl-10 md:pl-12 pr-4 text-sm md:text-base text-white hover:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 dark:placeholder:text-gray-600"
                      />
                    </div>
                    {invalidPhone && (
                      <p className="text-red-500 text-[10px] md:text-xs mt-1">
                        Phone number must be a valid Nigerian number (e.g., 08012345678 or +23480...).
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-white/80 text-[10px] md:text-xs font-semibold uppercase tracking-wide mb-1 md:mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 h-4 w-4 md:h-5 md:w-5" />
                      <input
                        id="password"
                       name="password"
                        type={showPass ? "text" : "password"}
                        placeholder="••••••••"
                        value={organiserPassword}
                        onChange={(e) => setOrganiserPassword(e.target.value)}
                        className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl py-3 md:py-3.5 pl-10 md:pl-12 pr-10 md:pr-12 text-sm md:text-base text-white hover:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 dark:placeholder:text-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
                      >
                        {showPass ? <EyeOff className="h-4 w-4 md:h-5 md:w-5" /> : <Eye className="h-4 w-4 md:h-5 md:w-5" />}
                      </button>
                    </div>
                    {organiserShortPassword && (
                      <p className="text-red-500 text-[10px] md:text-xs mt-1 animate-fade-in">
                        Password must be at least 6 characters long.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          
            <button
          type="submit"
           disabled={loading || !isFormValid()}
          className={`w-full mx-auto bg-rose-600 ${isFormValid() ? 'hover:bg-rose-700' : ''} text-[#FFFFFF] font-semibold py-3 md:py-4 rounded-full mt-4 md:mt-6 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base`}
           >
            {loading ? (<><Loader2 className="animate-spin mr-2 h-4 w-4 md:h-5 md:w-5" />Creating account...</>) : 'Create Account'}
           {!loading && <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />}
        </button>


      {/* --- Social Login Buttons --- */}
            {role === "Organizer" && (
              <>
                {/* --- OR Separator --- */}
                <div className="relative my-3 md:my-4 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-800"></div>
                  </div>
                  <span className="relative px-4 text-xs md:text-sm text-gray-500 bg-[#0A0A14]">
                    or
                  </span>
                </div>
                <div className="flex gap-4 justify-center mb-4">
                <Button
              variant="outline"
              type="button"
              onClick={() => googleLogin()}
              className="w-full h-10 md:h-12 rounded-xl border-gray-800 bg-zinc-900 hover:bg-zinc-800 text-gray-300 transition-all duration-200"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="h-4 w-4 md:h-5 md:w-5 flex items-center justify-center">
                  <img
                   src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                    alt="Google"
                  />
                </div>
                <span className="text-sm md:text-base">Sign Up with Google</span>
              </div>
            </Button>
        </div>
      </>
    )}
          </form>

          {/* Already have an account? Sign in */}
          <div className="text-center mt-3">
            <p className="text-gray-400 text-xs md:text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-[#FF3A66] hover:text-[#cf153e] font-semibold underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;