"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "If an account exists, a reset link has been sent.");
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to request password reset.");
      }
    } catch {
      setStatus("error");
      setMessage("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-sm">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and {"we'll"} send you a link to reset your password.
          </p>
        </div>

        {status === "success" ? (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Mail className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Check your email</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>{message}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Link href="/login" className="text-sm font-medium text-[#4CAF50] hover:text-[#388E3C]">
                Return to login
              </Link>
            </div>
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
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="relative block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-[#4CAF50] sm:text-sm sm:leading-6"
                  placeholder="Email address"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={status === "loading" || !email}
                className="group relative flex w-full justify-center rounded-md bg-[#4CAF50] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#388E3C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4CAF50] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {status === "loading" ? "Sending..." : "Send reset link"}
              </button>
            </div>

            <div className="text-center">
              <Link href="/login" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900">
                <ArrowLeft className="mr-1 h-4 w-4" /> Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
