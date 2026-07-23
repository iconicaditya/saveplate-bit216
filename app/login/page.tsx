"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  function validate(): boolean {
    const next: typeof errors = {};
    if (!email.trim()) {
      next.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (!password) {
      next.password = "Password is required.";
    } else if (password.length < 6) {
      next.password = "Password must be at least 6 characters.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    setIsLoading(true);
    // Simulate a brief network delay for frontend demo purposes
    await new Promise((r) => setTimeout(r, 800));
    setIsLoading(false);

    // In production, this would call an API endpoint
    // For now we just redirect to dashboard (the Link handles it)
    window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6" aria-label="Go to homepage">
            <Image src="/saveplate-logo.png" alt="" width={36} height={36} className="object-contain" />
            <span className="font-bold text-xl tracking-tight text-gray-900">SavePlate</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {apiError && (
            <div
              className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg"
              role="alert"
            >
              {apiError}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-sm font-semibold text-gray-700">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
                className={`w-full h-11 px-4 rounded-xl border bg-gray-50 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] ${
                  errors.email ? "border-red-400 bg-red-50" : "border-gray-200"
                }`}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "login-email-error" : undefined}
                autoComplete="email"
              />
              {errors.email && (
                <p id="login-email-error" className="text-xs text-red-600 mt-1" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="login-password" className="text-sm font-semibold text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  className="text-sm text-[#4CAF50] hover:text-[#3d8c40] transition-colors bg-transparent border-none p-0 cursor-pointer font-medium"
                >
                  Forgot?
                </button>
              </div>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: undefined })); }}
                className={`w-full h-11 px-4 rounded-xl border bg-gray-50 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] ${
                  errors.password ? "border-red-400 bg-red-50" : "border-gray-200"
                }`}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "login-password-error" : undefined}
                autoComplete="current-password"
              />
              {errors.password && (
                <p id="login-password-error" className="text-xs text-red-600 mt-1" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="rounded border-gray-300 text-[#4CAF50] focus:ring-[#4CAF50]"
              />
              <label htmlFor="remember" className="text-sm text-gray-600 select-none">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#4CAF50] text-white font-semibold py-3 rounded-xl text-center hover:bg-[#3d8c40] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" viewBox="0 0 24 24" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            No account?{" "}
            <Link href="/register" className="text-[#4CAF50] font-medium hover:text-[#3d8c40]">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}