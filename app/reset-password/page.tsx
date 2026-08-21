"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing reset token. Please request a new password reset link.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters long.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Password successfully reset.");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to reset password.");
      }
    } catch {
      setStatus("error");
      setMessage("An unexpected error occurred. Please try again later.");
    }
  };

  if (!token) {
     return (
        <div className="text-center space-y-4">
           <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
               {message}
           </div>
           <Link href="/forgot-password" className="inline-flex items-center text-sm font-medium text-[#4CAF50] hover:text-[#388E3C]">
                Request a new link
           </Link>
        </div>
     );
  }

  return (
    <>
        {status === "success" ? (
          <div className="rounded-md bg-green-50 p-6 text-center">
             <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
             <h3 className="text-lg font-medium text-green-900 mb-2">Password Reset Successful</h3>
             <p className="text-sm text-green-700 mb-6">{message}</p>
             <p className="text-sm text-green-600">Redirecting to login...</p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {status === "error" && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                {message}
              </div>
            )}

            <div className="-space-y-px rounded-md shadow-sm">
              <div>
                <label htmlFor="new-password" className="sr-only">
                  New Password
                </label>
                <input
                  id="new-password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="relative block w-full rounded-t-md border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-[#4CAF50] sm:text-sm sm:leading-6"
                  placeholder="New password"
                  minLength={8}
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="sr-only">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="relative block w-full rounded-b-md border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-[#4CAF50] sm:text-sm sm:leading-6"
                  placeholder="Confirm new password"
                  minLength={8}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={status === "loading" || !password || !confirmPassword}
                className="group relative flex w-full justify-center rounded-md bg-[#4CAF50] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#388E3C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4CAF50] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {status === "loading" ? "Resetting..." : "Reset Password"}
              </button>
            </div>

            <div className="text-center">
              <Link href="/login" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900">
                <ArrowLeft className="mr-1 h-4 w-4" /> Back to login
              </Link>
            </div>
          </form>
        )}
    </>
  );
}

export default function ResetPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-sm">
                <div>
                  <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                    Create new password
                  </h2>
                  <p className="mt-2 text-center text-sm text-gray-600">
                    Your new password must be at least 8 characters long.
                  </p>
                </div>
                <Suspense fallback={<div className="text-center text-sm text-gray-500">Loading form...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
