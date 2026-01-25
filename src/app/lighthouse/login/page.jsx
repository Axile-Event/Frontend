"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import useAuthStore from "../../../store/authStore";
import { adminService } from "../../../lib/admin";
import { Button } from "../../../components/ui/button";
import Logo from "../../../components/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await adminService.login(data.email, data.password);
      
      login(
        { email: response.email, is_staff: response.is_staff },
        response.access,
        response.refresh,
        "Admin"
      );

      toast.success("Welcome back, Admin");
      router.push("/lighthouse/dashboard");
    } catch (error) {
      console.error(error);
      let message = "Invalid credentials";
      if (error.response?.data) {
        const data = error.response.data;
        if (data.error) message = data.error;
        else if (data.detail) message = data.detail;
        else if (data.message) message = data.message;
        else {
          // If data is an object with keys (validation errors), pick the first one
          const keys = Object.keys(data);
          if (keys.length > 0) {
            const firstError = data[keys[0]];
            message = Array.isArray(firstError) ? firstError[0] : firstError;
          }
        }
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-4">
          <Logo
            href="/"
            textSize="text-3xl"
            iconSize="h-38 w-auto"
            className="text-foreground"
          />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 text-center">
          Admin Portal
        </h1>

        <p className="text-base text-muted-foreground mb-8 text-center">
          Secure access for system administrators
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-muted-foreground text-xs font-semibold uppercase tracking-wide mb-2"
            >
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Mail className="h-5 w-5" />
              </div>
              <input
                id="email"
                type="email"
                placeholder="admin@Axile.com"
                className={`w-full bg-background border rounded-xl py-3.5 pl-12 pr-4 text-foreground transition-all duration-200 
                  ${errors.email ? 'border-destructive focus:border-destructive' : 'border-input hover:border-primary/60 focus:border-primary'}
                  focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-muted-foreground/50`}
                {...register("email", { required: "Email is required" })}
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-muted-foreground text-xs font-semibold uppercase tracking-wide mb-2"
            >
              Password
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`w-full bg-background border rounded-xl py-3.5 pl-12 pr-12 text-foreground transition-all duration-200 
                  ${errors.password ? 'border-destructive focus:border-destructive' : 'border-input hover:border-primary/60 focus:border-primary'}
                  focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-muted-foreground/50`}
                {...register("password", { required: "Password is required" })}
                 disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
               <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
            )}
          </div>
          
          <Button
            type="submit"
             className="w-full h-12 rounded-xl text-base font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/20 transition-all duration-200"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
