"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, } from 'framer-motion'
import toast from 'react-hot-toast'
import api from "../../lib/axios";
import useAuthStore from "../../store/authStore";
import { Mail, Lock, User, Briefcase, Hash, Eye, EyeOff, UsersIcon, Loader2, ArrowRight } from "lucide-react";

const SignUp = () => {
  const router = useRouter();
  const loginUser = useAuthStore((state) => state.login);

  const [role, setRole] = useState("Student");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [matric, setMatric] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [organisationName, setOrganisationName] = useState("");
  const [organisationType, setOrganisationType] = useState("");
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
  const passwordMismatch =
    confirmPassword.length > 0 && confirmPassword !== password;

  const organiserShortPassword =
    organiserPassword.length > 0 && organiserPassword.length < 6;
  const organiserPasswordMismatch =
    organiserConfirm.length > 0 && organiserConfirm !== organiserPassword;

  const isFormValid = () => {
    if (role === "Student") {
      return (
        name.trim() &&
        department.trim() &&
        matric.trim() &&
        email.trim() &&
        password.length >= 6 &&
        confirmPassword === password
      );
    } else {
      return (
        organisationName.trim() &&
        organisationType.trim() &&
        organiserEmail.trim() &&
        organiserPassword.length >= 6 &&
        organiserConfirm === organiserPassword
      );
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let payload;
      if (role === "Student") {
        payload = {
          name,
          role,
          department,
          matric,
          email,
          password,
        };
      } else {
        payload = {
          organisationName,
          organisationType,
          email: organiserEmail,
          password: organiserPassword,
          role,
        };
      }

      const res = await api.post("/auth/signup", payload);

      loginUser(res.data.user, res.data.token);
      toast.success('Account Created Successfully')
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

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
        <div className="relative z-10 flex items-center justify-center">
          <img
            alt="Center Image"
            src='assets/image 2 (1).png'
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 lg:px-16 xl:px-24 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="text-[#FF3A66] text-3xl font-bold mb-8 text-center">
            Logo
          </div>

          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            Create Account
          </h1>

           {/* Role Switch */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setRole("Student")}
           className={`flex-1 py-3 px-6 rounded-full font-semibold text-base transition-all duration-200 ${
                role === "Student"
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "border-gray-600 border text-gray-300 hover:border-gray-500"
              }`}
              >
              Student  
            </button>

            <button
              onClick={() => setRole("Organizer")}
              className={`flex-1 py-3 px-6 rounded-full font-semibold text-base transition-all duration-200 ${
                role === "Organizer"
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "border-gray-600 border text-gray-300 hover:border-gray-500"
              }`}
            >
              Organizer
            </button>
          </div>

          <form onSubmit={submitForm} className="space-y-4">
            <div className="space-y-3">
              {role === "Student" && (
                <>
                  {/* NAME */}
                  <div>
                    <label className="block text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">
                      Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="text"
                        id="name"
                        name='name'
                        placeholder="e.g. John Christopher"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl py-3.5 pl-12 pr-4 text-white hover:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 dark:placeholder:text-gray-600"
                      />
                    </div>
                  </div>

                  {/* DEPARTMENT */}
                  <div>
                    <label className="block text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">
                      Department
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="text"
                        id="Department"
                        name="Department"
                        placeholder="e.g. Computer Science"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl py-3.5 pl-12 pr-4 text-white hover:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 dark:placeholder:text-gray-600"
                      />
                    </div>
                  </div>

                  {/* MATRIC — student only */}
                  <div>
                    <label className="block text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">
                      Matric Number
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="text"
                        id="Matric number"
                        name="Matric number"
                        placeholder="e.g. CSC/2024/057"
                        value={matric}
                        onChange={(e) => setMatric(e.target.value)}
                        className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl py-3.5 pl-12 pr-4 text-white hover:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 dark:placeholder:text-gray-600"
                      />
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label className="block text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="email"
                          id="email"
                        name="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl py-3.5 pl-12 pr-4 text-white hover:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 dark:placeholder:text-gray-600"
                      />
                    </div>
                    {invalidEmail && (
                      <p className="text-red-500 text-xs mt-1">
                        Please enter a valid email address.
                      </p>
                    )}
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label className="block text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        id="password"
                       name="password"
                        type={showPass ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl py-3.5 pl-12 pr-12 text-white hover:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 dark:placeholder:text-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
                      >
                        {showPass ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                    {shortPassword && (
                      <p className="text-red-500 text-xs mt-1 animate-fade-in">
                        Password must be at least 6 characters long.
                      </p>
                    )}
                  </div>

                  {/* Confirm PASSWORD */}
                  <div>
                    <label className="block text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type={showConfirm ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl py-3.5 pl-12 pr-12 text-white hover:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 dark:placeholder:text-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
                      >
                        {showConfirm ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                    {passwordMismatch && (
                      <p className="text-red-500 text-xs mt-1">
                        Passwords do not match.
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
                    <label className="block text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">
                      Organisation Name
                    </label>
                    <div className="relative">
                      <UsersIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="e.g. Campus Tech Club"
                        value={organisationName}
                        onChange={(e) => setOrganisationName(e.target.value)}
                        className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl py-3.5 pl-12 pr-4 text-white hover:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 dark:placeholder:text-gray-600"
                      />
                    </div>
                  </div>

                  {/* Organisation Type */}
                  <div>
                    <label className="block text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">
                      Organisation Type
                    </label>
                    <div className="relative">
                      <UsersIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="text"
                        placeholder="e.g. Non-profit / Student Society"
                        value={organisationType}
                        onChange={(e) => setOrganisationType(e.target.value)}
                        className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl py-3.5 pl-12 pr-4 text-white hover:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 dark:placeholder:text-gray-600"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="email"
                          id="email"
                         name="email"
                        placeholder="Enter organisation email"
                        value={organiserEmail}
                        onChange={(e) => setOrganiserEmail(e.target.value)}
                        className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl py-3.5 pl-12 pr-4 text-white hover:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 dark:placeholder:text-gray-600"
                      />
                    </div>
                    {invalidOrganiserEmail && (
                      <p className="text-red-500 text-xs mt-1">
                        Please enter a valid email address.
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        id="password"
                    name="password"
                        type={showPass ? "text" : "password"}
                        placeholder="••••••••"
                        value={organiserPassword}
                        onChange={(e) => setOrganiserPassword(e.target.value)}
                        className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl py-3.5 pl-12 pr-12 text-white hover:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 dark:placeholder:text-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
                      >
                        {showPass ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type={showConfirm ? "text" : "password"}
                        placeholder="••••••••"
                        value={organiserConfirm}
                        onChange={(e) => setOrganiserConfirm(e.target.value)}
                        className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl py-3.5 pl-12 pr-12 text-white hover:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 dark:placeholder:text-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
                      >
                        {showConfirm ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                    {organiserShortPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        Password must be at least 6 characters long.
                      </p>
                    )}
                    {organiserPasswordMismatch && (
                      <p className="text-red-500 text-xs mt-1">
                        Passwords do not match.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            <button
          type="submit"
           disabled={loading || !isFormValid()}
          className={`w-[80%] mx-auto bg-[#FF3A66] ${isFormValid() ? 'hover:bg-[#cf153e]' : ''} text-[#FFFFFF] font-semibold py-4 rounded-full mt-6 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            {loading ? (<><Loader2 className="animate-spin mr-2" />Creating account...</>) : 'Create Account'}
           {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
        </button>

            {/* --- OR Separator --- */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <span className="relative px-4 text-sm text-gray-500 bg-[#050B14]">
                or
              </span>
            </div>

              {/* --- Social Login Buttons --- */}
        <div className="flex gap-4 justify-center mb-4">
            <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                disabled={loading}
                className="w-12 h-12 bg-white rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 group"
                title="Sign up with Google"
            >
                 <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform"/>
            </button>
            <button
                type="button"
                onClick={() => handleSocialLogin('Apple')}
                disabled={loading}
                className="w-12 h-12 bg-white rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 group"
                title="Sign up with Apple"
            >
                <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" className="w-5 h-5 group-hover:scale-110 transition-transform"/>
            </button>
        </div>
          </form>

          {/* Already have an account? Sign in */}
          <div className="text-center mt-3">
            <p className="text-gray-400 text-sm">
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
