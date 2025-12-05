"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Loader2, User, Sparkles, Eye, EyeOff, Check, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/axios'
import useAuthStore from '../../store/authStore'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'

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
  const [isFocused, setIsFocused] = useState({
    email: false,
    password: false
  })
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

  const handleFocus = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: true }))
  }

  const handleBlur = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: false }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await api.post('/auth/login', formData)
      const { user, token } = response.data
      login(user, token)
      toast.success('Login successful! Redirecting...')
      router.push('/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      const message = err.response?.data?.message || 'Invalid email or password'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 dark:bg-black p-4 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10 m-6"
      >
        <Card className="border border-gray-200 dark:border-gray-800 shadow-xl rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 relative">
          <CardHeader className="space-y-2 text-center pb-6 pt-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/20">
              <User className="h-7 w-7 text-rose-600 dark:text-rose-500" />
            </div>
            
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome Back
            </CardTitle>
            
            <AnimatePresence mode="wait">
              {greeting ? (
                <motion.div
                  key="greeting"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <CardDescription className="text-base font-medium text-rose-600 dark:text-rose-400 flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {greeting}
                  </CardDescription>
                </motion.div>
              ) : (
                <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                  Sign in to get your tickets
                </CardDescription>
              )}
            </AnimatePresence>
          </CardHeader>
          
          <CardContent className="space-y-8 px-8 pb-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="radar@gmail.com" 
                    className="pl-12 h-12 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-zinc-950 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 text-base dark:text-white dark:placeholder:text-gray-600"
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </Label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm font-medium text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300 transition-colors"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Input 
                    id="password" 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    className="pl-12 pr-12 h-12 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-zinc-950 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 text-base dark:text-white dark:placeholder:text-gray-600"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
                className="w-full h-12 rounded-xl text-base font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/20 dark:shadow-rose-900/20 transition-all duration-200"
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
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 pb-8 px-8 pt-0">
            <div className="text-sm text-center text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{' '}
              <Link 
                href="/signup" 
                className="font-semibold text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300 hover:underline transition-colors"
              >
                Create an account
              </Link>
            </div>
            
            {/* Divider */}
            <div className="relative flex items-center justify-center w-full">
              <div className="grow border-t border-gray-200 dark:border-gray-800"></div>
              <span className="mx-4 text-xs text-gray-500 dark:text-gray-500 font-medium">OR</span>
              <div className="grow border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            
            {/* Social Login Option */}
            <Button 
              variant="outline" 
              className="w-full h-12 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 transition-all duration-200"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500">G</div>
                <span>Continue with Google</span>
              </div>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

export default LoginPage