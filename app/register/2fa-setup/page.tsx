"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Copy, Check } from "lucide-react";
import { setup2FA, verify2FA } from "@/lib/api";

export default function TwoFactorSetupPage() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState("");

  useEffect(() => {
    // Fetch 2FA setup data from backend
    async function fetchSetup() {
      try {
        const data = await setup2FA();
        setSecret(data.secret);
        setQrDataUrl(data.qrCode);
      } catch (err: any) {
        setError(err.message || "Failed to load 2FA setup.");
      }
    }
    fetchSetup();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit code from your authenticator app.");
      return;
    }

    setIsLoading(true);
    try {
      await verify2FA(otp);
      setIsConfigured(true);
      setTimeout(() => {
        window.location.href = "/register/privacy";
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSkip() {
    window.location.href = "/register/privacy";
  }

  function handleCopy() {
    navigator.clipboard.writeText(secret).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#4CAF50]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Two-Factor Authentication Enabled!</h2>
            <p className="text-sm text-gray-500">Your account is now more secure. Setting up your privacy preferences…</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Set Up Two-Factor Authentication</h1>
          <p className="text-gray-500 mt-1">
            Scan the QR code below with your authenticator app
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg" role="alert">
              {error}
            </div>
          )}

          {/* Real QR Code from backend */}
          <div className="flex justify-center mb-6">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Scan this QR code with your authenticator app"
                className="w-48 h-48 border border-gray-200 rounded-xl"
              />
            ) : (
              <div className="w-48 h-48 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center">
                <svg className="animate-spin h-6 w-6 text-gray-400" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            )}
          </div>

          {/* Secret Key */}
          {secret && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Or enter this key manually</p>
              <div className="flex items-center justify-between gap-2">
                <code className="text-sm font-mono font-bold text-gray-900 tracking-wider select-all">
                  {secret.match(/.{1,4}/g)?.join(" ") ?? secret}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="shrink-0 p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors"
                  aria-label={copied ? "Copied" : "Copy secret key"}
                >
                  {copied ? <Check className="w-4 h-4 text-[#4CAF50]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* OTP Confirmation */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="2fa-otp" className="text-sm font-semibold text-gray-700">
                Confirm with a 6-digit code
              </label>
              <input
                id="2fa-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
                className={`w-full h-11 px-4 rounded-xl border bg-gray-50 text-sm text-center tracking-[0.5em] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] ${
                  error ? "border-red-400 bg-red-50" : "border-gray-200"
                }`}
                aria-invalid={!!error}
                aria-describedby={error ? "2fa-otp-error" : undefined}
              />
              {error && <p id="2fa-otp-error" className="text-xs text-red-600 mt-1" role="alert">{error}</p>}
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
                "Verify & Continue"
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium bg-transparent border-none p-0 cursor-pointer transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}