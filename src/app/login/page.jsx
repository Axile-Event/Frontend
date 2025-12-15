"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Loader2, User, Sparkles, Eye, EyeOff, Check, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useGoogleLogin } from '@react-oauth/google'
import api from '../../lib/axios'
import useAuthStore from '../../store/authStore'
import { Button } from '../../components/ui/button'

const LoginPage = () => {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [greeting, setGreeting] = useState('')
  const [isValidEmail, setIsValidEmail] = useState(false)

  const extractUsername = (email) => {
    if (!email || !email.includes('@')) return ''
    return email.split('@')[0]
  }

  useEffect(() => {
    const username = extractUsername(formData.email)
    if (username) {
      setGreeting(`Hello, ${username}! 👋`)
      setIsValidEmail(validateEmail(formData.email))
    } else {
      setGreeting('')
      setIsValidEmail(false)
    }
  }, [formData.email])

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Assuming student login for now, logic might need adjustment based on user role selection if available on login page
        const res = await api.post('/student/google-signup/', {
          token: tokenResponse.access_token,
        });
        const { user_id, email, access, refresh, is_new_user } = res.data;
        login({ user_id, email }, access);
        toast.success('Login successful!');
        router.push('/dashboard');
      } catch (err) {
        console.error('Google login error:', err);
        toast.error('Google login failed');
      }
    },
    onError: () => {
      toast.error('Google login failed');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await api.post('/login/', formData)
      const { user_id, email, access, refresh } = response.data
      login({ user_id, email }, access)
      toast.success('Login successful! Redirecting...')
      router.push('/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      const message = err.response?.data?.error || 'Invalid email or password'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-[#0A0A14]">

            {/* left Side - Image */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center z-0 opacity-40"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1568289523939-61125d216fe5?q=80&w=436&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
            filter: "grayscale(30%)",
          }}
        />
        <div className="relative z-10  w-[40%] flex items-center justify-center">
          <img
            alt="Center Image"
            src='assets/image 2 (1).png'
          />
        </div>
      </div>
      {/* Right Side - Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 lg:px-16 xl:px-24 overflow-y-auto"
      >
        <div className="w-full max-w-md">
          <div className="text-[#FF3A66] text-3xl font-bold mb-8 text-center">
            Logo
          </div>

          <h1 className="text-4xl font-bold text-white mb-2 text-center">
            Welcome Back
          </h1>
          
          <AnimatePresence mode="wait">
            {greeting ? (
              <motion.div
                key="greeting"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-8 text-center"
              >
                <p className="text-base font-medium text-rose-400 flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  {greeting}
                </p>
              </motion.div>
            ) : (
              <p className="text-base text-gray-400 mb-8 text-center">
                Sign in to get your tickets
              </p>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="radar@gmail.com"
                  className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl py-3.5 pl-12 pr-4 text-white hover:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 dark:placeholder:text-gray-600"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {isValidEmail && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-white/80 text-xs font-semibold uppercase tracking-wide">
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
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl py-3.5 pl-12 pr-12 text-white hover:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 dark:placeholder:text-gray-600"
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
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/20 transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button> //btn
          </form>

          <div className="mt-8 flex flex-col space-y-4">
            <div className="text-sm text-center text-gray-400">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-semibold text-rose-400 hover:text-rose-300 hover:underline transition-colors"
              >
                Create an account
              </Link>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center w-full">
              <div className="grow border-t border-gray-800"></div>
              <span className="mx-4 text-xs text-gray-500 font-medium">OR</span>
              <div className="grow border-t border-gray-800"></div>
            </div>

            {/* Social Login Option */}
            <Button
              variant="outline"
              onClick={() => handleGoogleLogin()}
              className="w-full h-12 rounded-xl border-gray-800 bg-zinc-900 hover:bg-zinc-800 text-gray-300 transition-all duration-200"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="h-5 w-5 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500">G</div>
                <span>Continue with Google</span>
              </div>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage