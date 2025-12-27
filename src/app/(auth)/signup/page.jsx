"use client";

import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from "../../../lib/axios";
import useAuthStore from "../../../store/authStore";
import { Mail, Lock, User, Eye, EyeOff, UsersIcon, Loader2, ArrowRight } from "lucide-react";
import Logo from "@/components/Logo";

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
          Phone: "", // Add phone field if needed in form
        };
        endpoint = "/organizer/register/";
      }
      
      console.log("Submitting to", endpoint, "with payload", payload);
      const res = await api.post(endpoint, payload);
      
      if (role === "Student") {
         toast.success(res.data.message || 'OTP sent to email.', { id: toastId })
         router.push(`/verify-otp?email=${email}`);
      } else {
         // Organizer registration is immediate
         const { email, access, refresh } = res.data;
         loginUser({ email }, access, "organizer");
         toast.success('Account Created Successfully', { id: toastId })
         router.push("/dashboard");
      }

    } catch (err) {
      toast.error(err.response?.data?.error || "Signup failed.", { id: toastId });

    } finally {
      setLoading(false);
    }
  };

  // const googleLogin = useGoogleLogin({
  //   onSuccess: async (tokenResponse) => {
  //     setLoading(true);
  //     try {
  //       const endpoint = role === "Student" ? '/student/google-signup/' : '/organizer/google-signup/';
  //       const res = await api.post(endpoint, {
  //         token: tokenResponse.access_token,
  //       });
        
  //       const { email, access, refresh } = res.data;
  //       loginUser({ email }, access);
        
  //       toast.success('Account Created Successfully');
  //       router.push("/dashboard");
  //     } catch (err) {
  //       console.error('Google signup error:', err);
  //       toast.error(err.response?.data?.error || "Google signup failed");
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   onError: () => toast.error('Google signup failed'),
  // });

  const handleSocialLogin = (provider) => {
    if (provider === 'Google') {
      googleLogin();
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-[#0A0A14]">
      {/* Left Image */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center z-0 opacity-40 "
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1568289523939-61125d216fe5?q=80&w=436&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
            filter: "grayscale(30%)",
          }}
        />
        <div className="relative z-10 w-[40%] flex items-center justify-center">
          <img
            alt="Center Image"
            src='/assets/image 2 (1).png'
          />
        </div>
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
                        placeholder="your.name@student.edu.ng"
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

            {/* --- OR Separator --- */}
            <div className="relative my-3 md:my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <span className="relative px-4 text-xs md:text-sm text-gray-500 bg-[#050B14]">
                or
              </span>
            </div>

              {/* --- Social Login Buttons --- */}
        <div className="flex gap-4 justify-center mb-4">
            {/* <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                disabled={loading}
                className="w-12 h-12 bg-white rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 group"
                title="Sign up with Google"
            >
                 <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform"/>
            </button> */}

                <Button
              variant="outline"
              onClick={() => toast.error('Social login currently unavailable')}
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