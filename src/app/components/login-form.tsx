"use client";

import { useState } from "react";
import { useAuth } from "../context/auth-context";

type FormErrors = {
  email?: string;
  password?: string;
};

export default function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    error,
    clearError,
  } = useAuth();

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email))
      errors.email = "Enter a valid email address";

    if (!password) errors.password = "Password is required";
    else if (isSignUp && password.length < 6)
      errors.password = "Must be at least 6 characters";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 flex items-center justify-center">
      <div className="relative w-full max-w-md">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute  -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>

        {/* Main card */}
        <div className="relative backdrop-blur-xl bg-zinc-900/90 shadow-2xl border border-zinc-800/50 rounded-2xl overflow-hidden">
          {/* Gradient top border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>

          <div className="p-8 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-zinc-400">
                {isSignUp ? "Join us today!" : "Sign in to your account"}
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="relative overflow-hidden bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-lg p-4">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent"></div>
                <p className="relative text-red-400 text-sm text-center">
                  {error}
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-zinc-300"
                >
                  Email
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  disabled={isSubmitting}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFormErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  className={`w-full px-4 py-2.5 rounded-lg bg-zinc-800/50 text-zinc-200 border ${
                    formErrors.email
                      ? "border-red-500/50"
                      : "border-zinc-700/50"
                  } placeholder-zinc-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition duration-200`}
                />
                {formErrors.email && (
                  <p className="text-sm text-red-400 mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-zinc-300"
                >
                  Password
                </label>
                <input
                  type="password"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  disabled={isSubmitting}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFormErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className={`w-full px-4 py-2.5 rounded-lg bg-zinc-800/50 text-zinc-200 border ${
                    formErrors.password
                      ? "border-red-500/50"
                      : "border-zinc-700/50"
                  } placeholder-zinc-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition duration-200`}
                />
                {formErrors.password && (
                  <p className="text-sm text-red-400 mt-1">
                    {formErrors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="relative w-full py-2.5 rounded-lg font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition duration-200 disabled:opacity-70 group overflow-hidden"
              >
                <div className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-30 group-hover:animate-shimmer"></div>
                <span className="relative">
                  {isSubmitting ? "Processing..." : ""}
                  {isSignUp ? "Create Account" : "Sign In"}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800/50"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-zinc-900 text-zinc-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="relative w-full flex items-center justify-center gap-3 py-2.5 rounded-lg font-medium text-zinc-300 bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-700/50 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition duration-200 group overflow-hidden"
            >
              <div className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-30 group-hover:animate-shimmer"></div>
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="relative">Continue with Google</span>
            </button>

            {/* Toggle button */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setFormErrors({});
                  clearError();
                }}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
