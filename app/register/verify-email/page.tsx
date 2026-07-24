"use client";

import { useState, useRef, FormEvent, KeyboardEvent, ClipboardEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

export default function VerifyEmailPage() {
  // In a real app this would come from the registration state / URL params
  const email = "aaditya@example.com";

  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, value: string) {
    // Only allow single digits
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const next = [...code];
    next[index] = value;
    setCode(next);
    setError("");

    // Auto-advance to next field
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const next = [...code];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setCode(next);

    // Focus the next empty field or the last one
    const nextEmpty = next.findIndex((v) => !v);
    const targetIndex = nextEmpty === -1 ? 5 : nextEmpty;
    inputRefs.current[targetIndex]?.focus();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter the full 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    // Mock verification — accepts any 6-digit code
    await new Promise((r) => setTimeout(r, 800));
    setIsLoading(false);

    // Simulate success
    setIsVerified(true);
    setTimeout(() => {
      window.location.href = "/register/2fa-setup";
    }, 1200);
  }

  async function handleResend() {
    setResendMessage("");
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsLoading(false);
    setResendMessage("A new verification code has been sent to your email.");
    // Clear existing code
    setCode(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  }

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#4CAF50]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-sm text-gray-500">Redirecting to set up two-factor authentication…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6" aria-label="Go to homepage">
            <Image src="/saveplate-logo.png" alt="" width={36} height={36} className="object-contain" />
            <span className="font-bold text-xl tracking-tight text-gray-900">SavePlate</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
          <p className="text-gray-500 mt-1">
            We sent a verification code to{" "}
            <span className="text-gray-700 font-medium">{email}</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg" role="alert">
              {error}
            </div>
          )}

          {resendMessage && (
            <div className="mb-5 p-3 bg-[#E8F5E9] border border-[#4CAF50]/30 text-[#2E7D32] text-sm rounded-lg" role="status">
              {resendMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="flex justify-center gap-2 sm:gap-3 mb-6">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el: HTMLInputElement | null) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  aria-label={`Digit ${index + 1}`}
                  className={`w-11 h-12 sm:w-12 sm:h-13 text-center text-lg font-semibold rounded-xl border bg-gray-50 text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] ${
                    error ? "border-red-400 bg-red-50" : "border-gray-200"
                  }`}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#4CAF50] text-white font-semibold py-3 rounded-xl text-center hover:bg-[#3d8c40] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" viewBox="0 0 24 24" aria-hidden="true" />
                  Verifying…
                </>
              ) : (
                "Verify Email"
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={isLoading}
              className="text-sm text-[#4CAF50] font-medium hover:text-[#3d8c40] transition-colors bg-transparent border-none p-0 cursor-pointer disabled:opacity-50"
            >
              Resend verification code
            </button>
          </div>

          <div className="mt-4 text-center text-sm text-gray-500">
            Wrong email?{" "}
            <Link href="/register" className="text-[#4CAF50] font-medium hover:text-[#3d8c40]">
              Go back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
